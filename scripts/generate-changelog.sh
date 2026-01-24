#!/bin/bash

# Changelog Generator for Task Floater
# Generates CHANGELOG.md from git commit history
# Follows Conventional Commits specification

set -e

OUTPUT_FILE="CHANGELOG.md"
TEMP_FILE="/tmp/changelog-temp.md"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Generating changelog from git history...${NC}"

# Get all tags sorted by version
TAGS=$(git tag -l --sort=-v:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+')

# Start changelog
cat > "$TEMP_FILE" << 'EOF'
# Changelog

All notable changes to Task Floater will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

EOF

# Function to format date
format_date() {
  git log -1 --format=%ai "$1" | cut -d' ' -f1
}

# Function to get commits between two refs
get_commits() {
  local from=$1
  local to=$2

  if [ -z "$to" ]; then
    # First release - get all commits
    git log --format="%s" "$from"
  else
    # Between two tags
    git log --format="%s" "${to}..${from}"
  fi
}

# Function to categorize and format commits
format_commits() {
  local commits="$1"
  local has_content=false

  # Features
  local features=$(echo "$commits" | grep -i "^feat" || true)
  if [ -n "$features" ]; then
    echo "### ✨ Features"
    echo ""
    echo "$features" | sed 's/^feat[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Bug Fixes
  local fixes=$(echo "$commits" | grep -i "^fix" || true)
  if [ -n "$fixes" ]; then
    echo "### 🐛 Bug Fixes"
    echo ""
    echo "$fixes" | sed 's/^fix[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Documentation
  local docs=$(echo "$commits" | grep -i "^docs" || true)
  if [ -n "$docs" ]; then
    echo "### 📚 Documentation"
    echo ""
    echo "$docs" | sed 's/^docs[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Design/Style
  local design=$(echo "$commits" | grep -i "^\(design\|style\)" || true)
  if [ -n "$design" ]; then
    echo "### 🎨 Design & Style"
    echo ""
    echo "$design" | sed 's/^\(design\|style\)[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Performance
  local perf=$(echo "$commits" | grep -i "^perf" || true)
  if [ -n "$perf" ]; then
    echo "### ⚡ Performance"
    echo ""
    echo "$perf" | sed 's/^perf[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Refactoring
  local refactor=$(echo "$commits" | grep -i "^refactor" || true)
  if [ -n "$refactor" ]; then
    echo "### ♻️ Code Refactoring"
    echo ""
    echo "$refactor" | sed 's/^refactor[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Tests
  local tests=$(echo "$commits" | grep -i "^test" || true)
  if [ -n "$tests" ]; then
    echo "### ✅ Tests"
    echo ""
    echo "$tests" | sed 's/^test[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  # Build & CI/CD
  local build=$(echo "$commits" | grep -i "^\(build\|ci\|chore\)" || true)
  if [ -n "$build" ]; then
    echo "### 🔧 Build & CI/CD"
    echo ""
    echo "$build" | sed 's/^\(build\|ci\|chore\)[(:]*/- /' | sed 's/: /: **/' | sed 's/$/**/'
    echo ""
    has_content=true
  fi

  if [ "$has_content" = false ]; then
    echo "- Initial release"
    echo ""
  fi
}

# Process each version
PREV_TAG=""
for TAG in $TAGS; do
  VERSION=$(echo "$TAG" | sed 's/^v//')
  DATE=$(format_date "$TAG")

  echo -e "${GREEN}📦 Processing $VERSION ($DATE)...${NC}"

  # Write version header
  echo "## [$VERSION] - $DATE" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"

  # Get commits for this version
  COMMITS=$(get_commits "$TAG" "$PREV_TAG")

  # Format and write commits
  format_commits "$COMMITS" >> "$TEMP_FILE"

  # Separator
  echo "---" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"

  PREV_TAG="$TAG"
done

# Add unreleased changes if any
UNRELEASED=$(git log --format="%s" "${TAGS%% *}..HEAD" || true)
if [ -n "$UNRELEASED" ]; then
  echo -e "${YELLOW}🚧 Found unreleased changes...${NC}"

  echo "## [Unreleased]" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"
  echo "_Changes since last release:_" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"

  format_commits "$UNRELEASED" >> "$TEMP_FILE"

  echo "---" >> "$TEMP_FILE"
  echo "" >> "$TEMP_FILE"
fi

# Add footer with links
echo "" >> "$TEMP_FILE"
echo "---" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "**Legend:**" >> "$TEMP_FILE"
echo "- ✨ Features - New functionality" >> "$TEMP_FILE"
echo "- 🐛 Bug Fixes - Resolved issues" >> "$TEMP_FILE"
echo "- 📚 Documentation - Docs improvements" >> "$TEMP_FILE"
echo "- 🎨 Design & Style - UI/UX changes" >> "$TEMP_FILE"
echo "- ⚡ Performance - Speed improvements" >> "$TEMP_FILE"
echo "- ♻️ Code Refactoring - Internal code improvements" >> "$TEMP_FILE"
echo "- ✅ Tests - Testing improvements" >> "$TEMP_FILE"
echo "- 🔧 Build & CI/CD - Build system changes" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Move temp file to final location
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo -e "${GREEN}✅ Changelog generated successfully!${NC}"
echo -e "${BLUE}📄 Output: $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Review and edit CHANGELOG.md before committing${NC}"
