# Mac App Store Distribution Guide

## Overview

This guide covers the complete process of distributing Task Floater through the Mac App Store. Mac App Store distribution is **significantly different** from direct distribution (DMG/ZIP).

## Current Status

**What you have now**: Code-signed + notarized for **direct distribution**
- Users download DMG from GitHub
- Apps run with full system access (non-sandboxed)
- Can use commands like `screencapture`

**What Mac App Store requires**: Sandboxed apps with restricted APIs
- Users download from App Store
- Apps run in strict sandbox
- Many system APIs are restricted or unavailable

## Prerequisites

### 1. Apple Developer Program Membership
- **Cost**: $99/year
- **Enrollment**: https://developer.apple.com/programs/enroll/
- **What you get**:
  - Mac App Store distribution certificates
  - Provisioning profiles
  - App Store Connect access
  - TestFlight for beta testing

### 2. App Store Connect Setup
- Create new app listing: https://appstoreconnect.apple.com
- Fill required metadata:
  - App name, description, screenshots
  - Category: Productivity
  - Privacy policy URL (required for all apps)
  - Support URL
  - Marketing URL (optional)

### 3. Development Certificates & Profiles

You'll need **different** certificates than direct distribution:

**Certificates needed**:
- ✅ **Already have**: Developer ID Application (for direct distribution)
- ❌ **Need**: Mac App Distribution certificate
- ❌ **Need**: Mac Installer Distribution certificate (for .pkg)

**Create in Xcode**:
```
Xcode → Settings → Accounts → [Your Apple ID] → Manage Certificates
→ Click "+" → Select "Mac App Distribution"
```

**Provisioning Profile**:
- Go to: https://developer.apple.com/account/resources/profiles/list
- Create new profile: Mac App Store
- Select your App ID (com.reap.task-floater)
- Download and save to `build/embedded.provisionprofile`

## Code Compatibility Status

### ✅ Screenshot Capture - NOW COMPATIBLE!

**Implementation**: The app now uses Electron's `desktopCapturer` API instead of the `screencapture` command.

**Current implementation** (as of commit 27f9f76):
```typescript
// src/main.ts - Mac App Store compatible
import { desktopCapturer } from 'electron';

// Get available screens and windows
const sources = await desktopCapturer.getSources({
  types: ['screen', 'window'],
  thumbnailSize: { width: 300, height: 200 }
});

// User selects from visual picker (renderer.ts)
// Then capture selected source at full resolution
const image = source.thumbnail.toPNG();
```

**UX Changes**:
- Before: Drag-to-select region (native macOS tool)
- After: Select screen or window from thumbnail grid
- Same OCR processing and task extraction

**Benefits**:
- ✅ Mac App Store compatible (no external commands)
- ✅ Cross-platform (works on Windows/Linux too)
- ✅ Visual preview before capture
- ✅ No system permissions required

**Entitlements**: Already configured in `build/entitlements.mas.plist`

### Other API Restrictions

These features work in sandbox (you're safe):
- ✅ File system (within app container + user-selected files)
- ✅ Window management (`BrowserWindow`)
- ✅ IPC communication
- ✅ Timer functionality
- ✅ Local storage

These require entitlements or won't work:
- ❌ Global shortcuts (`globalShortcut`) - Need entitlement
- ❌ External process execution (`execFile`, `spawn`) - Forbidden
- ❌ Access to `~/Library` outside container - Forbidden

## Entitlements Configuration

Create **separate** entitlements for Mac App Store:

### File: `build/entitlements.mas.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Enable App Sandbox (REQUIRED for Mac App Store) -->
  <key>com.apple.security.app-sandbox</key>
  <true/>

  <!-- Allow read/write to user-selected files -->
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>

  <!-- Allow network access (for Linear API integration) -->
  <key>com.apple.security.network.client</key>
  <true/>

  <!-- If you keep screenshot feature, you need this -->
  <key>com.apple.security.temporary-exception.mach-lookup.global-name</key>
  <array>
    <string>com.apple.screencaptureui</string>
  </array>

  <!-- JIT for JavaScript engine (Usually allowed) -->
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
</dict>
</plist>
```

### File: `build/entitlements.mas.inherit.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Inherit sandboxing for child processes -->
  <key>com.apple.security.app-sandbox</key>
  <true/>

  <!-- Inherit JIT permission -->
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
</dict>
</plist>
```

## Package.json Configuration

Add Mac App Store build target:

```json
{
  "build": {
    "appId": "com.reap.task-floater",
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "mas",
          "arch": ["x64", "arm64"]
        }
      ],
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "mas": {
      "type": "distribution",
      "category": "public.app-category.productivity",
      "entitlements": "build/entitlements.mas.plist",
      "entitlementsInherit": "build/entitlements.mas.inherit.plist",
      "provisioningProfile": "build/embedded.provisionprofile",
      "hardenedRuntime": false,
      "gatekeeperAssess": false
    }
  }
}
```

Add build script:

```json
{
  "scripts": {
    "dist:mas": "npm run build && electron-builder --mac mas"
  }
}
```

## Build Process

### 1. Build Mac App Store Package

```bash
# Build for Mac App Store
npm run dist:mas
```

This creates:
- `release/Task Floater-1.7.0.pkg` - Mac App Store package
- `release/mas/Task Floater.app` - Sandboxed app bundle

### 2. Test Before Upload

**CRITICAL**: Test the sandboxed build thoroughly:

```bash
# Install locally to test
sudo installer -pkg "release/Task Floater-1.7.0.pkg" -target /

# Or drag app to /Applications and run
```

**What to test**:
- ✅ App launches without crashes
- ✅ Task creation works
- ✅ Timer functionality
- ✅ File import/export (should trigger file picker)
- ✅ Settings persistence
- ❌ Screenshot capture (will fail if using screencapture command)

### 3. Upload to App Store Connect

**Option A: Using Transporter (Recommended)**
1. Download Transporter from Mac App Store
2. Drag .pkg file to Transporter
3. Click "Deliver"

**Option B: Using Command Line**
```bash
# Install Application Loader tools
xcrun altool --upload-app \
  --type osx \
  --file "release/Task Floater-1.7.0.pkg" \
  --username "your-apple-id@email.com" \
  --password "@keychain:AC_PASSWORD"
```

**Create app-specific password**:
1. Go to: https://appleid.apple.com/account/manage
2. Sign in
3. Security → App-Specific Passwords → Generate
4. Save to keychain:
   ```bash
   xcrun altool --store-password-in-keychain-item "AC_PASSWORD" \
     -u "your-apple-id@email.com" \
     -p "xxxx-xxxx-xxxx-xxxx"
   ```

### 4. Submit for Review

In App Store Connect:

1. **Go to App Store Connect** → Your App → Version
2. **Build**: Select uploaded build (takes ~10 min to process)
3. **App Information**:
   - Name: Task Floater
   - Subtitle: Floating Task Manager
   - Category: Productivity
   - Privacy Policy URL: (you need to create one)

4. **Pricing**: Free or Paid ($0.99+)

5. **App Review Information**:
   - Contact info
   - Demo account (if needed)
   - Notes to reviewer: "Floating task manager with timer functionality"

6. **Version Information**:
   - Screenshots (required):
     - 1280x800 or 2560x1600
     - Show main features
     - Need 3-5 screenshots
   - Description (4000 chars max)
   - Keywords (100 chars, comma-separated)
   - Release notes

7. **Submit for Review**

## Review Process

**Timeline**: 1-7 days typically

**Common rejection reasons and status for Task Floater**:

1. ~~**Screenshot capture using external command**~~ ✅ **FIXED**
   - ✅ Now uses `desktopCapturer` API (as of commit 27f9f76)
   - ✅ Fully sandbox compatible

2. **Missing privacy policy** ⚠️ **TODO**
   - Solution: Host privacy policy on your website
   - Example: https://yoursite.com/task-floater-privacy
   - Template provided below in this guide

3. **Requesting unnecessary entitlements** ✅ **OK**
   - Current entitlements are all necessary:
     - App sandbox (required)
     - File access (for import/export)
     - Network (for future Linear integration)
     - Screen capture (for screenshot feature)
     - JIT (for JavaScript engine)

4. **App doesn't match screenshots** ⚠️ **TODO**
   - Need to create screenshots for App Store submission
   - Template requirements listed below

5. **Insufficient description** ✅ **OK**
   - Template provided below is comprehensive

## App Store Metadata

### Description Template

```markdown
**Task Floater - Your Always-Visible Productivity Companion**

Task Floater is a beautiful, modern task manager that stays on top of all your windows. Perfect for focused work sessions, Pomodoro technique, or simply keeping your priorities visible.

FEATURES
• Always-on-top floating window
• Pomodoro-style task timers
• Elegant glassmorphism design
• Focus mode for distraction-free work
• Drag-and-drop task reordering
• Dark mode support
• Keyboard shortcuts for power users
• Import/export tasks

PERFECT FOR
→ Software developers tracking sprint tasks
→ Students managing assignments
→ Freelancers juggling client projects
→ Anyone practicing the Pomodoro Technique

PRIVACY FIRST
All your tasks stay on your Mac. No cloud sync, no account required, no tracking.

BUILT FOR macOS
Native macOS design with Big Sur glassmorphism aesthetics. Optimized for both Intel and Apple Silicon Macs.
```

### Keywords

```
task manager, todo, productivity, floating, always on top, pomodoro, timer, focus, gtd, task list
```

### Screenshots Needed

**Required sizes**: 1280x800 or 2560x1600

1. **Main window** - Full task list with timer
2. **Focus mode** - Distraction-free view
3. **Timer running** - Active pomodoro timer
4. **Command palette** - Keyboard shortcuts
5. **Settings** - Configuration options

**Tips**:
- Use macOS screenshot tool: `Cmd+Shift+4`
- Show actual app usage, not just empty states
- Add subtle text overlays highlighting features
- Use consistent background across screenshots

## Privacy Policy

**Required for App Store**. Host on your website or GitHub Pages.

### Minimal Privacy Policy Template

```markdown
# Privacy Policy for Task Floater

Last updated: January 24, 2026

## Data Collection
Task Floater does NOT collect, store, or transmit any personal data.

## Local Storage Only
All tasks and settings are stored locally on your Mac at:
~/Library/Application Support/task-floater/

## No Analytics
We do not use analytics, tracking, or telemetry of any kind.

## No Third-Party Services
Task Floater does not communicate with external servers or services.

## Contact
For questions about this privacy policy:
Email: cyrus@pastelero.ph
GitHub: https://github.com/Cyvid7-Darus10/task-floater

---
This privacy policy is effective as of January 24, 2026.
```

Host at: `https://cyvid7-darus10.github.io/task-floater/privacy-policy`

## Post-Approval

Once approved:

1. **Release**: Click "Release this version" in App Store Connect
2. **Monitor**: Check for crash reports in App Store Connect
3. **Updates**: Follow same process for new versions
4. **Review Response**: Respond to user reviews

## Cost Comparison

| Distribution Method | Setup Cost | Ongoing Cost | Effort |
|---------------------|-----------|--------------|--------|
| **Direct (Current)** | $0 (with free signing) | $0 | Low |
| **Direct (Paid Signing)** | $99/year | $99/year | Low |
| **Mac App Store** | $99/year | $99/year | High |

## Recommendation

**Consider hybrid approach**:

1. **Keep direct distribution** (GitHub releases)
   - Free for users
   - Full features (native screenshot)
   - No App Store review delays
   - You control updates

2. **Add Mac App Store** (optional)
   - Wider audience reach
   - Built-in update system
   - User trust (App Store badge)
   - May need to remove/modify screenshot feature

**Suggested strategy**:
- Primary distribution: GitHub (what you have now)
- Secondary: Mac App Store (for discoverability)
- Maintain two build configurations
- Direct version has all features
- App Store version has sandbox-compatible features only

## Next Steps

If you want to proceed with Mac App Store:

1. ✅ Enroll in Apple Developer Program ($99)
2. ✅ Create App Store Connect listing
3. ⚠️ Decide on screenshot feature (remove or rework)
4. ✅ Create privacy policy page
5. ✅ Create Mac App Store entitlements
6. ✅ Get provisioning profile
7. ✅ Build and test sandboxed version
8. ✅ Create screenshots and metadata
9. ✅ Upload and submit for review
10. ⏳ Wait for approval (1-7 days)

## Questions?

**Is it worth it?**
- If you want maximum reach → Yes
- If you value speed and features → Direct distribution is fine
- Many successful Mac apps distribute both ways

**Can I do both?**
- Yes! Most developers do
- Keep GitHub releases for power users
- Use App Store for mainstream audience

**What if I get rejected?**
- Common for first submission
- Apple provides specific rejection reasons
- Fix issues and resubmit
- Usually approved on 2nd or 3rd try

---

**Current status**: You have excellent direct distribution setup with code signing and notarization. Mac App Store is optional but requires significant work to adapt codebase for sandbox restrictions.
