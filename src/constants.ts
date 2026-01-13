// Timer constants
export const TIMER_CONSTANTS = {
  TICK_INTERVAL_MS: 1000,
  SAVE_INTERVAL_SECONDS: 10,
  SECONDS_PER_MINUTE: 60,
} as const;

// Duration presets (in minutes)
export const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hrs', minutes: 90 },
] as const;

// CSS class names
export const CSS_CLASSES = {
  TIMER_RUNNING: 'timer-running',
  COMPLETED: 'completed',
  SELECTED: 'selected',
  RUNNING: 'running',
  PAUSED: 'paused',
} as const;

// Data attributes
export const DATA_ATTRIBUTES = {
  ID: 'data-id',
  ACTION: 'data-action',
  MINUTES: 'data-minutes',
} as const;

// Timer actions
export const TIMER_ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  RESET: 'reset',
} as const;

// Notification messages
export const MESSAGES = {
  TIMER_COMPLETE: (title: string) => `⏰ Timer completed for "${title}"!\n\nWould you like to proceed to the next task?`,
  NO_MORE_TASKS: 'No more tasks with timers! Great work! 🎉',
  EMPTY_STATE_TITLE: 'No tasks yet',
  EMPTY_STATE_TEXT: 'Type a task above and click a duration to get started',
} as const;

// Audio settings
export const AUDIO_SETTINGS = {
  FREQUENCY: 800,
  TYPE: 'sine' as OscillatorType,
  GAIN: 0.3,
  DURATION: 0.5,
} as const;

// Security limits
export const SECURITY_LIMITS = {
  MAX_TASKS: 1000,           // Prevent DoS
  MAX_TITLE_LENGTH: 500,     // Prevent memory exhaustion
  MAX_DURATION_MINUTES: 1440, // 24 hours max
  MAX_TIME_SECONDS: 86400,    // 24 hours max
} as const;

// DOM element IDs
export const ELEMENT_IDS = {
  TASK_INPUT: 'taskInput',
  DURATION_INPUT: 'durationInput',
  ADD_BTN: 'addBtn',
  TASKS_SECTION: 'tasksSection',
  MINIMIZE_BTN: 'minimizeBtn',
  CLOSE_BTN: 'closeBtn',
  SEARCH_INPUT: 'searchInput',
  STATS_TEXT: 'statsText',
  CLEAR_COMPLETED_BTN: 'clearCompletedBtn',
  EXPORT_BTN: 'exportBtn',
  IMPORT_BTN: 'importBtn',
  THEME_TOGGLE: 'themeToggle',
} as const;

// CSS Selectors
export const SELECTORS = {
  PRESET_BTN: '.preset-btn',
  TASK_CHECKBOX: '.task-checkbox',
  DELETE_BTN: '.delete-btn',
  TIMER_BTN: '.timer-btn',
  TIMER_DISPLAY: '.timer-display',
  TIMER_PROGRESS_BAR: '.timer-progress-bar',
  TIMER_PROGRESS_FILL: '.timer-progress-fill',
  TASK_ITEM: '.task-item',
  TASK_TITLE: '.task-title',
  DURATION_PRESETS: '.duration-presets',
} as const;
