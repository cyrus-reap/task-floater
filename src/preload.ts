import { contextBridge, ipcRenderer } from 'electron';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number;
  timeRemaining?: number;
  isTimerRunning?: boolean;
}

interface Settings {
  windowPosition?: { x: number; y: number };
  theme?: 'light' | 'dark';
  notifications?: boolean;
}

contextBridge.exposeInMainWorld('electronAPI', {
  getTasks: (): Promise<Task[]> => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks: Task[]): Promise<void> => ipcRenderer.invoke('save-tasks', tasks),
  addTask: (title: string, duration?: number): Promise<Task> => ipcRenderer.invoke('add-task', title, duration),
  toggleTask: (taskId: string): Promise<void> => ipcRenderer.invoke('toggle-task', taskId),
  deleteTask: (taskId: string): Promise<void> => ipcRenderer.invoke('delete-task', taskId),
  updateTask: (taskId: string, updates: Partial<Task>): Promise<void> => ipcRenderer.invoke('update-task', taskId, updates),
  updateTaskTimer: (taskId: string, timerData: Partial<Task>): Promise<void> => ipcRenderer.invoke('update-task-timer', taskId, timerData),
  clearCompleted: (): Promise<void> => ipcRenderer.invoke('clear-completed'),
  showNotification: (title: string, body: string): Promise<void> => ipcRenderer.invoke('show-notification', title, body),
  exportTasks: (): Promise<string | null> => ipcRenderer.invoke('export-tasks'),
  importTasks: (): Promise<number> => ipcRenderer.invoke('import-tasks'),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: Partial<Settings>): Promise<void> => ipcRenderer.invoke('update-settings', settings),
  minimize: (): Promise<void> => ipcRenderer.invoke('minimize'),
  close: (): Promise<void> => ipcRenderer.invoke('close'),
});
