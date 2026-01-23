#!/bin/bash
# Task Floater - Release Automation Script
# This script helps create a new release with proper versioning

set -e

echo "🚀 Task Floater - Release Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}❌ Error: Must be on main branch to create a release${NC}"
  echo "Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
  echo "Please commit or stash your changes before releasing"
  git status --short
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from origin..."
git pull origin main

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"
echo ""

# Ask for new version
echo "Select release type:"
echo "  1) Patch (bug fixes)     - e.g., 1.5.0 → 1.5.1"
echo "  2) Minor (new features)  - e.g., 1.5.0 → 1.6.0"
echo "  3) Major (breaking)      - e.g., 1.5.0 → 2.0.0"
echo "  4) Custom version"
echo ""
read -p "Enter choice (1-4): " CHOICE

case $CHOICE in
  1)
    VERSION_TYPE="patch"
    ;;
  2)
    VERSION_TYPE="minor"
    ;;
  3)
    VERSION_TYPE="major"
    ;;
  4)
    read -p "Enter custom version (e.g., 1.5.0): " CUSTOM_VERSION
    VERSION_TYPE="custom"
    ;;
  *)
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
    ;;
esac

# Bump version
if [ "$VERSION_TYPE" = "custom" ]; then
  NEW_VERSION=$CUSTOM_VERSION
  npm version $NEW_VERSION --no-git-tag-version
else
  npm version $VERSION_TYPE --no-git-tag-version
  NEW_VERSION=$(node -p "require('./package.json').version")
fi

echo ""
echo -e "${GREEN}Version bumped: $CURRENT_VERSION → $NEW_VERSION${NC}"
echo ""

# Update CHANGELOG
echo "📝 Update CHANGELOG.md with release notes"
echo ""
read -p "Press Enter to open CHANGELOG.md in your editor..."

# Detect editor (use EDITOR env var, fallback to nano/vim)
EDITOR="${EDITOR:-nano}"
$EDITOR CHANGELOG.md

echo ""
read -p "Did you update CHANGELOG.md? (y/n): " UPDATED_CHANGELOG
if [ "$UPDATED_CHANGELOG" != "y" ]; then
  echo -e "${RED}❌ Aborted: Please update CHANGELOG.md${NC}"
  # Revert version bump
  git checkout package.json package-lock.json
  exit 1
fi

# Run validation
echo ""
echo "🔍 Running validation..."
npm run validate

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Validation failed${NC}"
  echo "Fix errors and try again"
  git checkout package.json package-lock.json CHANGELOG.md
  exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:run

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Tests failed${NC}"
  echo "Fix tests and try again"
  git checkout package.json package-lock.json CHANGELOG.md
  exit 1
fi

# Build and test locally
echo ""
read -p "Build and test locally before releasing? (recommended) (y/n): " BUILD_LOCAL
if [ "$BUILD_LOCAL" = "y" ]; then
  echo "🔨 Building application..."
  npm run dist:mac

  echo ""
  echo -e "${YELLOW}⚠️  Please test the built app in release/mac-arm64/${NC}"
  read -p "Did the build succeed and app works correctly? (y/n): " BUILD_OK

  if [ "$BUILD_OK" != "y" ]; then
    echo -e "${RED}❌ Aborted${NC}"
    git checkout package.json package-lock.json CHANGELOG.md
    exit 1
  fi
fi

# Commit changes
echo ""
echo "📦 Committing release changes..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: release v$NEW_VERSION"

# Create git tag
echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Summary
echo ""
echo -e "${GREEN}✅ Release prepared successfully!${NC}"
echo ""
echo "Summary:"
echo "  Version: v$NEW_VERSION"
echo "  Branch: main"
echo "  Tag: v$NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Review changes: git show HEAD"
echo "  2. Push to GitHub: git push origin main --tags"
echo "  3. GitHub Actions will automatically:"
echo "     - Run tests"
echo "     - Build & sign the app"
echo "     - Notarize with Apple"
echo "     - Create GitHub Release"
echo "     - Upload DMG files"
echo ""
echo "To push:"
echo -e "${GREEN}  git push origin main --tags${NC}"
echo ""

# Ask if user wants to push now
read -p "Push to GitHub now? (y/n): " PUSH_NOW
if [ "$PUSH_NOW" = "y" ]; then
  echo ""
  echo "🚀 Pushing to GitHub..."
  git push origin main --tags

  echo ""
  echo -e "${GREEN}✅ Released v$NEW_VERSION successfully!${NC}"
  echo ""
  echo "GitHub Actions is now building and releasing:"
  echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
  echo ""
  echo "Release will be available at:"
  echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/tag/v$NEW_VERSION"
else
  echo ""
  echo -e "${YELLOW}⚠️  Remember to push manually:${NC}"
  echo "  git push origin main --tags"
fi
