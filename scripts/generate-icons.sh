#!/bin/bash

# Icon generation script for Task Floater
# Requires: ImageMagick or GraphicsMagick

set -e

ICON_SVG="build/icon.svg"
BUILD_DIR="build"

# Check if SVG exists
if [ ! -f "$ICON_SVG" ]; then
  echo "❌ Error: $ICON_SVG not found"
  exit 1
fi

echo "🎨 Generating app icons from SVG..."

# Check for required tools
if command -v magick &> /dev/null; then
  CONVERT="magick"
  echo "✅ Using ImageMagick"
elif command -v convert &> /dev/null; then
  CONVERT="convert"
  echo "✅ Using ImageMagick (legacy)"
elif command -v gm &> /dev/null; then
  CONVERT="gm convert"
  echo "✅ Using GraphicsMagick"
else
  echo "❌ Error: ImageMagick or GraphicsMagick required"
  echo ""
  echo "Install with Homebrew:"
  echo "  brew install imagemagick"
  echo ""
  echo "Or use online converter:"
  echo "  1. Go to https://cloudconvert.com/svg-to-png"
  echo "  2. Upload build/icon.svg"
  echo "  3. Set size to 1024x1024"
  echo "  4. Download as build/icon-1024.png"
  echo "  5. Then run: npm run icons:png"
  exit 1
fi

# Generate base PNG (1024x1024)
echo "📦 Creating PNG (1024x1024)..."
$CONVERT -background none -size 1024x1024 "$ICON_SVG" "$BUILD_DIR/icon-1024.png"

# Generate PNG at various sizes for different formats
echo "📦 Creating PNG (512x512)..."
$CONVERT -background none -size 512x512 "$ICON_SVG" "$BUILD_DIR/icon.png"

echo "📦 Creating PNG (256x256)..."
$CONVERT -background none -size 256x256 "$ICON_SVG" "$BUILD_DIR/icon-256.png"

# Generate macOS ICNS
if command -v iconutil &> /dev/null; then
  echo "🍎 Creating macOS icon (icon.icns)..."

  # Create iconset directory
  ICONSET="$BUILD_DIR/icon.iconset"
  mkdir -p "$ICONSET"

  # Generate all required sizes
  $CONVERT -background none -size 16x16 "$ICON_SVG" "$ICONSET/icon_16x16.png"
  $CONVERT -background none -size 32x32 "$ICON_SVG" "$ICONSET/icon_16x16@2x.png"
  $CONVERT -background none -size 32x32 "$ICON_SVG" "$ICONSET/icon_32x32.png"
  $CONVERT -background none -size 64x64 "$ICON_SVG" "$ICONSET/icon_32x32@2x.png"
  $CONVERT -background none -size 128x128 "$ICON_SVG" "$ICONSET/icon_128x128.png"
  $CONVERT -background none -size 256x256 "$ICON_SVG" "$ICONSET/icon_128x128@2x.png"
  $CONVERT -background none -size 256x256 "$ICON_SVG" "$ICONSET/icon_256x256.png"
  $CONVERT -background none -size 512x512 "$ICON_SVG" "$ICONSET/icon_256x256@2x.png"
  $CONVERT -background none -size 512x512 "$ICON_SVG" "$ICONSET/icon_512x512.png"
  $CONVERT -background none -size 1024x1024 "$ICON_SVG" "$ICONSET/icon_512x512@2x.png"

  # Convert to ICNS
  iconutil -c icns "$ICONSET" -o "$BUILD_DIR/icon.icns"
  rm -rf "$ICONSET"

  echo "✅ macOS icon created: $BUILD_DIR/icon.icns"
else
  echo "⚠️  iconutil not found (macOS only). Skipping .icns generation."
  echo "   You can create it manually or build on macOS."
fi

# Generate Windows ICO (requires ImageMagick)
echo "🪟 Creating Windows icon (icon.ico)..."
$CONVERT -background none \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  \( -clone 0 -resize 256x256 \) \
  -delete 0 "$BUILD_DIR/icon.ico" "$ICON_SVG" || \
$CONVERT -background none -size 256x256 "$ICON_SVG" "$BUILD_DIR/icon.ico"

echo ""
echo "✨ Icon generation complete!"
echo ""
echo "Generated files:"
echo "  ✅ $BUILD_DIR/icon.icns (macOS)"
echo "  ✅ $BUILD_DIR/icon.ico (Windows)"
echo "  ✅ $BUILD_DIR/icon.png (Linux)"
echo "  ✅ $BUILD_DIR/icon-1024.png (Source)"
echo ""
echo "Ready to build:"
echo "  npm run dist:mac"
