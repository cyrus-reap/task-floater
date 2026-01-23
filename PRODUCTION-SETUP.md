# Task Floater - Production Setup Guide

This guide will take you from unsigned development build to production-ready, code-signed application.

## 🎯 Quick Start

**Prerequisites:**
- ✅ Apple Developer account ($99/year)
- ✅ macOS with Xcode Command Line Tools
- ✅ Node.js 16+ installed

**Time estimate:** 2-3 hours for first-time setup

---

## Phase 1: Code Signing Setup (60 mins)

### Step 1: Get Developer ID Certificate

```bash
# Check if you already have it
security find-identity -v -p codesigning
```

**If you don't see "Developer ID Application":**

1. Go to https://developer.apple.com/account/resources/certificates
2. Click "+" to create new certificate
3. Select **"Developer ID Application"**
4. Follow instructions to create CSR (Certificate Signing Request):
   - Open Keychain Access
   - Menu: Keychain Access → Certificate Assistant → Request Certificate from CA
   - Enter your email, name
   - Choose "Save to disk"
5. Upload CSR to Apple Developer portal
6. Download certificate file
7. Double-click to install in Keychain

**Verify:**
```bash
security find-identity -v -p codesigning | grep "Developer ID"
```

You should see:
```
1) ABCD1234EFGH5678 "Developer ID Application: Your Name (TEAM123456)"
```

### Step 2: Configure Code Signing Credentials

**Run the setup script:**
```bash
cd task-floater
./scripts/setup-signing.sh
```

This script will:
- ✅ Detect your Developer ID certificate
- ✅ Extract your Team ID
- ✅ Prompt for Apple ID and app-specific password
- ✅ Create `.env.signing` file with credentials

**Manual alternative:**

1. Get app-specific password:
   - Go to https://appleid.apple.com/account/manage
   - Sign in with your Apple ID
   - Section: "Sign-In and Security" → "App-Specific Passwords"
   - Click "+" to generate
   - Label it "Task Floater Notarization"
   - Copy the password (format: `xxxx-xxxx-xxxx-xxxx`)

2. Create `.env.signing`:
   ```bash
   cat > .env.signing << 'EOF'
   export APPLEID="your-apple-id@email.com"
   export APPLEIDPASS="xxxx-xxxx-xxxx-xxxx"
   export TEAM_ID="YOUR_TEAM_ID"
   EOF
   chmod 600 .env.signing
   ```

### Step 3: Update package.json

**Find your Team ID:**
```bash
security find-identity -v -p codesigning | grep "Developer ID" | grep -o '([A-Z0-9]\{10\})' | tr -d '()'
```

**Update the `mac` section in package.json:**

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: YOUR NAME (TEAM_ID)",
      "notarize": {
        "teamId": "TEAM_ID"
      },
      "category": "public.app-category.productivity",
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    }
  }
}
```

**Replace:**
- `YOUR NAME` with your actual name from certificate
- `TEAM_ID` with your 10-character Team ID (appears twice)

### Step 4: Build Signed & Notarized App

```bash
# Load environment variables
source .env.signing

# Build production app
npm run dist:mac
```

**What happens during build:**
1. ✅ TypeScript compilation
2. ✅ Code signing with Developer ID
3. ✅ Upload to Apple for notarization (~5-10 min wait)
4. ✅ Staple notarization ticket to app
5. ✅ Create DMG and ZIP archives

**Watch for:**
```
  • signing         file=release/mac-arm64/Task Floater.app identityName=Developer ID Application...
  • uploading       file=release/mac-arm64/Task Floater.app
  • notarization    id=...
  • stapling        file=release/mac-arm64/Task Floater.app
```

### Step 5: Verify Signing

```bash
# Check code signature
codesign -dv --verbose=4 "release/mac-arm64/Task Floater.app"

# Check notarization
spctl -a -vv "release/mac-arm64/Task Floater.app"
```

**Expected output:**
```
Authority=Developer ID Application: Your Name (TEAM_ID)
...
source=Notarized Developer ID
accepted
```

✅ **Success!** Your app is now code signed and notarized.

---

## Phase 2: Automated Testing (90 mins)

### Step 1: Install Testing Framework

```bash
npm install --save-dev \
  vitest \
  @vitest/ui \
  happy-dom \
  electron-test-runner
```

### Step 2: Create Test Configuration

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/']
    }
  }
});
```

### Step 3: Write Tests

Create `test/validation.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { Validators, ValidationError } from '../src/validation';

describe('Input Validation', () => {
  describe('taskTitle', () => {
    it('should accept valid titles', () => {
      expect(Validators.taskTitle('Buy groceries')).toBe('Buy groceries');
    });

    it('should reject empty titles', () => {
      expect(() => Validators.taskTitle('')).toThrow(ValidationError);
    });

    it('should strip HTML tags', () => {
      expect(Validators.taskTitle('<script>alert("xss")</script>Task'))
        .toBe('Task');
    });

    it('should reject titles over 500 chars', () => {
      const longTitle = 'a'.repeat(501);
      expect(() => Validators.taskTitle(longTitle)).toThrow(ValidationError);
    });
  });

  describe('duration', () => {
    it('should accept valid durations', () => {
      expect(Validators.duration(30)).toBe(30);
    });

    it('should reject durations outside range', () => {
      expect(() => Validators.duration(0)).toThrow(ValidationError);
      expect(() => Validators.duration(1441)).toThrow(ValidationError);
    });

    it('should reject non-integer durations', () => {
      expect(() => Validators.duration(30.5)).toThrow(ValidationError);
    });
  });
});
```

### Step 4: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 5: Run Tests

```bash
# Run tests in watch mode
npm test

# Run once and exit
npm run test:run

# Generate coverage report
npm run test:coverage
```

---

## Phase 3: CI/CD Pipeline (45 mins)

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Lint
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Run tests
        run: npm run test:run

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    name: Build App
    runs-on: macos-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build TypeScript
        run: npm run build

      - name: Package app (unsigned)
        run: npm run dist:mac
        env:
          # Don't sign in CI unless it's a release
          CSC_IDENTITY_AUTO_DISCOVERY: false
```

### Step 2: Create Release Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Build & Release
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build & Sign
        run: npm run dist:mac
        env:
          APPLEID: ${{ secrets.APPLE_ID }}
          APPLEIDPASS: ${{ secrets.APPLE_ID_PASSWORD }}
          TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release/*.dmg
            release/*.zip
            release/latest-mac.yml
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Step 3: Configure GitHub Secrets

Go to your repo: Settings → Secrets and variables → Actions

Add these secrets:
- `APPLE_ID`: Your Apple ID email
- `APPLE_ID_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Your 10-character Team ID
- `CSC_LINK`: Base64-encoded .p12 certificate (see below)
- `CSC_KEY_PASSWORD`: Certificate password

**Export certificate for CI:**
```bash
# Export certificate from Keychain (requires password)
security find-identity -v -p codesigning | grep "Developer ID"
# Note the certificate name

# Export to .p12 file
security export -k ~/Library/Keychains/login.keychain-db \
  -t identities -f pkcs12 \
  -o certificate.p12 \
  -P "PASSWORD_YOU_CHOOSE"

# Convert to base64 for GitHub secret
base64 -i certificate.p12 | pbcopy

# Paste into GitHub Secrets as CSC_LINK
# Use PASSWORD_YOU_CHOOSE as CSC_KEY_PASSWORD

# Delete .p12 file (security)
rm certificate.p12
```

---

## Phase 4: Crash Reporting (30 mins)

### Option A: Sentry (Recommended)

```bash
npm install @sentry/electron
```

Update `src/main.ts`:
```typescript
import * as Sentry from '@sentry/electron/main';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV || 'production',
  release: app.getVersion(),
});
```

Update `src/renderer.ts`:
```typescript
import * as Sentry from '@sentry/electron/renderer';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### Option B: Custom Error Tracking

Add to `src/main.ts`:
```typescript
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Send to your error tracking service
  dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});
```

---

## Phase 5: Analytics (Optional, 20 mins)

### Privacy-First Analytics

For a privacy-focused app, consider:

**Option 1: Local-only usage stats**
```typescript
// Track locally, no external services
interface UsageStats {
  tasksCreated: number;
  timersUsed: number;
  appLaunches: number;
  lastUsed: string;
}

// Store in userData directory
```

**Option 2: Telemetry.js (privacy-focused)**
```bash
npm install @telemetry/sdk
```

---

## 🚀 Release Checklist

Before each release:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run full test suite: `npm run test:run`
- [ ] Run validation: `npm run validate`
- [ ] Build and test locally: `npm run dist:mac`
- [ ] Test signed app on clean macOS
- [ ] Create git tag: `git tag v1.X.X`
- [ ] Push tag: `git push origin v1.X.X`
- [ ] GitHub Actions builds and releases automatically
- [ ] Verify release on GitHub
- [ ] Test auto-update on existing installation
- [ ] Update README if needed

---

## 🔍 Troubleshooting

### "No Developer ID certificate found"
- Run: `security find-identity -v -p codesigning`
- If empty, re-download from developer.apple.com

### "Notarization failed"
- Check APPLEID and APPLEIDPASS are correct
- Ensure app-specific password (not regular password)
- Check Apple Developer account is active

### "Invalid signature"
- Clean build: `npm run clean && npm run build`
- Verify entitlements in `build/entitlements.mac.plist`

### CI/CD not signing
- Verify all GitHub secrets are set
- Check CSC_LINK is valid base64
- Ensure CSC_KEY_PASSWORD matches export password

---

## 📊 Success Metrics

After production setup, you should have:

✅ **Code Signing**
- App opens without warnings on macOS
- Users can double-click DMG to install
- No Gatekeeper bypass needed

✅ **Testing**
- Test coverage > 80%
- All critical paths tested
- Tests run on every PR

✅ **CI/CD**
- Automated builds on push
- Automated releases on tag
- Build artifacts uploaded to GitHub

✅ **Monitoring**
- Crash reports tracked
- Error rates < 1%
- Update success rate > 95%

---

## 🆘 Need Help?

1. Check [CODE-SIGNING.md](docs/guides/CODE-SIGNING.md) for detailed signing docs
2. Check [BUILD.md](docs/guides/BUILD.md) for build troubleshooting
3. Open issue on GitHub with logs

---

**Estimated Total Time:**
- Code signing setup: 60 minutes
- Testing framework: 90 minutes
- CI/CD pipeline: 45 minutes
- Crash reporting: 30 minutes
- **Total: 3-4 hours**

**After initial setup, each release takes:**
- Create tag: 1 minute
- CI/CD runs: 15-20 minutes
- Total: ~20 minutes automated
