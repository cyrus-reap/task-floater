import {
  TIMER_CONSTANTS,
  DURATION_PRESETS,
  CSS_CLASSES,
  DATA_ATTRIBUTES,
  TIMER_ACTIONS,
  MESSAGES,
  AUDIO_SETTINGS,
} from './constants';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number;
  timeRemaining?: number;
  isTimerRunning?: boolean;
}

let tasks: Task[] = [];
let timerIntervals: Map<string, number> = new Map();
let selectedDuration: number | undefined = undefined;

const taskInput = document.getElementById('taskInput') as HTMLInputElement;
const durationInput = document.getElementById('durationInput') as HTMLInputElement;
const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
const tasksSection = document.getElementById('tasksSection') as HTMLDivElement;
const minimizeBtn = document.getElementById('minimizeBtn') as HTMLButtonElement;
const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const statsText = document.getElementById('statsText') as HTMLDivElement | null;
const clearCompletedBtn = document.getElementById('clearCompletedBtn') as HTMLButtonElement | null;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement | null;
const importBtn = document.getElementById('importBtn') as HTMLButtonElement | null;
const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement | null;

function initializePresetButtons() {
  const presetsContainer = document.querySelector('.duration-presets');
  if (!presetsContainer) return;

  presetsContainer.innerHTML = DURATION_PRESETS.map(preset =>
    `<button class="preset-btn" ${DATA_ATTRIBUTES.MINUTES}="${preset.minutes}">${preset.label}</button>`
  ).join('');

  // Attach event listeners
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const minutes = parseInt(target.getAttribute(DATA_ATTRIBUTES.MINUTES) || '0');

      // Toggle selection
      const wasSelected = target.classList.contains(CSS_CLASSES.SELECTED);

      // Clear all selections
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.classList.remove(CSS_CLASSES.SELECTED);
      });

      // Set new selection or clear if clicking same button
      if (!wasSelected) {
        target.classList.add(CSS_CLASSES.SELECTED);
        selectedDuration = minutes;
      } else {
        selectedDuration = undefined;
      }
    });
  });
}

function updateStats() {
  if (!statsText) return;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  statsText.textContent = `${activeTasks} active • ${completedTasks} done`;
}

async function loadTasks() {
  tasks = await window.electronAPI.getTasks();
  renderTasks();
  updateStats();
  // Restart any running timers
  tasks.forEach(task => {
    if (task.isTimerRunning && task.timeRemaining && task.timeRemaining > 0) {
      startTaskTimer(task.id);
    }
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderTasks() {
  // Filter tasks by search query
  const searchQuery = searchInput?.value.toLowerCase() || '';
  const filteredTasks = searchQuery
    ? tasks.filter(task => task.title.toLowerCase().includes(searchQuery))
    : tasks;

  if (filteredTasks.length === 0) {
    const emptyMessage = searchQuery
      ? `No tasks matching "${searchQuery}"`
      : MESSAGES.EMPTY_STATE_TEXT;

    tasksSection.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <div class="empty-state-title">${searchQuery ? 'No matches' : MESSAGES.EMPTY_STATE_TITLE}</div>
        <div class="empty-state-text">${emptyMessage}</div>
      </div>
    `;
    return;
  }

  tasksSection.innerHTML = filteredTasks
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((task) => {
      const hasTimer = task.duration && task.duration > 0;
      const progressPercent = hasTimer && task.duration
        ? ((task.timeRemaining || 0) / (task.duration * TIMER_CONSTANTS.SECONDS_PER_MINUTE)) * 100
        : 0;

      const timerDisplay = hasTimer
        ? `<div class="task-timer">
             <div class="timer-row">
               <span class="timer-display ${task.isTimerRunning ? CSS_CLASSES.RUNNING : ''}" ${DATA_ATTRIBUTES.ID}="${task.id}">
                 ${formatTime(task.timeRemaining || 0)}
               </span>
               <div class="timer-controls">
                 ${task.isTimerRunning
                   ? `<button class="timer-btn ${TIMER_ACTIONS.PAUSE}" ${DATA_ATTRIBUTES.ID}="${task.id}" ${DATA_ATTRIBUTES.ACTION}="${TIMER_ACTIONS.PAUSE}" title="Pause timer">
                        <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      </button>`
                   : `<button class="timer-btn ${TIMER_ACTIONS.PLAY}" ${DATA_ATTRIBUTES.ID}="${task.id}" ${DATA_ATTRIBUTES.ACTION}="${TIMER_ACTIONS.PLAY}" title="Start timer">
                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>`
                 }
                 <button class="timer-btn ${TIMER_ACTIONS.RESET}" ${DATA_ATTRIBUTES.ID}="${task.id}" ${DATA_ATTRIBUTES.ACTION}="${TIMER_ACTIONS.RESET}" title="Reset timer">
                   <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                 </button>
               </div>
             </div>
             <div class="timer-progress-bar" ${DATA_ATTRIBUTES.ID}="${task.id}">
               <div class="timer-progress-fill ${task.isTimerRunning ? '' : CSS_CLASSES.PAUSED}" style="width: ${progressPercent}%"></div>
             </div>
           </div>`
        : '';

      return `
        <div class="task-item ${task.completed ? CSS_CLASSES.COMPLETED : ''} ${task.isTimerRunning ? CSS_CLASSES.TIMER_RUNNING : ''}">
          <div class="task-checkbox ${task.completed ? CSS_CLASSES.COMPLETED : ''}" ${DATA_ATTRIBUTES.ID}="${task.id}"></div>
          <div class="task-content">
            <div class="task-title">${escapeHtml(task.title)}</div>
            ${timerDisplay}
          </div>
          <button class="delete-btn" ${DATA_ATTRIBUTES.ID}="${task.id}" title="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      `;
    })
    .join('');

  attachEventListeners();
  updateStats();
}

function attachEventListeners() {
  document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const taskId = target.dataset.id!;
      await window.electronAPI.toggleTask(taskId);
      await loadTasks();
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const taskId = target.dataset.id!;

      // Stop timer if running
      if (timerIntervals.has(taskId)) {
        clearInterval(timerIntervals.get(taskId)!);
        timerIntervals.delete(taskId);
      }

      await window.electronAPI.deleteTask(taskId);
      await loadTasks();
    });
  });

  // Timer control buttons
  document.querySelectorAll('.timer-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const taskId = target.dataset.id!;
      const action = target.dataset.action!;

      if (action === 'play') {
        await startTaskTimer(taskId);
      } else if (action === 'pause') {
        await pauseTaskTimer(taskId);
      } else if (action === 'reset') {
        await resetTaskTimer(taskId);
      }
    });
  });
}

async function startTaskTimer(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.duration) return;

  // Stop all other running timers
  tasks.forEach(t => {
    if (t.id !== taskId && t.isTimerRunning) {
      pauseTaskTimer(t.id);
    }
  });

  await window.electronAPI.updateTaskTimer(taskId, { isTimerRunning: true });
  task.isTimerRunning = true;

  // Clear existing interval if any
  if (timerIntervals.has(taskId)) {
    clearInterval(timerIntervals.get(taskId)!);
  }

  const intervalId = window.setInterval(async () => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask || !currentTask.timeRemaining) {
      clearInterval(intervalId);
      timerIntervals.delete(taskId);
      return;
    }

    currentTask.timeRemaining--;

    // Update display
    const timerDisplay = document.querySelector(`.timer-display[${DATA_ATTRIBUTES.ID}="${taskId}"]`);
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(currentTask.timeRemaining);
    }

    // Update progress bar
    if (currentTask.duration) {
      const progressPercent = (currentTask.timeRemaining / (currentTask.duration * TIMER_CONSTANTS.SECONDS_PER_MINUTE)) * 100;
      const progressBar = document.querySelector(`.timer-progress-bar[${DATA_ATTRIBUTES.ID}="${taskId}"] .timer-progress-fill`);
      if (progressBar) {
        (progressBar as HTMLElement).style.width = `${progressPercent}%`;
      }
    }

    // Save to disk periodically
    if (currentTask.timeRemaining % TIMER_CONSTANTS.SAVE_INTERVAL_SECONDS === 0) {
      await window.electronAPI.updateTaskTimer(taskId, {
        timeRemaining: currentTask.timeRemaining
      });
    }

    // Timer completed
    if (currentTask.timeRemaining <= 0) {
      clearInterval(intervalId);
      timerIntervals.delete(taskId);
      await window.electronAPI.updateTaskTimer(taskId, {
        isTimerRunning: false,
        timeRemaining: 0
      });
      currentTask.isTimerRunning = false;

      await onTimerComplete(taskId);
    }
  }, TIMER_CONSTANTS.TICK_INTERVAL_MS);

  timerIntervals.set(taskId, intervalId);
  renderTasks();
}

async function pauseTaskTimer(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (timerIntervals.has(taskId)) {
    clearInterval(timerIntervals.get(taskId)!);
    timerIntervals.delete(taskId);
  }

  await window.electronAPI.updateTaskTimer(taskId, {
    isTimerRunning: false,
    timeRemaining: task.timeRemaining
  });
  task.isTimerRunning = false;
  renderTasks();
}

async function resetTaskTimer(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.duration) return;

  // Stop timer if running
  if (timerIntervals.has(taskId)) {
    clearInterval(timerIntervals.get(taskId)!);
    timerIntervals.delete(taskId);
  }

  const resetTime = task.duration * TIMER_CONSTANTS.SECONDS_PER_MINUTE;
  await window.electronAPI.updateTaskTimer(taskId, {
    isTimerRunning: false,
    timeRemaining: resetTime
  });
  task.isTimerRunning = false;
  task.timeRemaining = resetTime;
  renderTasks();
}

async function onTimerComplete(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Play notification sound
  playNotificationSound();

  // Show notification
  const result = confirm(MESSAGES.TIMER_COMPLETE(task.title));

  if (result) {
    // Find next incomplete task with a timer
    const currentIndex = tasks.findIndex(t => t.id === taskId);
    const nextTask = tasks
      .slice(currentIndex + 1)
      .find(t => !t.completed && t.duration && t.duration > 0);

    if (nextTask) {
      await startTaskTimer(nextTask.id);
    } else {
      alert(MESSAGES.NO_MORE_TASKS);
    }
  }
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = AUDIO_SETTINGS.FREQUENCY;
    oscillator.type = AUDIO_SETTINGS.TYPE;

    gainNode.gain.setValueAtTime(AUDIO_SETTINGS.GAIN, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + AUDIO_SETTINGS.DURATION);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + AUDIO_SETTINGS.DURATION);
  } catch (error) {
    console.error('Could not play notification sound:', error);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  await window.electronAPI.addTask(title, selectedDuration);

  taskInput.value = '';
  selectedDuration = undefined;

  // Clear selected state from preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SELECTED);
  });

  await loadTasks();
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

minimizeBtn.addEventListener('click', () => {
  window.electronAPI.minimize();
});

closeBtn.addEventListener('click', () => {
  window.electronAPI.close();
});

// Search functionality
if (searchInput) {
  let searchTimeout: number;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      renderTasks();
    }, 300);
  });
}

// Clear completed tasks
if (clearCompletedBtn && window.electronAPI.clearCompleted) {
  clearCompletedBtn.addEventListener('click', async () => {
    if (confirm('Clear all completed tasks?')) {
      await window.electronAPI.clearCompleted();
      await loadTasks();
    }
  });
}

// Export tasks
if (exportBtn && window.electronAPI.exportTasks) {
  exportBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.exportTasks();
    if (result) {
      alert('Tasks exported successfully!');
    }
  });
}

// Import tasks
if (importBtn && window.electronAPI.importTasks) {
  importBtn.addEventListener('click', async () => {
    const count = await window.electronAPI.importTasks();
    if (count > 0) {
      alert(`Imported ${count} tasks!`);
      await loadTasks();
    }
  });
}

// Theme toggle (placeholder - implement later)
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    // Theme toggle functionality to be implemented
    console.log('Theme toggle clicked');
  });
}

// Initialize app
initializePresetButtons();
loadTasks();
