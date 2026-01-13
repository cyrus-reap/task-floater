# Changelog

All notable changes to Task Floater will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎯 **Focus Mode** - Minimize distractions and concentrate on active tasks
  - Hides completed tasks, search, stats, and input sections
  - Highlights active timer task
  - Dims inactive tasks
  - Darker, immersive background
  - Toggle with focus button or `Cmd+Shift+F`
  - Notification on enable

## [1.0.0] - 2026-01-13

### Added
- Floating, always-on-top task window for macOS
- Pomodoro-style timer for each task
- Duration preset buttons (15min, 30min, 45min, 1hr, 1.5hrs)
- Progress bar for running timers
- Auto-advance to next task when timer completes
- Task search functionality
- Stats bar showing active/completed tasks
- Drag-and-drop task reordering
- Professional SVG icons throughout
- Glassmorphism UI design
- Auto-update functionality via GitHub Releases
- Comprehensive input validation and security hardening

### Security
- Input validation for all user inputs
- XSS prevention with HTML escaping and CSP
- Path traversal protection
- File permission hardening (0o600)
- Electron security hardening (sandbox, context isolation)
- Max task limits to prevent DoS

---

## How to Update

See [UPDATE.md](UPDATE.md) for the complete update workflow.
