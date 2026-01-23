#!/bin/bash
# Task Floater - Code Signing Setup Script
# Run this script to configure code signing environment variables

echo "🔐 Task Floater - Code Signing Setup"
echo "======================================"
echo ""

# Check for existing certificate
echo "📋 Checking for Developer ID certificate..."
CERT_INFO=$(security find-identity -v -p codesigning | grep "Developer ID Application")

if [ -z "$CERT_INFO" ]; then
  echo "❌ No Developer ID Application certificate found in Keychain"
  echo ""
  echo "To get your certificate:"
  echo "1. Go to: https://developer.apple.com/account/resources/certificates"
  echo "2. Create 'Developer ID Application' certificate"
  echo "3. Download and double-click to install"
  echo "4. Run this script again"
  exit 1
fi

echo "✅ Found certificate:"
echo "$CERT_INFO"
echo ""

# Extract Team ID from certificate
TEAM_ID=$(echo "$CERT_INFO" | grep -o '([A-Z0-9]\{10\})' | tr -d '()')
if [ -z "$TEAM_ID" ]; then
  echo "⚠️  Could not auto-detect Team ID"
  echo -n "Enter your Team ID (10 characters): "
  read TEAM_ID
fi

echo "Team ID: $TEAM_ID"
echo ""

# Get Apple ID
echo -n "Enter your Apple ID email: "
read APPLE_ID

echo ""
echo "🔑 App-Specific Password Setup"
echo "1. Go to: https://appleid.apple.com/account/manage"
echo "2. Generate an app-specific password"
echo "3. Copy the password (format: xxxx-xxxx-xxxx-xxxx)"
echo ""
echo -n "Enter app-specific password: "
read -s APP_PASSWORD
echo ""

# Create .env.signing file
ENV_FILE=".env.signing"
cat > "$ENV_FILE" << EOF
# Task Floater Code Signing Environment Variables
# Source this file before building: source .env.signing

export APPLEID="$APPLE_ID"
export APPLEIDPASS="$APP_PASSWORD"
export TEAM_ID="$TEAM_ID"

# For CI/CD (GitHub Actions)
export CSC_NAME="Developer ID Application: $CERT_INFO"
EOF

chmod 600 "$ENV_FILE"

echo ""
echo "✅ Configuration saved to .env.signing"
echo ""
echo "📝 Next steps:"
echo "1. Source the environment file:"
echo "   source .env.signing"
echo ""
echo "2. Update package.json with your Team ID"
echo "   (See docs/guides/CODE-SIGNING.md for details)"
echo ""
echo "3. Build signed & notarized app:"
echo "   npm run dist:mac"
echo ""
echo "⚠️  Add .env.signing to .gitignore (keep credentials private)"
