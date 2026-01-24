interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number;
  timeRemaining?: number;
  isTimerRunning?: boolean;
  tags?: string[];
  pinned?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface ParsedTask {
  title: string;
  duration?: number;
}

interface Settings {
  windowPosition?: { x: number; y: number };
  theme?: 'light' | 'dark';
  notifications?: boolean;
  searchCollapsed?: boolean;
  inputCollapsed?: boolean;
  doneSectionCollapsed?: boolean;
  soundEnabled?: boolean;
}

interface ElectronAPI {
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<void>;
  addTask: (title: string, duration?: number, priority?: 'high' | 'medium' | 'low') => Promise<Task>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateTaskTimer: (taskId: string, timerData: Partial<Task>) => Promise<void>;
  clearCompleted: () => Promise<void>;
  showNotification: (title: string, body: string) => Promise<void>;
  exportTasks: () => Promise<string | null>;
  importTasks: () => Promise<number>;
  getSettings: () => Promise<Settings>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  resizeWindow: (height: number) => Promise<void>;
  showConfirmDialog: (title: string, message: string) => Promise<boolean>;

  // Screenshot-based task capture
  captureNativeScreenshot: () => Promise<string | null>;
  processScreenshotFile: (imagePath: string) => Promise<ParsedTask[]>;
  addTasksBatch: (tasks: ParsedTask[]) => Promise<Task[]>;
  onScreenshotTrigger: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
