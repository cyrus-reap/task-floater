# Build Assets

This directory contains assets needed for building the production app.

## Required Icons

You need to create icons for the app in the following formats:

### macOS
- **File**: `icon.icns`
- **Tool**: Use `png2icons` or macOS Icon Composer
- **Source**: 1024x1024 PNG recommended

### Windows
- **File**: `icon.ico`
- **Sizes**: 16x16, 32x32, 48x48, 256x256

### Linux
- **File**: `icon.png`
- **Size**: 512x512 or 1024x1024

## Creating Icons

### Quick Method (Using Online Tool)
1. Create a 1024x1024 PNG icon
2. Use https://cloudconvert.com/png-to-icns for macOS
3. Use https://cloudconvert.com/png-to-ico for Windows

### Using npm Package
```bash
npm install --save-dev png2icons

# Then create icons from a 1024x1024 PNG
npx png2icons icon-source.png build/
```

## Icon Design Suggestions

The icon should represent:
- Task/todo management
- Timer/clock functionality
- Modern, clean design
- Works well at small sizes (16x16)

Consider:
- Checkmark + clock
- Floating window
- Task list with timer
- Clean, minimalist design
