# Making Task Floater an Official App

Guide to code signing, notarization, and distribution options.

## 🎯 Your Options

### Option 1: Apple Developer Code Signing ⭐ Recommended
- **Cost**: $99/year
- **Result**: No Gatekeeper warnings, looks professional
- **Distribution**: Direct download, GitHub Releases
- **Users**: Click to install, no warnings

### Option 2: Mac App Store
- **Cost**: $99/year (same Developer Account)
- **Result**: Listed in App Store
- **Distribution**: Apple handles it
- **Users**: Install from App Store
- **Limitation**: More restrictions, review process

### Option 3: Stay Unsigned (Current)
- **Cost**: Free
- **Result**: Gatekeeper warnings
- **Distribution**: GitHub Releases
- **Users**: Must right-click → Open first time
- **Good for**: Personal use, small audience

---

## 🍎 Option 1: Code Signing & Notarization

### Step 1: Join Apple Developer Program

1. Go to: https://developer.apple.com/programs/
2. Click "Enroll"
3. Pay $99/year
4. Wait 1-2 days for approval

### Step 2: Get Developer ID Certificate

**After enrollment approved:**

1. Go to: https://developer.apple.com/account/resources/certificates
2. Click the "+" button
3. Select: **"Developer ID Application"**
4. Follow instructions to create Certificate Signing Request (CSR)
5. Download the certificate
6. Double-click to install in Keychain Access

**Verify installation:**
```bash
security find-identity -v -p codesigning
```

You should see:
```
1) ABCD1234... "Developer ID Application: Your Name (TEAM_ID)"
```

### Step 3: Configure package.json

Add your identity to the mac section:

```json
"mac": {
  "identity": "Developer ID Application: Cyrus David Pastelero (YOUR_TEAM_ID)",
  // ... rest stays the same
}
```

Find YOUR_TEAM_ID:
```bash
security find-identity -v -p codesigning | grep "Developer ID"
```

### Step 4: Set Up Notarization

**Get app-specific password:**
1. Go to: https://appleid.apple.com/account/manage
2. Sign in
3. Generate app-specific password
4. Save it securely

**Set environment variables:**
```bash
export APPLEID="your-apple-id@email.com"
export APPLEIDPASS="xxxx-xxxx-xxxx-xxxx"  # App-specific password
export TEAM_ID="YOUR_TEAM_ID"
```

**Add to ~/.zshrc or ~/.bash_profile** to persist:
```bash
# Add to your shell config
echo 'export APPLEID="your@email.com"' >> ~/.zshrc
echo 'export APPLEIDPASS="xxxx-xxxx-xxxx-xxxx"' >> ~/.zshrc
echo 'export TEAM_ID="YOUR_TEAM_ID"' >> ~/.zshrc
```

### Step 5: Update package.json for Notarization

Add notarization config:

```json
"mac": {
  "identity": "Developer ID Application: Cyrus David Pastelero (YOUR_TEAM_ID)",
  "notarize": {
    "teamId": "YOUR_TEAM_ID"
  },
  // ... rest of config
}
```

### Step 6: Build Signed & Notarized

```bash
npm run dist:mac
```

electron-builder will:
1. ✅ Sign the app with your certificate
2. ✅ Upload to Apple for notarization
3. ✅ Wait for approval (~5-10 minutes)
4. ✅ Staple the notarization ticket
5. ✅ Create signed DMG

### Step 7: Verify Signing

```bash
codesign -dv --verbose=4 "release/mac-arm64/Task Floater.app"
```

Should show:
```
Authority=Developer ID Application: Your Name (TEAM_ID)
```

### Step 8: Release

Same as before:
```bash
gh release create v1.X.X release/*.dmg release/*.zip release/latest-mac.yml
```

**Now users can:**
- Double-click DMG → No warnings!
- Install normally
- macOS trusts your app

---

## 🏪 Option 2: Mac App Store

### Requirements
- Apple Developer Account ($99/year)
- Mac App Store distribution certificate
- App Store Connect setup

### Process

**1. Additional Configuration**

Add to package.json:
```json
"mac": {
  "type": "distribution",
  "target": ["mas"],
  "category": "public.app-category.productivity",
  "provisioningProfile": "embedded.provisionprofile",
  "entitlements": "build/entitlements.mas.plist",
  "entitlementsInherit": "build/entitlements.mas.inherit.plist"
}
```

**2. Create App Store Entitlements**

`build/entitlements.mas.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.app-sandbox</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>
```

**3. Build for App Store**
```bash
npm run build
electron-builder --mac mas
```

**4. Upload to App Store Connect**
```bash
xcrun altool --upload-app -f release/Task\ Floater.pkg -u your@email.com
```

**5. Submit for Review**
- Go to App Store Connect
- Fill out app information
- Submit for review
- Wait 1-7 days for approval

### App Store Considerations

**Pros:**
- ✅ Maximum trust (it's in the App Store!)
- ✅ Automatic distribution
- ✅ Built-in payment if you want to charge
- ✅ Discoverability

**Cons:**
- ❌ Review process (1-7 days per update)
- ❌ Sandboxing restrictions (more strict)
- ❌ Can't use some Electron features
- ❌ Apple takes 30% if you charge for app
- ❌ More complex setup

---

## 🆓 Option 3: Stay Unsigned (Current State)

### For Free Distribution

**What you currently have:**
- ✅ Works perfectly
- ✅ Free to distribute
- ✅ No yearly costs
- ✅ No review process
- ⚠️ Users see Gatekeeper warning first time

### Make It Easier for Users

**1. Update README with clear instructions:**

```markdown
## Installation

1. Download Task Floater-X.X.X-arm64.dmg
2. Double-click the DMG
3. **First time only:**
   - macOS will show a security warning
   - Click "Cancel"
   - Right-click the app → Select "Open"
   - Click "Open" in the dialog
4. Drag to Applications folder
5. Future launches work normally!
```

**2. Create a video tutorial** showing the right-click → Open process

**3. Add to release notes:**
```
⚠️ This app is unsigned. On first launch:
1. Right-click Task Floater.app
2. Click "Open"
3. Click "Open" again
```

### Alternative: Simple Bypass Command

Provide users with a one-liner:
```bash
xattr -cr /Applications/Task\ Floater.app && open /Applications/Task\ Floater.app
```

---

## 🎯 Recommended Path

### For You (Cyrus)

**If building for personal/team use (< 50 users):**
→ **Stay unsigned** (Option 3)
- Free
- Works fine with clear instructions
- No overhead

**If distributing publicly (want professional feel):**
→ **Get Developer Account + Code Signing** (Option 1)
- $99/year
- No user warnings
- Professional credibility
- Still distribute via GitHub (no App Store hassle)

**If building a commercial app:**
→ **Mac App Store** (Option 2)
- $99/year
- Maximum reach
- Built-in payments
- Review process overhead

---

## 📝 Quick Setup: Code Signing

Here's what to add to make your app signed once you have the certificate:

### 1. Update package.json

```json
"mac": {
  "identity": "Developer ID Application: Cyrus David Pastelero (TEAM_ID)",
  "notarize": {
    "teamId": "TEAM_ID"
  },
  // ... rest of existing config
}
```

### 2. Set Environment Variables

```bash
# Add to ~/.zshrc
export APPLEID="cyrus@reap.hk"
export APPLEIDPASS="xxxx-xxxx-xxxx-xxxx"
export TEAM_ID="YOUR_TEAM_ID"
```

### 3. Build Signed

```bash
npm run dist:mac
```

**First build will:**
- Upload to Apple (notarization)
- Wait ~5-10 minutes
- Staple notarization ticket

**Future builds:**
- Much faster (caching)
- Still notarized

### 4. Release

Same workflow:
```bash
gh release create v1.X.X release/*.dmg release/*.zip release/latest-mac.yml
```

**Users see:**
- ✅ No warnings
- ✅ Double-click to install
- ✅ macOS trusts the app

---

## 💰 Cost Comparison

| Method | Yearly Cost | User Experience | Distribution |
|--------|-------------|-----------------|--------------|
| Unsigned | **$0** | Right-click to open | GitHub, direct |
| Code Signed | **$99** | Click to install | GitHub, direct |
| App Store | **$99** | App Store install | App Store only |

---

## 🚀 My Recommendation

### For Now (Testing/Personal Use)
**Stay unsigned** - Just document the right-click → Open process clearly

### When Ready to Go Public
**Get Developer Account** - $99/year is worth it for:
- Professional appearance
- Better user experience
- No support questions about warnings
- Code signing = credibility

### Eventually (If Popular)
**Consider App Store** - But only if:
- You want maximum reach
- Don't mind review process
- Want built-in payment system

---

## 📄 Setting Up Code Signing (Step-by-Step)

I can help you set it up! Once you have the Developer Account:

1. **Get your certificate** (from Apple Developer portal)
2. **Find your Team ID**:
   ```bash
   security find-identity -v -p codesigning
   ```
3. **I'll update package.json** with your identity
4. **Set environment variables**
5. **Build signed version**
6. **Test it** - No warnings!
7. **Release to GitHub**

---

## ❓ FAQ

### "Do I need code signing?"
**No**, but it's professional. Unsigned apps work fine with clear instructions.

### "Can I sign later?"
**Yes!** You can always add signing to future releases.

### "What about Windows/Linux?"
Windows has similar code signing. Linux doesn't require it.

### "Is notarization required?"
**Recommended** but not strictly required. Without it, users see scarier warnings on macOS 10.15+.

### "Can I test signing without paying?"
**No** - need active Developer Account for certificates.

---

## ✅ Next Steps

**Decide which path:**

1. **Stay unsigned** (free, current state)
   - I can improve the installation instructions
   - Add video/GIF showing right-click process
   - Most users are OK with this for free apps

2. **Get Developer Account** ($99/year)
   - Let me know when you get it
   - I'll configure everything for signing
   - Professional, no-warning installations

3. **App Store** ($99/year + review process)
   - More complex setup
   - I can help if you want this path

**For now, your app is fully functional and distributable!** The unsigned status is fine for open-source projects - many successful apps start this way.

Want me to improve the installation instructions for unsigned distribution, or are you planning to get the Developer Account?
