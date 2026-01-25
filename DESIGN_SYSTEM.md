# Task Floater Design System

> A comprehensive design token system and component refinement guide for a premium dark-mode productivity app.

---

## Part 1: Design Tokens

### 🎨 Color System (Dark Mode Layered Surfaces)

```css
/* ========================================================================== */
/* SURFACE LAYERS - Progressive depth system (darkest to lightest)           */
/* ========================================================================== */

--layer-0-app-bg: #0a0a0c;                    /* App background (deepest) */
--layer-1-container: rgba(16, 16, 20, 0.95);  /* Main container */
--layer-2-panel: rgba(28, 28, 34, 0.6);       /* Input sections, panels */
--layer-3-card-rest: rgba(32, 32, 40, 0.4);   /* Task cards (resting) */
--layer-4-card-hover: rgba(38, 38, 46, 0.6);  /* Task cards (elevated) */
--layer-5-card-active: rgba(42, 42, 50, 0.7); /* Task cards (pressed) */

/* ========================================================================== */
/* BORDER SYSTEM - Progressive clarity                                       */
/* ========================================================================== */

--border-subtle: rgba(255, 255, 255, 0.04);   /* Dividers, structural lines */
--border-default: rgba(255, 255, 255, 0.08);  /* Card borders, inputs */
--border-strong: rgba(255, 255, 255, 0.12);   /* Hover states */
--border-accent: rgba(59, 130, 246, 0.4);     /* Focus rings, active states */
--border-accent-strong: rgba(59, 130, 246, 0.6);  /* Primary focus */

/* ========================================================================== */
/* TEXT HIERARCHY - Five-level contrast system                               */
/* ========================================================================== */

--text-primary: rgba(255, 255, 255, 0.95);    /* Main content, headings */
--text-secondary: rgba(255, 255, 255, 0.72);  /* Metadata, descriptions */
--text-tertiary: rgba(255, 255, 255, 0.5);    /* Timestamps, counts */
--text-muted: rgba(255, 255, 255, 0.35);      /* Structural labels */
--text-placeholder: rgba(255, 255, 255, 0.28); /* Input placeholders */

/* ========================================================================== */
/* ACCENT COLOR - Primary blue with variants                                 */
/* ========================================================================== */

--accent: #3b82f6;                            /* Primary accent (blue) */
--accent-bright: #60a5fa;                     /* Hover, highlights */
--accent-dim: rgba(59, 130, 246, 0.15);       /* Soft backgrounds */
--accent-subtle: rgba(59, 130, 246, 0.08);    /* Very subtle tints */
--accent-glow: rgba(59, 130, 246, 0.25);      /* Shadows, glows */
--accent-glow-strong: rgba(59, 130, 246, 0.4); /* Active glows */

/* ========================================================================== */
/* PRIORITY COLORS - Low, Medium, High with tinted backgrounds               */
/* ========================================================================== */

/* Low Priority (Blue) */
--priority-low: #3b82f6;
--priority-low-bright: #60a5fa;
--priority-low-bg: rgba(59, 130, 246, 0.18);
--priority-low-border: rgba(59, 130, 246, 0.5);
--priority-low-glow: rgba(59, 130, 246, 0.25);

/* Medium Priority (Amber) */
--priority-medium: #f59e0b;
--priority-medium-bright: #fbbf24;
--priority-medium-bg: rgba(245, 158, 11, 0.18);
--priority-medium-border: rgba(245, 158, 11, 0.5);
--priority-medium-glow: rgba(245, 158, 11, 0.25);

/* High Priority (Red) */
--priority-high: #ef4444;
--priority-high-bright: #f87171;
--priority-high-bg: rgba(239, 68, 68, 0.18);
--priority-high-border: rgba(239, 68, 68, 0.5);
--priority-high-glow: rgba(239, 68, 68, 0.3);

/* ========================================================================== */
/* SEMANTIC COLORS - Success, Warning, Danger                                */
/* ========================================================================== */

--success: #10b981;
--success-bg: rgba(16, 185, 129, 0.15);
--warning: #f59e0b;
--warning-bg: rgba(245, 158, 11, 0.15);
--danger: #ef4444;
--danger-bg: rgba(239, 68, 68, 0.15);

/* ========================================================================== */
/* INTERACTIVE STATES - Hover, active, focus                                 */
/* ========================================================================== */

--interactive-hover: rgba(255, 255, 255, 0.08);  /* Hover overlay */
--interactive-active: rgba(255, 255, 255, 0.12); /* Active/pressed */
--focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.12); /* Focus indicator */
--focus-ring-strong: 0 0 0 3px rgba(59, 130, 246, 0.2);
```

---

### 📏 Spacing Scale (4px base grid)

```css
/* ========================================================================== */
/* SPACING SYSTEM - Consistent layout rhythm                                 */
/* ========================================================================== */

--space-0: 0;
--space-1: 4px;     /* Tight spacing (icons, badges) */
--space-2: 8px;     /* Standard gap (list items) */
--space-3: 12px;    /* Comfortable padding (cards) */
--space-4: 16px;    /* Section padding */
--space-5: 20px;    /* Generous spacing */
--space-6: 24px;    /* Section gaps */
--space-8: 32px;    /* Major sections */
--space-10: 40px;   /* Page-level spacing */
--space-12: 48px;   /* Large gaps */
```

**Usage Guidelines:**
- Card padding: `var(--space-3)` (12px)
- Section gaps: `var(--space-6)` (24px)
- Input height: 44px minimum (accessibility)
- Button height: 32px-44px range
- List item spacing: `var(--space-2)` (8px)

---

### 🔘 Border Radius Scale

```css
/* ========================================================================== */
/* BORDER RADIUS - Component-specific rounding                               */
/* ========================================================================== */

--radius-xs: 4px;   /* Keycaps, small badges */
--radius-sm: 6px;   /* Checkboxes, small buttons */
--radius-md: 8px;   /* Pills, inputs, tags */
--radius-lg: 10px;  /* Task cards, panels */
--radius-xl: 12px;  /* Container, modals */
--radius-2xl: 16px; /* Large surfaces */
--radius-full: 9999px; /* Circles, round badges */
```

**Component Mapping:**
- Input fields: `--radius-md` (8px)
- Task cards: `--radius-lg` (10px)
- Main container: `--radius-xl` (12px)
- Pills/tags: `--radius-md` (8px)
- Checkboxes: `--radius-sm` (6px)

---

### 🌫 Elevation System (Shadows + Highlights)

```css
/* ========================================================================== */
/* ELEVATION - Depth through subtle shadows and highlights                   */
/* ========================================================================== */

/* Flat elements (no elevation) */
--elevation-0: none;

/* Level 1: Subtle lift (inputs, resting cards) */
--elevation-1:
  0 1px 3px rgba(0, 0, 0, 0.12),
  0 1px 2px rgba(0, 0, 0, 0.08);

/* Level 2: Card hover, dropdowns */
--elevation-2:
  0 4px 12px rgba(0, 0, 0, 0.15),
  0 2px 4px rgba(0, 0, 0, 0.1);

/* Level 3: Modals, popovers */
--elevation-3:
  0 8px 24px rgba(0, 0, 0, 0.2),
  0 4px 8px rgba(0, 0, 0, 0.12);

/* Glow effects (accent-based) */
--glow-accent: 0 0 12px rgba(59, 130, 246, 0.4);
--glow-accent-strong: 0 0 20px rgba(59, 130, 246, 0.5);
--glow-priority-high: 0 2px 8px rgba(239, 68, 68, 0.2);

/* Inset highlights (depth) */
--highlight-inset: inset 0 1px 0 rgba(255, 255, 255, 0.04);
--shadow-inset: inset 0 1px 3px rgba(0, 0, 0, 0.15);
```

**Usage:**
- Resting cards: `--elevation-1`
- Hover cards: `--elevation-2`
- Modals: `--elevation-3`
- Active timer: `--glow-accent`
- Input fields: `--shadow-inset`

---

### 🔤 Typography System

```css
/* ========================================================================== */
/* TYPOGRAPHY HIERARCHY                                                       */
/* ========================================================================== */

/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif;
--font-mono: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 11px;    /* Keycaps, metadata */
--text-sm: 12px;    /* Secondary text */
--text-base: 13px;  /* Body text */
--text-md: 14px;    /* Emphasized text */
--text-lg: 16px;    /* Timer countdown, headings */
--text-xl: 20px;    /* Focus timer */
--text-2xl: 32px;   /* Large focus timer */
--text-3xl: 48px;   /* Full-screen timer */

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Letter Spacing */
--tracking-tight: -0.01em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
--tracking-wider: 0.08em;
```

**Component Typography:**

| Component | Size | Weight | Tracking |
|-----------|------|--------|----------|
| Task title | 13px | 400 | -0.01em |
| Timer countdown | 16px | 600 | 0.02em |
| Section headers | 11px | 600 | 0.08em |
| Focus timer | 48px | 600 | -0.02em |
| Button text | 12px | 500 | 0.01em |

---

### 🎞 Motion System

```css
/* ========================================================================== */
/* ANIMATION TIMING - Speed and easing curves                                */
/* ========================================================================== */

/* Duration tokens */
--duration-instant: 80ms;    /* Button press feedback */
--duration-fast: 120ms;      /* Hover states */
--duration-base: 180ms;      /* Standard transitions */
--duration-smooth: 250ms;    /* Smooth state changes */
--duration-slow: 350ms;      /* Task completion, major states */
--duration-slower: 500ms;    /* Modals, overlays */

/* Easing curves */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Deceleration */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Acceleration */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);      /* Smooth both ends */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful bounce */
--ease-smooth: cubic-bezier(0.45, 0, 0.15, 1);    /* Very smooth */

/* Combined transition tokens */
--transition-fast: 120ms var(--ease-out);
--transition-base: 180ms var(--ease-in-out);
--transition-smooth: 250ms var(--ease-in-out);
--transition-bounce: 300ms var(--ease-bounce);
```

**Animation Guidelines:**

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Button hover | 120ms | ease-out | Quick response |
| Button press | 80ms | ease-in | Instant feedback |
| Card hover | 180ms | ease-in-out | Smooth lift |
| Task complete | 350ms | ease-in-out | Satisfying exit |
| Modal open | 250ms | ease-out | Smooth entrance |
| Progress bar | 300ms | ease-out | Not linear |
| Focus mode toggle | 400ms | ease-smooth | Major transition |

---

## Part 2: Component Refinements

### 1. Task Input Area

**Current Issues:**
- Input blends into background
- Add button feels disconnected
- Focus state lacks impact

**Refinements:**

```css
/* Input Field */
.task-input {
  height: 44px;
  padding: 0 var(--space-4);
  background: var(--layer-2-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  box-shadow: var(--shadow-inset);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.task-input::placeholder {
  color: var(--text-placeholder);
}

.task-input:focus {
  background: rgba(20, 20, 26, 0.8);
  border-color: var(--border-accent-strong);
  box-shadow:
    var(--focus-ring),
    var(--shadow-inset);
  outline: none;
}

/* Add Button (attached to input) */
.add-button {
  height: 44px;
  padding: 0 var(--space-5);
  background: linear-gradient(135deg, var(--accent) 0%, #2563eb 100%);
  border: none;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  color: white;
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-button:hover {
  background: linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}
```

**Design Tokens Used:**
- Surface: `--layer-2-panel`
- Border: `--border-default`, `--border-accent-strong`
- Height: 44px (accessibility target)
- Radius: `--radius-md`
- Transition: `--transition-fast`

---

### 2. Duration Selector (Timer Pills)

**Current Issues:**
- Pills lack clear interactivity
- Selected state too subtle
- Custom option blends in

**Refinements:**

```css
.duration-btn {
  height: 32px;
  padding: 0 var(--space-4);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.duration-btn:hover {
  background: var(--interactive-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.duration-btn.selected {
  background: var(--accent-dim);
  border-color: var(--border-accent);
  color: var(--text-primary);
  box-shadow:
    0 2px 8px var(--accent-glow),
    var(--highlight-inset);
}

.duration-btn:active {
  transform: scale(0.96);
}

/* Custom duration input */
.custom-duration-input {
  width: 60px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--layer-2-panel);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.custom-duration-input:focus {
  border-color: var(--border-accent);
  box-shadow: var(--focus-ring);
  outline: none;
}
```

**Visual Hierarchy:**
- Unselected: Low-contrast, subtle border
- Hover: Elevated surface, brighter text
- Selected: Accent-tinted background, glow shadow
- Active: Scale feedback (0.96)

---

### 3. Priority Selector

**Current Issues:**
- Priority colors too muted
- Selected state unclear
- No visual weight difference

**Refinements:**

```css
.priority-btn {
  position: relative;
  height: 32px;
  padding: 0 var(--space-4) 0 var(--space-6);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

/* Color indicator dot */
.priority-btn::before {
  content: '';
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  opacity: 0.4;
  transition: all var(--transition-fast);
}

.priority-btn:hover {
  background: var(--interactive-hover);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.priority-btn:hover::before {
  opacity: 0.7;
}

/* Low Priority (Blue) */
.priority-btn.low::before {
  background: var(--priority-low-bright);
}

.priority-btn.low.selected {
  background: var(--priority-low-bg);
  border-color: var(--priority-low-border);
  color: var(--text-primary);
}

.priority-btn.low.selected::before {
  opacity: 1;
  box-shadow: 0 0 8px var(--priority-low-glow);
}

/* Medium Priority (Amber) */
.priority-btn.medium::before {
  background: var(--priority-medium-bright);
}

.priority-btn.medium.selected {
  background: var(--priority-medium-bg);
  border-color: var(--priority-medium-border);
  color: var(--text-primary);
}

.priority-btn.medium.selected::before {
  opacity: 1;
  box-shadow: 0 0 8px var(--priority-medium-glow);
}

/* High Priority (Red) */
.priority-btn.high::before {
  background: var(--priority-high-bright);
}

.priority-btn.high.selected {
  background: var(--priority-high-bg);
  border-color: var(--priority-high-border);
  color: var(--text-primary);
  box-shadow: var(--glow-priority-high);
}

.priority-btn.high.selected::before {
  opacity: 1;
  box-shadow: 0 0 8px var(--priority-high-glow);
  animation: priorityPulse 2s ease-in-out infinite;
}

@keyframes priorityPulse {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-50%) scale(1.2);
    opacity: 0.8;
  }
}
```

**Visual States:**
- Dot visibility increases with priority level
- High priority gets subtle pulse animation
- Tinted backgrounds use priority color at 18% opacity
- Clear border contrast for selected states

---

### 4. Search Bar

**Current Issues:**
- Blends into background
- Keyboard shortcut not prominent
- No clear focus state

**Refinements:**

```css
.search-section {
  padding: var(--space-3) var(--space-4);
  background: var(--layer-2-panel);
  border-bottom: 1px solid var(--border-subtle);
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3);
  background: rgba(28, 28, 34, 0.6);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  box-shadow: var(--elevation-1);
  transition: all var(--transition-base);
}

.search-input:focus {
  background: var(--layer-3-card-rest);
  border-color: var(--border-accent);
  box-shadow:
    var(--focus-ring),
    var(--elevation-1);
  outline: none;
}

/* Keyboard shortcut hint (styled as keycap) */
.keyboard-hint {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 1px 0 rgba(0, 0, 0, 0.2);
}
```

**Keycap Styling:**
- Monospace font for technical feel
- 3D effect with subtle shadows
- Appears as physical key

---

### 5. Task Cards

**Current Issues:**
- Cards feel flat
- Hover state too subtle
- Priority indicators unclear

**Refinements:**

```css
.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background: var(--layer-3-card-rest);
  border: 1px solid var(--border-default);
  border-left: 3px solid transparent;
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-1);
  cursor: default;
  transition: all var(--transition-base);
}

.task-item:hover {
  background: var(--layer-4-card-hover);
  border-color: var(--border-strong);
  transform: translateY(-1px);
  box-shadow: var(--elevation-2);
}

.task-item:active {
  transform: translateY(0);
}

/* Timer running state */
.task-item.timer-running {
  background: var(--accent-dim);
  border-left-color: var(--accent);
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.2),
    var(--elevation-2);
  animation: timerPulse 2s ease-in-out infinite;
}

@keyframes timerPulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(59, 130, 246, 0.2),
      var(--elevation-2);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(59, 130, 246, 0.4),
      0 4px 20px rgba(59, 130, 246, 0.2);
  }
}

/* Priority border indicators */
.task-item.priority-low {
  border-left-color: var(--priority-low);
}

.task-item.priority-medium {
  border-left-color: var(--priority-medium);
}

.task-item.priority-high {
  border-left-color: var(--priority-high);
  box-shadow:
    var(--elevation-1),
    -2px 0 8px var(--priority-high-glow);
}

/* Checkbox */
.task-checkbox {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-checkbox:hover {
  border-color: var(--accent-bright);
  background: var(--accent-subtle);
}

.task-checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
}

.task-checkbox.checked::after {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: var(--weight-semibold);
}
```

**Card Elevation:**
- Resting: Subtle shadow, low contrast
- Hover: Lifted 1px, stronger shadow
- Timer running: Pulsing glow effect
- Priority: Colored left border (3px)

---

### 6. Active Timer Display

**Current Issues:**
- Countdown lacks emphasis
- Progress bar too thin
- Controls not clearly interactive

**Refinements:**

```css
/* Timer Display Section */
.task-timer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  transition: all var(--transition-smooth);
}

/* Countdown Timer */
.timer-time {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
  min-width: 70px;
  transition: all var(--transition-base);
}

.task-item.timer-running .timer-time {
  color: var(--accent-bright);
  text-shadow: 0 0 12px var(--accent-glow);
}

.task-item.timer-warning .timer-time {
  color: var(--priority-high);
  animation: timerWarningPulse 1s ease-in-out infinite;
}

@keyframes timerWarningPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Progress Bar */
.timer-progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.timer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%);
  border-radius: var(--radius-full);
  transition: width 300ms var(--ease-out);
  box-shadow: var(--glow-accent);
}

.task-item.timer-running .timer-progress-fill {
  animation: progressGlow 2s ease-in-out infinite;
}

@keyframes progressGlow {
  0%, 100% {
    box-shadow: 0 0 8px var(--accent-glow);
  }
  50% {
    box-shadow: 0 0 16px var(--accent-glow-strong);
  }
}

/* Warning state (last 5 minutes) */
.task-item.timer-warning .timer-progress-fill {
  background: linear-gradient(90deg, var(--priority-medium) 0%, var(--priority-medium-bright) 100%);
  box-shadow: 0 0 12px var(--priority-medium-glow);
}

/* Critical state (last 1 minute) */
.task-item.timer-critical .timer-progress-fill {
  background: linear-gradient(90deg, var(--priority-high) 0%, var(--priority-high-bright) 100%);
  box-shadow: 0 0 12px var(--priority-high-glow);
  animation: criticalPulse 1s ease-in-out infinite;
}

@keyframes criticalPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Timer Controls */
.timer-control-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-dim);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.timer-control-btn:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: var(--border-accent);
  transform: scale(1.05);
}

.timer-control-btn:active {
  transform: scale(0.95);
}

/* Running timer indicator dot */
.timer-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--accent-bright);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}
```

**Timer States:**
- Normal: Blue gradient with glow
- Warning (< 5min): Amber with pulse
- Critical (< 1min): Red with faster pulse
- Countdown: Monospace, tabular numerals (no shifting)

---

### 7. Section Headers (ACTIVE / DONE)

**Current Issues:**
- Too prominent for structural labels
- Compete with content

**Refinements:**

```css
.section-header {
  padding: var(--space-4) var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-muted);
  border-top: 1px solid var(--border-subtle);
  margin-top: var(--space-6);
}

.section-header:first-child {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

/* Task count badge */
.task-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 var(--space-2);
  margin-left: var(--space-2);
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-tertiary);
}
```

**Design Intent:**
- De-emphasized (low contrast)
- Wide letter-spacing for readability
- Subtle divider above sections
- Count badge for context

---

### 8. Focus / Full Timer Mode

**Current Issues:**
- Timer doesn't feel immersive
- Controls compete for attention
- Background not dark enough

**Refinements:**

```css
/* Focus Mode Container */
.container.focus-mode {
  background: rgba(10, 10, 12, 0.98);
  max-height: none;
}

/* Large Focus Timer */
.focus-timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  gap: var(--space-6);
}

.focus-timer-countdown {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  text-shadow: 0 0 40px var(--accent-glow-strong);
  animation: focusTimerGlow 3s ease-in-out infinite;
}

@keyframes focusTimerGlow {
  0%, 100% {
    text-shadow: 0 0 40px var(--accent-glow);
  }
  50% {
    text-shadow: 0 0 60px var(--accent-glow-strong);
  }
}

.focus-timer-countdown.warning {
  color: var(--priority-medium-bright);
  text-shadow: 0 0 40px var(--priority-medium-glow);
}

.focus-timer-countdown.critical {
  color: var(--priority-high-bright);
  text-shadow: 0 0 40px var(--priority-high-glow);
  animation: criticalGlow 1s ease-in-out infinite;
}

@keyframes criticalGlow {
  0%, 100% {
    text-shadow: 0 0 40px var(--priority-high-glow);
  }
  50% {
    text-shadow: 0 0 60px rgba(239, 68, 68, 0.5);
  }
}

/* Focus Mode Progress Bar */
.focus-progress-bar {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.focus-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%);
  border-radius: var(--radius-full);
  transition: width 1s linear;
  box-shadow: 0 0 20px var(--accent-glow-strong);
}

/* Focus Mode Controls (de-emphasized) */
.focus-controls {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  opacity: 0.6;
  transition: opacity var(--transition-base);
}

.focus-controls:hover {
  opacity: 1;
}

.focus-control-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.focus-control-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--border-strong);
  transform: scale(1.05);
}

.focus-control-btn:active {
  transform: scale(0.95);
}

/* Task Title in Focus Mode */
.focus-task-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  text-align: center;
  max-width: 400px;
  line-height: var(--leading-relaxed);
}
```

**Focus Mode Philosophy:**
- Maximum contrast (near-black background)
- Large, glowing countdown (48px)
- Subtle pulsing glow effect
- Controls fade until needed
- Immersive, distraction-free

---

## Part 3: Motion & Interaction Guidelines

### Task Completion Animation

```css
/* Task Completion Flow */
@keyframes taskComplete {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  20% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
}

.task-item.completing {
  animation: taskComplete 350ms var(--ease-in-out) forwards;
  pointer-events: none;
}

/* Checkbox animation */
@keyframes checkboxCheck {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.task-checkbox.checked::after {
  animation: checkboxCheck 200ms var(--ease-bounce);
}
```

**Flow:**
1. Checkbox scales (50ms)
2. Checkmark draws (150ms)
3. Task fades/scales down (350ms)
4. Remaining tasks slide up (250ms)

---

### Task Addition Animation

```css
@keyframes taskSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-12px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.task-item.new {
  animation: taskSlideIn 250ms var(--ease-bounce);
}
```

**Flow:**
1. Input briefly pulses (100ms)
2. New task appears at top
3. Slides in from above with bounce
4. Input clears and refocuses

---

### Timer Start/Stop

```css
@keyframes timerStart {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.95);
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.timer-control-btn.starting {
  animation: timerStart 250ms var(--ease-bounce);
}
```

**Flow:**
1. Button scales down then up (bounce)
2. Progress bar slides in from left
3. Timer dot fades in with pulse
4. Card border turns accent color

---

### Hover Interactions

```css
/* Universal hover pattern */
.interactive-element {
  transition:
    background var(--duration-fast) var(--ease-out),
    border var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.interactive-element:hover {
  transform: translateY(-1px);
}

.interactive-element:active {
  transform: translateY(0) scale(0.98);
  transition-duration: var(--duration-instant);
}
```

**Pattern:**
- Hover: 120ms, slight lift
- Active: 80ms, press down
- Release: Return to hover state

---

### Focus Mode Toggle

```css
@keyframes focusModeEnter {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.container.focus-mode .focus-timer-display {
  animation: focusModeEnter 400ms var(--ease-smooth);
}
```

**Flow:**
1. Container scales down (100ms)
2. Non-essential elements fade (200ms)
3. Background darkens (300ms)
4. Focus timer scales up and centers (250ms delay)

---

## Implementation Checklist

### Phase 1: Token System
- [ ] Update color variables with new layer system
- [ ] Add border scale refinements
- [ ] Implement elevation tokens
- [ ] Add motion timing tokens

### Phase 2: Input Components
- [ ] Refine task input + add button (attached style)
- [ ] Enhance duration selector pills
- [ ] Improve priority selector with dots
- [ ] Style search bar with keycap hints

### Phase 3: Task Cards
- [ ] Update card elevation and hover states
- [ ] Add priority left-border indicators
- [ ] Enhance timer display (larger, monospace)
- [ ] Improve progress bar (thicker, glowing)
- [ ] Refine timer controls

### Phase 4: Structural Elements
- [ ] De-emphasize section headers
- [ ] Add task count badges
- [ ] Improve empty states

### Phase 5: Focus Mode
- [ ] Darken background
- [ ] Scale up timer (48px)
- [ ] Add glow effects
- [ ] De-emphasize controls

### Phase 6: Animations
- [ ] Task completion flow
- [ ] Task addition bounce
- [ ] Timer start/stop feedback
- [ ] Hover/active micro-interactions
- [ ] Progress bar smooth transitions

---

## Token Reference Quick Guide

```css
/* Most Common Tokens */
--layer-3-card-rest         /* Task card background */
--layer-4-card-hover        /* Task card hover */
--border-default            /* Standard borders */
--border-accent             /* Focus states */
--text-primary              /* Main content */
--text-secondary            /* Metadata */
--accent                    /* Primary actions */
--accent-dim                /* Subtle backgrounds */
--space-3                   /* Card padding (12px) */
--radius-lg                 /* Card corners (10px) */
--elevation-1               /* Card shadow */
--transition-fast           /* Hover (120ms) */
--transition-base           /* Standard (180ms) */
```

---

**End of Design System Documentation**

This system prioritizes:
- ✅ Visual hierarchy through layered surfaces
- ✅ Clear interaction states with smooth feedback
- ✅ Calm, minimal aesthetic for focus sessions
- ✅ Accessible contrast and target sizes
- ✅ Consistent spacing and motion
