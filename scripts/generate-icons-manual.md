# Manual Icon Generation Guide

Since ImageMagick is not installed, here are alternative methods to generate icons:

## Option 1: Install ImageMagick (Recommended)

```bash
# Install with Homebrew
brew install imagemagick

# Then run icon generation
npm run icons
```

## Option 2: Use Online Converter

### Step 1: Convert SVG to PNG
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `build/icon.svg`
3. Set dimensions to **1024x1024**
4. Download and save as `build/icon-1024.png`

### Step 2: Generate macOS ICNS
1. Go to https://cloudconvert.com/png-to-icns
2. Upload `build/icon-1024.png`
3. Download and save as `build/icon.icns`

### Step 3: Generate Windows ICO
1. Go to https://cloudconvert.com/png-to-ico
2. Upload `build/icon-1024.png`
3. Download and save as `build/icon.ico`

### Step 4: Linux PNG
```bash
cp build/icon-1024.png build/icon.png
```

## Option 3: Use macOS Preview (macOS only)

### For ICNS:
1. Open `build/icon.svg` in Preview
2. File → Export → PNG
3. Save as `icon-1024.png` (1024x1024)
4. Use online converter for .icns (see Option 2)

## Option 4: Use npm Package

```bash
# Install icon generator
npm install --save-dev electron-icon-builder

# Add to package.json scripts:
"icons:auto": "electron-icon-builder --input=build/icon.svg --output=build"
```

## Verify Icons

After generating, you should have:
```
build/
├── icon.svg          # Source SVG
├── icon.icns         # macOS icon
├── icon.ico          # Windows icon
├── icon.png          # Linux icon (512x512+)
└── icon-1024.png     # Source PNG
```

Then you can build:
```bash
npm run dist:mac
```
