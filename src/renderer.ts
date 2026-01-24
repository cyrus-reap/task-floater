/**
 * Task Floater - Renderer Process
 * Clean, modular, well-organized code with clear separation of concerns
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

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

// =============================================================================
// IMPORTS - CONSTANTS
// =============================================================================

import {
  TIMER_CONSTANTS,
  UI_TIMING,
  DURATION_PRESETS,
  ELEMENT_IDS,
  SELECTORS,
  CSS_CLASSES,
  APP_MODES,
  type AppMode,
  DATA_ATTRIBUTES,
  TIMER_ACTIONS,
  KEYBOARD_KEYS,
  AUDIO_SETTINGS,
  SCROLL_BEHAVIOR,
  THEMES,
  MESSAGES,
  PRIORITY_LEVELS,
  type Priority,
} from './constants';

// =============================================================================
// LOCAL CONSTANTS (derived from imports for convenience)
// =============================================================================

// Timer constants
const TIMER_SAVE_INTERVAL_SECONDS = TIMER_CONSTANTS.SAVE_INTERVAL_SECONDS;
const SECONDS_PER_MINUTE = TIMER_CONSTANTS.SECONDS_PER_MINUTE;
const AUTO_ADVANCE_DELAY_MS = TIMER_CONSTANTS.AUTO_ADVANCE_DELAY_MS;
const TIMER_TICK_INTERVAL_MS = TIMER_CONSTANTS.TICK_INTERVAL_MS;
const TIMER_WARNING_THRESHOLD_SECONDS = TIMER_CONSTANTS.WARNING_THRESHOLD_SECONDS;

// UI timing
const SEARCH_DEBOUNCE_MS = UI_TIMING.SEARCH_DEBOUNCE_MS;
const TOAST_DURATION_MS = UI_TIMING.TOAST_DURATION_MS;
const SUCCESS_ANIMATION_DURATION_MS = UI_TIMING.SUCCESS_ANIMATION_DURATION_MS;
const CONFETTI_COUNT = UI_TIMING.CONFETTI_COUNT;

// Data attributes
const ATTR_ID = DATA_ATTRIBUTES.ID;
const ATTR_MINUTES = DATA_ATTRIBUTES.MINUTES;

// Timer actions
const TIMER_ACTION_PLAY = TIMER_ACTIONS.PLAY;
const TIMER_ACTION_PAUSE = TIMER_ACTIONS.PAUSE;
const TIMER_ACTION_RESET = TIMER_ACTIONS.RESET;

// Keyboard keys
const KEY_ESCAPE = KEYBOARD_KEYS.ESCAPE;
const KEY_ENTER = KEYBOARD_KEYS.ENTER;
const KEY_ARROW_UP = KEYBOARD_KEYS.ARROW_UP;
const KEY_ARROW_DOWN = KEYBOARD_KEYS.ARROW_DOWN;
const KEY_SPACE = KEYBOARD_KEYS.SPACE;

// Audio settings
const AUDIO_FREQUENCY = AUDIO_SETTINGS.FREQUENCY;
const AUDIO_GAIN = AUDIO_SETTINGS.GAIN;
const AUDIO_DURATION = AUDIO_SETTINGS.DURATION;
const AUDIO_TYPE_SINE = AUDIO_SETTINGS.TYPE;

// Scroll behavior
const SCROLL_BEHAVIOR_SMOOTH = SCROLL_BEHAVIOR.SMOOTH;
const SCROLL_BLOCK_NEAREST = SCROLL_BEHAVIOR.BLOCK_NEAREST;

// Theme values
const THEME_LIGHT = THEMES.LIGHT;
const THEME_DARK = THEMES.DARK;

// Messages
const MSG_TIMER_COMPLETE_TITLE = MESSAGES.TIMER_COMPLETE_TITLE;
const MSG_ALL_DONE_TITLE = MESSAGES.ALL_DONE_TITLE;
const MSG_ALL_DONE_BODY = MESSAGES.ALL_DONE_BODY;
const MSG_TASK_DELETED = MESSAGES.TASK_DELETED;
const MSG_TASK_RESTORED = MESSAGES.TASK_RESTORED;

// Undo timing
const UNDO_WINDOW_MS = UI_TIMING.UNDO_WINDOW_MS;

// =============================================================================
// STATE
// =============================================================================

let tasks: Task[] = [];
const timerIntervals: Map<string, number> = new Map();
let selectedDuration: number | undefined = undefined;
let selectedPriority: Priority = PRIORITY_LEVELS.NONE;
let selectedTaskIndex = -1;
let currentMode: AppMode = APP_MODES.FULL;
let contextMenuTarget: string | null = null;
let draggedTaskId: string | null = null; // For drag-and-drop reordering
let isDoneSectionCollapsed = true;
let isCommandPaletteOpen = false;
let commandPaletteSelectedIndex = 0;

// Undo delete state
let lastDeletedTask: Task | null = null;
let undoTimeout: number | null = null;

// =============================================================================
// COMMAND PALETTE DEFINITIONS
// =============================================================================

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void | Promise<void>;
}

const COMMANDS: Command[] = [
  {
    id: 'add-task',
    label: 'Add new task',
    shortcut: '⌘N',
    icon: '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    action: () => DOM.taskInput.focus(),
  },
  {
    id: 'search',
    label: 'Search tasks',
    shortcut: '⌘F',
    icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    action: () => DOM.searchInput?.focus(),
  },
  {
    id: 'full-mode',
    label: 'Full mode',
    shortcut: '⌘1',
    icon: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
    action: () => setAppMode(APP_MODES.FULL),
  },
  {
    id: 'compact-mode',
    label: 'Compact mode',
    shortcut: '⌘2',
    icon: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    action: () => setAppMode(APP_MODES.COMPACT),
  },
  {
    id: 'focus-mode',
    label: 'Focus mode',
    shortcut: '⌘3',
    icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
    action: () => setAppMode(APP_MODES.FOCUS),
  },
  {
    id: 'toggle-theme',
    label: 'Toggle theme',
    shortcut: '⌘T',
    icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    action: () => DOM.themeToggle?.click(),
  },
  {
    id: 'export',
    label: 'Export tasks',
    shortcut: '⌘E',
    icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    action: handleExport,
  },
  {
    id: 'import',
    label: 'Import tasks',
    shortcut: '⌘I',
    icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    action: handleImport,
  },
  {
    id: 'clear-completed',
    label: 'Clear completed',
    icon: '<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    action: handleClearCompleted,
  },
];

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const DOM = {
  container: document.querySelector('.container') as HTMLDivElement,
  taskInput: document.getElementById(ELEMENT_IDS.TASK_INPUT) as HTMLInputElement,
  durationInput: document.getElementById(ELEMENT_IDS.DURATION_INPUT) as HTMLInputElement,
  addBtn: document.getElementById(ELEMENT_IDS.ADD_BTN) as HTMLButtonElement,
  tasksSection: document.getElementById(ELEMENT_IDS.TASKS_SECTION) as HTMLDivElement,
  minimizeBtn: document.getElementById(ELEMENT_IDS.MINIMIZE_BTN) as HTMLButtonElement,
  closeBtn: document.getElementById(ELEMENT_IDS.CLOSE_BTN) as HTMLButtonElement,
  searchInput: document.getElementById(ELEMENT_IDS.SEARCH_INPUT) as HTMLInputElement | null,
  statsText: document.getElementById(ELEMENT_IDS.STATS_TEXT) as HTMLDivElement | null,
  statsBar: document.getElementById(ELEMENT_IDS.STATS_BAR) as HTMLDivElement | null,
  clearCompletedBtn: document.getElementById(
    ELEMENT_IDS.CLEAR_COMPLETED_BTN
  ) as HTMLButtonElement | null,
  exportBtn: document.getElementById(ELEMENT_IDS.EXPORT_BTN) as HTMLButtonElement | null,
  importBtn: document.getElementById(ELEMENT_IDS.IMPORT_BTN) as HTMLButtonElement | null,
  themeToggle: document.getElementById(ELEMENT_IDS.THEME_TOGGLE) as HTMLButtonElement | null,
  focusBtn: document.getElementById(ELEMENT_IDS.FOCUS_BTN) as HTMLButtonElement | null,
  searchToggle: document.getElementById(ELEMENT_IDS.SEARCH_TOGGLE) as HTMLButtonElement | null,
  inputToggle: document.getElementById(ELEMENT_IDS.INPUT_TOGGLE) as HTMLButtonElement | null,
  searchBar: document.getElementById(ELEMENT_IDS.SEARCH_BAR) as HTMLDivElement | null,
  inputSection: document.getElementById(ELEMENT_IDS.INPUT_SECTION) as HTMLDivElement | null,
  // New premium UI elements
  appContainer: document.getElementById(ELEMENT_IDS.APP_CONTAINER) as HTMLDivElement | null,
  fullModeBtn: document.getElementById(ELEMENT_IDS.FULL_MODE_BTN) as HTMLButtonElement | null,
  compactModeBtn: document.getElementById(ELEMENT_IDS.COMPACT_MODE_BTN) as HTMLButtonElement | null,
  focusModeBtn: document.getElementById(ELEMENT_IDS.FOCUS_MODE_BTN) as HTMLButtonElement | null,
  durationPicker: document.getElementById(ELEMENT_IDS.DURATION_PICKER) as HTMLDivElement | null,
  customDurationInput: document.getElementById(
    ELEMENT_IDS.CUSTOM_DURATION_INPUT
  ) as HTMLInputElement | null,
  priorityPicker: document.getElementById(ELEMENT_IDS.PRIORITY_PICKER) as HTMLDivElement | null,
  overflowMenuBtn: document.getElementById(
    ELEMENT_IDS.OVERFLOW_MENU_BTN
  ) as HTMLButtonElement | null,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / SECONDS_PER_MINUTE);
  const secs = seconds % SECONDS_PER_MINUTE;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playNotificationSound(): void {
  try {
    // Use webkit prefixed AudioContext for older browsers
    const AudioContextConstructor =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = AUDIO_FREQUENCY;
    oscillator.type = AUDIO_TYPE_SINE as OscillatorType;

    gainNode.gain.setValueAtTime(AUDIO_GAIN, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + AUDIO_DURATION);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + AUDIO_DURATION);
  } catch (error) {
    console.error('Could not play notification sound:', error);
  }
}

/**
 * Show toast notification
 */
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  let toastContainer = document.querySelector('.toast-container') as HTMLDivElement;
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-size: 16px;">${icons[type]}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION_MS);
}

/**
 * Show toast notification with undo action button
 */
function showToastWithUndo(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  let toastContainer = document.querySelector('.toast-container') as HTMLDivElement;
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Remove any existing toasts with undo buttons
  toastContainer.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-size: 16px;">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-action" id="undoBtn">Undo</button>
  `;

  toastContainer.appendChild(toast);

  // Attach undo handler
  const undoBtn = toast.querySelector('#undoBtn');
  undoBtn?.addEventListener('click', () => {
    toast.remove();
    undoDelete();
  });

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, UNDO_WINDOW_MS);
}

/**
 * Debounce utility function
 * Returns a debounced version of the provided function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Show loading overlay with spinner
 * Returns a unique ID for hiding the specific overlay later
 */
function showLoadingOverlay(message: string): string {
  const loadingId = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = loadingId;
  overlay.setAttribute('role', 'alert');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'true');

  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-message">${message}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  return loadingId;
}

/**
 * Hide loading overlay by ID
 */
function hideLoadingOverlay(loadingId: string): void {
  const overlay = document.getElementById(loadingId);
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  }
}

/**
 * Trigger confetti celebration
 */
function triggerConfetti(): void {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = 2 + Math.random() * 2 + 's';

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

/**
 * Show success animation on element
 */
function showSuccessAnimation(element: HTMLElement): void {
  element.classList.add('success');
  setTimeout(() => element.classList.remove('success'), SUCCESS_ANIMATION_DURATION_MS);
}

/**
 * Update timer warning visual state
 */
function updateTimerWarning(taskId: string, timeRemaining: number): void {
  const taskItem = document.querySelector(`[data-id="${taskId}"]`)?.closest(SELECTORS.TASK_ITEM);
  const timerDisplay = document.querySelector(`${SELECTORS.TIMER_DISPLAY}[data-id="${taskId}"]`);
  const timerContainer = taskItem?.querySelector('.task-timer');

  if (timeRemaining <= TIMER_WARNING_THRESHOLD_SECONDS && timeRemaining > 0) {
    taskItem?.classList.add(CSS_CLASSES.TIMER_WARNING);
    timerDisplay?.classList.add(CSS_CLASSES.WARNING);
    timerContainer?.classList.add(CSS_CLASSES.WARNING);
  } else {
    taskItem?.classList.remove(CSS_CLASSES.TIMER_WARNING);
    timerDisplay?.classList.remove(CSS_CLASSES.WARNING);
    timerContainer?.classList.remove(CSS_CLASSES.WARNING);
  }
}

// =============================================================================
// TASK MANAGEMENT
// =============================================================================

async function loadTasks(): Promise<void> {
  try {
    tasks = await window.electronAPI.getTasks();
    renderTasks();
    updateStats();
    restartRunningTimers();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    showToast('Failed to load tasks. Please restart the app.', 'error');
  }
}

function updateStats(): void {
  if (!DOM.statsText) {
    return;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  DOM.statsText.textContent = `${activeTasks} active • ${completedTasks} done`;
}

async function addTask(): Promise<void> {
  const title = DOM.taskInput.value.trim();
  if (!title) {
    DOM.taskInput.style.animation = 'shake 0.3s ease-out';
    setTimeout(() => (DOM.taskInput.style.animation = ''), 300);
    return;
  }

  try {
    // Convert priority 'none' to undefined for API
    const priorityValue =
      selectedPriority === PRIORITY_LEVELS.NONE
        ? undefined
        : (selectedPriority as 'high' | 'medium' | 'low');

    await window.electronAPI.addTask(title, selectedDuration, priorityValue);

    // Success feedback
    showSuccessAnimation(DOM.addBtn);
    showToast('Task added!', 'success');

    DOM.taskInput.value = '';
    selectNoneOption();
    selectNonePriority();

    await loadTasks();

    // Auto-focus for quick entry
    setTimeout(() => DOM.taskInput.focus(), 100);
  } catch (error) {
    console.error('Failed to add task:', error);
    showToast('Failed to add task. Please try again.', 'error');
  }
}

async function toggleTask(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  const isBeingCompleted = task && !task.completed;

  // Add completing animation if task is being marked as complete
  if (isBeingCompleted) {
    const taskElement = document.querySelector(`${SELECTORS.TASK_ITEM}[${ATTR_ID}="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.add(CSS_CLASSES.COMPLETING);
      // Wait for animation to complete before updating
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }

  try {
    await window.electronAPI.toggleTask(taskId);
    await loadTasks();

    // Check if all tasks are complete
    const allComplete = tasks.length > 0 && tasks.every(t => t.completed);
    if (allComplete) {
      triggerConfetti();
      showToast('🎉 All tasks complete! Great work!', 'success');
    }
  } catch (error) {
    console.error('Failed to toggle task:', error);
    showToast('Failed to update task. Please try again.', 'error');
    // Reload tasks to ensure UI is in sync
    await loadTasks();
  }
}

async function deleteTask(taskId: string): Promise<void> {
  // Store task for potential undo
  const taskToDelete = tasks.find(t => t.id === taskId);

  stopTimer(taskId);

  // Smooth removal animation
  const taskElement = document.querySelector(`[data-id="${taskId}"]`)?.closest('.task-item');
  if (taskElement) {
    (taskElement as HTMLElement).style.animation = 'slideOut 0.3s ease-out forwards';
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  try {
    await window.electronAPI.deleteTask(taskId);

    // Store for undo and clear any previous timeout
    if (taskToDelete) {
      if (undoTimeout !== null) {
        clearTimeout(undoTimeout);
      }
      lastDeletedTask = { ...taskToDelete };

      // Show toast with undo action
      showToastWithUndo(MSG_TASK_DELETED, 'info');

      // Clear undo state after window expires
      undoTimeout = window.setTimeout(() => {
        lastDeletedTask = null;
        undoTimeout = null;
      }, UNDO_WINDOW_MS);
    }

    await loadTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
    showToast('Failed to delete task. Please try again.', 'error');
    // Reload tasks to ensure UI is in sync
    await loadTasks();
  }
}

async function undoDelete(): Promise<void> {
  if (!lastDeletedTask) {
    return;
  }

  try {
    // Clear the undo timeout
    if (undoTimeout !== null) {
      clearTimeout(undoTimeout);
      undoTimeout = null;
    }

    // Re-add the task with all its properties
    const restoredTask = lastDeletedTask;
    lastDeletedTask = null;

    // Get current tasks and add the restored task back
    const currentTasks = await window.electronAPI.getTasks();
    currentTasks.push(restoredTask);
    await window.electronAPI.saveTasks(currentTasks);

    showToast(MSG_TASK_RESTORED, 'success');
    await loadTasks();

    // Restart timer if it was running
    if (
      restoredTask.isTimerRunning &&
      restoredTask.timeRemaining &&
      restoredTask.timeRemaining > 0
    ) {
      startTimer(restoredTask.id);
    }
  } catch (error) {
    console.error('Failed to undo delete:', error);
    showToast('Failed to restore task', 'error');
  }
}

async function updateTaskTitle(taskId: string, newTitle: string): Promise<void> {
  try {
    await window.electronAPI.updateTask(taskId, { title: newTitle });
    await loadTasks();
  } catch (error) {
    console.error('Failed to update task title:', error);
    showToast('Failed to update task. Please try again.', 'error');
    // Reload tasks to ensure UI is in sync
    await loadTasks();
  }
}

async function togglePin(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  await window.electronAPI.updateTask(taskId, { pinned: !task.pinned });
  showToast(task.pinned ? 'Task unpinned' : 'Task pinned', 'info');
  await loadTasks();
}

async function reorderTasks(draggedId: string, targetId: string): Promise<void> {
  const draggedIndex = tasks.findIndex(t => t.id === draggedId);
  const targetIndex = tasks.findIndex(t => t.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return;
  }

  const [draggedTask] = tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, draggedTask);

  await window.electronAPI.saveTasks(tasks);
  renderTasks();
}

// =============================================================================
// TIMER MANAGEMENT
// =============================================================================

function restartRunningTimers(): void {
  tasks.forEach(task => {
    if (task.isTimerRunning && task.timeRemaining && task.timeRemaining > 0) {
      startTimer(task.id);
    }
  });
}

async function startTimer(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.duration) {
    return;
  }

  // Stop other timers
  tasks.forEach(t => {
    if (t.id !== taskId && t.isTimerRunning) {
      stopTimer(t.id);
      t.isTimerRunning = false;
    }
  });

  await window.electronAPI.updateTaskTimer(taskId, { isTimerRunning: true });
  task.isTimerRunning = true;

  stopTimer(taskId); // Clear existing interval

  const intervalId = window.setInterval(async () => {
    await tickTimer(taskId);
  }, TIMER_TICK_INTERVAL_MS);

  timerIntervals.set(taskId, intervalId);
  renderTasks();
}

async function pauseTimer(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  stopTimer(taskId);

  await window.electronAPI.updateTaskTimer(taskId, {
    isTimerRunning: false,
    timeRemaining: task.timeRemaining,
  });
  task.isTimerRunning = false;
  renderTasks();
}

async function resetTimer(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.duration) {
    return;
  }

  stopTimer(taskId);

  const resetTime = task.duration * 60;
  await window.electronAPI.updateTaskTimer(taskId, {
    isTimerRunning: false,
    timeRemaining: resetTime,
  });
  task.isTimerRunning = false;
  task.timeRemaining = resetTime;
  renderTasks();
}

function stopTimer(taskId: string): void {
  if (timerIntervals.has(taskId)) {
    clearInterval(timerIntervals.get(taskId)!);
    timerIntervals.delete(taskId);
  }
}

async function tickTimer(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.timeRemaining) {
    stopTimer(taskId);
    return;
  }

  task.timeRemaining--;

  // Update UI
  updateTimerDisplay(taskId, task.timeRemaining, task.duration || 0);

  // Update warning state for low time
  updateTimerWarning(taskId, task.timeRemaining);

  // Save periodically
  if (task.timeRemaining % TIMER_SAVE_INTERVAL_SECONDS === 0) {
    await window.electronAPI.updateTaskTimer(taskId, { timeRemaining: task.timeRemaining });
  }

  // Timer completed
  if (task.timeRemaining <= 0) {
    stopTimer(taskId);
    await window.electronAPI.updateTaskTimer(taskId, {
      isTimerRunning: false,
      timeRemaining: 0,
    });
    task.isTimerRunning = false;
    await handleTimerComplete(taskId);
  }
}

function updateTimerDisplay(taskId: string, timeRemaining: number, duration: number): void {
  // Support both old and new selectors
  const timerDisplay = document.querySelector(`${SELECTORS.TIMER_DISPLAY}[${ATTR_ID}="${taskId}"]`);
  const timerTime = document.querySelector(`${SELECTORS.TIMER_TIME}[${ATTR_ID}="${taskId}"]`);
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemaining);
  }
  if (timerTime) {
    timerTime.textContent = formatTime(timeRemaining);
  }

  // Focus mode timer display
  const focusTimerDisplay = document.querySelector(`.focus-timer-display[${ATTR_ID}="${taskId}"]`);
  if (focusTimerDisplay) {
    focusTimerDisplay.textContent = formatTime(timeRemaining);
  }

  const progressPercent = (timeRemaining / (duration * SECONDS_PER_MINUTE)) * 100;

  // Support both old and new progress bar selectors
  const progressBar = document.querySelector(
    `${SELECTORS.TIMER_PROGRESS_BAR}[${ATTR_ID}="${taskId}"] ${SELECTORS.TIMER_PROGRESS_FILL}`
  );
  const progressFill = document.querySelector(
    `${SELECTORS.TIMER_PROGRESS}[${ATTR_ID}="${taskId}"] .timer-progress-fill`
  );
  if (progressBar) {
    (progressBar as HTMLElement).style.width = `${progressPercent}%`;
  }
  if (progressFill) {
    (progressFill as HTMLElement).style.width = `${progressPercent}%`;
  }

  // Focus mode progress bar
  const focusProgressFill = document.querySelector('.focus-timer-progress-fill');
  if (focusProgressFill) {
    (focusProgressFill as HTMLElement).style.width = `${progressPercent}%`;
  }
}

async function handleTimerComplete(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  playNotificationSound();

  // Automatically mark the task as done
  await toggleTask(taskId);
  showToast(`✓ Completed: ${task.title}`, 'success');

  // System notification
  await window.electronAPI.showNotification(MSG_TIMER_COMPLETE_TITLE, `Completed: ${task.title}`);

  // Find next task with timer
  const nextTask = tasks.find(t => !t.completed && t.id !== taskId && t.duration && t.duration > 0);

  if (nextTask) {
    // Ask user if they want to continue to next task
    const shouldContinue = await window.electronAPI.showConfirmDialog(
      'Continue to next task?',
      `Start timer for "${nextTask.title}"?`
    );

    if (shouldContinue) {
      showToast(`▶ Starting: ${nextTask.title}`, 'info');
      setTimeout(() => startTimer(nextTask.id), AUTO_ADVANCE_DELAY_MS);
    }
  } else {
    // All timers done - celebrate!
    triggerConfetti();
    showToast('🎉 All tasks complete! Awesome work!', 'success');
    await window.electronAPI.showNotification(MSG_ALL_DONE_TITLE, MSG_ALL_DONE_BODY);
  }
}

// =============================================================================
// UI RENDERING
// =============================================================================

function renderTasks(): void {
  const searchQuery = DOM.searchInput?.value.toLowerCase() || '';
  const filteredTasks = filterTasks(searchQuery);

  if (filteredTasks.length === 0) {
    DOM.tasksSection.innerHTML = renderEmptyState(searchQuery);
    resizeWindowToContent();
    return;
  }

  // Focus mode: check if any timer is running
  if (currentMode === APP_MODES.FOCUS) {
    const runningTask = filteredTasks.find(t => t.isTimerRunning);
    if (runningTask) {
      DOM.tasksSection.innerHTML = renderFocusTimerView(runningTask);
      // Event handlers now use delegation - no need to attach here
      resizeWindowToContent();
      return;
    } else {
      DOM.tasksSection.innerHTML = renderFocusModeEmptyState();
      resizeWindowToContent();
      return;
    }
  }

  // Render task sections (Active / Done)
  DOM.tasksSection.innerHTML = renderTaskSections(filteredTasks);

  attachEventHandlers();
  attachSectionHandlers();
  updateStats();
  resizeWindowToContent();
}

function renderTaskSections(taskList: Task[]): string {
  const activeTasks = getActiveTasks(taskList);
  const completedTasks = getCompletedTasks(taskList);

  // Sort active tasks by priority
  const sortedActive = sortTasks(activeTasks);

  const caretIcon = `<svg class="caret-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>`;

  let html = '';

  // Active section (always visible)
  if (sortedActive.length > 0) {
    html += `
      <div class="task-group" data-group="active">
        <div class="task-group-header">
          <span class="task-group-label">Active</span>
          <span class="task-group-count">${sortedActive.length}</span>
        </div>
        <div class="task-group-items">
          ${sortedActive.map(renderTaskHTML).join('')}
        </div>
      </div>
    `;
  }

  // Done section (collapsible)
  if (completedTasks.length > 0) {
    const collapsedClass = isDoneSectionCollapsed ? CSS_CLASSES.COLLAPSED : '';
    html += `
      <div class="task-group task-group-done ${collapsedClass}" data-group="done">
        <div class="task-group-header" role="button" tabindex="0" aria-expanded="${!isDoneSectionCollapsed}">
          ${caretIcon}
          <span class="task-group-label">Done</span>
          <span class="task-group-count">${completedTasks.length}</span>
        </div>
        <div class="task-group-items">
          ${completedTasks.map(renderTaskHTML).join('')}
        </div>
      </div>
    `;
  }

  // If no tasks at all, show empty state
  if (sortedActive.length === 0 && completedTasks.length === 0) {
    return renderEmptyState();
  }

  return html;
}

// Event delegation handler - attached once during initialization
function attachSectionHandlers(): void {
  // Note: This handler uses event delegation and is only attached once during initialization
  // It is NOT re-attached on every render, preventing memory leaks
}

// One-time initialization of delegated section event listeners
function initSectionEventDelegation(): void {
  // Handle clicks and keyboard events on the "Done" section header
  DOM.tasksSection.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    const doneHeader = target.closest('.task-group-done .task-group-header');
    if (doneHeader) {
      toggleDoneSection();
    }
  });

  DOM.tasksSection.addEventListener('keydown', (e: Event) => {
    const target = e.target as HTMLElement;
    const doneHeader = target.closest('.task-group-done .task-group-header');
    if (doneHeader) {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === KEY_ENTER || keyEvent.key === KEY_SPACE) {
        e.preventDefault();
        toggleDoneSection();
      }
    }
  });
}

function toggleDoneSection(): void {
  isDoneSectionCollapsed = !isDoneSectionCollapsed;
  const doneGroup = document.querySelector('.task-group-done');
  if (doneGroup) {
    doneGroup.classList.toggle(CSS_CLASSES.COLLAPSED, isDoneSectionCollapsed);
    const header = doneGroup.querySelector('.task-group-header');
    header?.setAttribute('aria-expanded', String(!isDoneSectionCollapsed));
  }
  // Save preference
  window.electronAPI.updateSettings({ doneSectionCollapsed: isDoneSectionCollapsed });
  resizeWindowToContent();
}

function resizeWindowToContent(): void {
  // Use requestAnimationFrame to ensure DOM has updated
  requestAnimationFrame(() => {
    const container = DOM.container;
    if (container) {
      // Get the actual content height
      const contentHeight = container.scrollHeight;
      // Add some padding for visual comfort
      const padding = 10;
      window.electronAPI.resizeWindow(contentHeight + padding);
    }
  });
}

function filterTasks(query: string): Task[] {
  if (!query) {
    return tasks;
  }
  return tasks.filter(task => task.title.toLowerCase().includes(query));
}

function sortTasks(taskList: Task[]): Task[] {
  // Sort priority: pinned → running timer → high priority → medium priority → low priority → none → completed
  // Preserve manual order within each priority group
  const pinned = taskList.filter(t => !t.completed && t.pinned);
  const running = taskList.filter(t => !t.completed && !t.pinned && t.isTimerRunning);

  // Active tasks (not pinned, not running timer, not completed)
  const active = taskList.filter(t => !t.completed && !t.pinned && !t.isTimerRunning);

  // Sort active tasks by priority
  const highPriority = active.filter(t => t.priority === PRIORITY_LEVELS.HIGH);
  const mediumPriority = active.filter(t => t.priority === PRIORITY_LEVELS.MEDIUM);
  const lowPriority = active.filter(t => t.priority === PRIORITY_LEVELS.LOW);
  const noPriority = active.filter(t => !t.priority);

  const completed = taskList.filter(t => t.completed);

  return [
    ...pinned,
    ...running,
    ...highPriority,
    ...mediumPriority,
    ...lowPriority,
    ...noPriority,
    ...completed,
  ];
}

function getActiveTasks(taskList: Task[]): Task[] {
  return taskList.filter(t => !t.completed);
}

function getCompletedTasks(taskList: Task[]): Task[] {
  return taskList.filter(t => t.completed);
}

function renderEmptyState(searchQuery?: string): string {
  if (searchQuery) {
    return `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <div class="empty-state-title">No matches</div>
        <div class="empty-state-text">No tasks matching "${escapeHtml(searchQuery)}"</div>
      </div>
    `;
  }

  return `
    <div class="empty-state">
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="13" y2="13"/>
        <line x1="9" y1="17" x2="11" y2="17"/>
      </svg>
      <div class="empty-state-title">No tasks yet</div>
      <div class="empty-state-text">Add your first task to get started</div>
      <div class="empty-state-hint">
        Press <span class="keyboard-hint">Enter</span> to add quickly
      </div>
    </div>
  `;
}

function renderFocusModeEmptyState(): string {
  const incompleteTasks = tasks.filter(t => !t.completed);
  const tasksWithTimers = incompleteTasks.filter(t => t.duration && t.duration > 0);

  if (incompleteTasks.length === 0) {
    return `
      <div class="empty-state focus-empty">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <div class="empty-state-title">All done!</div>
        <div class="empty-state-text">No tasks to focus on</div>
        <div class="empty-state-hint">
          Press <span class="keyboard-hint">Esc</span> to exit focus mode
        </div>
      </div>
    `;
  }

  if (tasksWithTimers.length === 0) {
    return `
      <div class="empty-state focus-empty">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <div class="empty-state-title">No timers set</div>
        <div class="empty-state-text">Add a timer to a task to use focus mode</div>
        <div class="empty-state-hint">
          Press <span class="keyboard-hint">Esc</span> to exit
        </div>
      </div>
    `;
  }

  return `
    <div class="empty-state focus-empty">
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="5,3 19,12 5,21 5,3"/>
      </svg>
      <div class="empty-state-title">Ready to focus</div>
      <div class="empty-state-text">Start a timer on any task to begin</div>
      <div class="empty-state-hint">
        Press <span class="keyboard-hint">Esc</span> to exit focus mode
      </div>
    </div>
  `;
}

function renderFocusTimerView(task: Task): string {
  const progressPercent = task.duration
    ? ((task.timeRemaining || 0) / (task.duration * SECONDS_PER_MINUTE)) * 100
    : 0;

  const playIcon = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 4 18 12 6 20 6 4"></polygon></svg>`;
  const pauseIcon = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
  const resetIcon = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`;
  const stopIcon = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="1"></rect></svg>`;

  return `
    <div class="focus-timer-view">
      <div class="focus-timer-display ${task.isTimerRunning ? 'running' : ''}" data-id="${task.id}">
        ${formatTime(task.timeRemaining || 0)}
      </div>
      <div class="focus-timer-title">${escapeHtml(task.title)}</div>
      <div class="focus-timer-progress">
        <div class="focus-timer-progress-fill ${task.isTimerRunning ? '' : 'paused'}" style="width: ${progressPercent}%"></div>
      </div>
      <div class="focus-timer-controls">
        ${
          task.isTimerRunning
            ? `<button class="focus-timer-btn primary" data-id="${task.id}" data-action="${TIMER_ACTION_PAUSE}" title="Pause">${pauseIcon} Pause</button>`
            : `<button class="focus-timer-btn primary" data-id="${task.id}" data-action="${TIMER_ACTION_PLAY}" title="Start">${playIcon} Start</button>`
        }
        <button class="focus-timer-btn secondary" data-id="${task.id}" data-action="${TIMER_ACTION_RESET}" title="Reset">${resetIcon}</button>
        <button class="focus-timer-btn tertiary" data-id="${task.id}" data-action="stop" title="Stop & Complete">${stopIcon}</button>
      </div>
      <div class="focus-timer-hint">Press <span class="keyboard-hint">Esc</span> to exit</div>
    </div>
  `;
}

// One-time initialization of delegated focus timer event listeners
function initFocusTimerEventDelegation(): void {
  // Focus timer button clicks - delegate to tasksSection
  DOM.tasksSection.addEventListener('click', async e => {
    const target = e.target as HTMLElement;
    const focusBtn = target.closest('.focus-timer-btn') as HTMLElement;
    if (focusBtn) {
      const taskId = focusBtn.dataset.id;
      const action = focusBtn.dataset.action;

      if (!taskId) {
        return;
      }

      switch (action) {
        case TIMER_ACTION_PLAY:
          await startTimer(taskId);
          break;
        case TIMER_ACTION_PAUSE:
          await pauseTimer(taskId);
          break;
        case TIMER_ACTION_RESET:
          await resetTimer(taskId);
          break;
        case 'stop':
          await pauseTimer(taskId);
          await toggleTask(taskId);
          break;
      }
    }
  });
}

function renderTaskHTML(task: Task): string {
  const timerHTML = renderTimerHTML(task);
  const completedClass = task.completed ? CSS_CLASSES.COMPLETED : '';
  const timerRunningClass = task.isTimerRunning ? CSS_CLASSES.TIMER_RUNNING : '';
  const hasTimerClass = task.duration && task.duration > 0 ? CSS_CLASSES.HAS_TIMER : '';
  const pinnedClass = task.pinned ? CSS_CLASSES.PINNED : '';

  // Priority class for left border
  let priorityClass = '';
  if (task.priority === PRIORITY_LEVELS.HIGH) {
    priorityClass = CSS_CLASSES.PRIORITY_HIGH;
  } else if (task.priority === PRIORITY_LEVELS.MEDIUM) {
    priorityClass = CSS_CLASSES.PRIORITY_MEDIUM;
  } else if (task.priority === PRIORITY_LEVELS.LOW) {
    priorityClass = CSS_CLASSES.PRIORITY_LOW;
  }

  // Priority indicator dot
  let priorityIndicator = '';
  if (task.priority) {
    priorityIndicator = `<span class="task-priority-indicator priority-${task.priority}"></span>`;
  }

  // SVG icons
  const dragIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>`;
  const deleteIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;
  const moreIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
  const pinIcon = `<svg class="pin-indicator icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L12 8M12 8L16 4M12 8L8 4M12 8L12 22" stroke-width="2"/></svg>`;

  return `
    <div class="task-item ${completedClass} ${timerRunningClass} ${hasTimerClass} ${pinnedClass} ${priorityClass}"
         draggable="true"
         data-id="${task.id}"
         role="listitem"
         aria-label="${escapeHtml(task.title)}${task.completed ? ' (completed)' : ''}${task.pinned ? ' (pinned)' : ''}${task.priority ? ` (${task.priority} priority)` : ''}">
      <div class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder task">
        ${dragIcon}
      </div>
      <div class="task-checkbox ${completedClass}"
           data-id="${task.id}"
           role="checkbox"
           aria-checked="${task.completed}"
           tabindex="0"
           aria-label="Mark task ${escapeHtml(task.title)} as ${task.completed ? 'incomplete' : 'complete'}"></div>
      <div class="task-content">
        <div class="task-main">
          ${task.pinned ? pinIcon : ''}
          ${priorityIndicator}
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-actions">
            <button class="task-action-btn more-btn" data-id="${task.id}" title="More actions" aria-label="More actions for ${escapeHtml(task.title)}" aria-haspopup="true">
              ${moreIcon}
            </button>
            <button class="task-action-btn delete-btn delete" data-id="${task.id}" title="Delete" aria-label="Delete task ${escapeHtml(task.title)}">
              ${deleteIcon}
            </button>
          </div>
        </div>
        ${timerHTML}
      </div>
    </div>
  `;
}

function renderTimerHTML(task: Task): string {
  if (!task.duration || task.duration <= 0) {
    return '';
  }

  const progressPercent = ((task.timeRemaining || 0) / (task.duration * 60)) * 100;

  // SVG icons for timer controls - compact inline design
  const playIcon = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="6 4 18 12 6 20 6 4"></polygon></svg>`;
  const pauseIcon = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
  const resetIcon = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`;

  // New premium timer design
  return `
    <div class="task-timer" role="group" aria-label="Timer for ${escapeHtml(task.title)}">
      <span class="timer-time ${task.isTimerRunning ? CSS_CLASSES.RUNNING : ''}" data-id="${task.id}" aria-live="polite" aria-atomic="true">
        ${formatTime(task.timeRemaining || 0)}
      </span>
      <div class="timer-progress" data-id="${task.id}" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        <div class="timer-progress-fill ${task.isTimerRunning ? '' : CSS_CLASSES.PAUSED}" style="width: ${progressPercent}%"></div>
      </div>
      <div class="timer-controls">
        ${
          task.isTimerRunning
            ? `<button class="timer-btn pause" data-id="${task.id}" data-action="${TIMER_ACTION_PAUSE}" title="Pause (Space)" aria-label="Pause timer">${pauseIcon}</button>`
            : `<button class="timer-btn play" data-id="${task.id}" data-action="${TIMER_ACTION_PLAY}" title="Start (Space)" aria-label="Start timer">${playIcon}</button>`
        }
        <button class="timer-btn reset" data-id="${task.id}" data-action="${TIMER_ACTION_RESET}" title="Reset" aria-label="Reset timer">${resetIcon}</button>
      </div>
    </div>
  `;
}

// =============================================================================
// EVENT HANDLERS - TASKS
// =============================================================================

// Event delegation handlers - attached once to parent containers
// This prevents memory leaks from attaching/re-attaching on every render
function attachTaskEventHandlers(): void {
  // Note: These handlers use event delegation and are only attached once during initialization
  // They are NOT re-attached on every render, preventing memory leaks
}

// One-time initialization of delegated task event listeners
function initTaskEventDelegation(): void {
  // Checkbox toggle - delegate to tasksSection
  DOM.tasksSection.addEventListener('click', async e => {
    const target = e.target as HTMLElement;
    const checkbox = target.closest(SELECTORS.TASK_CHECKBOX) as HTMLElement;
    if (checkbox) {
      const taskId = checkbox.dataset.id;
      if (taskId) {
        await toggleTask(taskId);
      }
    }
  });

  // Double-click to edit - delegate to tasksSection
  DOM.tasksSection.addEventListener('dblclick', e => {
    const target = e.target as HTMLElement;
    const title = target.closest(SELECTORS.TASK_TITLE);
    if (title) {
      const taskItem = title.closest(SELECTORS.TASK_ITEM);
      const taskId = taskItem?.querySelector(`[${ATTR_ID}]`)?.getAttribute(ATTR_ID);
      if (taskId) {
        enterEditMode(taskId);
      }
    }
  });

  // Delete button - delegate to tasksSection
  DOM.tasksSection.addEventListener('click', async e => {
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest(SELECTORS.DELETE_BTN) as HTMLElement;
    if (deleteBtn) {
      const taskId = deleteBtn.dataset.id;
      if (taskId) {
        await deleteTask(taskId);
      }
    }
  });

  // More button (overflow menu) - delegate to tasksSection
  DOM.tasksSection.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    const moreBtn = target.closest('.more-btn') as HTMLElement;
    if (moreBtn) {
      e.stopPropagation();
      const taskId = moreBtn.dataset.id;
      if (taskId) {
        const rect = moreBtn.getBoundingClientRect();
        showTaskContextMenu({ clientX: rect.right, clientY: rect.bottom } as MouseEvent, taskId);
      }
    }
  });
}

// =============================================================================
// EVENT HANDLERS - TIMERS
// =============================================================================

// Event delegation handlers - attached once to parent container
function attachTimerEventHandlers(): void {
  // Note: These handlers use event delegation and are only attached once during initialization
  // They are NOT re-attached on every render, preventing memory leaks
}

// One-time initialization of delegated timer event listeners
function initTimerEventDelegation(): void {
  // Timer button clicks - delegate to tasksSection
  DOM.tasksSection.addEventListener('click', async e => {
    const target = e.target as HTMLElement;
    const timerBtn = target.closest(SELECTORS.TIMER_BTN) as HTMLElement;
    if (timerBtn) {
      const taskId = timerBtn.dataset.id;
      const action = timerBtn.dataset.action;

      if (!taskId || !action) {
        return;
      }

      if (action === TIMER_ACTION_PLAY) {
        await startTimer(taskId);
      } else if (action === TIMER_ACTION_PAUSE) {
        await pauseTimer(taskId);
      } else if (action === TIMER_ACTION_RESET) {
        await resetTimer(taskId);
      }
    }
  });
}

// =============================================================================
// EVENT HANDLERS - DRAG & DROP
// =============================================================================

// Constants for drag and drop styling
const DRAG_OPACITY_DRAGGING = '0.5';
const DRAG_OPACITY_NORMAL = '1';
const DRAG_CLASS = 'dragging';
const DRAG_OVER_CLASS = 'drag-over';

// Event delegation handlers - attached once to parent container
function attachDragHandlers(): void {
  // Note: These handlers use event delegation and are only attached once during initialization
  // They are NOT re-attached on every render, preventing memory leaks
}

// One-time initialization of delegated drag-and-drop event listeners
function initDragEventDelegation(): void {
  // Dragstart - delegate to tasksSection
  DOM.tasksSection.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const taskItem = target.closest(SELECTORS.TASK_ITEM) as HTMLElement;
    if (taskItem) {
      draggedTaskId = taskItem.getAttribute(ATTR_ID);
      if (e.dataTransfer && draggedTaskId) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedTaskId);
      }
      taskItem.style.opacity = DRAG_OPACITY_DRAGGING;
      taskItem.classList.add(DRAG_CLASS);
    }
  });

  // Dragend - delegate to tasksSection
  DOM.tasksSection.addEventListener('dragend', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const taskItem = target.closest(SELECTORS.TASK_ITEM) as HTMLElement;
    if (taskItem) {
      taskItem.style.opacity = DRAG_OPACITY_NORMAL;
      taskItem.classList.remove(DRAG_CLASS);
      draggedTaskId = null;
      // Clean up any drag-over classes
      document.querySelectorAll(`.${DRAG_OVER_CLASS}`).forEach(el => {
        el.classList.remove(DRAG_OVER_CLASS);
      });
    }
  });

  // Dragover - delegate to tasksSection
  DOM.tasksSection.addEventListener('dragover', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const taskItem = target.closest(SELECTORS.TASK_ITEM) as HTMLElement;
    if (taskItem) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      const taskId = taskItem.getAttribute(ATTR_ID);
      if (draggedTaskId && taskId && draggedTaskId !== taskId) {
        taskItem.classList.add(DRAG_OVER_CLASS);
      }
    }
  });

  // Dragleave - delegate to tasksSection
  DOM.tasksSection.addEventListener('dragleave', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const taskItem = target.closest(SELECTORS.TASK_ITEM) as HTMLElement;
    if (taskItem) {
      taskItem.classList.remove(DRAG_OVER_CLASS);
    }
  });

  // Drop - delegate to tasksSection
  DOM.tasksSection.addEventListener('drop', async (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const taskItem = target.closest(SELECTORS.TASK_ITEM) as HTMLElement;
    if (taskItem) {
      e.preventDefault();
      taskItem.classList.remove(DRAG_OVER_CLASS);

      const targetTaskId = taskItem.getAttribute(ATTR_ID);
      const droppedTaskId = e.dataTransfer?.getData('text/plain') || draggedTaskId;

      if (droppedTaskId && targetTaskId && droppedTaskId !== targetTaskId) {
        await reorderTasks(droppedTaskId, targetTaskId);
      }
    }
  });
}

function attachEventHandlers(): void {
  attachTaskEventHandlers();
  attachTimerEventHandlers();
  attachDragHandlers();
}

// =============================================================================
// TASK EDITING
// =============================================================================

function enterEditMode(taskId: string): void {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  const taskItem = document.querySelector(`${SELECTORS.TASK_ITEM}[${ATTR_ID}="${taskId}"]`);
  if (!taskItem) {
    return;
  }

  taskItem.classList.add(CSS_CLASSES.EDITING);
  const titleEl = taskItem.querySelector(SELECTORS.TASK_TITLE);
  if (!titleEl) {
    return;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.className = CSS_CLASSES.TASK_EDIT_INPUT;
  input.value = task.title;

  titleEl.after(input);
  input.focus();
  input.select();

  const saveEdit = async () => {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== task.title) {
      await updateTaskTitle(taskId, newTitle);
    }
    taskItem.classList.remove(CSS_CLASSES.EDITING);
    input.remove();
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', e => {
    if (e.key === KEY_ENTER) {
      saveEdit();
    } else if (e.key === KEY_ESCAPE) {
      taskItem.classList.remove(CSS_CLASSES.EDITING);
      input.remove();
    }
  });
}

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', async e => {
    await handleKeyboardShortcut(e);
  });
}

async function handleKeyboardShortcut(e: KeyboardEvent): Promise<void> {
  const TAG_INPUT = 'INPUT';
  const TAG_TEXTAREA = 'TEXTAREA';
  const TAG_BUTTON = 'BUTTON';

  const activeElement = document.activeElement;
  const isInputFocused =
    activeElement?.tagName === TAG_INPUT ||
    activeElement?.tagName === TAG_TEXTAREA ||
    activeElement?.tagName === TAG_BUTTON;

  // Esc - Always works (blur input and clear)
  if (e.key === KEY_ESCAPE) {
    if (isInputFocused && activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
    clearInputs();
    return;
  }

  const incompleteTasks = tasks.filter(t => !t.completed);

  // Cmd/Ctrl shortcuts - work even when input is focused
  if (e.metaKey || e.ctrlKey) {
    await handleModifierShortcut(e, incompleteTasks);
    return;
  }

  // Don't trigger navigation/action keys when typing in input
  if (isInputFocused) {
    return;
  }

  // Arrow & action keys (only when not in input)
  await handleNavigationKey(e, incompleteTasks);
}

async function handleModifierShortcut(e: KeyboardEvent, incompleteTasks: Task[]): Promise<void> {
  switch (e.key) {
    // Mode switching: ⌘1, ⌘2, ⌘3
    case '1':
      e.preventDefault();
      setAppMode(APP_MODES.FULL);
      break;

    case '2':
      e.preventDefault();
      setAppMode(APP_MODES.COMPACT);
      break;

    case '3':
      e.preventDefault();
      setAppMode(APP_MODES.FOCUS);
      break;

    case 'd':
      e.preventDefault();
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        await toggleTask(incompleteTasks[selectedTaskIndex].id);
      }
      break;

    case 'Backspace':
      e.preventDefault();
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        await deleteTask(incompleteTasks[selectedTaskIndex].id);
        selectedTaskIndex = Math.max(0, selectedTaskIndex - 1);
      }
      break;

    case 'e':
      e.preventDefault();
      await handleExport();
      break;

    case 'i':
      e.preventDefault();
      await handleImport();
      break;

    case 'n':
      e.preventDefault();
      // Focus task input for new task
      DOM.taskInput.focus();
      break;

    case 'f':
      e.preventDefault();
      if (e.shiftKey) {
        // Cmd+Shift+F: Toggle focus mode
        toggleFocusMode();
      } else {
        // Cmd+F: Focus search
        DOM.searchInput?.focus();
      }
      break;

    case 't':
      e.preventDefault();
      DOM.themeToggle?.click();
      break;

    case 'k':
      e.preventDefault();
      openCommandPalette();
      break;
  }
}

async function handleNavigationKey(e: KeyboardEvent, incompleteTasks: Task[]): Promise<void> {
  switch (e.key) {
    case KEY_ARROW_DOWN:
      e.preventDefault();
      selectedTaskIndex = Math.min(incompleteTasks.length - 1, selectedTaskIndex + 1);
      highlightSelectedTask();
      break;

    case KEY_ARROW_UP:
      e.preventDefault();
      selectedTaskIndex = Math.max(0, selectedTaskIndex - 1);
      highlightSelectedTask();
      break;

    case KEY_SPACE:
      e.preventDefault();
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        await toggleTask(incompleteTasks[selectedTaskIndex].id);
      }
      break;

    case KEY_ENTER:
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        enterEditMode(incompleteTasks[selectedTaskIndex].id);
      }
      break;
  }
}

function highlightSelectedTask(): void {
  document.querySelectorAll(SELECTORS.TASK_ITEM_NOT_COMPLETED).forEach((item, index) => {
    if (index === selectedTaskIndex) {
      item.classList.add(CSS_CLASSES.SELECTED);
      item.scrollIntoView({
        behavior: SCROLL_BEHAVIOR_SMOOTH as ScrollBehavior,
        block: SCROLL_BLOCK_NEAREST as ScrollLogicalPosition,
      });
    } else {
      item.classList.remove(CSS_CLASSES.SELECTED);
    }
  });
}

function clearInputs(): void {
  const EMPTY_STRING = '';

  DOM.taskInput.value = EMPTY_STRING;
  selectedTaskIndex = -1;
  if (DOM.searchInput) {
    DOM.searchInput.value = EMPTY_STRING;
  }
  selectNoneOption();
  renderTasks();
}

// =============================================================================
// DURATION PRESETS / SEGMENTED CONTROL
// =============================================================================

function initializePresetButtons(): void {
  // Try new duration picker first (premium UI)
  const durationPicker = DOM.durationPicker;
  if (durationPicker) {
    attachDurationPickerHandlers();
    return;
  }

  // Try segmented control (old premium UI)
  const segmentedControl = document.querySelector(SELECTORS.SEGMENTED_CONTROL);
  if (segmentedControl) {
    attachSegmentHandlers();
    return;
  }

  // Fall back to legacy preset buttons
  const presetsContainer = document.querySelector(SELECTORS.DURATION_PRESETS);
  if (!presetsContainer) {
    return;
  }

  presetsContainer.innerHTML = DURATION_PRESETS.map(
    preset =>
      `<button class="${SELECTORS.PRESET_BTN.slice(1)}" ${ATTR_MINUTES}="${preset.minutes}">${preset.label}</button>`
  ).join('');

  attachPresetHandlers();
}

function attachDurationPickerHandlers(): void {
  document.querySelectorAll(SELECTORS.DURATION_OPTION).forEach(btn => {
    btn.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement;
      const minutes = parseInt(target.getAttribute(ATTR_MINUTES) || '0');
      toggleDurationOption(target, minutes);

      // Clear custom input when preset is selected
      if (DOM.customDurationInput) {
        DOM.customDurationInput.value = '';
        DOM.customDurationInput.classList.remove(CSS_CLASSES.ACTIVE);
      }
    });
  });

  // Custom duration input handler
  attachCustomDurationHandler();
}

function attachCustomDurationHandler(): void {
  const customInput = DOM.customDurationInput;
  if (!customInput) {
    return;
  }

  customInput.addEventListener('focus', () => {
    // Clear preset selection when custom input is focused
    clearPresetSelection();
    customInput.classList.add(CSS_CLASSES.ACTIVE);
  });

  customInput.addEventListener('input', () => {
    const value = parseInt(customInput.value);

    if (!isNaN(value) && value > 0) {
      // Clamp to valid range
      const clampedValue = Math.min(Math.max(value, 1), 1440);
      selectedDuration = clampedValue;

      // Clear preset selection
      clearPresetSelection();
      customInput.classList.add(CSS_CLASSES.ACTIVE);
    } else if (customInput.value === '') {
      selectedDuration = undefined;
      customInput.classList.remove(CSS_CLASSES.ACTIVE);
    }
  });

  customInput.addEventListener('blur', () => {
    const value = parseInt(customInput.value);

    if (!isNaN(value) && value > 0) {
      // Clamp value on blur and update display
      const clampedValue = Math.min(Math.max(value, 1), 1440);
      customInput.value = clampedValue.toString();
      selectedDuration = clampedValue;
    } else if (customInput.value === '') {
      customInput.classList.remove(CSS_CLASSES.ACTIVE);
      // If empty, select "None" option
      selectNoneOption();
    }
  });

  // Handle Enter key
  customInput.addEventListener('keydown', e => {
    if (e.key === KEY_ENTER) {
      customInput.blur();
    }
  });
}

function toggleDurationOption(clickedBtn: HTMLElement, minutes: number): void {
  // Clear all selections
  clearPresetSelection();

  // Select the clicked button
  clickedBtn.classList.add(CSS_CLASSES.SELECTED);

  // Set duration (0 means no timer)
  selectedDuration = minutes === 0 ? undefined : minutes;
}

function attachSegmentHandlers(): void {
  document.querySelectorAll(SELECTORS.SEGMENT_BTN).forEach(btn => {
    btn.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement;
      const minutes = parseInt(target.getAttribute(ATTR_MINUTES) || '0');
      toggleSegmentSelection(target, minutes);
    });
  });
}

function toggleSegmentSelection(clickedBtn: HTMLElement, minutes: number): void {
  // Clear all selections
  clearPresetSelection();

  // Select the clicked button
  clickedBtn.classList.add(CSS_CLASSES.SELECTED);

  // Set duration (0 means no timer)
  selectedDuration = minutes === 0 ? undefined : minutes;
}

function attachPresetHandlers(): void {
  document.querySelectorAll(SELECTORS.PRESET_BTN).forEach(btn => {
    btn.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement;
      const minutes = parseInt(target.getAttribute(ATTR_MINUTES) || '0');
      togglePresetSelection(target, minutes);
    });
  });
}

function togglePresetSelection(clickedBtn: HTMLElement, minutes: number): void {
  const wasSelected = clickedBtn.classList.contains(CSS_CLASSES.SELECTED);

  clearPresetSelection();

  if (!wasSelected) {
    clickedBtn.classList.add(CSS_CLASSES.SELECTED);
    selectedDuration = minutes;
  } else {
    selectedDuration = undefined;
  }
}

function clearPresetSelection(): void {
  // Clear duration option buttons (new premium UI)
  document.querySelectorAll(SELECTORS.DURATION_OPTION).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
  });

  // Clear both segment buttons and legacy preset buttons
  document.querySelectorAll(SELECTORS.SEGMENT_BTN).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
  });
  document.querySelectorAll(SELECTORS.PRESET_BTN).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
  });
}

function selectNoneOption(): void {
  clearPresetSelection();
  const noneOption = document.querySelector(`${SELECTORS.DURATION_OPTION}[${ATTR_MINUTES}="0"]`);
  if (noneOption) {
    noneOption.classList.add(CSS_CLASSES.SELECTED);
  }
  selectedDuration = undefined;

  // Clear custom input
  if (DOM.customDurationInput) {
    DOM.customDurationInput.value = '';
    DOM.customDurationInput.classList.remove(CSS_CLASSES.ACTIVE);
  }
}

// =============================================================================
// PRIORITY PICKER
// =============================================================================

function initializePriorityPicker(): void {
  if (!DOM.priorityPicker) {
    return;
  }

  document.querySelectorAll(SELECTORS.PRIORITY_OPTION).forEach(btn => {
    btn.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement;
      const priority = target.getAttribute('data-priority') as Priority;
      togglePriorityOption(target, priority);
    });
  });
}

function togglePriorityOption(clickedBtn: HTMLElement, priority: Priority): void {
  // Clear all priority selections
  document.querySelectorAll(SELECTORS.PRIORITY_OPTION).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
    btn.setAttribute('aria-checked', 'false');
  });

  // Select the clicked button
  clickedBtn.classList.add(CSS_CLASSES.SELECTED);
  clickedBtn.setAttribute('aria-checked', 'true');

  // Set priority
  selectedPriority = priority;
}

function selectNonePriority(): void {
  selectedPriority = PRIORITY_LEVELS.NONE;
  document.querySelectorAll(SELECTORS.PRIORITY_OPTION).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
    btn.setAttribute('aria-checked', 'false');
  });
  const noneOption = document.querySelector(`${SELECTORS.PRIORITY_OPTION}[data-priority="none"]`);
  if (noneOption) {
    noneOption.classList.add(CSS_CLASSES.SELECTED);
    noneOption.setAttribute('aria-checked', 'true');
  }
}

// =============================================================================
// ACTION BUTTONS
// =============================================================================

function setupActionButtons(): void {
  // Clear completed
  if (DOM.clearCompletedBtn) {
    DOM.clearCompletedBtn.addEventListener('click', async () => {
      const completedCount = tasks.filter(t => t.completed).length;
      if (completedCount === 0) {
        showToast('No completed tasks to clear', 'info');
        return;
      }

      await window.electronAPI.clearCompleted();
      showToast(
        `Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`,
        'success'
      );
      await loadTasks();
    });
  }

  // Export
  if (DOM.exportBtn) {
    DOM.exportBtn.addEventListener('click', async () => {
      showToast('Exporting tasks...', 'info');
      const result = await window.electronAPI.exportTasks();
      if (result) {
        showToast('Tasks exported successfully!', 'success');
      }
    });
  }

  // Import
  if (DOM.importBtn) {
    DOM.importBtn.addEventListener('click', async () => {
      showToast('Importing tasks...', 'info');
      const count = await window.electronAPI.importTasks();
      if (count > 0) {
        showToast(`Imported ${count} task${count > 1 ? 's' : ''}!`, 'success');
        await loadTasks();
      } else {
        showToast('No tasks imported', 'info');
      }
    });
  }

  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', async () => {
      document.body.classList.toggle(CSS_CLASSES.LIGHT_THEME);
      const theme = document.body.classList.contains(CSS_CLASSES.LIGHT_THEME)
        ? THEME_LIGHT
        : THEME_DARK;
      await window.electronAPI.updateSettings({ theme });
    });

    // Load saved theme
    window.electronAPI
      .getSettings()
      .then(settings => {
        if (settings.theme === THEME_LIGHT) {
          document.body.classList.add(CSS_CLASSES.LIGHT_THEME);
        }
      })
      .catch(error => {
        console.error('Failed to load theme settings:', error);
      });
  }

  // Focus mode toggle
  if (DOM.focusBtn) {
    DOM.focusBtn.addEventListener('click', () => {
      toggleFocusMode();
    });
  }
}

// =============================================================================
// APP MODES (Full / Compact / Focus)
// =============================================================================

function setAppMode(mode: AppMode): void {
  currentMode = mode;

  // Remove all mode classes
  DOM.container.classList.remove(CSS_CLASSES.FOCUS_MODE, CSS_CLASSES.COMPACT_MODE);

  // Remove active class from all mode buttons
  DOM.fullModeBtn?.classList.remove(CSS_CLASSES.ACTIVE);
  DOM.compactModeBtn?.classList.remove(CSS_CLASSES.ACTIVE);
  DOM.focusModeBtn?.classList.remove(CSS_CLASSES.ACTIVE);

  // Apply new mode
  switch (mode) {
    case APP_MODES.COMPACT:
      DOM.container.classList.add(CSS_CLASSES.COMPACT_MODE);
      DOM.compactModeBtn?.classList.add(CSS_CLASSES.ACTIVE);
      break;
    case APP_MODES.FOCUS:
      DOM.container.classList.add(CSS_CLASSES.FOCUS_MODE);
      DOM.focusModeBtn?.classList.add(CSS_CLASSES.ACTIVE);
      break;
    case APP_MODES.FULL:
    default:
      DOM.fullModeBtn?.classList.add(CSS_CLASSES.ACTIVE);
      break;
  }

  renderTasks();
}

function setupModeSelector(): void {
  // Full mode button
  DOM.fullModeBtn?.addEventListener('click', () => {
    setAppMode(APP_MODES.FULL);
  });

  // Compact mode button
  DOM.compactModeBtn?.addEventListener('click', () => {
    setAppMode(APP_MODES.COMPACT);
  });

  // Focus mode button
  DOM.focusModeBtn?.addEventListener('click', () => {
    setAppMode(APP_MODES.FOCUS);
  });

  // Legacy focus button
  DOM.focusBtn?.addEventListener('click', () => {
    toggleFocusMode();
  });
}

function toggleFocusMode(): void {
  if (currentMode === APP_MODES.FOCUS) {
    setAppMode(APP_MODES.FULL);
  } else {
    setAppMode(APP_MODES.FOCUS);
  }
}

// =============================================================================
// OVERFLOW MENU
// =============================================================================

function setupOverflowMenu(): void {
  DOM.overflowMenuBtn?.addEventListener('click', e => {
    e.stopPropagation();
    showOverflowMenu();
  });
}

function showOverflowMenu(): void {
  // Remove existing menu if any
  closeContextMenu();

  const menu = document.createElement('div');
  menu.className = 'context-menu overflow-menu';

  // Position relative to overflow button
  const btnRect = DOM.overflowMenuBtn?.getBoundingClientRect();
  if (btnRect) {
    menu.style.top = `${btnRect.bottom + 4}px`;
    menu.style.right = `${window.innerWidth - btnRect.right}px`;
    menu.style.left = 'auto';
  }

  menu.innerHTML = `
    <div class="context-menu-item" data-action="export">
      <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      <span>Export Tasks</span>
      <span class="shortcut">⌘E</span>
    </div>
    <div class="context-menu-item" data-action="import">
      <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span>Import Tasks</span>
      <span class="shortcut">⌘I</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" data-action="clear">
      <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      <span>Clear Completed</span>
    </div>
  `;

  document.body.appendChild(menu);

  // Handle menu actions
  menu.addEventListener('click', async e => {
    const target = (e.target as HTMLElement).closest('.context-menu-item');
    if (!target) {
      return;
    }

    const action = target.getAttribute('data-action');
    closeContextMenu();

    switch (action) {
      case 'export':
        await handleExport();
        break;
      case 'import':
        await handleImport();
        break;
      case 'clear':
        await handleClearCompleted();
        break;
    }
  });

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu, { once: true });
  }, 0);
}

async function handleExport(): Promise<void> {
  const loadingId = showLoadingOverlay('Exporting tasks...');
  try {
    const result = await window.electronAPI.exportTasks();
    hideLoadingOverlay(loadingId);
    if (result) {
      showToast('Tasks exported successfully!', 'success');
    } else {
      showToast('Export canceled', 'info');
    }
  } catch (error) {
    hideLoadingOverlay(loadingId);
    console.error('Failed to export tasks:', error);
    showToast('Failed to export tasks. Please try again.', 'error');
  }
}

async function handleImport(): Promise<void> {
  const loadingId = showLoadingOverlay('Importing tasks...');
  try {
    const count = await window.electronAPI.importTasks();
    hideLoadingOverlay(loadingId);
    if (count > 0) {
      showToast(`Imported ${count} task${count > 1 ? 's' : ''}!`, 'success');
      await loadTasks();
    } else {
      showToast('No tasks imported', 'info');
    }
  } catch (error) {
    hideLoadingOverlay(loadingId);
    console.error('Failed to import tasks:', error);
    showToast('Failed to import tasks. Please try again.', 'error');
  }
}

async function handleClearCompleted(): Promise<void> {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }

  await window.electronAPI.clearCompleted();
  showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'success');
  await loadTasks();
}

// =============================================================================
// CONTEXT MENU
// =============================================================================

function setupContextMenu(): void {
  // Right-click on tasks
  DOM.tasksSection.addEventListener('contextmenu', e => {
    const taskItem = (e.target as HTMLElement).closest(SELECTORS.TASK_ITEM);
    if (!taskItem) {
      return;
    }

    e.preventDefault();
    const taskId = taskItem.getAttribute(ATTR_ID);
    if (taskId) {
      showTaskContextMenu(e as MouseEvent, taskId);
    }
  });
}

function showTaskContextMenu(e: MouseEvent, taskId: string): void {
  closeContextMenu();
  contextMenuTarget = taskId;

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.top = `${e.clientY}px`;
  menu.style.left = `${e.clientX}px`;

  const timerAction = task.isTimerRunning
    ? `<div class="context-menu-item" data-action="pause">
        <svg class="icon" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause Timer</span>
        <span class="shortcut">Space</span>
      </div>`
    : task.duration && task.duration > 0
      ? `<div class="context-menu-item" data-action="play">
          <svg class="icon" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Start Timer</span>
          <span class="shortcut">Space</span>
        </div>`
      : '';

  const pinAction = !task.completed
    ? `<div class="context-menu-item" data-action="pin">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 2v10M12 12l4-4M12 12l-4-4M12 12v10" stroke-width="2"/></svg>
        <span>${task.pinned ? 'Unpin Task' : 'Pin to Top'}</span>
      </div>`
    : '';

  menu.innerHTML = `
    <div class="context-menu-item" data-action="edit">
      <svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      <span>Edit</span>
      <span class="shortcut">Enter</span>
    </div>
    <div class="context-menu-item" data-action="toggle">
      <svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${task.completed ? 'Mark Incomplete' : 'Mark Complete'}</span>
      <span class="shortcut">⌘D</span>
    </div>
    ${pinAction}
    ${timerAction}
    <div class="context-menu-divider"></div>
    <div class="context-menu-item danger" data-action="delete">
      <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      <span>Delete</span>
      <span class="shortcut">⌫</span>
    </div>
  `;

  document.body.appendChild(menu);

  // Handle menu actions
  menu.addEventListener('click', async e => {
    const target = (e.target as HTMLElement).closest('.context-menu-item');
    if (!target) {
      return;
    }

    const action = target.getAttribute('data-action');
    closeContextMenu();

    if (!contextMenuTarget) {
      return;
    }

    switch (action) {
      case 'edit':
        enterEditMode(contextMenuTarget);
        break;
      case 'toggle':
        await toggleTask(contextMenuTarget);
        break;
      case 'pin':
        await togglePin(contextMenuTarget);
        break;
      case 'play':
        await startTimer(contextMenuTarget);
        break;
      case 'pause':
        await pauseTimer(contextMenuTarget);
        break;
      case 'delete':
        await deleteTask(contextMenuTarget);
        break;
    }
  });

  // Adjust position if menu goes off-screen
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - menuRect.width - 8}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - menuRect.height - 8}px`;
    }
  });

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu, { once: true });
  }, 0);
}

function closeContextMenu(): void {
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  contextMenuTarget = null;
}

// =============================================================================
// SEARCH
// =============================================================================

function setupSearch(): void {
  if (!DOM.searchInput) {
    return;
  }

  let searchTimeout: number;
  DOM.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => renderTasks(), SEARCH_DEBOUNCE_MS);
  });
}

// =============================================================================
// ACCORDION CONTROLS
// =============================================================================

function setupAccordionToggles(): void {
  // Search bar toggle
  if (DOM.searchToggle && DOM.searchBar) {
    DOM.searchToggle.addEventListener('click', () => {
      const isCollapsed = DOM.searchBar!.classList.toggle(CSS_CLASSES.COLLAPSED);
      DOM.searchToggle!.classList.toggle(CSS_CLASSES.COLLAPSED, isCollapsed);
      // Save state
      window.electronAPI.updateSettings({ searchCollapsed: isCollapsed });
    });
  }

  // Input section toggle
  if (DOM.inputToggle && DOM.inputSection) {
    DOM.inputToggle.addEventListener('click', () => {
      const isCollapsed = DOM.inputSection!.classList.toggle(CSS_CLASSES.COLLAPSED);
      DOM.inputToggle!.classList.toggle(CSS_CLASSES.COLLAPSED, isCollapsed);
      // Save state
      window.electronAPI.updateSettings({ inputCollapsed: isCollapsed });
    });
  }

  // Load saved states
  window.electronAPI
    .getSettings()
    .then(settings => {
      if (settings.searchCollapsed && DOM.searchBar && DOM.searchToggle) {
        DOM.searchBar.classList.add(CSS_CLASSES.COLLAPSED);
        DOM.searchToggle.classList.add(CSS_CLASSES.COLLAPSED);
      }
      if (settings.inputCollapsed && DOM.inputSection && DOM.inputToggle) {
        DOM.inputSection.classList.add(CSS_CLASSES.COLLAPSED);
        DOM.inputToggle.classList.add(CSS_CLASSES.COLLAPSED);
      }
      // Load done section collapsed state
      if (settings.doneSectionCollapsed !== undefined) {
        isDoneSectionCollapsed = settings.doneSectionCollapsed;
      }
    })
    .catch(error => {
      console.error('Failed to load accordion settings:', error);
    });
}

// =============================================================================
// WINDOW CONTROLS
// =============================================================================

function setupWindowControls(): void {
  DOM.minimizeBtn.addEventListener('click', () => {
    window.electronAPI.minimize();
  });

  DOM.closeBtn.addEventListener('click', () => {
    window.electronAPI.close();
  });
}

// =============================================================================
// TASK INPUT
// =============================================================================

function setupTaskInput(): void {
  DOM.addBtn.addEventListener('click', addTask);

  DOM.taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
}

// =============================================================================
// COMMAND PALETTE
// =============================================================================

const COMMAND_PALETTE_MIN_HEIGHT = 500;

function openCommandPalette(): void {
  if (isCommandPaletteOpen) {
    return;
  }
  isCommandPaletteOpen = true;
  commandPaletteSelectedIndex = 0;

  // Ensure window is tall enough for command palette
  window.electronAPI.resizeWindow(COMMAND_PALETTE_MIN_HEIGHT);

  const overlay = document.createElement('div');
  overlay.className = 'command-palette-overlay';
  overlay.innerHTML = `
    <div class="command-palette">
      <div class="command-palette-search">
        <div class="command-palette-search-wrapper">
          <svg class="command-palette-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" class="command-palette-input" placeholder="Type a command..." autofocus>
        </div>
      </div>
      <div class="command-palette-list">
        ${renderCommandList(COMMANDS)}
      </div>
      <div class="command-palette-hint">
        <span class="kbd">↑↓</span> navigate
        <span class="kbd">↵</span> select
        <span class="kbd">esc</span> close
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Get elements
  const input = overlay.querySelector('.command-palette-input') as HTMLInputElement;
  const list = overlay.querySelector('.command-palette-list') as HTMLDivElement;

  // Focus input
  setTimeout(() => input?.focus(), 50);

  // Handle input filtering with debounce to improve performance
  const debouncedFilter = debounce(() => {
    const query = input.value.toLowerCase();
    const filtered = filterCommands(query);
    list.innerHTML = renderCommandList(filtered);
    commandPaletteSelectedIndex = 0;
    updateCommandPaletteSelection(list);
    attachCommandClickHandlers(list, overlay);
  }, SEARCH_DEBOUNCE_MS);

  input?.addEventListener('input', debouncedFilter);

  // Handle keyboard navigation
  input?.addEventListener('keydown', e => {
    handleCommandPaletteKeyboard(e, list, overlay);
  });

  // Close on overlay click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      closeCommandPalette();
    }
  });

  // Update selection and attach click handlers
  updateCommandPaletteSelection(list);
  attachCommandClickHandlers(list, overlay);
}

function closeCommandPalette(): void {
  if (!isCommandPaletteOpen) {
    return;
  }
  isCommandPaletteOpen = false;

  const overlay = document.querySelector('.command-palette-overlay');
  if (overlay) {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
      // Restore window size to content
      resizeWindowToContent();
    }, 150);
  }
}

function filterCommands(query: string): Command[] {
  if (!query) {
    return COMMANDS;
  }
  return COMMANDS.filter(
    cmd => cmd.label.toLowerCase().includes(query) || cmd.id.toLowerCase().includes(query)
  );
}

function renderCommandList(commands: Command[]): string {
  if (commands.length === 0) {
    return `<div class="command-palette-empty">No matching commands</div>`;
  }

  return commands
    .map(
      (cmd, index) => `
      <div class="command-palette-item ${index === commandPaletteSelectedIndex ? 'selected' : ''}" data-command-id="${cmd.id}">
        ${cmd.icon}
        <div class="command-palette-item-content">
          <span class="command-palette-item-label">${cmd.label}</span>
        </div>
        ${cmd.shortcut ? `<span class="command-palette-shortcut">${cmd.shortcut}</span>` : ''}
      </div>
    `
    )
    .join('');
}

function updateCommandPaletteSelection(list: HTMLElement): void {
  const items = list.querySelectorAll('.command-palette-item');
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === commandPaletteSelectedIndex);
    if (index === commandPaletteSelectedIndex) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

function handleCommandPaletteKeyboard(
  e: KeyboardEvent,
  list: HTMLElement,
  overlay: HTMLElement
): void {
  const items = list.querySelectorAll('.command-palette-item');
  const itemCount = items.length;

  switch (e.key) {
    case KEY_ARROW_DOWN:
      e.preventDefault();
      commandPaletteSelectedIndex = (commandPaletteSelectedIndex + 1) % itemCount;
      updateCommandPaletteSelection(list);
      break;

    case KEY_ARROW_UP:
      e.preventDefault();
      commandPaletteSelectedIndex = (commandPaletteSelectedIndex - 1 + itemCount) % itemCount;
      updateCommandPaletteSelection(list);
      break;

    case KEY_ENTER:
      e.preventDefault();
      executeSelectedCommand(overlay);
      break;

    case KEY_ESCAPE:
      e.preventDefault();
      closeCommandPalette();
      break;
  }
}

function attachCommandClickHandlers(list: HTMLElement, overlay: HTMLElement): void {
  list.querySelectorAll('.command-palette-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      commandPaletteSelectedIndex = index;
      executeSelectedCommand(overlay);
    });
    item.addEventListener('mouseenter', () => {
      commandPaletteSelectedIndex = index;
      updateCommandPaletteSelection(list);
    });
  });
}

function executeSelectedCommand(overlay: HTMLElement): void {
  const input = overlay.querySelector('.command-palette-input') as HTMLInputElement;
  const query = input?.value.toLowerCase() || '';
  const filtered = filterCommands(query);

  if (filtered[commandPaletteSelectedIndex]) {
    const command = filtered[commandPaletteSelectedIndex];
    closeCommandPalette();
    command.action();
  }
}

function setupCommandPalette(): void {
  // Cmd+K is handled in handleModifierShortcut
  // This function exists for any additional setup if needed
}

// =============================================================================
// SCREENSHOT CAPTURE
// =============================================================================

let previewTasks: ParsedTask[] = [];
let screenshotSetupComplete = false; // Prevent duplicate setup

function setupScreenshotCapture(): void {
  // Only setup once to prevent duplicate event listeners
  if (screenshotSetupComplete) {
    return;
  }
  screenshotSetupComplete = true;

  const screenshotBtn = document.getElementById('screenshotBtn');
  const modal = document.getElementById('screenshotModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalAddBtn = document.getElementById('modalAddBtn');
  const previewTaskList = document.getElementById('previewTaskList');
  const modalLoading = document.getElementById('modalLoading');
  const modalFooter = document.getElementById('modalFooter');
  const modalEmptyState = document.getElementById('modalEmptyState');
  const modalAddCount = document.getElementById('modalAddCount');

  if (!screenshotBtn || !modal) {
    console.warn('Screenshot elements not found');
    return;
  }

  // Screenshot button click handler
  const handleButtonClick = async () => {
    await handleScreenshotCapture();
  };

  // Screenshot button click
  screenshotBtn.addEventListener('click', handleButtonClick);

  // Listen for keyboard shortcut trigger (only once)
  window.electronAPI.onScreenshotTrigger(async () => {
    await handleScreenshotCapture();
  });

  // Close modal handlers
  modalCloseBtn?.addEventListener('click', closeModal);
  modalCancelBtn?.addEventListener('click', closeModal);

  // Close modal on overlay click
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Add tasks button
  modalAddBtn?.addEventListener('click', async () => {
    if (previewTasks.length === 0) {
      return;
    }

    try {
      if (modalAddBtn) {
        (modalAddBtn as HTMLButtonElement).disabled = true;
      }
      const addedTasks = await window.electronAPI.addTasksBatch(previewTasks);

      // Close modal and refresh task list
      closeModal();
      await loadTasks();

      // Show success toast
      showToast(`Added ${addedTasks.length} task${addedTasks.length === 1 ? '' : 's'}!`, 'success');
    } catch (error) {
      console.error('Error adding tasks:', error);
      showToast('Failed to add tasks', 'error');
    } finally {
      if (modalAddBtn) {
        (modalAddBtn as HTMLButtonElement).disabled = false;
      }
    }
  });

  async function handleScreenshotCapture(): Promise<void> {
    try {
      // Trigger native macOS screenshot tool (like Cmd+Shift+4)
      const imagePath = await window.electronAPI.captureNativeScreenshot();

      if (!imagePath) {
        // User canceled (pressed Esc) or no screenshot taken
        return;
      }

      // Show modal in loading state while processing
      openModal();
      showLoadingState();

      // Process screenshot file with OCR
      const tasks = await window.electronAPI.processScreenshotFile(imagePath);

      if (tasks.length === 0) {
        showEmptyState();
      } else {
        previewTasks = tasks;
        showPreviewTasks(tasks);
      }
    } catch (error) {
      console.error('Screenshot capture error:', error);
      closeModal();
      showToast('Failed to process screenshot', 'error');
    }
  }

  function openModal(): void {
    modal?.classList.add('active');
  }

  function closeModal(): void {
    modal?.classList.remove('active');
    previewTasks = [];
  }

  function showLoadingState(): void {
    if (modalLoading) {
      modalLoading.style.display = 'flex';
    }
    if (previewTaskList) {
      previewTaskList.style.display = 'none';
    }
    if (modalFooter) {
      modalFooter.style.display = 'none';
    }
    if (modalEmptyState) {
      modalEmptyState.style.display = 'none';
    }
  }

  function showEmptyState(): void {
    if (modalLoading) {
      modalLoading.style.display = 'none';
    }
    if (previewTaskList) {
      previewTaskList.style.display = 'none';
    }
    if (modalFooter) {
      modalFooter.style.display = 'none';
    }
    if (modalEmptyState) {
      modalEmptyState.style.display = 'block';
    }
  }

  function showPreviewTasks(tasks: ParsedTask[]): void {
    if (modalLoading) {
      modalLoading.style.display = 'none';
    }
    if (modalEmptyState) {
      modalEmptyState.style.display = 'none';
    }
    if (previewTaskList) {
      previewTaskList.style.display = 'flex';
    }
    if (modalFooter) {
      modalFooter.style.display = 'flex';
    }

    // Render task preview list
    if (previewTaskList) {
      previewTaskList.innerHTML = tasks
        .map(
          (task, index) => `
        <div class="preview-task-item" data-index="${index}">
          <button class="preview-task-remove" data-index="${index}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="preview-task-content">
            <div class="preview-task-title">${escapeHtml(task.title)}</div>
            ${task.duration ? `<div class="preview-task-duration">${task.duration} min</div>` : ''}
          </div>
        </div>
      `
        )
        .join('');

      // Setup remove buttons
      previewTaskList.querySelectorAll('.preview-task-remove').forEach(btn => {
        btn.addEventListener('click', e => {
          const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0', 10);
          removePreviewTask(index);
        });
      });
    }

    updateAddButtonCount();
  }

  function removePreviewTask(index: number): void {
    previewTasks.splice(index, 1);

    if (previewTasks.length === 0) {
      showEmptyState();
    } else {
      showPreviewTasks(previewTasks);
    }
  }

  function updateAddButtonCount(): void {
    if (modalAddCount) {
      modalAddCount.textContent = previewTasks.length.toString();
    }
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initialize(): void {
  // Verify electronAPI exists
  if (!window.electronAPI) {
    console.error('CRITICAL: electronAPI not available!');
    alert('Critical error: electronAPI not available. Check preload script.');
    return;
  }

  // Setup all components
  initializePresetButtons();
  initializePriorityPicker();
  setupTaskInput();
  setupWindowControls();
  setupActionButtons();
  setupSearch();
  setupAccordionToggles();
  setupKeyboardShortcuts();

  // Premium UI setup
  setupModeSelector();
  setupOverflowMenu();
  setupContextMenu();
  setupCommandPalette();
  setupScreenshotCapture();

  // Initialize event delegation for tasks, timers, drag-and-drop, and sections
  // These are attached ONCE to parent containers to prevent memory leaks
  initTaskEventDelegation();
  initTimerEventDelegation();
  initDragEventDelegation();
  initSectionEventDelegation();
  initFocusTimerEventDelegation();

  // Load initial data
  loadTasks();
}

// Start the app
initialize();
