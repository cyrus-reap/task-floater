# Production Setup Checklist

Quick reference checklist for making Task Floater production-ready.

## ✅ Phase 1: Code Signing (30 minutes)

- [ ] **Get Developer ID Certificate**
  ```bash
  security find-identity -v -p codesigning
  ```
  If empty: Go to https://developer.apple.com/account/resources/certificates

- [ ] **Run setup script**
  ```bash
  ./scripts/setup-signing.sh
  ```

- [ ] **Update package.json**
  - Add your `identity` to `build.mac` section
  - Add your `teamId` to `build.mac.notarize` section

- [ ] **Get app-specific password**
  - Visit: https://appleid.apple.com/account/manage
  - Generate app-specific password
  - Save in `.env.signing` (script does this)

- [ ] **Test local signing**
  ```bash
  source .env.signing
  npm run dist:mac
  ```

- [ ] **Verify signing works**
  ```bash
  codesign -dv --verbose=4 "release/mac-arm64/Task Floater.app"
  spctl -a -vv "release/mac-arm64/Task Floater.app"
  ```

---

## ✅ Phase 2: Testing (15 minutes)

- [ ] **Install test dependencies**
  ```bash
  npm install --save-dev vitest @vitest/ui happy-dom @vitest/coverage-v8
  ```

- [ ] **Run tests**
  ```bash
  npm run test:run
  ```

- [ ] **Check coverage**
  ```bash
  npm run test:coverage
  open coverage/index.html
  ```

- [ ] **Verify all tests pass**
  - Should see: "Test Files: 2 passed (2)"
  - Should see: "Tests: 48+ passed"

---

## ✅ Phase 3: CI/CD Setup (20 minutes)

- [ ] **Export certificate for CI**
  ```bash
  security export -k ~/Library/Keychains/login.keychain-db \
    -t identities -f pkcs12 \
    -o certificate.p12 \
    -P "CHOOSE_A_PASSWORD"

  base64 -i certificate.p12 | pbcopy
  rm certificate.p12
  ```

- [ ] **Add GitHub Secrets**
  Go to: `https://github.com/YOUR_USERNAME/task-floater/settings/secrets/actions`

  Add these secrets:
  - `APPLE_ID` = your-apple-id@email.com
  - `APPLE_ID_PASSWORD` = xxxx-xxxx-xxxx-xxxx (app-specific password)
  - `APPLE_TEAM_ID` = YOUR_TEAM_ID (10 characters)
  - `CSC_LINK` = (paste base64 from clipboard)
  - `CSC_KEY_PASSWORD` = (password you used above)
  - `KEYCHAIN_PASSWORD` = (any secure password)

- [ ] **Test CI pipeline**
  ```bash
  git add .
  git commit -m "feat: production setup complete"
  git push origin main
  ```

- [ ] **Check GitHub Actions**
  Visit: `https://github.com/YOUR_USERNAME/task-floater/actions`
  - Should see CI pipeline running
  - All jobs should pass ✅

---

## ✅ Phase 4: First Release (10 minutes)

- [ ] **Update CHANGELOG.md**
  - Add entry for v1.5.1 or next version
  - Document what's new

- [ ] **Run release script**
  ```bash
  ./scripts/release.sh
  ```

- [ ] **Follow prompts**
  - Choose version type (patch/minor/major)
  - Update CHANGELOG when prompted
  - Confirm tests pass
  - Push to GitHub

- [ ] **Monitor release build**
  Visit: `https://github.com/YOUR_USERNAME/task-floater/actions`
  - Wait for "Release" workflow to complete (~15-20 mins)
  - Includes notarization (slow but automatic)

- [ ] **Verify release**
  Visit: `https://github.com/YOUR_USERNAME/task-floater/releases/latest`
  - Should see DMG files
  - Should see release notes

- [ ] **Test auto-update**
  - Install old version
  - App should notify of update
  - Update should work automatically

---

## ✅ Optional: Monitoring & Analytics

- [ ] **Set up crash reporting**
  - Option A: Sentry (recommended)
  - Option B: Custom solution
  - See: `PRODUCTION-SETUP.md` Phase 4

- [ ] **Add usage analytics** (optional)
  - Local-only stats recommended (privacy-first)
  - Or use Telemetry.js

---

## 🎯 Quick Verification

After setup, verify everything works:

```bash
# 1. Tests pass
npm run test:run

# 2. Validation passes
npm run validate

# 3. Local build works
source .env.signing
npm run dist:mac

# 4. App opens without warnings
open "release/mac-arm64/Task Floater.app"

# 5. App is signed
codesign -dv "release/mac-arm64/Task Floater.app"

# 6. App is notarized
spctl -a -vv "release/mac-arm64/Task Floater.app"
```

---

## 📊 Success Criteria

✅ **Code Signing Working:**
- `codesign -dv` shows: `Authority=Developer ID Application`
- `spctl -a -vv` shows: `source=Notarized Developer ID, accepted`
- App opens without Gatekeeper warnings

✅ **Tests Working:**
- All tests pass: `npm run test:run`
- Coverage > 80%: `npm run test:coverage`

✅ **CI/CD Working:**
- GitHub Actions runs on push
- All CI jobs pass
- Release workflow creates GitHub release

✅ **Release Working:**
- `./scripts/release.sh` completes
- GitHub Release created automatically
- DMG files available for download

---

## 🆘 Troubleshooting

### Certificate Issues
```bash
# Find certificate
security find-identity -v -p codesigning

# If not found, reinstall from developer.apple.com
```

### Notarization Issues
```bash
# Check credentials
echo $APPLEID
echo $APPLEIDPASS
echo $TEAM_ID

# Must use app-specific password, not regular password
```

### Test Issues
```bash
# Reinstall dependencies
npm ci
npm install --save-dev vitest @vitest/ui happy-dom @vitest/coverage-v8

# Run with verbose output
npm run test:run -- --reporter=verbose
```

### CI Issues
```bash
# Verify all secrets are set in GitHub
# Settings → Secrets and variables → Actions

# Check workflow runs
# https://github.com/YOUR_USERNAME/task-floater/actions
```

---

## 📖 Full Documentation

For detailed instructions, see:
- `PRODUCTION-READY-SUMMARY.md` - Complete overview
- `PRODUCTION-SETUP.md` - Step-by-step guide
- `docs/guides/CODE-SIGNING.md` - Signing details
- `docs/guides/BUILD.md` - Build troubleshooting

---

## ✅ Completion

Once all checkboxes are ticked, you have a production-ready app! 🎉

**Estimated time:** 2-3 hours for first-time setup
**Future releases:** ~20 minutes each (mostly automated)
