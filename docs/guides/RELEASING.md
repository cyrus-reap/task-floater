# Release & Update Guide

Complete guide for building, releasing, and updating Task Floater.

## 🚀 Quick Release (3 Commands)

```bash
npm version patch              # Bump version
npm run dist:mac               # Build DMG
gh release create v1.0.X release/*.{dmg,zip,yml}  # Release
```

## 📋 Pre-Release Checklist

- [ ] All features tested (`npm start`)
- [ ] Code validated (`npm run validate`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped (`npm version patch/minor/major`)

## 🔄 Update Workflow

### Step 1: Make Changes & Test
```bash
npm start          # Test locally
npm run validate   # Type check + lint + format
```

### Step 2: Version Bump

```bash
# Bug fixes (1.0.0 → 1.0.1)
npm version patch

# New features (1.0.0 → 1.1.0)
npm version minor

# Breaking changes (1.0.0 → 2.0.0)
npm version major
```

This automatically:
- Updates `package.json`
- Creates git commit
- Creates git tag

### Step 3: Build Production DMG

```bash
npm run dist:mac
```

Output in `release/`:
- `Task Floater-VERSION-arm64.dmg` - Apple Silicon installer
- `Task Floater-VERSION-arm64-mac.zip` - Portable version
- `latest-mac.yml` - **Critical for auto-update!**

### Step 4: Create GitHub Release

**Quick method:**
```bash
gh release create v1.0.X \
  --title "Task Floater v1.0.X" \
  --notes "What's new in this version" \
  release/*.dmg \
  release/*.zip \
  release/latest-mac.yml
```

**Or GitHub Web:**
1. Go to: https://github.com/cyrus-reap/task-floater/releases/new
2. Tag: `v1.0.X`
3. Upload files from `release/` folder
4. Publish

### Step 5: Push Code
```bash
git push && git push --tags
```

## 🔄 How Auto-Update Works

### For Users (Automatic)
1. User opens app → Auto-checks for updates (5 seconds later)
2. Update found → Dialog: "New version available!"
3. User clicks "Download" → Downloads in background
4. Download complete → "Update ready, restart?"
5. Quit/Restart → Update installs automatically ✨

### Technical
- Checks: GitHub Releases API
- Reads: `latest-mac.yml` for version/checksums
- Downloads: DMG or ZIP file
- Installs: On app quit

## 📝 Release Checklist

Before creating release:

- [ ] Code changes tested locally
- [ ] `npm run validate` passes
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Built production DMG
- [ ] GitHub release created with:
  - [ ] DMG uploaded
  - [ ] ZIP uploaded
  - [ ] `latest-mac.yml` uploaded ← **Must include!**
  - [ ] Release notes written
- [ ] Code pushed
- [ ] Release published (not draft)

## 🎯 Example Release Notes

```markdown
## What's New in v1.1.0

### New Features
- 🎯 Focus Mode - Press Cmd+Shift+F for distraction-free work
- ⌨️ Enhanced keyboard navigation

### Improvements
- Faster timer rendering
- Better animations
- Improved icon visibility

### Bug Fixes
- Fixed timer persistence on quit
- Fixed search clearing

### Security
- Updated dependencies
- Enhanced validation
```

## 🐛 Troubleshooting

### "Update not detected by users"
**Fix:**
- Verify `latest-mac.yml` uploaded
- Verify release is published (not draft)
- Check repo is public

### "Build fails"
**Fix:**
```bash
npm run clean
npm install
npm run build
npm run dist:mac
```

### "Gatekeeper blocks app"
**For development testing:**
```bash
xattr -cr "release/mac-arm64/Task Floater.app"
```

**For production:** Get Apple Developer certificate ($99/year)

## 📊 Build Commands Reference

```bash
# Development
npm start          # Run app
npm run dev        # Auto-reload

# Build & Test
npm run build      # TypeScript only
npm run pack       # Test build (no installer)

# Icons
npm run icons      # Generate all formats

# Production
npm run dist:mac   # Build DMG
npm run release    # Validate + icons + build

# Quality
npm run validate   # All checks
npm run lint:fix   # Auto-fix
npm run format     # Auto-format
```

## 🎁 One-Line Full Release

```bash
npm version minor && npm run dist:mac && gh release create v$(node -p "require('./package.json').version") release/*.{dmg,zip,yml} && git push --follow-tags
```

## 📦 What Users Download

From: https://github.com/cyrus-reap/task-floater/releases

- Apple Silicon: `Task Floater-VERSION-arm64.dmg` (96 MB)
- Intel Mac: `Task Floater-VERSION-mac.zip` (91 MB)

## ✨ You're All Set!

Releasing updates is now a simple 3-command process, and users get them automatically! 🚀
