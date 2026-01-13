# Quick Release Guide

## Build for Production (1 Command)

```bash
npm run release
```

This runs:
1. ✅ Type checking
2. ✅ Linting
3. ✅ Format checking
4. ✅ Icon generation
5. ✅ Production build

**Output**: `release/Task Floater-1.0.0-arm64.dmg`

## What You Get

### For Sharing (macOS)
```
release/
├── Task Floater-1.0.0-arm64.dmg      ← Share this (Apple Silicon)
├── Task Floater-1.0.0-x64.dmg        ← Share this (Intel Mac)
├── Task Floater-1.0.0-arm64-mac.zip  ← Portable version
└── Task Floater-1.0.0-x64-mac.zip    ← Portable version
```

**File size**: ~80-120 MB each

## Quick Test Before Release

```bash
# 1. Test pack (faster, no DMG)
npm run pack

# 2. Run the unpacked app
open release/mac/Task\ Floater.app

# 3. Test all features
# 4. If good, build DMG
npm run dist:mac
```

## Sharing with Users

### Method 1: Direct Download (Easiest)

1. Upload DMG to:
   - Google Drive / Dropbox
   - GitHub Releases
   - Your website

2. Share link with instructions:
   ```
   Task Floater v1.0.0

   Download: [Link to DMG]

   Installation:
   1. Download Task Floater-1.0.0-arm64.dmg
   2. Double-click the DMG
   3. Drag "Task Floater" to Applications
   4. Launch from Applications

   Note: First time, right-click → Open (Gatekeeper)
   ```

### Method 2: GitHub Releases (Professional)

```bash
# 1. Create git tag
git tag v1.0.0
git push origin v1.0.0

# 2. Go to GitHub → Releases → Create Release
# 3. Upload release/*.dmg and release/*.zip
# 4. Add release notes
```

### Method 3: npm Package (Advanced)

```bash
# Publish to npm (if public)
npm publish
```

## First-Time User Instructions

### macOS (Unsigned App)

When users first run the app, they'll see:
> "Task Floater" can't be opened because it is from an unidentified developer.

**Solution**:
1. Right-click the app
2. Click "Open"
3. Click "Open" again in the dialog

Or use Terminal:
```bash
xattr -cr /Applications/Task\ Floater.app
```

### Avoiding Gatekeeper Warnings (Optional)

**Code sign the app** (requires Apple Developer Account - $99/year):

```bash
# Set credentials
export APPLEID="your@email.com"
export APPLEIDPASS="app-specific-password"

# Add to package.json:
"mac": {
  "identity": "Developer ID Application: Your Name",
  // ...
}

# Build
npm run dist:mac
```

## Version Updates

```bash
# Bump version
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.0 → 1.1.0 (new features)
npm version major   # 1.0.0 → 2.0.0 (breaking changes)

# Build new version
npm run release

# Tag and push
git push && git push --tags
```

## Build Artifacts

### Keep
- `release/*.dmg` - For distribution
- `release/*.zip` - Portable versions

### Can Delete
- `release/mac/` - Unpacked app (rebuilt each time)
- `release/*.blockmap` - Update metadata (not needed for manual distribution)
- `release/builder-effective-config.yaml` - Build debug info

## Troubleshooting

### "Cannot find icon"
```bash
npm run icons
```

### "Build failed"
```bash
npm run clean
npm install
npm run build
npm run dist:mac
```

### "App won't open on other Macs"
Check:
- macOS version compatibility (built for macOS 10.13+)
- Architecture (arm64 for Apple Silicon, x64 for Intel)
- Gatekeeper (need to right-click → Open first time)

### Build is slow
First build downloads Electron binaries (~100MB). Subsequent builds are faster.

## Quick Commands Reference

```bash
# Development
npm start          # Run app in dev mode
npm run dev        # Auto-reload during development

# Build & Test
npm run build      # Compile TypeScript only
npm run pack       # Create unpacked app (fast)
npm start          # Test compiled version

# Icons
npm run icons      # Generate all icon formats

# Production
npm run dist:mac   # Build DMG installers
npm run release    # Validate + icons + build

# Quality
npm run validate   # Type + lint + format checks
npm run lint:fix   # Auto-fix linting issues
npm run format     # Auto-format code
```

## Checklist Before Sharing

- [ ] Version updated in package.json
- [ ] Code validated (`npm run validate`)
- [ ] Icons generated (`npm run icons`)
- [ ] Test build works (`npm run pack`)
- [ ] Production build created (`npm run dist:mac`)
- [ ] DMG tested on your machine
- [ ] Installation tested (drag to Applications)
- [ ] App launches and works correctly
- [ ] README.md updated with version/features
- [ ] CHANGELOG.md created (optional but recommended)

## File Sizes

**Development:**
- Source code: ~50 KB
- node_modules: ~150 MB

**Production Build:**
- DMG: ~80-120 MB (includes Electron runtime)
- Installed app: ~150-200 MB

**Why so large?**
- Electron bundles Chromium browser
- Necessary for cross-platform desktop apps
- Users only download once

## Support

If users have issues:
1. Check their macOS version (10.13+)
2. Verify architecture match (arm64 vs x64)
3. Try: Right-click → Open
4. Try: Remove quarantine (`xattr -cr`)
5. Check Console.app for error logs
