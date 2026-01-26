/**
 * Notarize macOS app after signing
 * This script is called by electron-builder via the afterSign hook
 */

const { notarize } = require('@mistweaverco/electron-notarize-async');
const path = require('path');
const fs = require('fs');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization: not macOS');
    return;
  }

  // Try to load credentials from .env.signing file
  const envPath = path.join(__dirname, '..', '.env.signing');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');

    envLines.forEach(line => {
      const match = line.match(/^export\s+([A-Z_]+)="([^"]+)"$/);
      if (match) {
        const [, key, value] = match;
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }

  // Check for required environment variables
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log('Skipping notarization: missing credentials');
    console.log('  APPLE_ID:', appleId ? '✓' : '✗ missing');
    console.log('  APPLE_APP_SPECIFIC_PASSWORD:', appleIdPassword ? '✓' : '✗ missing');
    console.log('  APPLE_TEAM_ID:', teamId ? '✓' : '✗ missing');
    console.log('  Tip: Create .env.signing file with credentials or set environment variables');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`\n🍎 Notarizing ${appName}...`);
  console.log(`   App path: ${appPath}`);
  console.log(`   Apple ID: ${appleId}`);
  console.log(`   Team ID: ${teamId}`);
  console.log('   This may take 5-15 minutes...\n');

  try {
    await notarize({
      appPath,
      appleId,
      appleIdPassword,
      teamId,
      wait: true, // Wait for notarization and staple the ticket
    });

    console.log(`\n✅ Notarization complete for ${appName}!`);
    console.log('   Notarization ticket has been stapled to the app.\n');
  } catch (error) {
    console.error('\n❌ Notarization failed:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n')[1]);
    }
    console.error('   You can still distribute the app, but users will see Gatekeeper warnings.\n');
    // Don't throw - allow build to continue even if notarization fails
    // throw error;
  }
};
