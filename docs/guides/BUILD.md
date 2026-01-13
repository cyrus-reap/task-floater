# Building Task Floater for Production

This guide covers building Task Floater for distribution on macOS, Windows, and Linux.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** (v8 or higher)
3. **Dependencies installed**: `npm install`

## Quick Start

### Development Build
```bash
npm run build    # Compile TypeScript
npm start        # Run the app
```

### Production Build (macOS)
```bash
npm run dist:mac
```

Output: `release/Task Floater-1.0.0-arm64.dmg` and `.zip`

## Build Commands

### Local Testing (No Installer)
```bash
npm run pack
```
- Creates unpacked app in `release/mac/Task Floater.app`
- Fastest way to test production build
- **Use this to verify before creating installers**

### macOS Production Build
```bash
npm run dist:mac
```
Creates:
- `Task Floater-1.0.0-arm64.dmg` (Apple Silicon installer)
- `Task Floater-1.0.0-x64.dmg` (Intel installer)
- `Task Floater-1.0.0-arm64-mac.zip` (Portable)
- `Task Floater-1.0.0-x64-mac.zip` (Portable)

### All Platforms
```bash
npm run dist:all
```
Builds for macOS, Windows, and Linux (requires platform-specific tools)

## Before Building

### 1. Run Pre-build Checklist
```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Format check
npm run format:check

# Or run all at once
npm run validate
```

### 2. Create App Icons

**You need to create icons before building!**

Place icons in the `build/` directory:
- `build/icon.icns` (macOS)
- `build/icon.ico` (Windows)
- `build/icon.png` (Linux, 512x512+)

See `build/README.md` for icon creation instructions.

### 3. Test the Build
```bash
# First do a pack (faster)
npm run pack

# Then run the unpacked app
open release/mac/Task\ Floater.app
```

## Distribution

### For macOS Users

#### DMG Installer (Recommended)
```bash
npm run dist:mac
```

**Share**: `release/Task Floater-1.0.0-arm64.dmg`

Users:
1. Download the .dmg file
2. Double-click to mount
3. Drag "Task Floater" to Applications folder
4. Eject the DMG
5. Open from Applications

#### ZIP Archive (Portable)
```bash
npm run dist:mac
```

**Share**: `release/Task Floater-1.0.0-arm64-mac.zip`

Users:
1. Download and extract
2. Move `Task Floater.app` to Applications
3. Right-click → Open (first time only, due to Gatekeeper)

### For Windows Users
```bash
npm run dist    # On Windows or with wine
```

Creates:
- `Task Floater Setup 1.0.0.exe` (Installer)
- `Task Floater-1.0.0-win.zip` (Portable)

### For Linux Users
```bash
npm run dist    # On Linux
```

Creates:
- `Task Floater-1.0.0.AppImage` (Universal)
- `task-floater_1.0.0_amd64.deb` (Debian/Ubuntu)

## Code Signing (Optional but Recommended)

### macOS Code Signing

**Why?** Prevents "App from unidentified developer" warnings

**Requirements:**
1. Apple Developer Account ($99/year)
2. Developer ID Application certificate

**Setup:**
```bash
# Set environment variables
export APPLEID="your-apple-id@email.com"
export APPLEIDPASS="app-specific-password"

# Build with signing
npm run dist:mac
```

Add to `package.json` build config:
```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)",
  "electronUpdaterCompatibility": ">=2.16",
}
```

### macOS Notarization

For Gatekeeper approval, add:
```json
"afterSign": "scripts/notarize.js",
"notarize": {
  "teamId": "YOUR_TEAM_ID"
}
```

**Note**: Not required for personal use, only for public distribution.

## Build Configuration

### Customization

Edit `package.json` → `build` section:

```json
{
  "appId": "com.reap.task-floater",         // Unique app identifier
  "productName": "Task Floater",            // Display name
  "copyright": "Copyright © 2026 ...",      // Copyright text
  "category": "public.app-category.productivity"  // macOS category
}
```

### Files Included in Build

From `package.json`:
```json
"files": [
  "dist/**/*",        // Compiled JavaScript
  "src/index.html",   // UI markup
  "package.json"      // App metadata
]
```

**Not included:**
- Source TypeScript files (`src/*.ts`)
- Development dependencies
- Test files
- Documentation (unless added)

## Troubleshooting

### "Icon not found"
**Solution**: Create icons in `build/` directory (see `build/README.md`)

### Build fails with "Cannot find module"
**Solution**:
```bash
npm run clean
npm install
npm run build
npm run dist:mac
```

### "App is damaged" on macOS
**Cause**: Gatekeeper blocking unsigned app

**Solution**:
```bash
# Remove quarantine attribute
xattr -cr /Applications/Task\ Floater.app

# Or right-click → Open
```

### Build is too large
**Check**:
```bash
ls -lh release/*.dmg
```

**Optimize**:
- Ensure `node_modules` not included (should be automatic)
- Use `npm prune --production` before building
- Check `files` array in package.json

## Testing the Build

### Pre-Release Checklist

- [ ] Run `npm run validate` (typecheck + lint + format)
- [ ] Test development build (`npm start`)
- [ ] Create test pack (`npm run pack`)
- [ ] Test unpacked app from `release/mac/`
- [ ] Verify all features work
- [ ] Test timer functionality
- [ ] Test data persistence
- [ ] Check window positioning
- [ ] Create final DMG (`npm run dist:mac`)
- [ ] Test DMG installation
- [ ] Verify app launches from Applications
- [ ] Test on clean machine if possible

## Release Workflow

### 1. Version Bump
```bash
# Update version in package.json
npm version patch   # 1.0.0 → 1.0.1
# or
npm version minor   # 1.0.0 → 1.1.0
# or
npm version major   # 1.0.0 → 2.0.0
```

### 2. Build
```bash
npm run validate    # Pre-build checks
npm run dist:mac    # Create installer
```

### 3. Test
```bash
# Install from DMG
open release/Task\ Floater-1.0.0-arm64.dmg

# Test all features
# - Create tasks
# - Start timers
# - Check persistence
```

### 4. Distribute
```bash
# Upload to GitHub Releases, website, etc.
```

## Build Outputs

### macOS (after `npm run dist:mac`)
```
release/
├── Task Floater-1.0.0-arm64.dmg        # Apple Silicon installer
├── Task Floater-1.0.0-x64.dmg          # Intel installer
├── Task Floater-1.0.0-arm64-mac.zip    # Apple Silicon portable
├── Task Floater-1.0.0-x64-mac.zip      # Intel portable
├── mac/
│   └── Task Floater.app                # Unpacked app (from npm run pack)
└── builder-effective-config.yaml       # Build configuration used
```

### File Sizes (Approximate)
- DMG: ~80-120 MB (includes Electron runtime)
- ZIP: ~80-120 MB
- Unpacked: ~150-200 MB

## Continuous Integration

### GitHub Actions Example
```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run validate
      - run: npm run dist:mac
      - uses: actions/upload-artifact@v3
        with:
          name: macos-build
          path: release/*.dmg
```

## Environment Variables

### For Code Signing
```bash
export APPLEID="your-apple-id@email.com"
export APPLEIDPASS="app-specific-password"
export TEAM_ID="YOUR_TEAM_ID"
```

### For CI/CD
Add to GitHub Secrets:
- `APPLEID`
- `APPLEIDPASS`
- `CSC_LINK` (base64 encoded certificate)
- `CSC_KEY_PASS` (certificate password)

## Platform-Specific Notes

### macOS
- **Apple Silicon**: Builds for arm64 architecture
- **Intel**: Builds for x64 architecture
- **Universal**: Can build universal binary (both architectures)
- **Gatekeeper**: Unsigned apps require right-click → Open
- **Sandbox**: App runs in macOS sandbox

### Windows
- Requires wine on macOS/Linux for cross-compilation
- NSIS installer created by default
- May trigger SmartScreen without code signing

### Linux
- AppImage is universal (works on most distros)
- .deb for Debian/Ubuntu
- Doesn't require wine

## Additional Resources

- [electron-builder docs](https://www.electron.build/)
- [macOS Code Signing](https://www.electron.build/code-signing)
- [macOS Notarization](https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/)
- [Windows Code Signing](https://www.electron.build/code-signing#windows)
