# Upgrade Guide - Node.js v20+ and Test Infrastructure

This guide covers upgrading your development environment to Node.js v20+ and setting up the complete testing infrastructure for Task Floater.

## Prerequisites & Requirements

### Current Requirements (as of 2026-01-24)

- **Node.js**: >=20.0.0 (required by Electron 40, vitest, and other dev dependencies)
- **npm**: >=10.0.0
- **Operating System**: macOS (for native screenshot features)
- **Electron**: v40.0.0

### Why Upgrade?

The project has been updated with:
- **Electron v40** (from v28) - 12 major versions jump
  - Better performance and security
  - Latest Chromium engine
  - Improved macOS integration
- **Modern testing tools** - vitest requires Node.js 20+
- **Latest developer tools** - ESLint, TypeScript, and build tools benefit from newer Node

---

## Step 1: Check Current Node.js Version

```bash
node --version
# If < v20.0.0, you need to upgrade
```

---

## Step 2: Upgrade Node.js to v20+

### Option A: Using nvm (Recommended)

**Install nvm if you don't have it:**

```bash
# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Or via Homebrew (macOS)
brew install nvm

# Add to your shell profile (~/.zshrc or ~/.bashrc)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

**Install and use Node.js 20:**

```bash
# Install Node.js 20 LTS
nvm install 20

# Use Node.js 20
nvm use 20

# Set as default
nvm alias default 20

# Verify
node --version
# Should output: v20.x.x
```

### Option B: Using Homebrew (macOS)

```bash
# Update Homebrew
brew update

# Install Node.js 20
brew install node@20

# Link it
brew link --overwrite node@20

# Add to your PATH in ~/.zshrc or ~/.bashrc
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Reload shell
source ~/.zshrc  # or ~/.bashrc

# Verify
node --version
```

### Option C: Direct Download

Visit [nodejs.org](https://nodejs.org/) and download Node.js v20 LTS installer for your platform.

---

## Step 3: Fix npm Cache Permissions (If Needed)

If you see permission errors when running `npm install`:

```bash
# Fix npm cache ownership
sudo chown -R $(whoami) ~/.npm

# Or reset npm cache
npm cache clean --force
```

---

## Step 4: Reinstall Dependencies

After upgrading Node.js, reinstall all dependencies:

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Clean install
npm install

# Verify installation
npm list electron
# Should show: electron@40.0.0
```

---

## Step 5: Install Testing Dependencies

Now that Node.js v20+ is installed, you can install vitest and testing tools:

```bash
# Install vitest and related testing tools
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8

# Verify installation
npx vitest --version
```

---

## Step 6: Create Vitest Configuration

Create `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/types.d.ts',
        'src/index.html',
        'dist/**',
        'test/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

---

## Step 7: Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Expected Test Results

Currently passing tests:
- ✅ **validation.test.ts** - 100% coverage
  - Input validation & sanitization
  - XSS prevention
  - SQL injection prevention
  - DoS prevention

- ✅ **ocrService.test.ts** - ~95% coverage
  - Screenshot OCR processing
  - Task parsing from various formats

Pending tests:
- ⏳ **main.test.ts** - Test skeleton ready (awaits refactoring)
  - Main process IPC handlers
  - File operations
  - Security checks

---

## Step 8: Update Other Tools (Optional but Recommended)

```bash
# Update TypeScript
npm install --save-dev typescript@latest

# Update ESLint
npm install --save-dev eslint@latest

# Update Prettier
npm install --save-dev prettier@latest

# Update electron-builder
npm install --save-dev electron-builder@latest
```

---

## Step 9: Verify Everything Works

```bash
# Run full validation
npm run validate
# This runs: typecheck + lint + format:check

# Build the app
npm run build

# Start the app
npm start

# Run tests
npm run test:run
```

---

## Troubleshooting

### Issue: "vitest: command not found"

**Solution**: Make sure vitest is installed in devDependencies:

```bash
npm install --save-dev vitest
```

### Issue: "Unsupported engine" warnings

**Solution**: These are warnings, not errors. They indicate some dependencies prefer Node 20+. If you've upgraded to Node 20+, you can ignore them. To silence them:

```bash
npm config set engine-strict false
```

### Issue: npm EACCES permission errors

**Solution**:

```bash
# Fix npm ownership
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm instead (doesn't require sudo)
```

### Issue: Tests fail with "Cannot find module 'electron'"

**Solution**: Add Electron mocking in your test files:

```typescript
import { vi } from 'vitest';

vi.mock('electron', () => ({
  app: { getPath: vi.fn() },
  ipcMain: { handle: vi.fn() },
  // ... other mocked APIs
}));
```

### Issue: Build fails after Electron upgrade

**Check for breaking changes**: Review [Electron 40 release notes](https://www.electronjs.org/blog/electron-40-0) for API changes.

**Common fixes**:
- Update `electron-builder` to latest
- Check Content Security Policy settings
- Verify file paths are still correct

### Issue: App crashes on startup

**Debug steps**:

```bash
# Check for console errors
npm start

# Check Electron version
npm list electron

# Rebuild native modules if needed
npm rebuild
```

---

## Verification Checklist

After completing the upgrade, verify:

- [ ] Node.js version is 20+ (`node --version`)
- [ ] npm install completes without errors
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] App starts successfully (`npm start`)
- [ ] Tests run successfully (`npm run test:run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)

---

## What's New After Upgrade

### Electron 40 Features

- **Latest Chromium**: Better web platform support
- **Performance**: Faster startup and rendering
- **Security**: Latest security patches
- **macOS Integration**: Improved native features

### Testing Infrastructure

- **vitest**: Fast unit test runner
- **Coverage reporting**: Track test coverage
- **UI mode**: Interactive test debugging
- **Watch mode**: Auto-run tests on file changes

### Developer Experience

- **Faster builds**: Node.js 20 performance improvements
- **Better error messages**: Improved TypeScript diagnostics
- **Modern JavaScript**: ES2022+ features available

---

## Rollback Instructions (If Needed)

If you need to rollback the upgrades:

```bash
# Switch back to Node.js 18
nvm use 18

# Or install Node.js 18
nvm install 18
nvm use 18

# Revert package.json changes
git checkout package.json package-lock.json

# Reinstall old dependencies
rm -rf node_modules
npm install
```

**Note**: You'll lose the new features and improvements, but the app will work with the older setup.

---

## Next Steps

After upgrading, consider:

1. **Run full test suite**: `npm run test:coverage`
2. **Update documentation**: Reflect Node.js 20+ requirement in README
3. **Set up CI/CD**: Configure GitHub Actions with Node.js 20
4. **Review security**: Run `npm audit` and fix vulnerabilities
5. **Performance testing**: Benchmark app with Electron 40

---

## Support & Resources

- **Node.js Documentation**: https://nodejs.org/docs/
- **Electron 40 Release Notes**: https://www.electronjs.org/blog/electron-40-0
- **vitest Documentation**: https://vitest.dev/
- **npm Troubleshooting**: https://docs.npmjs.com/troubleshooting

---

## Summary

This upgrade brings:
- ✅ **Electron 40** - Latest features and security
- ✅ **Node.js 20+** - Modern JavaScript and better performance
- ✅ **vitest** - Fast, modern testing infrastructure
- ✅ **Improved DX** - Better tooling and developer experience

**Estimated time**: 15-30 minutes

**Difficulty**: Intermediate

**Breaking changes**: Minimal (mostly dev dependencies)
