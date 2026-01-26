# Changelog

All notable changes to Task Floater will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.0] - 2026-01-26

### ✨ Features

- **Enhanced Design System**: Refined dark mode color layering with no pure black surfaces
- **Improved Light Mode**: Complete redesign with better contrast, shadows, and professional appearance
- **Premium Micro-interactions**: Smooth animations, glowing focus states, and subtle hover effects
- **Dynamic Window Resizing**: Window now properly resizes based on mode (Full/Compact/Focus)
- **Increased Maximum Height**: Window can now grow to 750px for better task visibility

### 🎨 Design & Style

- **Unified Input Design**: Input field and Add button now form a single cohesive component
- **Enhanced Priority Selectors**: Interactive pill buttons with tinted backgrounds when selected
- **Refined Task Cards**: Consistent heights (56px minimum), removed distracting colored borders
- **Improved Timer Display**: Larger countdown (14px bold), thicker progress bar (4px), gradient fills
- **Better Search Bar**: Added top margin, improved focus states, refined keyboard shortcut badges
- **Cleaner Section Labels**: Smaller size (9px), increased letter spacing, structural appearance
- **Enhanced Checkboxes**: Larger (20px), better contrast, bounce animation on completion
- **Pulsing Timer Indicator**: Running timers now have a subtle pulsing animation

### 🐛 Bug Fixes

- **Fixed Loading Overlay**: Removed invisible overlay that was blocking all mouse clicks
- **Fixed Cut-off UI Elements**: Timer controls now have proper spacing and visibility
- **Fixed Card Heights**: All task cards now have consistent minimum height
- **Fixed Module Bundling**: Added esbuild bundler to properly compile renderer for browser

### ⚡ Performance

- **Optimized Transitions**: Refined timing functions (150-250ms) for smoother animations
- **Improved Rendering**: Better flexbox layout prevents content overflow

### ♻️ Code Refactoring

- **Removed Debug Logging**: Cleaned up console logs from initialization
- **Better Color Variables**: Added priority-specific tints and glow variants
- **Enhanced Shadow System**: More sophisticated shadow layering for depth

### 📝 Breaking Changes

- None - fully backward compatible

---

## [1.6.0] - 2026-01-24

### ✨ Features

-  add production-ready code signing, CI/CD, and testing infrastructure**
-  add screenshot-based task capture with OCR**
-  premium UI redesign with mode switching and context menus**
-  add focus mode and organize documentation (#1)**
-  implement all high-impact UX enhancements**
-  add comprehensive UX micro-interactions and animations**
-  add collapsible accordion for search and add task sections**
-  complete task floater with all features and clean architecture**

### 🐛 Bug Fixes

-  remove unused variables to pass linting**
-  explicitly set light theme background on container**
-  focus mode now respects light theme**
-  remove adaptive opacity - keep window always visible**

### 📚 Documentation

-  update installation instructions for unsigned distribution**
-  add Cmd+K shortcut to README, remove Linear references from SECURITY.md**
-  update SECURITY.md with current implementation details**
-  organize light theme screenshots**
-  reorganize screenshots layout in README**
-  rewrite README with professional structure and tone**
-  arrange screenshots in professional grid layout**
-  add code signing guide and improve installation instructions**
-  add comprehensive code quality report**
-  add comprehensive best practices documentation**
-  remove footer**
-  replace ASCII diagram with Mermaid architecture diagram**
-  update repository URLs**

### 🎨 Design & Style

design: **new premium app icon with centered checkbox and timer badge**
style: **auto-formatting from prettier**
design: **reduce empty state icon to 24px for better proportions**
design: **reduce empty state icon size for better proportions**
style: **UI improvements and refinements**
design: **refine UI with improved color system and design tokens**
design: **reduce border-radius for less rounded, cleaner look**
design: **improve window transparency for better visibility**
design: **enhance task item UI with improved timer and controls**
design: **improve UI/UX symmetry and visual hierarchy**

### ♻️ Code Refactoring

-  code cleanup and improvements**
-  eliminate magic strings and add comprehensive linting**

### 🔧 Build & CI/CD

chore: **bump version to 1.6.0 and prepare for signed release**
build: **optimize app size with locale stripping and compression**
build: **add electron-builder for distributable app packaging**
chore: **improve TypeScript config and build tooling**

---

## [1.5.0] - 2026-01-15

- Initial release

---

## [1.4.0] - 2026-01-14

- Initial release

---

## [1.3.1] - 2026-01-13

- Initial release

---

## [1.3.0] - 2026-01-13

- Initial release

---

## [1.2.1] - 2026-01-13

- Initial release

---

## [1.2.0] - 2026-01-13

- Initial release

---

## [1.1.7] - 2026-01-13

- Initial release

---

## [1.1.6] - 2026-01-13

- Initial release

---

## [1.1.5] - 2026-01-13

- Initial release

---

## [1.1.4] - 2026-01-13

- Initial release

---

## [1.1.3] - 2026-01-13

- Initial release

---

## [1.1.2] - 2026-01-13

- Initial release

---

## [1.1.1] - 2026-01-13

- Initial release

---

## [1.1.0] - 2026-01-13

- Initial release

---

## [1.0.0] - 2026-01-13

- Initial release

---


---

**Legend:**
- ✨ Features - New functionality
- 🐛 Bug Fixes - Resolved issues
- 📚 Documentation - Docs improvements
- 🎨 Design & Style - UI/UX changes
- ⚡ Performance - Speed improvements
- ♻️ Code Refactoring - Internal code improvements
- ✅ Tests - Testing improvements
- 🔧 Build & CI/CD - Build system changes

