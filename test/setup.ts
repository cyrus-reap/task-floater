/**
 * Test setup file
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup code that runs once before all tests
  console.log('🧪 Test suite starting...');
});

afterAll(() => {
  // Cleanup code that runs once after all tests
  console.log('✅ Test suite completed');
});

// Mock Electron API for testing
global.window = {
  electronAPI: {
    getTasks: async () => [],
    saveTasks: async () => {},
    addTask: async (title: string, duration?: number) => ({
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      duration,
    }),
    toggleTask: async () => {},
    deleteTask: async () => {},
    updateTask: async () => {},
    updateTaskTimer: async () => {},
    clearCompleted: async () => {},
    showNotification: async () => {},
    exportTasks: async () => null,
    importTasks: async () => 0,
    getSettings: async () => ({}),
    updateSettings: async () => {},
    minimize: async () => {},
    close: async () => {},
    resizeWindow: async () => {},
    showConfirmDialog: async () => true,
    captureNativeScreenshot: async () => null,
    processScreenshotFile: async () => [],
    addTasksBatch: async () => [],
    onScreenshotTrigger: () => {},
  },
} as any;
