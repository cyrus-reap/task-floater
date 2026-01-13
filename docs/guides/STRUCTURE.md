# Documentation Structure

This document shows the complete organization of Task Floater documentation.

## 📁 Directory Tree

```
task-floater/
│
├── 📄 README.md                    # Main project documentation
├── 📄 CHANGELOG.md                 # Version history
├── 📄 CLAUDE.md                    # AI assistant guidance
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 CODE_OF_CONDUCT.md           # Community standards
│
├── 📁 docs/                        # All documentation
│   │
│   ├── 📄 README.md                # Documentation index (start here!)
│   │
│   ├── 📁 guides/                  # User & developer guides
│   │   ├── BUILD.md                # Building & development
│   │   ├── RELEASING.md            # Release workflow (consolidated)
│   │   ├── FOCUS-MODE.md           # Focus mode feature
│   │   └── SHORTCUTS.md            # Keyboard shortcuts
│   │
│   ├── 📁 architecture/            # Technical design docs
│   │   ├── SECURITY.md             # Security implementation
│   │   ├── BEST_PRACTICES.md       # Code standards
│   │   └── FEATURES.md             # Feature documentation
│   │
│   ├── 📁 reports/                 # Project reports
│   │   ├── CODE_QUALITY_REPORT.md
│   │   ├── IMPROVEMENTS_SUMMARY.md
│   │   └── UX_ENHANCEMENTS.md
│   │
│   └── 📄 STRUCTURE.md             # This file
│
├── 📁 src/                         # Source code
│   ├── main.ts
│   ├── renderer.ts
│   ├── preload.ts
│   ├── constants.ts                # No magic strings!
│   ├── validation.ts               # Input validation
│   ├── types.d.ts
│   └── index.html
│
├── 📁 build/                       # Build assets
│   ├── icon.svg                    # Source icon
│   ├── icon.icns                   # macOS icon
│   ├── icon.ico                    # Windows icon
│   ├── icon.png                    # Linux icon
│   └── entitlements.mac.plist      # macOS permissions
│
├── 📁 scripts/                     # Build scripts
│   ├── generate-icons.js           # Icon generation
│   └── generate-icons-manual.md    # Manual icon guide
│
└── 📁 release/                     # Build output (gitignored)
    ├── Task Floater-VERSION.dmg
    ├── Task Floater-VERSION.zip
    └── latest-mac.yml              # Auto-update manifest
```

## 📖 Documentation Categories

### Root Level Files
Essential project files that should always be at the repository root:

- **README.md** - First thing users see, project overview
- **CHANGELOG.md** - Version history following Keep a Changelog format
- **CLAUDE.md** - Guidance for Claude Code (AI development assistant)
- **CONTRIBUTING.md** - How to contribute to the project
- **CODE_OF_CONDUCT.md** - Community behavior guidelines

### docs/guides/
How-to guides, tutorials, and step-by-step instructions:

- **BUILD.md** - Complete build system documentation
- **RELEASING.md** - Release workflow (consolidated UPDATE, RELEASE, QUICK-RELEASE)
- **FOCUS-MODE.md** - Focus mode feature guide
- **SHORTCUTS.md** - Keyboard shortcut reference

### docs/architecture/
Technical design, architecture decisions, and standards:

- **SECURITY.md** - Security implementation and threat model
- **BEST_PRACTICES.md** - Code quality and development standards
- **FEATURES.md** - Technical feature documentation

### docs/reports/
Project analysis, summaries, and historical reports:

- **CODE_QUALITY_REPORT.md** - Code quality analysis
- **IMPROVEMENTS_SUMMARY.md** - Enhancement tracking
- **UX_ENHANCEMENTS.md** - UI/UX improvement history

## 🎯 Quick Navigation

### I want to...

| Goal | Documentation |
|------|--------------|
| Get started | [README.md](../README.md) |
| Build from source | [guides/BUILD.md](guides/BUILD.md) |
| Release an update | [guides/RELEASING.md](guides/RELEASING.md) |
| Use focus mode | [guides/FOCUS-MODE.md](guides/FOCUS-MODE.md) |
| Learn shortcuts | [guides/SHORTCUTS.md](guides/SHORTCUTS.md) |
| Understand security | [architecture/SECURITY.md](architecture/SECURITY.md) |
| Follow best practices | [architecture/BEST_PRACTICES.md](architecture/BEST_PRACTICES.md) |
| Contribute code | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| See what changed | [../CHANGELOG.md](../CHANGELOG.md) |
| Help Claude Code | [../CLAUDE.md](../CLAUDE.md) |

## 📝 Documentation Standards

### File Naming
- Use `UPPERCASE.md` for important standalone docs
- Use descriptive names (RELEASING.md not RELEASE.md)
- No redundant prefixes (BUILD.md not BUILD-GUIDE.md)

### Content Organization
- Start with clear purpose/overview
- Use headers for structure
- Include code examples
- Add links to related docs
- Keep content focused

### Location Guidelines
- **Root** - Essential project files only
- **guides/** - Step-by-step instructions
- **architecture/** - Design and technical decisions
- **reports/** - Analysis and historical summaries

## 🔄 Consolidated Documentation

### Removed Duplicates
We consolidated these redundant docs:

- ❌ ~~RELEASE.md~~
- ❌ ~~QUICK-RELEASE.md~~  
- ❌ ~~RELEASE-CHECKLIST.md~~
- ❌ ~~UPDATE.md~~

Into one comprehensive guide:
- ✅ **docs/guides/RELEASING.md** - All release info in one place

### Benefits
- Easier to maintain
- No contradicting info
- Single source of truth
- Faster to find information

## 🆕 Adding New Documentation

When creating new docs:

1. **Determine category**:
   - How-to guide? → `docs/guides/`
   - Technical design? → `docs/architecture/`
   - Analysis/report? → `docs/reports/`

2. **Create the file** with clear purpose

3. **Update indexes**:
   - Add to `docs/README.md`
   - Link from root `README.md` if important

4. **Follow format**:
   - Clear title
   - Table of contents for long docs
   - Code examples
   - Links to related docs

## ✅ Well-Organized Benefits

- ✨ Easy to find documentation
- 📁 Logical categorization
- 🔗 Cross-referenced
- 🧹 No duplication
- 📖 Clear entry point (docs/README.md)
- 🎯 Quick navigation by task

---

**Start here**: [docs/README.md](README.md) - Documentation index
