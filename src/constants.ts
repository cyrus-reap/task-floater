/**
 * Application Constants
 * Centralized configuration to avoid magic strings and numbers
 */

// =============================================================================
// TIMER CONSTANTS
// =============================================================================

export const TIMER_CONSTANTS = {
  TICK_INTERVAL_MS: 1000,
  SAVE_INTERVAL_SECONDS: 10,
  SECONDS_PER_MINUTE: 60,
  WARNING_THRESHOLD_SECONDS: 300, // 5 minutes
  AUTO_ADVANCE_DELAY_MS: 2000,
} as const;

// =============================================================================
// UI TIMING CONSTANTS
// =============================================================================

export const UI_TIMING = {
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 3000,
  SUCCESS_ANIMATION_DURATION_MS: 400,
  CONFETTI_COUNT: 50,
} as const;

// =============================================================================
// DURATION PRESETS
// =============================================================================

export const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '90 min', minutes: 90 },
] as const;

// =============================================================================
// DOM ELEMENT IDS
// =============================================================================

export const ELEMENT_IDS = {
  // Input and controls
  TASK_INPUT: 'taskInput',
  DURATION_INPUT: 'durationInput',
  ADD_BTN: 'addBtn',
  TASKS_SECTION: 'tasksSection',

  // Window controls
  MINIMIZE_BTN: 'minimizeBtn',
  CLOSE_BTN: 'closeBtn',

  // Search and filters
  SEARCH_INPUT: 'searchInput',
  SEARCH_BAR: 'searchBar',
  SEARCH_TOGGLE: 'searchToggle',

  // Stats and display
  STATS_TEXT: 'statsText',
  STATS_BAR: 'statsBar',

  // Actions
  CLEAR_COMPLETED_BTN: 'clearCompletedBtn',
  EXPORT_BTN: 'exportBtn',
  IMPORT_BTN: 'importBtn',

  // Settings
  THEME_TOGGLE: 'themeToggle',

  // Modes and sections
  FOCUS_BTN: 'focusBtn',
  INPUT_TOGGLE: 'inputToggle',
  INPUT_SECTION: 'inputSection',
  APP_CONTAINER: 'appContainer',

  // Mode buttons
  FULL_MODE_BTN: 'fullModeBtn',
  COMPACT_MODE_BTN: 'compactModeBtn',
  FOCUS_MODE_BTN: 'focusModeBtn',

  // Duration picker
  DURATION_PICKER: 'durationPicker',

  // Overflow menu
  OVERFLOW_MENU_BTN: 'overflowMenuBtn',
} as const;

// =============================================================================
// CSS SELECTORS
// =============================================================================

export const SELECTORS = {
  // Buttons
  PRESET_BTN: '.preset-btn',
  SEGMENT_BTN: '.segment-btn',
  SEGMENTED_CONTROL: '.segmented-control',
  MODE_BTN: '.mode-btn',

  // Task elements
  TASK_CHECKBOX: '.task-checkbox',
  DELETE_BTN: '.delete-btn',
  TASK_ITEM: '.task-item',
  TASK_TITLE: '.task-title',
  TASK_ITEM_NOT_COMPLETED: '.task-item:not(.completed)',

  // Timer elements
  TIMER_BTN: '.timer-btn',
  TIMER_DISPLAY: '.timer-display',
  TIMER_TIME: '.timer-time',
  TIMER_PROGRESS: '.timer-progress',
  TIMER_PROGRESS_BAR: '.timer-progress-bar',
  TIMER_PROGRESS_FILL: '.timer-progress-fill',

  // Duration picker
  DURATION_PRESETS: '.duration-presets',
  DURATION_OPTION: '.duration-option',

  // Menus
  CONTEXT_MENU: '.context-menu',
  OVERFLOW_MENU: '.overflow-menu',
} as const;

// =============================================================================
// CSS CLASSES
// =============================================================================

export const CSS_CLASSES = {
  // Timer states
  TIMER_RUNNING: 'timer-running',
  TIMER_WARNING: 'timer-warning',
  RUNNING: 'running',
  PAUSED: 'paused',
  WARNING: 'warning',

  // Task states
  COMPLETED: 'completed',
  COMPLETING: 'completing',
  SELECTED: 'selected',
  EDITING: 'editing',
  ACTIVE: 'active',
  HAS_TIMER: 'has-timer',
  PINNED: 'pinned',

  // UI states
  LIGHT_THEME: 'light-theme',
  COLLAPSED: 'collapsed',
  EMPTY_STATE: 'empty-state',
  EMPTY_STATE_ICON: 'empty-state-icon',
  EMPTY_STATE_TITLE: 'empty-state-title',
  EMPTY_STATE_TEXT: 'empty-state-text',

  // Modes
  FOCUS_MODE: 'focus-mode',
  COMPACT_MODE: 'compact-mode',

  // Task groups
  TASK_GROUP: 'task-group',
  TASK_GROUP_HEADER: 'task-group-header',
  TASK_GROUP_ITEMS: 'task-group-items',

  // Edit mode
  TASK_EDIT_INPUT: 'task-edit-input',
} as const;

// =============================================================================
// APP MODES
// =============================================================================

export const APP_MODES = {
  FULL: 'full',
  COMPACT: 'compact',
  FOCUS: 'focus',
} as const;

export type AppMode = (typeof APP_MODES)[keyof typeof APP_MODES];

// =============================================================================
// DATA ATTRIBUTES
// =============================================================================

export const DATA_ATTRIBUTES = {
  ID: 'data-id',
  ACTION: 'data-action',
  MINUTES: 'data-minutes',
} as const;

// =============================================================================
// TIMER ACTIONS
// =============================================================================

export const TIMER_ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  RESET: 'reset',
} as const;

// =============================================================================
// KEYBOARD KEYS
// =============================================================================

export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  SPACE: ' ',
} as const;

// =============================================================================
// AUDIO SETTINGS
// =============================================================================

export const AUDIO_SETTINGS = {
  FREQUENCY: 800,
  TYPE: 'sine' as OscillatorType,
  GAIN: 0.3,
  DURATION: 0.5,
} as const;

// =============================================================================
// SCROLL BEHAVIOR
// =============================================================================

export const SCROLL_BEHAVIOR = {
  SMOOTH: 'smooth' as ScrollBehavior,
  BLOCK_NEAREST: 'nearest' as ScrollLogicalPosition,
} as const;

// =============================================================================
// THEME VALUES
// =============================================================================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

// =============================================================================
// NOTIFICATION MESSAGES
// =============================================================================

export const MESSAGES = {
  TIMER_COMPLETE_TITLE: '⏰ Timer Complete',
  ALL_DONE_TITLE: '🎉 All Done!',
  ALL_DONE_BODY: 'No more tasks with timers. Great work!',
  TIMER_COMPLETE: (title: string) =>
    `⏰ Timer completed for "${title}"!\n\nWould you like to proceed to the next task?`,
  NO_MORE_TASKS: 'No more tasks with timers! Great work! 🎉',
  EMPTY_STATE_TITLE: 'No tasks yet',
  EMPTY_STATE_TEXT: 'Type a task above and click a duration to get started',
} as const;

// =============================================================================
// SECURITY LIMITS
// =============================================================================

export const SECURITY_LIMITS = {
  MAX_TASKS: 1000, // Prevent DoS
  MAX_TITLE_LENGTH: 500, // Prevent memory exhaustion
  MAX_DURATION_MINUTES: 1440, // 24 hours max
  MAX_TIME_SECONDS: 86400, // 24 hours max
} as const;
