import { app, BrowserWindow, ipcMain, screen, Notification, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

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
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(tasks, null, 2));
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
  saveTasks(tasks);
});

ipcMain.handle('add-task', async (_event, title: string, duration?: number): Promise<Task> => {
  const tasks = getTasks();
  const newTask: Task = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    duration,
    timeRemaining: duration ? duration * 60 : undefined,
    isTimerRunning: false,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
});

ipcMain.handle('toggle-task', async (_event, taskId: string): Promise<void> => {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
  }
});

ipcMain.handle('delete-task', async (_event, taskId: string): Promise<void> => {
  let tasks = getTasks();
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks(tasks);
});

ipcMain.handle('update-task-timer', async (_event, taskId: string, timerData: Partial<Task>): Promise<void> => {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    if (timerData.timeRemaining !== undefined) task.timeRemaining = timerData.timeRemaining;
    if (timerData.isTimerRunning !== undefined) task.isTimerRunning = timerData.isTimerRunning;
    if (timerData.duration !== undefined) task.duration = timerData.duration;
    saveTasks(tasks);
  }
});

ipcMain.handle('update-task', async (_event, taskId: string, updates: Partial<Task>): Promise<void> => {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    saveTasks(tasks);
  }
});

ipcMain.handle('clear-completed', async (): Promise<void> => {
  let tasks = getTasks();
  tasks = tasks.filter((t) => !t.completed);
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

