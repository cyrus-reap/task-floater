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
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Timer constants
const TIMER_SAVE_INTERVAL_SECONDS = 10;
const SECONDS_PER_MINUTE = 60;
const AUTO_ADVANCE_DELAY_MS = 2000;
const SEARCH_DEBOUNCE_MS = 300;
const TIMER_TICK_INTERVAL_MS = 1000;

// Duration presets (in minutes) - 3×2 grid for symmetry
const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '90 min', minutes: 90 },
];

// DOM Element IDs
const ELEMENT_IDS = {
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
  SEARCH_TOGGLE: 'searchToggle',
  INPUT_TOGGLE: 'inputToggle',
  SEARCH_BAR: 'searchBar',
  INPUT_SECTION: 'inputSection',
} as const;

// CSS Selectors
const SELECTORS = {
  PRESET_BTN: '.preset-btn',
  TASK_CHECKBOX: '.task-checkbox',
  DELETE_BTN: '.delete-btn',
  TIMER_BTN: '.timer-btn',
  TIMER_DISPLAY: '.timer-display',
  TIMER_PROGRESS_BAR: '.timer-progress-bar',
  TIMER_PROGRESS_FILL: '.timer-progress-fill',
  TASK_ITEM: '.task-item',
  TASK_TITLE: '.task-title',
  TASK_ITEM_NOT_COMPLETED: '.task-item:not(.completed)',
  DURATION_PRESETS: '.duration-presets',
} as const;

// CSS Classes
const CSS_CLASSES = {
  TIMER_RUNNING: 'timer-running',
  COMPLETED: 'completed',
  SELECTED: 'selected',
  RUNNING: 'running',
  PAUSED: 'paused',
  EDITING: 'editing',
  LIGHT_THEME: 'light-theme',
  TASK_EDIT_INPUT: 'task-edit-input',
  EMPTY_STATE: 'empty-state',
  EMPTY_STATE_ICON: 'empty-state-icon',
  EMPTY_STATE_TITLE: 'empty-state-title',
  EMPTY_STATE_TEXT: 'empty-state-text',
  COLLAPSED: 'collapsed',
} as const;

// Data Attributes
const ATTR_ID = 'data-id';
const ATTR_MINUTES = 'data-minutes';

// Timer Actions
const TIMER_ACTION_PLAY = 'play';
const TIMER_ACTION_PAUSE = 'pause';
const TIMER_ACTION_RESET = 'reset';

// Keyboard Keys
const KEY_ESCAPE = 'Escape';
const KEY_ENTER = 'Enter';
const KEY_ARROW_UP = 'ArrowUp';
const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_SPACE = ' ';

// Audio settings
const AUDIO_FREQUENCY = 800;
const AUDIO_GAIN = 0.3;
const AUDIO_DURATION = 0.5;
const AUDIO_TYPE_SINE = 'sine';

// Scroll behavior
const SCROLL_BEHAVIOR_SMOOTH = 'smooth';
const SCROLL_BLOCK_NEAREST = 'nearest';

// Theme values
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

// Messages
const MSG_TIMER_COMPLETE_TITLE = '⏰ Timer Complete';
const MSG_ALL_DONE_TITLE = '🎉 All Done!';
const MSG_ALL_DONE_BODY = 'No more tasks with timers. Great work!';
const MSG_CLEARED_TITLE = '🗑️ Cleared';
const MSG_EXPORT_TITLE = '📤 Export Complete';
const MSG_EXPORT_BODY = 'Tasks exported successfully!';
const MSG_IMPORT_TITLE = '📥 Import Complete';

// =============================================================================
// STATE
// =============================================================================

let tasks: Task[] = [];
const timerIntervals: Map<string, number> = new Map();
let selectedDuration: number | undefined = undefined;
let selectedTaskIndex = -1;

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const DOM = {
  taskInput: document.getElementById(ELEMENT_IDS.TASK_INPUT) as HTMLInputElement,
  durationInput: document.getElementById(ELEMENT_IDS.DURATION_INPUT) as HTMLInputElement,
  addBtn: document.getElementById(ELEMENT_IDS.ADD_BTN) as HTMLButtonElement,
  tasksSection: document.getElementById(ELEMENT_IDS.TASKS_SECTION) as HTMLDivElement,
  minimizeBtn: document.getElementById(ELEMENT_IDS.MINIMIZE_BTN) as HTMLButtonElement,
  closeBtn: document.getElementById(ELEMENT_IDS.CLOSE_BTN) as HTMLButtonElement,
  searchInput: document.getElementById(ELEMENT_IDS.SEARCH_INPUT) as HTMLInputElement | null,
  statsText: document.getElementById(ELEMENT_IDS.STATS_TEXT) as HTMLDivElement | null,
  clearCompletedBtn: document.getElementById(
    ELEMENT_IDS.CLEAR_COMPLETED_BTN
  ) as HTMLButtonElement | null,
  exportBtn: document.getElementById(ELEMENT_IDS.EXPORT_BTN) as HTMLButtonElement | null,
  importBtn: document.getElementById(ELEMENT_IDS.IMPORT_BTN) as HTMLButtonElement | null,
  themeToggle: document.getElementById(ELEMENT_IDS.THEME_TOGGLE) as HTMLButtonElement | null,
  searchToggle: document.getElementById(ELEMENT_IDS.SEARCH_TOGGLE) as HTMLButtonElement | null,
  inputToggle: document.getElementById(ELEMENT_IDS.INPUT_TOGGLE) as HTMLButtonElement | null,
  searchBar: document.getElementById(ELEMENT_IDS.SEARCH_BAR) as HTMLDivElement | null,
  inputSection: document.getElementById(ELEMENT_IDS.INPUT_SECTION) as HTMLDivElement | null,
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

// =============================================================================
// TASK MANAGEMENT
// =============================================================================

async function loadTasks(): Promise<void> {
  tasks = await window.electronAPI.getTasks();
  renderTasks();
  updateStats();
  restartRunningTimers();
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
    return;
  }

  await window.electronAPI.addTask(title, selectedDuration);

  DOM.taskInput.value = '';
  selectedDuration = undefined;
  clearPresetSelection();

  await loadTasks();
}

async function toggleTask(taskId: string): Promise<void> {
  await window.electronAPI.toggleTask(taskId);
  await loadTasks();
}

async function deleteTask(taskId: string): Promise<void> {
  stopTimer(taskId);
  await window.electronAPI.deleteTask(taskId);
  await loadTasks();
}

async function updateTaskTitle(taskId: string, newTitle: string): Promise<void> {
  await window.electronAPI.updateTask(taskId, { title: newTitle });
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
  const timerDisplay = document.querySelector(`${SELECTORS.TIMER_DISPLAY}[${ATTR_ID}="${taskId}"]`);
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemaining);
  }

  const progressPercent = (timeRemaining / (duration * SECONDS_PER_MINUTE)) * 100;
  const progressBar = document.querySelector(
    `${SELECTORS.TIMER_PROGRESS_BAR}[${ATTR_ID}="${taskId}"] ${SELECTORS.TIMER_PROGRESS_FILL}`
  );
  if (progressBar) {
    (progressBar as HTMLElement).style.width = `${progressPercent}%`;
  }
}

async function handleTimerComplete(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return;
  }

  playNotificationSound();

  await window.electronAPI.showNotification(MSG_TIMER_COMPLETE_TITLE, `Finished: ${task.title}`);

  // Auto-advance to next task
  const currentIndex = tasks.findIndex(t => t.id === taskId);
  const nextTask = tasks
    .slice(currentIndex + 1)
    .find(t => !t.completed && t.duration && t.duration > 0);

  if (nextTask) {
    setTimeout(() => startTimer(nextTask.id), AUTO_ADVANCE_DELAY_MS);
  } else {
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
    return;
  }

  const sortedTasks = sortTasks(filteredTasks);
  DOM.tasksSection.innerHTML = sortedTasks.map(renderTaskHTML).join('');

  attachEventHandlers();
  updateStats();
}

function filterTasks(query: string): Task[] {
  if (!query) {
    return tasks;
  }
  return tasks.filter(task => task.title.toLowerCase().includes(query));
}

function sortTasks(taskList: Task[]): Task[] {
  return taskList.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function renderEmptyState(searchQuery?: string): string {
  const message = searchQuery
    ? `No tasks matching "${searchQuery}"`
    : 'Type a task above and click a duration to get started';

  const title = searchQuery ? 'No matches' : 'No tasks yet';

  return `
    <div class="empty-state">
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-text">${message}</div>
    </div>
  `;
}

function renderTaskHTML(task: Task): string {
  const timerHTML = renderTimerHTML(task);

  return `
    <div class="task-item ${task.completed ? 'completed' : ''} ${task.isTimerRunning ? 'timer-running' : ''}"
         draggable="true"
         data-id="${task.id}"
         role="listitem"
         aria-label="${escapeHtml(task.title)}${task.completed ? ' (completed)' : ''}">
      <div class="task-checkbox ${task.completed ? 'completed' : ''}"
           data-id="${task.id}"
           role="checkbox"
           aria-checked="${task.completed}"
           tabindex="0"
           aria-label="Mark as ${task.completed ? 'incomplete' : 'complete'}"></div>
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${timerHTML}
      </div>
      <button class="delete-btn"
              data-id="${task.id}"
              title="Delete task"
              aria-label="Delete ${escapeHtml(task.title)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    </div>
  `;
}

function renderTimerHTML(task: Task): string {
  if (!task.duration || task.duration <= 0) {
    return '';
  }

  const progressPercent = ((task.timeRemaining || 0) / (task.duration * 60)) * 100;

  return `
    <div class="task-timer">
      <div class="timer-row">
        <span class="timer-display ${task.isTimerRunning ? 'running' : ''}" data-id="${task.id}">
          ${formatTime(task.timeRemaining || 0)}
        </span>
        <div class="timer-controls">
          ${
            task.isTimerRunning
              ? `<button class="timer-btn pause" data-id="${task.id}" data-action="pause" title="Pause">⏸</button>`
              : `<button class="timer-btn play" data-id="${task.id}" data-action="play" title="Start">▶</button>`
          }
          <button class="timer-btn reset" data-id="${task.id}" data-action="reset" title="Reset">↺</button>
        </div>
      </div>
      <div class="timer-progress-bar" data-id="${task.id}">
        <div class="timer-progress-fill ${task.isTimerRunning ? '' : 'paused'}" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  `;
}

// =============================================================================
// EVENT HANDLERS - TASKS
// =============================================================================

function attachTaskEventHandlers(): void {
  // Checkbox toggle
  document.querySelectorAll(SELECTORS.TASK_CHECKBOX).forEach(checkbox => {
    checkbox.addEventListener('click', async e => {
      const taskId = (e.currentTarget as HTMLElement).dataset.id!;
      await toggleTask(taskId);
    });
  });

  // Double-click to edit
  document.querySelectorAll(SELECTORS.TASK_TITLE).forEach(title => {
    title.addEventListener('dblclick', e => {
      const taskItem = (e.target as HTMLElement).closest(SELECTORS.TASK_ITEM);
      const taskId = taskItem?.querySelector(`[${ATTR_ID}]`)?.getAttribute(ATTR_ID);
      if (taskId) {
        enterEditMode(taskId);
      }
    });
  });

  // Delete button
  document.querySelectorAll(SELECTORS.DELETE_BTN).forEach(btn => {
    btn.addEventListener('click', async e => {
      const taskId = (e.currentTarget as HTMLElement).dataset.id!;
      await deleteTask(taskId);
    });
  });
}

// =============================================================================
// EVENT HANDLERS - TIMERS
// =============================================================================

function attachTimerEventHandlers(): void {
  document.querySelectorAll(SELECTORS.TIMER_BTN).forEach(btn => {
    btn.addEventListener('click', async e => {
      const target = e.currentTarget as HTMLElement;
      const taskId = target.dataset.id!;
      const action = target.dataset.action!;

      if (action === TIMER_ACTION_PLAY) {
        await startTimer(taskId);
      } else if (action === TIMER_ACTION_PAUSE) {
        await pauseTimer(taskId);
      } else if (action === TIMER_ACTION_RESET) {
        await resetTimer(taskId);
      }
    });
  });
}

// =============================================================================
// EVENT HANDLERS - DRAG & DROP
// =============================================================================

function attachDragHandlers(): void {
  let draggedTaskId: string | null = null;

  const DRAG_OPACITY_DRAGGING = '0.4';
  const DRAG_OPACITY_NORMAL = '1';
  const DRAG_BORDER_HIGHLIGHT = '2px solid rgba(100, 150, 255, 0.6)';
  const DRAG_BORDER_NORMAL = '';

  document.querySelectorAll(SELECTORS.TASK_ITEM).forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedTaskId = (item as HTMLElement).getAttribute(ATTR_ID);
      (item as HTMLElement).style.opacity = DRAG_OPACITY_DRAGGING;
    });

    item.addEventListener('dragend', () => {
      (item as HTMLElement).style.opacity = DRAG_OPACITY_NORMAL;
      draggedTaskId = null;
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
      const taskId = (item as HTMLElement).getAttribute(ATTR_ID);
      if (draggedTaskId && taskId && draggedTaskId !== taskId) {
        (item as HTMLElement).style.borderTop = DRAG_BORDER_HIGHLIGHT;
      }
    });

    item.addEventListener('dragleave', () => {
      (item as HTMLElement).style.borderTop = DRAG_BORDER_NORMAL;
    });

    item.addEventListener('drop', async e => {
      e.preventDefault();
      (item as HTMLElement).style.borderTop = DRAG_BORDER_NORMAL;

      const targetTaskId = (item as HTMLElement).getAttribute(ATTR_ID);
      if (draggedTaskId && targetTaskId && draggedTaskId !== targetTaskId) {
        await reorderTasks(draggedTaskId, targetTaskId);
      }
    });
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

  // Esc - Always works
  if (e.key === KEY_ESCAPE) {
    clearInputs();
    return;
  }

  // Don't trigger navigation when typing
  if (isInputFocused && e.key !== KEY_ESCAPE) {
    return;
  }

  const incompleteTasks = tasks.filter(t => !t.completed);

  // Cmd/Ctrl shortcuts
  if (e.metaKey || e.ctrlKey) {
    await handleModifierShortcut(e, incompleteTasks);
    return;
  }

  // Arrow & action keys
  await handleNavigationKey(e, incompleteTasks);
}

async function handleModifierShortcut(e: KeyboardEvent, incompleteTasks: Task[]): Promise<void> {
  switch (e.key) {
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
      DOM.exportBtn?.click();
      break;

    case 'i':
      e.preventDefault();
      DOM.importBtn?.click();
      break;

    case 'f':
      e.preventDefault();
      DOM.searchInput?.focus();
      break;

    case 't':
      e.preventDefault();
      DOM.themeToggle?.click();
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
  selectedDuration = undefined;
  selectedTaskIndex = -1;
  if (DOM.searchInput) {
    DOM.searchInput.value = EMPTY_STRING;
  }
  clearPresetSelection();
  renderTasks();
}

// =============================================================================
// DURATION PRESETS
// =============================================================================

function initializePresetButtons(): void {
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
  document.querySelectorAll(SELECTORS.PRESET_BTN).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
  });
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
        return;
      }

      await window.electronAPI.clearCompleted();
      await window.electronAPI.showNotification(
        MSG_CLEARED_TITLE,
        `Removed ${completedCount} completed task${completedCount > 1 ? 's' : ''}`
      );
      await loadTasks();
    });
  }

  // Export
  if (DOM.exportBtn) {
    DOM.exportBtn.addEventListener('click', async () => {
      const result = await window.electronAPI.exportTasks();
      if (result) {
        await window.electronAPI.showNotification(MSG_EXPORT_TITLE, MSG_EXPORT_BODY);
      }
    });
  }

  // Import
  if (DOM.importBtn) {
    DOM.importBtn.addEventListener('click', async () => {
      const count = await window.electronAPI.importTasks();
      if (count > 0) {
        await window.electronAPI.showNotification(
          MSG_IMPORT_TITLE,
          `Imported ${count} task${count > 1 ? 's' : ''}!`
        );
        await loadTasks();
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
    window.electronAPI.getSettings().then(settings => {
      if (settings.theme === THEME_LIGHT) {
        document.body.classList.add(CSS_CLASSES.LIGHT_THEME);
      }
    });
  }
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
  window.electronAPI.getSettings().then(settings => {
    if (settings.searchCollapsed && DOM.searchBar && DOM.searchToggle) {
      DOM.searchBar.classList.add(CSS_CLASSES.COLLAPSED);
      DOM.searchToggle.classList.add(CSS_CLASSES.COLLAPSED);
    }
    if (settings.inputCollapsed && DOM.inputSection && DOM.inputToggle) {
      DOM.inputSection.classList.add(CSS_CLASSES.COLLAPSED);
      DOM.inputToggle.classList.add(CSS_CLASSES.COLLAPSED);
    }
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
  setupTaskInput();
  setupWindowControls();
  setupActionButtons();
  setupSearch();
  setupAccordionToggles();
  setupKeyboardShortcuts();

  // Load initial data
  loadTasks();
}

// Start the app
initialize();
