interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number;
  timeRemaining?: number;
  isTimerRunning?: boolean;
  tags?: string[];
}

interface Settings {
  windowPosition?: { x: number; y: number };
  theme?: 'light' | 'dark';
  notifications?: boolean;
}

interface ElectronAPI {
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<void>;
  addTask: (title: string, duration?: number) => Promise<Task>;
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
