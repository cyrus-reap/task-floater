# Security Implementation

This document outlines the security measures implemented in Task Floater.

## Electron Security Configuration

### Context Isolation ✅
- **Status**: Enabled (`contextIsolation: true`)
- **Purpose**: Separates renderer process from Node.js/Electron APIs
- **Location**: `src/main.ts:29`

### Node Integration ✅
- **Status**: Disabled (`nodeIntegration: false`)
- **Purpose**: Prevents renderer from accessing Node.js APIs directly
- **Location**: `src/main.ts:29`

### Preload Script ✅
- **Purpose**: Secure IPC bridge using `contextBridge`
- **Location**: `src/preload.ts`
- **Pattern**: Only expose specific, validated APIs to renderer

## Input Validation

### Validation Module
**File**: `src/validation.ts`

All user inputs are validated before processing:

1. **Task Title**
   - Type check: Must be string
   - Length: 1-500 characters
   - Sanitization: HTML tags stripped
   - XSS Prevention: Applied in renderer via `escapeHtml()`

2. **Duration**
   - Type check: Must be number
   - Range: 1-1440 minutes (max 24 hours)
   - Integer check: No fractional minutes
   - Prevents resource exhaustion from extreme values

3. **Task ID**
   - Type check: Must be string
   - Format: Alphanumeric with dashes/underscores only
   - Prevents injection attacks via IDs

4. **Time Remaining**
   - Type check: Must be number
   - Range: 0-86400 seconds (max 24 hours)
   - Floor function: Ensures integers

### IPC Handler Validation

Every IPC handler validates inputs:

```typescript
// Example: add-task handler
ipcMain.handle('add-task', async (_event, title: string, duration?: number) => {
  const validatedTitle = Validators.taskTitle(title);      // ✅ Validated
  const validatedDuration = Validators.duration(duration); // ✅ Validated
  // ... rest of implementation
});
```

## XSS Prevention

### HTML Escaping ✅
- **Function**: `escapeHtml()` in `src/renderer.ts`
- **Usage**: All user-generated content (task titles) is escaped
- **Method**: Uses DOM's built-in text content escaping

```typescript
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;  // Browser handles escaping
  return div.innerHTML;
}
```

### Content Security Policy (CSP) ✅
**Location**: `src/index.html:6`

```
default-src 'none';           # Deny all by default
script-src 'self';            # Only load scripts from app
style-src 'unsafe-inline';    # Allow inline styles (needed for Electron)
img-src 'self' data:;         # Only local images
connect-src 'none';           # No external connections
```

### X-Content-Type-Options ✅
Prevents MIME-type sniffing attacks

## File System Security

### Path Traversal Prevention ✅

All file operations validate paths:

```typescript
const normalizedPath = path.normalize(STORE_PATH);
const userDataPath = path.normalize(app.getPath('userData'));

if (!normalizedPath.startsWith(userDataPath)) {
  throw new Error('Invalid file path - security violation');
}
```

### File Permissions ✅
- Tasks file written with `mode: 0o600` (user read/write only)
- Prevents other users from reading task data

### Secure Storage Paths
- **Tasks**: `~/Library/Application Support/task-floater/tasks.json`
- **Settings**: `~/Library/Application Support/task-floater/settings.json`
- Both within app's sandboxed userData directory

## Data Sanitization

### Save Operations ✅
The `save-tasks` IPC handler validates every task:
- Checks array structure
- Validates each task object
- Sanitizes all fields
- Prevents malicious task objects

### Update Operations ✅
The `update-task` handler uses whitelisting:
- Only specific fields can be updated (title, duration, completed, tags)
- Each field individually validated
- **No** `Object.assign(task, updates)` which would allow arbitrary properties

## Error Handling

### Try-Catch Blocks ✅
All IPC handlers wrapped in try-catch:
- Prevents crashes from malformed inputs
- Logs errors for debugging
- Returns meaningful error messages

### Validation Errors ✅
Custom `ValidationError` class for validation failures:
- Clear error messages
- Distinguishable from other errors
- Properly logged

## Runtime Security

### Timer Intervals
- Properly cleared on task deletion
- Prevents memory leaks
- No unbounded resource consumption

### Audio Context
- Wrapped in try-catch
- Limits: 800Hz, 0.5s duration, 0.3 gain
- Cannot be used for attacks

## Configuration Security

### API Keys
- Linear API key stored in separate config file
- **Never** in code or version control
- User's responsibility to secure

### No Remote Code
- No `eval()` or `Function()` constructors
- No dynamic script loading
- No remote content loading

## Attack Surface Analysis

### ✅ Protected Against:
1. **XSS** - HTML escaping + CSP
2. **Code Injection** - Context isolation + input validation
3. **Path Traversal** - Path normalization checks
4. **Resource Exhaustion** - Duration/time limits
5. **Privilege Escalation** - nodeIntegration disabled
6. **MITM** - No external network requests
7. **Data Tampering** - File validation on load

### 🛡️ Mitigated:
1. **Local File Access** - Sandboxed to userData directory
2. **Malicious Tasks File** - Validated on load, defaults to empty array

### ⚠️ User Responsibility:
1. **API Key Security** - User must secure their Linear API key
2. **Physical Access** - App doesn't encrypt stored tasks

## Security Checklist

- [x] Context isolation enabled
- [x] Node integration disabled
- [x] Content Security Policy configured
- [x] All user inputs validated
- [x] HTML output escaped
- [x] File paths validated against traversal
- [x] File permissions restrictive (0o600)
- [x] IPC handlers use whitelisting
- [x] Error handling prevents crashes
- [x] No remote code execution
- [x] No eval() or Function() usage
- [x] Proper TypeScript typing

## Future Enhancements

1. **Encryption**: Encrypt tasks.json file
2. **Backup**: Automatic encrypted backups
3. **Audit Log**: Track all task modifications
4. **Rate Limiting**: Prevent IPC flooding
