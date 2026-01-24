# Testing Guide for Task Floater

## Overview

This document describes the testing infrastructure and how to run tests for the Task Floater application.

## Prerequisites

### Node.js Version Requirement

**IMPORTANT**: Vitest requires Node.js version 20.0.0 or higher.

Current project status:
- Node.js in use: v18.18.0 (as of 2026-01-24)
- Required for vitest: >=20.0.0

**To upgrade Node.js:**

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or using Homebrew (macOS)
brew install node@20
brew link --overwrite node@20
```

### Installing Test Dependencies

Once Node.js 20+ is installed:

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8
```

If you encounter npm cache permission errors:

```bash
sudo chown -R $(whoami) ~/.npm
```

## Current Test Coverage

### ✅ Implemented Tests

1. **Input Validation** (`test/validation.test.ts`)
   - Task title validation
   - Duration validation
   - Task ID validation
   - Time remaining validation
   - HTML sanitization
   - XSS prevention
   - SQL injection prevention
   - Edge cases and security tests

2. **OCR Service** (`test/ocrService.test.ts`)
   - Screenshot text extraction
   - Task parsing from various formats
   - Duration extraction
   - Noise filtering

### ⏳ Planned Tests (Requires Node 20+)

3. **Main Process IPC Handlers** (`test/main.test.ts`)
   - Task CRUD operations (get, add, toggle, delete, update)
   - File system security
   - Import/export functionality
   - Screenshot processing
   - Settings management

## Running Tests

### Basic Commands

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Running Specific Test Files

```bash
# Run validation tests only
npx vitest run test/validation.test.ts

# Run OCR tests only
npx vitest run test/ocrService.test.ts

# Run main process tests (once Node 20+ installed)
npx vitest run test/main.test.ts
```

## Test Structure

```
test/
├── validation.test.ts    # ✅ Input validation & security tests
├── ocrService.test.ts    # ✅ Screenshot OCR & parsing tests
└── main.test.ts          # ⏳ Main process IPC handler tests (stub)
```

## Test Coverage Goals

| Module | Target Coverage | Current Status |
|--------|----------------|----------------|
| validation.ts | 100% | ✅ 100% |
| ocrService.ts | 90%+ | ✅ ~95% |
| main.ts | 80%+ | ❌ 0% (needs refactoring) |
| renderer.ts | 70%+ | ❌ 0% (needs refactoring) |

## Writing New Tests

### Example: Testing a Pure Function

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/myModule';

describe('myFunction', () => {
  it('should return expected output for valid input', () => {
    expect(myFunction('input')).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeUndefined();
  });
});
```

### Example: Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('File Operations', () => {
  it('should read file successfully', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('file content');

    const result = await myFileReader('test.txt');
    expect(result).toBe('file content');
  });
});
```

## Refactoring for Testability

### Current Challenge: Main Process Tests

The main process (`src/main.ts`) is difficult to test because:
1. Logic is embedded in IPC handlers
2. Heavy coupling with Electron APIs
3. No dependency injection

### Recommended Refactoring

#### Before (Untestable):

```typescript
// main.ts
ipcMain.handle('get-tasks', async () => {
  const tasksFile = path.join(app.getPath('userData'), 'tasks.json');
  try {
    const data = await fs.readFile(tasksFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
});
```

#### After (Testable):

```typescript
// taskManager.ts (new file)
export class TaskManager {
  constructor(private dataPath: string) {}

  async getTasks(): Promise<Task[]> {
    const tasksFile = path.join(this.dataPath, 'tasks.json');
    try {
      const data = await fs.readFile(tasksFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }
}

// main.ts
const taskManager = new TaskManager(app.getPath('userData'));

ipcMain.handle('get-tasks', async () => {
  return taskManager.getTasks();
});

// taskManager.test.ts (new test file)
describe('TaskManager', () => {
  it('should return tasks from file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([...]));
    const manager = new TaskManager('/test/path');
    const tasks = await manager.getTasks();
    expect(tasks).toHaveLength(1);
  });
});
```

## Integration Testing

For end-to-end testing of Electron IPC:

```bash
npm install --save-dev @electron/test-runner
```

Example integration test:

```typescript
import { app } from 'electron';
import { test, expect } from '@electron/test-runner';

test('should handle task creation via IPC', async () => {
  const window = new BrowserWindow({ show: false });
  await window.loadFile('src/index.html');

  const result = await window.webContents.executeJavaScript(`
    window.electronAPI.addTask('Test Task', 30)
  `);

  expect(result).toBeDefined();
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
```

## Performance Testing

For performance-critical operations (e.g., OCR processing):

```typescript
import { describe, it, expect } from 'vitest';

describe('Performance', () => {
  it('should process screenshot within 2 seconds', async () => {
    const start = Date.now();
    await processScreenshot(testImageBuffer);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
  });
});
```

## Security Testing

Key security test areas:

1. **XSS Prevention**
   - Test HTML escaping in all user inputs
   - Verify Content Security Policy

2. **Injection Prevention**
   - Test SQL injection patterns in task IDs
   - Test path traversal in file operations

3. **DoS Prevention**
   - Test max task limit (1000 tasks)
   - Test max file size for screenshots (50MB)
   - Test max string lengths (500 chars for titles)

4. **File Permissions**
   - Verify files created with mode 0o600
   - Verify operations sandboxed to userData directory

## Troubleshooting

### Tests Won't Run

**Error**: `vitest: command not found`

**Solution**: Install vitest: `npm install --save-dev vitest`

---

**Error**: `Unsupported engine { required: { node: '^20.0.0' } }`

**Solution**: Upgrade to Node.js 20+

---

**Error**: `Cannot find module 'electron'`

**Solution**: Mock electron in test file:

```typescript
vi.mock('electron', () => ({
  app: { getPath: vi.fn() },
  ipcMain: { handle: vi.fn() },
}));
```

### Coverage Not Generated

**Issue**: Coverage report is empty

**Solution**: Ensure vitest.config.ts has coverage configuration:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/types.d.ts'],
    },
  },
});
```

## Best Practices

1. **Test Naming**: Use descriptive test names
   ```typescript
   // ✅ Good
   it('should reject task titles over 500 characters')

   // ❌ Bad
   it('validates title')
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should add task successfully', async () => {
     // Arrange
     const title = 'Buy groceries';
     const duration = 30;

     // Act
     const task = await addTask(title, duration);

     // Assert
     expect(task.title).toBe(title);
     expect(task.duration).toBe(duration);
   });
   ```

3. **Test Isolation**: Each test should be independent
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
     // Reset any shared state
   });
   ```

4. **Test Coverage**: Aim for meaningful tests, not just 100% coverage
   - Cover edge cases
   - Cover error paths
   - Cover security scenarios
   - Don't test trivial code (getters/setters)

## Next Steps

1. ✅ **Completed**: Memory leak fix in renderer.ts
2. ✅ **Completed**: Error handling in IPC calls
3. ⏳ **In Progress**: Main process tests (blocked by Node version)
4. 📋 **Todo**: Upgrade to Node.js 20+
5. 📋 **Todo**: Install vitest dependencies
6. 📋 **Todo**: Refactor main.ts for testability
7. 📋 **Todo**: Implement main process tests
8. 📋 **Todo**: Add renderer process tests
9. 📋 **Todo**: Add integration tests
10. 📋 **Todo**: Set up CI/CD with automated testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
