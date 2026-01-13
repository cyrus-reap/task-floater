# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Task Floater is an Electron-based desktop application for macOS that provides a floating, always-on-top task manager with Linear integration. It uses TypeScript and compiles to JavaScript before running.

## Development Commands

### Building & Running
```bash
# Compile TypeScript to JavaScript (output: dist/)
npm run build

# Watch mode - auto-recompile on file changes
npm run watch

# Build and run the app
npm start

# Development mode - watch + auto-restart
npm run dev
```

### Testing Linear Integration
The app requires Linear API configuration. Config file location:
- **macOS**: `~/Library/Application Support/task-floater/config.json`

Example config:
```json
{
  "linearApiKey": "your-linear-api-key-here"
}
```

## Architecture

### Electron Process Model

This app follows Electron's standard three-process architecture:

1. **Main Process** (`src/main.ts`)
   - Creates the BrowserWindow with frameless, transparent, always-on-top configuration
   - Handles IPC communication via `ipcMain.handle()`
   - Manages persistent storage (`~/Library/Application Support/task-floater/tasks.json`)
   - Window properties: 380x550, positioned top-right, floating above all windows

2. **Preload Script** (`src/preload.ts`)
   - Security bridge between main and renderer processes
   - Uses `contextBridge` to expose safe IPC APIs to renderer
   - Enforces context isolation (no direct node integration in renderer)

3. **Renderer Process** (`src/renderer.ts` + `src/index.html`)
   - UI logic and DOM manipulation
   - Communicates with main process via `window.electronAPI`
   - No direct access to Node.js APIs (security by design)

### Data Flow

```
User Action (renderer.ts)
  ↓
window.electronAPI.method() (preload.ts)
  ↓
ipcRenderer.invoke() (preload.ts)
  ↓
ipcMain.handle() (main.ts)
  ↓
File System / Linear API
  ↓
Return result back up the chain
```

### Linear Integration

**Service**: `src/linearService.ts`
- Uses `@linear/sdk` (official Linear client)
- Fetches assigned issues excluding completed/canceled states
- Syncs by replacing all Linear tasks while preserving manual tasks
- Not yet fully integrated into main IPC handlers (work in progress)

**Task Structure**:
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  duration?: number;             // Timer duration in minutes
  timeRemaining?: number;        // Timer countdown in seconds
  isTimerRunning?: boolean;      // Timer state
  source?: 'manual' | 'linear';  // Future enhancement
  linearId?: string;             // Linear issue identifier
}
```

### Timer Feature

Tasks can have optional timers (Pomodoro-style):
- **Duration**: Set in minutes when creating a task
- **Controls**: Play, pause, reset buttons per task
- **Single active timer**: Only one timer can run at a time
- **Auto-advance**: When a timer completes, prompts to start the next task
- **Persistence**: Timer state saved every 10 seconds and survives app restarts
- **Notification**: Audio beep and confirm dialog when timer completes
- **Display**: Live countdown in MM:SS format with visual pulsing effect

### Security Model

- **Context Isolation**: Enabled (`contextIsolation: true`)
- **Node Integration**: Disabled (`nodeIntegration: false`)
- **Preload Script**: Only secure APIs exposed via `contextBridge`
- No direct Node.js/Electron APIs accessible from renderer process

## File Structure

```
src/
├── main.ts          # Main process - window creation, IPC handlers, file I/O
├── preload.ts       # Security bridge - exposes safe APIs to renderer
├── renderer.ts      # Renderer logic - UI interactions, task management
├── linearService.ts # Linear API integration (in progress)
├── types.d.ts       # TypeScript declarations for ElectronAPI
└── index.html       # UI markup and embedded styles
```

## TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS (required for Electron)
- **Output**: `dist/` directory
- **Strict mode**: Enabled
- **Notable**: Includes DOM lib for renderer process types

## Common Patterns

### Adding New IPC Handlers

When adding communication between renderer and main process:

1. **Define handler in main.ts**:
```typescript
ipcMain.handle('my-action', async (_event, arg) => {
  // Implementation
  return result;
});
```

2. **Expose in preload.ts**:
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // Existing methods...
  myAction: (arg: Type): Promise<Result> => ipcRenderer.invoke('my-action', arg),
});
```

3. **Update types.d.ts**:
```typescript
interface ElectronAPI {
  // Existing methods...
  myAction: (arg: Type) => Promise<Result>;
}
```

4. **Use in renderer.ts**:
```typescript
const result = await window.electronAPI.myAction(arg);
```

### Storage Pattern

Tasks persist to JSON file using Node.js `fs` module (main process only):
- **Path**: Determined by `app.getPath('userData')`
- **Format**: JSON array of Task objects
- **Pattern**: Read full array → modify → write full array (no incremental updates)

## Window Configuration

The window is configured for macOS floating behavior:
- **Frameless**: Custom title bar in HTML
- **Transparent**: Glass morphism effect with backdrop blur
- **Always on top**: Uses `floating` level with priority 1
- **Draggable**: Header has `-webkit-app-region: drag`
- **Non-draggable elements**: Must have `-webkit-app-region: no-drag`

## Known Limitations

1. **Linear Integration**: Service exists but not fully wired into IPC handlers
2. **macOS Only**: Window positioning and always-on-top behavior optimized for macOS
3. **No undo**: Task deletions are immediate and permanent
4. **Single user**: No multi-user or sync between devices
