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

const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hrs', minutes: 90 },
];

// =============================================================================
// STATE
// =============================================================================

let tasks: Task[] = [];
let timerIntervals: Map<string, number> = new Map();
let selectedDuration: number | undefined = undefined;
let selectedTaskIndex = -1;

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const DOM = {
  taskInput: document.getElementById('taskInput') as HTMLInputElement,
  durationInput: document.getElementById('durationInput') as HTMLInputElement,
  addBtn: document.getElementById('addBtn') as HTMLButtonElement,
  tasksSection: document.getElementById('tasksSection') as HTMLDivElement,
  minimizeBtn: document.getElementById('minimizeBtn') as HTMLButtonElement,
  closeBtn: document.getElementById('closeBtn') as HTMLButtonElement,
  searchInput: document.getElementById('searchInput') as HTMLInputElement | null,
  statsText: document.getElementById('statsText') as HTMLDivElement | null,
  clearCompletedBtn: document.getElementById('clearCompletedBtn') as HTMLButtonElement | null,
  exportBtn: document.getElementById('exportBtn') as HTMLButtonElement | null,
  importBtn: document.getElementById('importBtn') as HTMLButtonElement | null,
  themeToggle: document.getElementById('themeToggle') as HTMLButtonElement | null,
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
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
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
  if (!DOM.statsText) return;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  DOM.statsText.textContent = `${activeTasks} active • ${completedTasks} done`;
}

async function addTask(): Promise<void> {
  const title = DOM.taskInput.value.trim();
  if (!title) return;

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

  if (draggedIndex === -1 || targetIndex === -1) return;

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
  if (!task || !task.duration) return;

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
  }, 1000);

  timerIntervals.set(taskId, intervalId);
  renderTasks();
}

async function pauseTimer(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

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
  if (!task || !task.duration) return;

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
  if (task.timeRemaining % 10 === 0) {
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
  const timerDisplay = document.querySelector(`.timer-display[data-id="${taskId}"]`);
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemaining);
  }

  const progressPercent = (timeRemaining / (duration * 60)) * 100;
  const progressBar = document.querySelector(`.timer-progress-bar[data-id="${taskId}"] .timer-progress-fill`);
  if (progressBar) {
    (progressBar as HTMLElement).style.width = `${progressPercent}%`;
  }
}

async function handleTimerComplete(taskId: string): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  playNotificationSound();

  await window.electronAPI.showNotification(
    '⏰ Timer Complete',
    `Finished: ${task.title}`
  );

  // Auto-advance to next task
  const currentIndex = tasks.findIndex(t => t.id === taskId);
  const nextTask = tasks
    .slice(currentIndex + 1)
    .find(t => !t.completed && t.duration && t.duration > 0);

  if (nextTask) {
    setTimeout(() => startTimer(nextTask.id), 2000);
  } else {
    await window.electronAPI.showNotification(
      '🎉 All Done!',
      'No more tasks with timers. Great work!'
    );
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
  if (!query) return tasks;
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
  if (!task.duration || task.duration <= 0) return '';

  const progressPercent = (task.timeRemaining || 0) / (task.duration * 60) * 100;

  return `
    <div class="task-timer">
      <div class="timer-row">
        <span class="timer-display ${task.isTimerRunning ? 'running' : ''}" data-id="${task.id}">
          ${formatTime(task.timeRemaining || 0)}
        </span>
        <div class="timer-controls">
          ${task.isTimerRunning
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
  document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('click', async (e) => {
      const taskId = (e.currentTarget as HTMLElement).dataset.id!;
      await toggleTask(taskId);
    });
  });

  // Double-click to edit
  document.querySelectorAll('.task-title').forEach((title) => {
    title.addEventListener('dblclick', (e) => {
      const taskItem = (e.target as HTMLElement).closest('.task-item');
      const taskId = taskItem?.querySelector('[data-id]')?.getAttribute('data-id');
      if (taskId) enterEditMode(taskId);
    });
  });

  // Delete button
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const taskId = (e.currentTarget as HTMLElement).dataset.id!;
      await deleteTask(taskId);
    });
  });
}

// =============================================================================
// EVENT HANDLERS - TIMERS
// =============================================================================

function attachTimerEventHandlers(): void {
  document.querySelectorAll('.timer-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const taskId = target.dataset.id!;
      const action = target.dataset.action!;

      if (action === 'play') await startTimer(taskId);
      else if (action === 'pause') await pauseTimer(taskId);
      else if (action === 'reset') await resetTimer(taskId);
    });
  });
}

// =============================================================================
// EVENT HANDLERS - DRAG & DROP
// =============================================================================

function attachDragHandlers(): void {
  let draggedTaskId: string | null = null;

  document.querySelectorAll('.task-item').forEach((item) => {
    item.addEventListener('dragstart', () => {
      draggedTaskId = (item as HTMLElement).getAttribute('data-id');
      (item as HTMLElement).style.opacity = '0.4';
    });

    item.addEventListener('dragend', () => {
      (item as HTMLElement).style.opacity = '1';
      draggedTaskId = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      const taskId = (item as HTMLElement).getAttribute('data-id');
      if (draggedTaskId && taskId && draggedTaskId !== taskId) {
        (item as HTMLElement).style.borderTop = '2px solid rgba(100, 150, 255, 0.6)';
      }
    });

    item.addEventListener('dragleave', () => {
      (item as HTMLElement).style.borderTop = '';
    });

    item.addEventListener('drop', async (e) => {
      e.preventDefault();
      (item as HTMLElement).style.borderTop = '';

      const targetTaskId = (item as HTMLElement).getAttribute('data-id');
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
  if (!task) return;

  const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (!taskItem) return;

  taskItem.classList.add('editing');
  const titleEl = taskItem.querySelector('.task-title');
  if (!titleEl) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.title;

  titleEl.after(input);
  input.focus();
  input.select();

  const saveEdit = async () => {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== task.title) {
      await updateTaskTitle(taskId, newTitle);
    }
    taskItem.classList.remove('editing');
    input.remove();
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') {
      taskItem.classList.remove('editing');
      input.remove();
    }
  });
}

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', async (e) => {
    await handleKeyboardShortcut(e);
  });
}

async function handleKeyboardShortcut(e: KeyboardEvent): Promise<void> {
  const activeElement = document.activeElement;
  const isInputFocused = activeElement?.tagName === 'INPUT' ||
                        activeElement?.tagName === 'TEXTAREA' ||
                        activeElement?.tagName === 'BUTTON';

  // Esc - Always works
  if (e.key === 'Escape') {
    clearInputs();
    return;
  }

  // Don't trigger navigation when typing
  if (isInputFocused && e.key !== 'Escape') return;

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
    case 'ArrowDown':
      e.preventDefault();
      selectedTaskIndex = Math.min(incompleteTasks.length - 1, selectedTaskIndex + 1);
      highlightSelectedTask();
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedTaskIndex = Math.max(0, selectedTaskIndex - 1);
      highlightSelectedTask();
      break;

    case ' ':
      e.preventDefault();
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        await toggleTask(incompleteTasks[selectedTaskIndex].id);
      }
      break;

    case 'Enter':
      if (selectedTaskIndex >= 0 && incompleteTasks[selectedTaskIndex]) {
        enterEditMode(incompleteTasks[selectedTaskIndex].id);
      }
      break;
  }
}

function highlightSelectedTask(): void {
  document.querySelectorAll('.task-item:not(.completed)').forEach((item, index) => {
    if (index === selectedTaskIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

function clearInputs(): void {
  DOM.taskInput.value = '';
  selectedDuration = undefined;
  selectedTaskIndex = -1;
  if (DOM.searchInput) DOM.searchInput.value = '';
  clearPresetSelection();
  renderTasks();
}

// =============================================================================
// DURATION PRESETS
// =============================================================================

function initializePresetButtons(): void {
  const presetsContainer = document.querySelector('.duration-presets');
  if (!presetsContainer) return;

  presetsContainer.innerHTML = DURATION_PRESETS
    .map(preset => `<button class="preset-btn" data-minutes="${preset.minutes}">${preset.label}</button>`)
    .join('');

  attachPresetHandlers();
}

function attachPresetHandlers(): void {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const minutes = parseInt(target.getAttribute('data-minutes') || '0');
      togglePresetSelection(target, minutes);
    });
  });
}

function togglePresetSelection(clickedBtn: HTMLElement, minutes: number): void {
  const wasSelected = clickedBtn.classList.contains('selected');

  clearPresetSelection();

  if (!wasSelected) {
    clickedBtn.classList.add('selected');
    selectedDuration = minutes;
  } else {
    selectedDuration = undefined;
  }
}

function clearPresetSelection(): void {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('selected');
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
      if (completedCount === 0) return;

      await window.electronAPI.clearCompleted();
      await window.electronAPI.showNotification(
        '🗑️ Cleared',
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
        await window.electronAPI.showNotification('📤 Export Complete', 'Tasks exported successfully!');
      }
    });
  }

  // Import
  if (DOM.importBtn) {
    DOM.importBtn.addEventListener('click', async () => {
      const count = await window.electronAPI.importTasks();
      if (count > 0) {
        await window.electronAPI.showNotification('📥 Import Complete', `Imported ${count} task${count > 1 ? 's' : ''}!`);
        await loadTasks();
      }
    });
  }

  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', async () => {
      document.body.classList.toggle('light-theme');
      const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      await window.electronAPI.updateSettings({ theme });
    });

    // Load saved theme
    window.electronAPI.getSettings().then(settings => {
      if (settings.theme === 'light') {
        document.body.classList.add('light-theme');
      }
    });
  }
}

// =============================================================================
// SEARCH
// =============================================================================

function setupSearch(): void {
  if (!DOM.searchInput) return;

  let searchTimeout: number;
  DOM.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => renderTasks(), 300);
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

  DOM.taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initialize(): void {
  console.log('Initializing Task Floater...');

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
  setupKeyboardShortcuts();

  // Load initial data
  loadTasks();

  console.log('Task Floater initialized successfully');
}

// Start the app
initialize();
