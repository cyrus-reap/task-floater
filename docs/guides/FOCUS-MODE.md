# Focus Mode Feature

Focus Mode helps you concentrate on active tasks by minimizing distractions.

## 🎯 What is Focus Mode?

When enabled, Focus Mode:
- ✅ **Hides completed tasks** - Only shows active work
- ✅ **Hides search bar** - No distractions
- ✅ **Hides stats bar** - Cleaner interface
- ✅ **Hides input section** - Can't add new tasks while focused
- ✅ **Dims inactive tasks** - Tasks without timers appear at 50% opacity
- ✅ **Highlights active task** - Running timer task scales up and glows
- ✅ **Darker background** - More immersive experience

## 🚀 How to Use

### Toggle Focus Mode

**Method 1: Click Button**
- Click the focus icon (two circles) in the header
- Button turns blue when active

**Method 2: Keyboard Shortcut**
```
Cmd+Shift+F  (macOS)
Ctrl+Shift+F (Windows/Linux)
```

### Exit Focus Mode

Same methods:
- Click the blue focus button again
- Press Cmd+Shift+F again

## 💡 Use Cases

### 1. Deep Work Session
```
1. Add your tasks for the day
2. Set timers on each
3. Enable Focus Mode (Cmd+Shift+F)
4. Start first timer
5. Work without distractions
6. Timer auto-advances to next task
```

### 2. Pomodoro Workflow
```
1. Add "Write report" with 25min timer
2. Add "Review code" with 25min timer
3. Add "Respond to emails" with 15min timer
4. Enable Focus Mode
5. Let the app guide you through each task
```

### 3. Sprint Focus
```
1. Start your work sprint
2. Enable Focus Mode
3. See only what matters
4. Complete tasks one by one
5. Exit focus mode to review completedtasks
```

## 🎨 Visual Changes in Focus Mode

### Normal Mode
```
┌─────────────────────┐
│ Header with controls│
├─────────────────────┤
│ Stats: 3 active     │
├─────────────────────┤
│ 🔍 Search...        │
├─────────────────────┤
│ Add new task input  │
│ Duration presets    │
├─────────────────────┤
│ ✓ Completed task    │
│ ○ Active task       │
│ ▶ Running timer     │
└─────────────────────┘
```

### Focus Mode
```
┌─────────────────────┐
│ Header (focus btn 🔵)│
├─────────────────────┤
│                     │
│ ○ Task (dim)        │
│ ▶ ACTIVE TIMER      │← Highlighted!
│   30:00 ████████░░  │← Big & bright
│ ○ Task (dim)        │
│                     │
└─────────────────────┘
```

## ⌨️ Keyboard Shortcuts

### Enter Focus Mode
- `Cmd+Shift+F` - Toggle focus mode

### While in Focus Mode
- Navigation still works:
  - `↑/↓` - Navigate tasks
  - `Space` - Toggle task complete
  - `Enter` - Edit task
- Timer controls still work
- `Cmd+Shift+F` - Exit focus mode
- `Esc` - Clear selections

## 🔔 Notifications

When entering focus mode:
```
🎯 Focus Mode
Completed tasks hidden. Distractions minimized.
```

## 🎨 Design Details

### Colors
- **Active focus button**: Blue gradient with glow
- **Container background**: Darker (rgba(20, 20, 30, 0.95))
- **Border**: Blue accent (rgba(100, 150, 255, 0.3))
- **Active timer**: Scaled up 102% with green glow

### Animations
- Smooth 0.3s cubic-bezier transitions
- Stats/search/input collapse smoothly
- Completed tasks fade out
- Active task scales up

## 💡 Tips

1. **Best for timed work**: Most effective when tasks have timers
2. **One task at a time**: Focus on the running timer
3. **No multitasking**: Hides distractions deliberately
4. **Quick toggle**: Cmd+Shift+F for instant focus
5. **Review later**: Exit focus mode to see all tasks

## 🔧 Technical Implementation

### State Management
```typescript
let isFocusMode = false;  // Global state
```

### CSS Class Applied
```css
.container.focus-mode {
  /* Darker background */
  /* Hide stats, search, input */
  /* Hide completed tasks */
  /* Dim inactive tasks */
  /* Highlight running timer */
}
```

### Event Flow
```
Click button OR Cmd+Shift+F
  ↓
toggleFocusMode()
  ↓
Update state & CSS classes
  ↓
renderTasks()
  ↓
UI reflects focus mode
```

## 🎯 Future Enhancements

Possible improvements:
- [ ] Focus mode timer sound effects
- [ ] Fullscreen focus mode option
- [ ] Focus mode statistics (time in focus)
- [ ] Customizable focus mode (choose what to hide)
- [ ] Focus mode presets (Pomodoro, Deep Work, etc.)
- [ ] Break timer between focused sessions
- [ ] Focus mode history/analytics

## 📸 Visual Comparison

| Normal Mode | Focus Mode |
|-------------|------------|
| All UI elements visible | Minimal UI |
| All tasks shown | Only active tasks |
| Equal task prominence | Active timer emphasized |
| Standard opacity | Dimmed distractions |
| Standard background | Darker, immersive |

## ✨ Summary

Focus Mode transforms Task Floater into a distraction-free productivity tool. Perfect for deep work, Pomodoro sessions, or any time you need to concentrate on completing tasks one by one.

**Try it now: Cmd+Shift+F** 🎯
