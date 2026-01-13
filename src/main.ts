import { app, BrowserWindow, ipcMain, screen, Notification, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Validators, ValidationError } from './validation';

const STORE_PATH = path.join(app.getPath('userData'), 'tasks.json');
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number; // Duration in minutes
  timeRemaining?: number; // Time remaining in seconds
  isTimerRunning?: boolean;
  tags?: string[];
}

interface Settings {
  windowPosition?: { x: number; y: number };
  theme?: 'light' | 'dark';
  notifications?: boolean;
}

let mainWindow: BrowserWindow | null = null;

function getSettings(): Settings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return { notifications: true };
}

function saveSettings(settings: Settings): void {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

function createWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const settings = getSettings();

  const windowX = settings.windowPosition?.x ?? screenWidth - 400;
  const windowY = settings.windowPosition?.y ?? 50;

  mainWindow = new BrowserWindow({
    width: 380,
    height: 600,
    x: windowX,
    y: windowY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false, // Prevent Node.js access in renderer
      contextIsolation: true, // Isolate renderer from Node.js
      sandbox: true, // Enable Chromium sandbox
      webSecurity: true, // Enable web security
      allowRunningInsecureContent: false, // Block mixed content
      experimentalFeatures: false, // Disable experimental features
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'floating', 1);

  // Save window position when moved
  mainWindow.on('moved', () => {
    const position = mainWindow?.getPosition();
    if (position) {
      const settings = getSettings();
      settings.windowPosition = { x: position[0], y: position[1] };
      saveSettings(settings);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helper functions
function getTasks(): Task[] {
  try {
    // Ensure we're reading from the correct path (prevent path traversal)
    const normalizedPath = path.normalize(STORE_PATH);
    const userDataPath = path.normalize(app.getPath('userData'));

    if (!normalizedPath.startsWith(userDataPath)) {
      throw new Error('Invalid file path - security violation');
    }

    if (fs.existsSync(normalizedPath)) {
      const data = fs.readFileSync(normalizedPath, 'utf-8');
      const parsed = JSON.parse(data);

      // Validate parsed data is an array
      if (!Array.isArray(parsed)) {
        console.error('Tasks file corrupted - not an array');
        return [];
      }

      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  try {
    // Ensure we're writing to the correct path (prevent path traversal)
    const normalizedPath = path.normalize(STORE_PATH);
    const userDataPath = path.normalize(app.getPath('userData'));

    if (!normalizedPath.startsWith(userDataPath)) {
      throw new Error('Invalid file path - security violation');
    }

    // Ensure directory exists
    const dir = path.dirname(normalizedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(normalizedPath, JSON.stringify(tasks, null, 2), { mode: 0o600 });
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
}

// IPC Handlers
ipcMain.handle('get-tasks', async (): Promise<Task[]> => {
  return getTasks();
});

ipcMain.handle('save-tasks', async (_event, tasks: Task[]): Promise<void> => {
  try {
    // Validate that tasks is an array
    if (!Array.isArray(tasks)) {
      throw new ValidationError('Tasks must be an array');
    }

    // Validate each task
    const validatedTasks = tasks.map((task, index) => {
      if (!task || typeof task !== 'object') {
        throw new ValidationError(`Invalid task at index ${index}`);
      }

      return {
        id: Validators.taskId(task.id),
        title: Validators.taskTitle(task.title),
        completed: typeof task.completed === 'boolean' ? task.completed : false,
        createdAt: task.createdAt || new Date().toISOString(),
        duration: Validators.duration(task.duration),
        timeRemaining: Validators.timeRemaining(task.timeRemaining),
        isTimerRunning: typeof task.isTimerRunning === 'boolean' ? task.isTimerRunning : false,
        tags: task.tags,
      };
    });

    saveTasks(validatedTasks);
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
});

ipcMain.handle('add-task', async (_event, title: string, duration?: number): Promise<Task> => {
  try {
    // Validate inputs
    const validatedTitle = Validators.taskTitle(title);
    const validatedDuration = Validators.duration(duration);

    const tasks = getTasks();

    // Prevent DoS: Limit total number of tasks
    if (tasks.length >= 1000) {
      throw new ValidationError('Maximum number of tasks reached (1000)');
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: validatedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
      duration: validatedDuration,
      timeRemaining: validatedDuration ? validatedDuration * 60 : undefined,
      isTimerRunning: false,
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
});

ipcMain.handle('toggle-task', async (_event, taskId: string): Promise<void> => {
  try {
    const validatedId = Validators.taskId(taskId);
    const tasks = getTasks();
    const task = tasks.find(t => t.id === validatedId);
    if (!task) {
      throw new ValidationError('Task not found');
    }
    task.completed = !task.completed;
    saveTasks(tasks);
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
});

ipcMain.handle('delete-task', async (_event, taskId: string): Promise<void> => {
  try {
    const validatedId = Validators.taskId(taskId);
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== validatedId);
    saveTasks(tasks);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
});

ipcMain.handle(
  'update-task-timer',
  async (_event, taskId: string, timerData: Partial<Task>): Promise<void> => {
    try {
      const validatedId = Validators.taskId(taskId);
      const tasks = getTasks();
      const task = tasks.find(t => t.id === validatedId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Validate timer data
      if (timerData.timeRemaining !== undefined) {
        task.timeRemaining = Validators.timeRemaining(timerData.timeRemaining);
      }
      if (timerData.isTimerRunning !== undefined) {
        if (typeof timerData.isTimerRunning !== 'boolean') {
          throw new ValidationError('isTimerRunning must be a boolean');
        }
        task.isTimerRunning = timerData.isTimerRunning;
      }
      if (timerData.duration !== undefined) {
        task.duration = Validators.duration(timerData.duration);
      }

      saveTasks(tasks);
    } catch (error) {
      console.error('Error updating task timer:', error);
      throw error;
    }
  }
);

ipcMain.handle(
  'update-task',
  async (_event, taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const validatedId = Validators.taskId(taskId);
      const tasks = getTasks();
      const task = tasks.find(t => t.id === validatedId);
      if (!task) {
        throw new ValidationError('Task not found');
      }

      // Only allow specific fields to be updated
      if (updates.title !== undefined) {
        task.title = Validators.taskTitle(updates.title);
      }
      if (updates.duration !== undefined) {
        task.duration = Validators.duration(updates.duration);
      }
      if (updates.completed !== undefined) {
        if (typeof updates.completed !== 'boolean') {
          throw new ValidationError('completed must be a boolean');
        }
        task.completed = updates.completed;
      }
      if (updates.tags !== undefined) {
        if (!Array.isArray(updates.tags) || !updates.tags.every(t => typeof t === 'string')) {
          throw new ValidationError('tags must be an array of strings');
        }
        task.tags = updates.tags.map(t => t.trim()).filter(t => t.length > 0);
      }

      saveTasks(tasks);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
);

ipcMain.handle('clear-completed', async (): Promise<void> => {
  let tasks = getTasks();
  tasks = tasks.filter(t => !t.completed);
  saveTasks(tasks);
});

ipcMain.handle('show-notification', async (_event, title: string, body: string): Promise<void> => {
  const settings = getSettings();
  if (settings.notifications !== false) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('export-tasks', async (): Promise<string | null> => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export Tasks',
      defaultPath: `tasks-${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (filePath) {
      const tasks = getTasks();
      fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
      return filePath;
    }
    return null;
  } catch (error) {
    console.error('Error exporting tasks:', error);
    throw error;
  }
});

ipcMain.handle('import-tasks', async (): Promise<number> => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow!, {
      title: 'Import Tasks',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (filePaths && filePaths[0]) {
      const data = fs.readFileSync(filePaths[0], 'utf-8');
      const importedTasks: Task[] = JSON.parse(data);
      const currentTasks = getTasks();

      // Merge imported tasks with current tasks (avoid duplicates)
      const existingIds = new Set(currentTasks.map(t => t.id));
      const newTasks = importedTasks.filter(t => !existingIds.has(t.id));

      saveTasks([...currentTasks, ...newTasks]);
      return newTasks.length;
    }
    return 0;
  } catch (error) {
    console.error('Error importing tasks:', error);
    throw error;
  }
});

ipcMain.handle('get-settings', async (): Promise<Settings> => {
  return getSettings();
});

ipcMain.handle('update-settings', async (_event, settings: Partial<Settings>): Promise<void> => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  saveSettings(updated);
});

ipcMain.handle('minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('close', () => {
  app.quit();
});

ipcMain.handle('resize-window', (_event, height: number) => {
  if (mainWindow) {
    const MIN_HEIGHT = 150;
    const MAX_HEIGHT = 700;
    const clampedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));
    const [width] = mainWindow.getSize();
    mainWindow.setSize(width, clampedHeight);
  }
});
