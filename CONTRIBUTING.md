# Contributing to Task Floater

First off, thank you for considering contributing to Task Floater! It's people like you that make Task Floater such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** - Include code samples or screenshots
- **Describe the behavior you observed** and what you expected
- **Include system information** - macOS version, Node.js version, etc.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include screenshots or mockups** if applicable

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the coding standards** outlined below
3. **Write clear commit messages** using conventional commits format
4. **Test your changes** thoroughly
5. **Update documentation** as needed
6. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/task-floater.git
cd task-floater

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

```typescript
// Good
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// Avoid
type Task = {
  id: any;
  t: string;
  c: boolean;
};
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Keep lines under 100 characters when possible
- Use async/await instead of promise chains

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add timer pause functionality
fix: resolve window positioning bug on multi-monitor setups
docs: update README with installation instructions
refactor: simplify task storage logic
test: add unit tests for timer feature
chore: update dependencies
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### File Structure

- Keep components small and focused
- Use descriptive file names
- Group related functionality together

```
src/
├── main.ts           # Main process
├── preload.ts        # Security bridge
├── renderer.ts       # UI logic
├── types.d.ts        # TypeScript declarations
└── index.html        # UI markup
```

## Testing

Before submitting a PR:

1. **Build the project** - `npm run build`
2. **Test manually** - Run the app and verify your changes
3. **Check for TypeScript errors** - `npx tsc --noEmit`
4. **Verify all features work** - Test core functionality

## Adding New Features

When adding a new feature:

1. **Check if it fits** the project's scope and vision
2. **Discuss in an issue** before starting work on large features
3. **Keep it simple** - Follow the minimalist design philosophy
4. **Update docs** - Update README and add JSDoc comments
5. **Consider edge cases** - Test thoroughly

### IPC Communication Pattern

When adding new IPC handlers:

```typescript
// 1. Add handler in main.ts
ipcMain.handle('my-action', async (_event, arg) => {
  // Implementation
  return result;
});

// 2. Expose in preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  myAction: (arg: Type): Promise<Result> =>
    ipcRenderer.invoke('my-action', arg),
});

// 3. Update types.d.ts
interface ElectronAPI {
  myAction: (arg: Type) => Promise<Result>;
}

// 4. Use in renderer.ts
const result = await window.electronAPI.myAction(arg);
```

## Security

- **Never expose Node.js APIs** to the renderer process
- **Use contextBridge** for all IPC communication
- **Validate all user input** before processing
- **Keep dependencies updated** to patch security vulnerabilities

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Update CHANGELOG.md with notable changes
- Include code examples in docs

## Questions?

Feel free to ask questions by:
- Opening an issue with the `question` label
- Reaching out to the maintainer

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
