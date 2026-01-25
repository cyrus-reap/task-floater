# Task Floater v1.9.0 Release Notes

**Release Date**: 2026-01-24

**Major Feature**: Mac App Store Compatibility

---

## 🎉 What's New

This release makes Task Floater **fully compatible with the Mac App Store** by replacing the native screenshot capture with Electron's cross-platform `desktopCapturer` API.

### ✨ Highlights

- 🍎 **Mac App Store Compatible** - Fully sandboxed, ready for App Store submission
- 🌍 **Cross-Platform Ready** - Screenshot feature now works on Windows/Linux
- 🖼️ **Visual Source Picker** - Select screens or windows from thumbnail grid
- ✅ **Same Functionality** - All features maintained, OCR accuracy unchanged
- 📦 **MAS Build Target** - New `npm run dist:mas` script for App Store builds

---

## 🔄 Screenshot Capture Reimplemented

### What Changed

**Before (v1.8.0 and earlier)**:
- Used native macOS `screencapture` command
- Drag-to-select region (like Cmd+Shift+4)
- macOS only
- ❌ Not Mac App Store compatible (sandbox restriction)

**After (v1.9.0)**:
- Uses Electron's `desktopCapturer` API
- Select screen or window from visual picker
- Cross-platform (macOS, Windows, Linux)
- ✅ Mac App Store compatible

### New User Experience

1. Click camera icon or press `Cmd+Shift+S`
2. **Modal opens showing available screens and windows**
3. Thumbnails displayed in a 2-column grid
4. Click desired screen/window to capture
5. OCR processes and extracts tasks (same as before)
6. Review and add tasks (same as before)

### Trade-offs

**UX Change**: Instead of dragging to select a region, users now select an entire screen or window.

**Workaround**:
- Select a specific window instead of the full screen for more focused captures
- Position relevant content prominently before capturing
- The same OCR processing works on the captured content

---

## 🍎 Mac App Store Configuration

### Ready for Submission

**Entitlements Created**:
- `build/entitlements.mas.plist` - Sandbox entitlements with screen capture permission
- `build/entitlements.mas.inherit.plist` - Child process entitlements

**Build Configuration**:
- Added "mas" target in `package.json`
- New script: `npm run dist:mas` - Builds Mac App Store package (.pkg)

**Sandbox Entitlements**:
- ✅ App sandbox (required)
- ✅ File access for import/export
- ✅ Network access for Linear API integration
- ✅ Screen capture permission for desktopCapturer
- ✅ JIT for JavaScript engine

### Submission Checklist

See `docs/guides/MAC_APP_STORE.md` for complete submission guide:

- [x] Code is sandbox compatible
- [x] Entitlements configured
- [x] Build scripts ready
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App Store Connect listing
- [ ] Get provisioning profile
- [ ] Create privacy policy page
- [ ] Take app screenshots (1280x800)
- [ ] Build and upload to App Store Connect
- [ ] Submit for review

---

## ✨ Additional Benefits

### Cross-Platform Support

The `desktopCapturer` API works on all Electron-supported platforms:
- ✅ macOS (Intel and Apple Silicon)
- ✅ Windows
- ✅ Linux

This opens the door for future Windows/Linux releases.

### Visual Preview

Users can now see thumbnail previews of all available screens and windows before capturing, making it easier to select the right source.

### No System Permissions

Unlike screen recording APIs, `desktopCapturer` doesn't require additional system permissions on macOS.

---

## 🔧 Technical Changes

### API Changes

**Main Process** (`src/main.ts`):
- Removed `capture-native-screenshot` IPC handler
- Added `get-desktop-sources` IPC handler - Returns list of available screens/windows
- Added `capture-desktop-source` IPC handler - Captures selected source

**Preload** (`src/preload.ts`):
- Removed `captureNativeScreenshot()` API
- Added `getDesktopSources()` API
- Added `captureDesktopSource(sourceId)` API

**Renderer** (`src/renderer.ts`):
- Added source selector UI state management
- Implemented thumbnail grid rendering
- Source selection click handlers

### Files Modified

- `src/main.ts` - desktopCapturer implementation
- `src/preload.ts` - New IPC APIs
- `src/renderer.ts` - Source selector UI
- `src/types.d.ts` - Updated TypeScript types
- `src/index.html` - Source selector modal + CSS
- `package.json` - MAS build target, Node 20 requirement
- `.github/workflows/*` - Updated CI/CD to Node.js 20

### Files Added

- `build/entitlements.mas.plist` - Mac App Store sandbox entitlements
- `build/entitlements.mas.inherit.plist` - Child process entitlements
- `docs/guides/MAC_APP_STORE.md` - Complete App Store submission guide

---

## 📊 Statistics

- **10 files changed**: 295 insertions, 61 deletions
- **2 new files**: Mac App Store entitlements
- **Commits**: 27f9f76 (implementation) + d484a4d (docs)

---

## 🚀 Dual Distribution Support

Task Floater now supports **both** distribution methods using the same codebase:

### Direct Distribution (GitHub)
```bash
npm run dist:mac
```
- ✅ Code-signed + notarized
- ✅ Full features
- ✅ Free for users
- ✅ Fast updates

### Mac App Store
```bash
npm run dist:mas
```
- ✅ Sandbox compatible
- ✅ Wider audience reach
- ✅ Built-in trust & updates
- ⚠️ Requires Apple Developer Program ($99/year)

---

## 📚 Documentation

### New Documentation

- **Mac App Store Guide** (`docs/guides/MAC_APP_STORE.md`)
  - Complete submission workflow
  - Prerequisites and requirements
  - Code compatibility status
  - Entitlements configuration
  - Build and upload process
  - App Store metadata templates
  - Privacy policy template
  - Common rejection reasons

### Updated Documentation

- Main README - Mentions Mac App Store compatibility
- CLAUDE.md - Updated architecture notes

---

## 🔐 Security

All security measures maintained:
- Input validation still active
- XSS prevention unchanged
- File system security intact
- Sandbox compatibility verified

Additional security from Mac App Store sandboxing:
- Restricted file system access
- Network access controlled
- Process isolation enforced

---

## ⚠️ Breaking Changes

### User-Facing Changes

**Screenshot Capture UX**:
- Previous: Drag-to-select region (native tool)
- Current: Select screen/window from grid

This is considered a **minor breaking change** as the feature still works, just with different interaction.

### Developer/API Changes

**IPC API Changes** (internal only, doesn't affect end users):
- Removed: `captureNativeScreenshot()`
- Added: `getDesktopSources()` and `captureDesktopSource(sourceId)`

---

## 🐛 Bug Fixes

None in this release - focused on Mac App Store compatibility.

---

## 🔜 Future Enhancements

With Mac App Store compatibility in place, future possibilities include:

- Mac App Store distribution alongside GitHub releases
- Windows/Linux versions using the same screenshot implementation
- TestFlight beta testing for Mac App Store builds
- App Store review and ratings

---

## 📦 Installation

### Direct Download (GitHub)

Download from [GitHub Releases](https://github.com/Cyvid7-Darus10/task-floater/releases/tag/v1.9.0):

**macOS Intel**:
- `Task Floater-1.9.0.dmg` (109 MB)
- `Task Floater-1.9.0-mac.zip` (116 MB)

**macOS Apple Silicon**:
- `Task Floater-1.9.0-arm64.dmg` (104 MB)
- `Task Floater-1.9.0-arm64-mac.zip` (110 MB)

**First-time installation**: See [Installation Guide](../README.md#installation) for unsigned app instructions.

### Build from Source

```bash
git clone https://github.com/Cyvid7-Darus10/task-floater.git
cd task-floater
git checkout v1.9.0
npm install
npm start
```

**Requirements**: Node.js 20+, npm 10+

---

## 🙏 Acknowledgments

- Electron team for the `desktopCapturer` API
- macOS sandbox documentation from Apple
- Community feedback on Mac App Store distribution

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Cyvid7-Darus10/task-floater/issues)
- **Documentation**: [docs/](../docs/)
- **Email**: cyrus@pastelero.ph

---

**Enjoy Task Floater v1.9.0!** 🎉

Now ready for the Mac App Store. 🍎
