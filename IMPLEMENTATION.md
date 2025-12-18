# Implementation Plan: MkDocs Snippet Lens

This document outlines the phased implementation approach for the MkDocs Snippet Lens
VS Code extension. Features are prioritized to deliver value early while managing
complexity and risk.

**Note:** The Week 1 spike explored multi-line decoration approaches. As of this
writing, VS Code only supports single line decoration previews using the `after`
property. Multi-line ghost text blocks are not possible with the current API. Each
snippet preview is therefore rendered as a single (potentially long) line, and true
block-style previews are deferred until VS Code supports this capability.
- [About This Document](#about-this-document)
- [Release Strategy Overview](#release-strategy-overview)
- [v0.1.0 - Minimum Viable Product (MVP)](#v010---minimum-viable-product-mvp)
  - [Features In Scope (\[DONE\])](#features-in-scope-done)
    - [1. Basic Snippet Detection \[DONE\]](#1-basic-snippet-detection-done)
    - [2. Document Link Provider \[DONE\]](#2-document-link-provider-done)
    - [3. Simple Ghost Text Preview \[DONE\]](#3-simple-ghost-text-preview-done)
    - [4. Basic Error Handling \[DONE\]](#4-basic-error-handling-done)
    - [5. Basic Configuration \[DONE\]](#5-basic-configuration-done)
  - [Development Tasks (\[DONE\])](#development-tasks-done)
  - [Additional MVP Feature (\[DONE\])](#additional-mvp-feature-done)
  - [MVP Success Metrics](#mvp-success-metrics)
- [v0.2.0 - Enhanced Diagnostics and Error Handling](#v020---enhanced-diagnostics-and-error-handling)
  - [Features In Scope (\[DONE\])](#features-in-scope-done-1)
    - [1. StrictMode with Auto-Detection \[DONE\]](#1-strictmode-with-auto-detection-done)
    - [2. Enhanced Error Diagnostics \[DONE\]](#2-enhanced-error-diagnostics-done)
    - [3. Section Markers in Comments \[DONE\]](#3-section-markers-in-comments-done)
    - [4. Named Section Support \[DONE in v0.1.1\]](#4-named-section-support-done-in-v011)
  - [Features Deferred from Original v0.2.0 Plan](#features-deferred-from-original-v020-plan)
  - [Development Tasks (\[DONE\])](#development-tasks-done-1)
- [v0.3.0 - Advanced Syntax and UX Enhancements](#v030---advanced-syntax-and-ux-enhancements)
  - [Features In Scope](#features-in-scope)
    - [1. Race Condition Fix (Quick Win) - Issue #48](#1-race-condition-fix-quick-win---issue-48)
    - [2. Advanced Line Range Support](#2-advanced-line-range-support)
    - [3. UX Improvements and Per-Snippet Toggle - Issue #55](#3-ux-improvements-and-per-snippet-toggle---issue-55)
    - [4. Block Format Support](#4-block-format-support)
    - [5. Disabled and Escaped Snippets](#5-disabled-and-escaped-snippets)
    - [6. Configurable Preview Length](#6-configurable-preview-length)
    - [7. Multi-Root Workspace Support (Optional) - Issue #47](#7-multi-root-workspace-support-optional---issue-47)
  - [Development Tasks](#development-tasks)
- [v0.4.0 - Performance and Robustness](#v040---performance-and-robustness)
  - [Features In Scope](#features-in-scope-1)
    - [1. Path Traversal Protection - Issue #52](#1-path-traversal-protection---issue-52)
    - [2. Symlink Validation - Issue #54](#2-symlink-validation---issue-54)
    - [3. Performance and File Size Limits - Issue #51](#3-performance-and-file-size-limits---issue-51)
    - [4. Asynchronous File Loading (continued from above)](#4-asynchronous-file-loading-continued-from-above)
    - [5. Recursive Snippet Processing](#5-recursive-snippet-processing)
    - [6. Auto-Refresh on File Changes](#6-auto-refresh-on-file-changes)
    - [7. Comprehensive Error Handling](#7-comprehensive-error-handling)
    - [8. File Size Limits](#8-file-size-limits)
    - [9. State Persistence](#9-state-persistence)
  - [Development Tasks](#development-tasks-1)
- [v0.5.0 - URL Snippets and Remote Content](#v050---url-snippets-and-remote-content)
  - [Features In Scope](#features-in-scope-2)
    - [1. URL Snippets](#1-url-snippets)
    - [2. HTTP Retry Logic](#2-http-retry-logic)
    - [3. Custom HTTP Headers](#3-custom-http-headers)
  - [Development Tasks](#development-tasks-2)
- [v1.0.0 - Production Ready](#v100---production-ready)
  - [Features In Scope](#features-in-scope-3)
    - [1. Security Hardening](#1-security-hardening)
    - [2. Performance Optimization](#2-performance-optimization)
    - [3. Accessibility Features - Issue #53](#3-accessibility-features---issue-53)
    - [4. Complete Documentation](#4-complete-documentation)
    - [5. Marketplace Publishing Automation](#5-marketplace-publishing-automation)
  - [Development Tasks](#development-tasks-3)
- [Command Implementation Schedule](#command-implementation-schedule)
  - [v0.1.0 - MVP Commands](#v010---mvp-commands)
  - [v0.2.0 - Enhanced Control Commands](#v020---enhanced-control-commands)
  - [v0.3.0 - Navigation \& Refresh Commands](#v030---navigation--refresh-commands)
  - [v1.1.0+ - Future Commands](#v110---future-commands)
- [Future Releases (v1.1.0+)](#future-releases-v110)
  - [Potential Features (Not Yet Scheduled)](#potential-features-not-yet-scheduled)
  - [Prioritization Criteria for Future Features](#prioritization-criteria-for-future-features)
  - [Feature Request Process](#feature-request-process)
- [Release Process](#release-process)
  - [Version Numbering](#version-numbering)
  - [Release Checklist](#release-checklist)
  - [Post-Release Activities](#post-release-activities)
- [Development Standards](#development-standards)
  - [Development Methodology](#development-methodology)
    - [TDD Process (Mandatory)](#tdd-process-mandatory)
  - [Code Quality](#code-quality)
  - [Git Workflow](#git-workflow)
  - [Testing Strategy](#testing-strategy)
  - [Performance Budgets](#performance-budgets)
  - [Documentation Requirements](#documentation-requirements)
- [Risk Mitigation](#risk-mitigation)
- [Success Metrics](#success-metrics)
  - [Technical Metrics](#technical-metrics)
  - [User Metrics (Post-1.0)](#user-metrics-post-10)
  - [Project Health](#project-health)

## About This Document

This document defines **how and when** the requirements in `REQUIREMENTS.md` will be
implemented. It breaks the full feature set into manageable releases, prioritizing
features to deliver value incrementally while managing complexity and risk.

**Purpose:**

- Define release strategy and timelines
- Break requirements into phased milestones (v0.1, v0.2, v1.0, etc.)
- Prioritize features for each release
- Provide development task breakdown and scheduling
- Document technical implementation decisions and approaches
- Track progress toward completion

**What's Included:**

- Release roadmap with target dates and goals
- Feature scope for each release (what's in/out)
- Development task breakdowns by week/phase
- Success criteria for each milestone
- Command implementation schedule
- Development standards and practices
- Risk mitigation strategies specific to implementation

**What's NOT Included:**

- Detailed feature specifications (see `REQUIREMENTS.md`)
- Why features exist or user needs (see `REQUIREMENTS.md`)
- Completed implementation details (those go in code/comments)

**Relationship to Other Documents:**

- `REQUIREMENTS.md` - Defines **what** needs to be built and **why**
- `RISKS.md` - Identifies risks that inform prioritization and scheduling
- `CHANGELOG.md` - Records actual implementation history and releases
- GitHub Issues/Milestones - Track detailed tasks and bugs

**Maintenance:**

- Update actively during development as plans evolve
- Review and adjust after each release based on learnings
- Move completed releases to "Completed Releases" section
- Adjust future releases based on feedback and changing priorities
- More dynamic than REQUIREMENTS.md - expects frequent updates

**How to Use This Document:**

1. **Planning:** Review upcoming release to understand scope and timeline
2. **Development:** Check current phase for task breakdown and priorities
3. **Tracking:** Update task checkboxes as work progresses
4. **Retrospective:** After each release, update with learnings and adjust future
   plans
5. **Onboarding:** New contributors should read this to understand where the project
   is heading

---

**Guiding Principles:**

- Start simple, iterate based on feedback
- Deliver working software early and often
- Validate technical approaches before full implementation
- Build foundation for future features without over-engineering
- Maintain high quality (100% test coverage required) throughout

---

## Release Strategy Overview

| Release | Target Date | Focus | Key Deliverables |
| --------- | ------------- | ------- | ------------------ |
| v0.1.0 (MVP) | ✅ Complete | Core functionality proof-of-concept | Basic snippet detection, file links, simple previews |
| v0.2.0 | ✅ Complete | Enhanced diagnostics and error handling | StrictMode, diagnostic severity, ambiguous pattern detection |
| v0.3.0 | TBD | Advanced syntax and UX | Per-snippet toggles, block format, disabled/escaped snippets, advanced line ranges |
| v0.4.0 | TBD | Performance and robustness | Recursive snippets, auto-refresh, async loading |
| v0.5.0 | TBD | Remote content | URL snippets, HTTP caching, retry logic |
| v1.0.0 | TBD | Production ready | Security hardening, performance optimization, full documentation |
| v1.1.0+ | Future | Advanced features | Multi-root workspaces, advanced settings, accessibility |

---

## v0.1.0 - Minimum Viable Product (MVP)

**Status:** [DONE] — v0.1.0 is complete. All MVP features below are implemented. See
CHANGELOG.md and REQUIREMENTS.md for details. Hover tooltips for snippet content are
also included in the MVP.

**Goal:** Prove the core concept works and delivers value to users. Establish
technical foundation.

**Timeline:** 4 weeks

**Success Criteria:**

- Users can click snippet references to open files
- Users can see basic ghost text previews
- Extension works on all three platforms (Windows, macOS, Linux)
- Code coverage == 100%
- Tests fail if coverage < 100%
- CI fails on insufficient coverage
- No critical bugs

### Features In Scope ([DONE])

#### 1. Basic Snippet Detection [DONE]

- Detects simple `--8<-- "path/to/file"` and `--8<-- 'path/to/file'` syntax in
  markdown files (entire file only, both quote types).
- Triggered on file open and save only.
- Scans only `.md` files.
- Uses basic regex pattern.

**Completed Beyond MVP Scope:**

- ✅ Named sections (`:section_name`) - Added in v0.1.1
- ✅ Explicit line ranges (`:start:end`) - Added in v0.1.1
- ✅ Multiple ranges (`:1:3,5:6`) - Added in v0.1.1

**Out of Scope for v0.1:**

- Start-only ranges (`:5`), end-only ranges (`::10`)
- Negative indexes (`:-5`)
- Block format (`--8<--\nfile1.md\nfile2.md\n--8<--`)
- Disabled snippets (`--8<-- "; file.md"`)
- Escaped snippets (`;--8<-- "file.md"`)
- URL snippets (`--8<-- "https://...")`)
- Recursive snippet expansion

**Implementation Notes:**

- Regex: `/--8<--\s+["']([^"']+)["']/g`
- Store detected snippets with line numbers and file paths
- No caching in v0.1 - re-scan on each trigger

**Known Limitations (documented in README):**

- Does not handle escaped quotes inside paths: `--8<-- "path/with\"quote.md"`
- Does not handle paths with line breaks (unlikely but possible)
- These are acceptable for MVP; consider robust parser in v0.2+ if needed

**Testing:**

- Unit tests for regex pattern matching
- Edge cases: escaped quotes, unicode, spaces in paths
- Integration test: detect snippets in sample markdown file

#### 2. Document Link Provider [DONE]

- Snippet file paths are clickable and open referenced files in a new editor tab.

**Path Resolution (Simple):**

- Try absolute path first
- Try relative to current file's directory
- Try relative to workspace root
- Try relative to configured `basePath` setting
- Show error diagnostic if file not found

**Resolution Precedence (document in code/README):**

1. If path is absolute (starts with `/` or drive letter on Windows), use as-is
2. Else try relative to current markdown file's directory
3. Else try relative to workspace root
4. Else try relative to configured `basePath`
5. If all fail, show diagnostic error

**Out of Scope for v0.1:**

- Opening to specific line numbers
- Preview on hover
- Path traversal protection (implement in v1.0)

**Implementation Notes:**

- Use `vscode.Uri.file()` for path resolution
- Handle file not found gracefully with diagnostic
- Document precedence order in code comments

**Testing:**

- Unit tests for path resolution logic
- Test precedence: what happens when same filename exists in multiple locations
- Integration tests for link provider registration
- Cross-platform path testing (Windows drive letters, Unix paths)

#### 3. Simple Ghost Text Preview [DONE]

- Displays snippet file content below the snippet line using faded, italic ghost text
  (up to 20 lines, with truncation indicator if longer).
- Manual global toggle only (OFF by default).
- Command: "MkDocs Snippet Lens: Toggle All Previews".

**Styling:**

- Use `editorCodeLens.foreground` theme color
- Font style: italic
- No fancy borders or margins in v0.1

**Out of Scope for v0.1:**

- Per-snippet toggle
- CodeLens toggle button
- State persistence
- Auto-refresh on file changes
- Configurable preview line limit

**Implementation Notes:**

- Single decoration type reused for all previews
- Global toggle state in memory only (lost on reload)
- Load file content synchronously for simplicity (optimize in v0.2)
- Handle file read errors with error message in preview
- **Note:** Week 1 spike will validate multi-line decoration approach; if `after`
  property has limitations, may need to use decoration ranges or alternative strategy

**Performance Considerations:**

- Synchronous loading acceptable for MVP but measure impact in Week 3
- If >50 snippets or files >100KB cause lag, document as known limitation
- Plan async loading for v0.2 based on Week 3 performance test results

**Testing:**

- Unit tests for content truncation logic
- Integration tests for decoration application
- Visual tests (manual) for styling
- Performance test: 50+ snippets with various file sizes (Week 3)

#### 4. Basic Error Handling [DONE]

- Diagnostic (red squiggle) for file not found, with error message: "Snippet file not
  found: 'path/to/file'".
- Diagnostics clear when file is opened or snippet is removed.

**Out of Scope for v0.1:**

- Permission denied errors
- Invalid path syntax validation
- Security validation (path traversal)
- Detailed error context chains

**Implementation Notes:**

- Use `DiagnosticCollection` for errors
- Create diagnostics for snippet path range only
- Update diagnostics on document change

**Testing:**

- Unit tests for diagnostic creation
- Integration tests verifying diagnostics appear in Problems panel

#### 5. Basic Configuration [DONE]

- Minimal settings implemented: `mkdocsSnippetLens.basePath`,
  `mkdocsSnippetLens.previewMaxLines`, and `mkdocsSnippetLens.previewMaxChars`.

**Out of Scope for v0.1:**

- `previewLines` (hardcoded to 20)
- `defaultPreviewState` (hardcoded to off)
- `maxFileSize` (no limit in v0.1)
- All security settings

**Implementation Notes:**

- Use `workspace.getConfiguration('mkdocsLens')`
- React to configuration changes
- Validate `basePath` setting

**Testing:**

- Unit tests for configuration reading
- Integration tests for configuration changes

### Development Tasks ([DONE])

- [x] Set up project structure and build system
- [x] Configure TypeScript, ESLint, testing framework
- [x] Set up GitHub Actions for CI (lint, type check, tests)
- [x] Spike: Validate multi-line decoration rendering approach with
  TextEditorDecorationType
- [x] Define extension activation events in package.json (onLanguage:markdown)
- [x] Document path resolution precedence order (absolute → relative to file →
  workspace root)
- [x] Configure release-please for version management
- [x] Implement snippet detection regex and parser
- [x] Unit tests for pattern matching (including escaped quotes, unicode, spaces in
  paths)
- [x] Implement Document Link Provider
- [x] Implement basic path resolution
- [x] Implement ghost text decoration rendering
- [x] Implement command: `mkdocsLens.toggleAllPreviews`
- [x] Implement diagnostic error handling
- [x] Add configuration settings
- [x] Integration tests on all platforms (GitHub Actions matrix: Windows, macOS,
  Linux)
- [x] Performance testing with 50+ snippets in one file
- [x] Test with large snippet files (1MB+)
- [x] Document manual test scenarios checklist
- [x] Fix bugs, improve error messages
- [x] Create test fixtures repository/folder for manual testing
- [x] Record demo GIF/video for README
- [x] Write README with installation, usage, configuration, limitations,
  contributing/license info
- [x] Manual testing on all platforms
- [x] Verify CI/CD pipeline working
- [x] Merge release-please PR for v0.1.0
- [x] Verify GitHub release created automatically

### Additional MVP Feature ([DONE])

- [x] Implement hover tooltips for snippet content (truncated preview, matches ghost
  text behavior)

### MVP Success Metrics

- ✅ Extension activates without errors
- ✅ Snippets detected in markdown files
- ✅ Click to open works for absolute and relative paths
- ✅ Ghost text preview shows content (when toggled on)
- ✅ File not found errors appear as diagnostics
- ✅ Works on Windows, macOS, Linux
- ✅ Test coverage == 100%
- ✅ Tests fail if coverage < 100%

---

## v0.2.0 - Enhanced Diagnostics and Error Handling

**Status:** [DONE] — v0.2.0 is complete. All features below are implemented.

**Goal:** Enhance diagnostic capabilities with configurable severity levels, improve
error handling for ambiguous patterns, and implement strictMode with auto-detection
from mkdocs.yml.

**Timeline:** Completed December 2025

**Success Criteria:**

- ✅ StrictMode with auto-detection from mkdocs.yml
- ✅ Diagnostic severity levels (warnings vs errors) configurable
- ✅ Error handling for ambiguous/malformed snippet patterns
- ✅ Support for section markers embedded in comments
- ✅ Comprehensive test coverage for edge cases
- ✅ Code coverage == 100%
- ✅ Tests fail if coverage < 100%

**Note:** This release focused on robustness and error handling rather than the
originally planned advanced syntax features. The original v0.2.0 scope (per-snippet
toggles, block format, URL snippets, etc.) has been deferred to v0.3.0 and beyond
based on user feedback prioritizing diagnostic improvements.

### Features In Scope ([DONE])

#### 1. StrictMode with Auto-Detection [DONE]

**Description:** Control diagnostic severity (errors vs warnings) with automatic
detection from mkdocs.yml configuration.

**Status:** ✅ Complete - see CHANGELOG.md v0.2.0

**Requirements:**

- New setting `mkdocsSnippetLens.strictMode` with three modes:
  - `"auto"` (default): Reads `check_paths` setting from `mkdocs.yml`
  - `"true"`: Always show errors (red squiggles)
  - `"false"`: Always show warnings (yellow squiggles)
- Automatic mkdocs.yml detection and parsing
- Respects mkdocs.yml location in workspace

**Implementation:**

- Added `mkdocsConfigReader.ts` module
- Parses YAML configuration
- Falls back to warnings if mkdocs.yml not found
- Integrated with diagnostic severity resolution

**Testing:**

- Unit tests for mkdocs.yml parsing
- Tests for all three strictMode values
- Edge cases: missing files, invalid YAML, nested plugins config

#### 2. Enhanced Error Diagnostics [DONE]

**Description:** Improved error messages and diagnostics for ambiguous or malformed
snippet patterns.

**Status:** ✅ Complete - see CHANGELOG.md v0.2.0

**Requirements:**

- Detect ambiguous multi-range patterns (e.g., `file.md:1:3,invalid`)
- Display warning diagnostics with specific error messages
- Fallback to section reference when pattern is ambiguous
- Clear user-facing error messages explaining the issue

**Implementation:**

- Enhanced pattern detection in `snippetDetector.ts`
- Added validation for multi-range numeric patterns
- Diagnostic warnings for malformed patterns

**Testing:**

- Comprehensive edge case tests for line range extraction
- Tests for non-numeric parts in ranges
- Tests for incomplete range patterns

#### 3. Section Markers in Comments [DONE]

**Description:** Support section markers embedded in code comments.

**Status:** ✅ Complete - see CHANGELOG.md v0.2.0

**Requirements:**

- Detect `--8<-- [start:name]` and `--8<-- [end:name]` in comments
- Language-aware comment detection
- Works with various comment styles (Python #, JavaScript //, etc.)

**Implementation:**

- Updated section marker detection regex
- Handles markers with or without comment prefixes

**Testing:**

- Unit tests for section markers in comments
- Tests for various programming languages

#### 4. Named Section Support [DONE in v0.1.1]

**Note:** Named sections were implemented ahead of schedule in v0.1.1.

**Description:** Support `--8<-- "file.ext:section_name"` syntax.

**Status:** ✅ Complete - see CHANGELOG.md v0.1.1

**Requirements:**

- Detect section specifier in snippet syntax
- Parse snippet files for `--8<-- [start:name]` and `--8<-- [end:name]` markers
- Extract content between markers (excluding marker lines)
- Show diagnostic if section not found
- Support sections in comments (language-aware detection)

**Implementation Notes:**

- Extend regex to capture optional `:section_name`
- Create section marker parser
- Cache parsed sections per file

**Testing:**

- Unit tests for section marker detection
- Test various comment styles (Python, JavaScript, YAML, etc.)
- Test missing/mismatched section markers

### Features Deferred from Original v0.2.0 Plan

The following features were originally planned for v0.2.0 but have been moved to
future releases (v0.3.0+) to prioritize diagnostic improvements and error handling:

- Advanced line range support (start-only, end-only, negative indexes)
- Per-snippet toggle with CodeLens
- Block format support
- Disabled and escaped snippets
- URL snippets
- Configurable preview length
- Asynchronous file loading

See v0.3.0 and later sections for rescheduled features.

### Development Tasks ([DONE])

- [x] Implement mkdocsConfigReader module
- [x] Add strictMode setting with auto/true/false options
- [x] Parse mkdocs.yml for check_paths plugin configuration
- [x] Integrate strictMode with diagnostic severity resolution
- [x] Enhance error detection for ambiguous/malformed patterns
- [x] Add diagnostic warnings for invalid multi-range patterns
- [x] Support section markers embedded in comments
- [x] Comprehensive edge case testing for line range extraction
- [x] Unit tests for mkdocs.yml parsing and strictMode
- [x] Documentation updates (README, REQUIREMENTS, copilot-instructions)
- [x] Enforce 2-space indentation across codebase
- [x] Create v0.2.0 release

---

## v0.3.0 - Advanced Syntax and UX Enhancements

**Status:** In Planning

**Goal:** Implement advanced snippet syntax features (originally planned for v0.2.0)
including per-snippet toggles, block format, and additional line range options. Also
includes critical UX improvements and robustness fixes.

**Timeline:** Q1 2026 (estimated 6-8 weeks)

**Success Criteria:**

- Race condition in mkdocs.yml watcher fixed (Issue #48)
- Per-snippet toggle with CodeLens implemented (Issue #55)
- Improved visual differentiation for previews (Issue #55)
- Advanced line range support (start-only, end-only, negative indexes) working
- Block format supported
- Disabled and escaped snippets handled
- Multi-root workspace support decision made (Issue #47 - defer to v0.4.0 or include)
- Code coverage == 100%
- Tests fail if coverage < 100%

**Related GitHub Issues:**

- [#48 - Prevent race conditions in mkdocs.yml file watcher
  callback](https://github.com/main-branch/mkdocs-snippet-lens/issues/48)
- [#55 - UX: Improve preview visual differentiation and add per-snippet
  toggles](https://github.com/main-branch/mkdocs-snippet-lens/issues/55)
- [#47 - Support multi-root workspaces for MkDocs config
  auto-detection](https://github.com/main-branch/mkdocs-snippet-lens/issues/47)
  (Optional)

### Features In Scope

#### 1. Race Condition Fix (Quick Win) - Issue #48

**Priority:** HIGH - Quick win, should be completed first

**Description:** Fix race conditions in mkdocs.yml file watcher callback to prevent
multiple concurrent config reloads.

**Problem:**

- Multiple rapid saves of mkdocs.yml can trigger overlapping async config loads
- Diagnostics refresh loop could operate on stale config data
- Brief display of incorrect diagnostic severity during race window

**Solution:**

Implement semaphore/lock pattern with event coalescing:

```typescript
let isReloadingMkdocsConfig = false;
let hasPendingMkdocsReload = false;

const reloadMkdocsConfig = async () => {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return;
  }

  if (isReloadingMkdocsConfig) {
    hasPendingMkdocsReload = true;
    return;
  }

  isReloadingMkdocsConfig = true;
  try {
    do {
      hasPendingMkdocsReload = false;
      await diagnosticManager.loadMkdocsConfig(workspaceFolders[0].uri.fsPath);

      vscode.window.visibleTextEditors
        .filter(editor => editor.document.languageId === 'markdown')
        .forEach(editor => {
          diagnosticManager.updateDiagnostics(editor.document);
        });
    } while (hasPendingMkdocsReload);
  } finally {
    isReloadingMkdocsConfig = false;
  }
};
```

**Testing:**

- Unit tests for semaphore logic
- Integration tests simulating rapid config changes
- Verify no race conditions with concurrent saves
- Verify diagnostics always reflect latest config

**Effort:** 1-2 days

#### 2. Advanced Line Range Support

**Description:** Complete remaining line range syntax variations.

**Requirements:**

- **Start-only ranges:** `file.ext:5` (line 5 to end)
- **End-only ranges:** `file.ext::10` (start to line 10)
- **Negative indexes:** `file.ext:-5` (last 5 lines), `file.ext:-10:-1` (range from
  end)
- 1-based line numbers (0 clamped to 1)
- Negative indexes converted to positive based on file line count
- Show diagnostic if range out of bounds

**Note:** Basic explicit ranges (`:5:10`) and multiple ranges (`:1:3,5:6`) were
completed in v0.1.1. This feature adds the remaining advanced range syntax.

**Implementation Notes:**

- Extend regex to capture line range specifiers
- Implement line extraction logic
- Validate ranges against file length

**Testing:**

- Unit tests for all line range variations
- Edge cases: empty ranges, invalid ranges, EOF

#### 3. UX Improvements and Per-Snippet Toggle - Issue #55

**Description:** Improve visual differentiation of ghost text previews and implement
per-snippet toggle functionality.

**Phase 1: Visual Differentiation (Priority: HIGH)**

- **[Preview] Label:** Add subtle `[Preview]` prefix to ghost text content
  - Color: Match theme's `editorCodeLens.foreground`
  - Style: Slightly dimmer than content (0.6 opacity)
  - Format: `[Preview] content line 1...`

- **Additional Visual Indicators:**
  - Consider icon before `[Preview]` label (e.g., 👁 or 📄)
  - Evaluate background color option (very subtle, theme-aware)
  - Maintain subtle left border (already implemented)

- **Status Bar Indication:**
  - Show status when previews are globally enabled
  - Format: `$(eye) Snippet Previews: On` (clickable to toggle)
  - Hide when previews are off to reduce clutter

**Phase 2: Per-Snippet Toggle (Priority: MEDIUM)**

- **CodeLens Implementation:**
  - Display above each snippet line
  - Label when hidden: "$(eye) Show Preview"
  - Label when shown: "$(eye-closed) Hide Preview"
  - Click to toggle that specific preview
  - State persists during editor session

- **Commands:**
  - `mkdocsLens.toggleCurrentPreview` - Toggle preview at cursor position
  - `mkdocsLens.showAllPreviews` - Show all previews
  - `mkdocsLens.hideAllPreviews` - Hide all previews

- **Keyboard Shortcuts:**
  - `Ctrl+K Ctrl+P` / `Cmd+K Cmd+P` - Toggle preview at cursor
  - Document in README and package.json keybindings

**Implementation Notes:**

- Start with Phase 1 (visual improvements) - quick wins
- Implement `CodeLensProvider` for Phase 2
- Track toggle state per snippet (Map of document URI + line number)
- Update only affected decorations on toggle
- Set context key `mkdocsLens:hasSnippetAtCursor` when cursor is on snippet line
- Use workspace state for persistence

**Testing:**

- Unit tests for [Preview] label injection
- Unit tests for status bar text generation
- Integration tests for CodeLens provider
- Test state management with multiple documents
- Test multiple snippets in same file
- Test context key updates
- User testing to validate visual distinction is sufficient

**User Testing:**

- Solicit feedback on visual changes via GitHub discussion
- Verify users can easily distinguish preview from actual content
- Iterate on visual design based on feedback

#### 4. Block Format Support

**Description:** Support multi-file block format syntax.

**Syntax:**

```markdown
--8<--
file1.md
file2.md:section
file3.md:10:20
; disabled.md
--8<--
```

**Requirements:**

- Detect block format with opening and closing `--8<--` on separate lines
- Process each file path on its own line
- Support all single-line syntax features (sections, ranges, etc.)
- Support disabled files with `;` prefix
- Handle empty lines within block (preserve in output per MkDocs behavior)

**Implementation Notes:**

- Update regex to detect block format
- Parse content between markers line-by-line
- Create multiple snippet locations for each file in block

**Testing:**

- Unit tests for block format detection
- Test with mixed file types and syntax
- Test disabled files within block

#### 5. Disabled and Escaped Snippets

**Description:** Support temporarily disabling and escaping snippet syntax.

**Syntax:**
- **Disabled:** `--8<-- "; skip.md"` (semicolon before filename)
- **Escaped:** `;--8<-- "example.md"` (semicolon before scissors, shows literally)

**Requirements:**

- Disabled snippets are detected but not processed (no link, no preview)
- Escaped snippets pass through with first `;` removed, shown as plain text
- Works in both single-line and block format

**Implementation Notes:**

- Update regex to detect `;` prefix
- Skip processing for disabled snippets
- Render escaped syntax literally in preview

**Testing:**

- Unit tests for disabled/escaped detection
- Test in single-line and block formats
- Verify escaped syntax renders correctly

#### 6. Configurable Preview Length

**Description:** Make preview line limit configurable.

**Settings:**

```json
{
  "mkdocsLens.previewLines": {
    "type": "number",
    "default": 20,
    "minimum": 5,
    "maximum": 500,
    "description": "Maximum lines to show in snippet preview"
  }
}
```

**Implementation Notes:**

- Replace hardcoded 20 with setting value
- React to configuration changes
- Update all visible previews when setting changes

**Testing:**

- Unit tests for truncation with various limits
- Integration tests for configuration updates

#### 7. Multi-Root Workspace Support (Optional) - Issue #47

**Status:** DECISION NEEDED - Include in v0.3.0 or defer to v0.4.0?

**Description:** Support multiple workspace folders, each with its own mkdocs.yml
configuration.

**Current Limitations:**

- Only loads `mkdocs.yml` from first workspace folder
- File watcher only monitors first workspace folder
- DiagnosticManager doesn't maintain per-folder config state

**Proposed Solution:**

- Load config for all workspace folders on activation
- Create file watcher per workspace folder
- Update DiagnosticManager to store config per workspace folder (Map)
- Use `vscode.workspace.getWorkspaceFolder(document.uri)` to determine correct config

**Recommendation:** **Defer to v0.4.0** to keep v0.3.0 scope manageable. Most users
have single-folder workspaces, and current behavior works correctly for them.

**If included in v0.3.0:**

**Implementation Notes:**

- Refactor config loading to loop over all workspace folders
- Create watcher array with one watcher per folder
- Update DiagnosticManager with `Map<string, MkdocsConfig>`
- Test workspace folder changes (add/remove folders)

**Testing:**

- Unit tests for per-folder config storage
- Integration tests with mock multi-root workspace
- Test document in different folders uses correct config
- Test config change in one folder doesn't affect others

**Effort:** 3-4 days

### Development Tasks

**Phase 0: Quick Wins (Week 1)**

- [ ] Fix race condition in mkdocs.yml watcher (Issue #48)
  - [ ] Implement semaphore pattern
  - [ ] Add unit tests for lock logic
  - [ ] Test with rapid config changes
  - [ ] Create PR and merge

**Phase 1: Visual Improvements (Week 2)**

- [ ] Add [Preview] label to ghost text (Issue #55)
  - [ ] Implement label injection in decoration
  - [ ] Unit tests for label formatting
  - [ ] Test with various themes
- [ ] Add status bar indicator
  - [ ] Show when previews enabled
  - [ ] Make clickable to toggle
  - [ ] Test status updates
- [ ] User testing and feedback
  - [ ] Create GitHub discussion for feedback
  - [ ] Iterate on design if needed

**Phase 2: Per-Snippet Toggles (Weeks 3-4)**

- [ ] Implement CodeLens provider (Issue #55)
  - [ ] Show/hide labels per snippet
  - [ ] Click handler for toggle
  - [ ] Unit tests for CodeLens generation
- [ ] Implement toggle commands
  - [ ] `toggleCurrentPreview` command
  - [ ] `showAllPreviews` command
  - [ ] `hideAllPreviews` command
  - [ ] Keyboard shortcuts
- [ ] State management
  - [ ] Track per-snippet state
  - [ ] Workspace state persistence
  - [ ] Integration tests

**Phase 3: Advanced Syntax (Weeks 5-6)**

- [ ] Advanced line range support
  - [ ] Start-only ranges (`:5`)
  - [ ] End-only ranges (`::10`)
  - [ ] Negative indexes (`:-5`)
  - [ ] Comprehensive unit tests
- [ ] Block format support
  - [ ] Detect block syntax
  - [ ] Parse multi-file blocks
  - [ ] Unit and integration tests
- [ ] Disabled/escaped snippets
  - [ ] Detect `;` prefix
  - [ ] Skip processing for disabled
  - [ ] Unit tests

**Phase 4: Configuration & Polish (Week 7)**

- [ ] Configurable preview length
  - [ ] Add setting to package.json
  - [ ] Update preview logic
  - [ ] React to config changes
  - [ ] Unit tests
- [ ] Multi-root workspace decision
  - [ ] Review Issue #47
  - [ ] Decide: include in v0.3.0 or defer to v0.4.0
  - [ ] If included: implement per Phase 6

**Phase 5: Testing & Release (Week 8)**

- [ ] Achieve 100% test coverage
- [ ] Configure tests to fail if coverage < 100%
- [ ] Cross-platform testing (Windows, macOS, Linux)
- [ ] Performance testing with many snippets
- [ ] Update documentation
  - [ ] README with new features
  - [ ] CHANGELOG (auto-generated)
  - [ ] Update copilot-instructions if needed
- [ ] Create v0.3.0 release
- [ ] Publish to marketplace

**Optional Phase 6: Multi-Root Workspaces (if included)**

- [ ] Refactor config loading for multiple folders
- [ ] Create per-folder file watchers
- [ ] Update DiagnosticManager with config map
- [ ] Comprehensive testing
- [ ] Documentation updates

---

## v0.4.0 - Performance and Robustness

**Status:** Planned

**Goal:** Add recursive snippet support, auto-refresh, asynchronous loading, and
comprehensive error handling. Implement security and performance safeguards.

**Timeline:** Q2 2026 (estimated 8-10 weeks)

**Success Criteria:**

- Recursive snippets work without crashes
- File changes trigger preview updates
- Asynchronous file loading implemented
- All error conditions properly handled
- Path traversal protection implemented (Issue #52)
- Symlink validation implemented (Issue #54)
- File size limits and async loading (Issue #51)
- Multi-root workspace support (Issue #47, if deferred from v0.3.0)
- Code coverage == 100%
- Tests fail if coverage < 100%

**Related GitHub Issues:**

- [#51 - Performance: Implement file size limits and async
  loading](https://github.com/main-branch/mkdocs-snippet-lens/issues/51)
- [#52 - Security: Implement path traversal
  protection](https://github.com/main-branch/mkdocs-snippet-lens/issues/52)
- [#54 - Security: Implement symlink validation and
  protection](https://github.com/main-branch/mkdocs-snippet-lens/issues/54)
- [#47 - Support multi-root
  workspaces](https://github.com/main-branch/mkdocs-snippet-lens/issues/47) (if
  deferred from v0.3.0)

### Features In Scope

#### 1. Path Traversal Protection - Issue #52

**Priority:** HIGH - Security requirement

**Description:** Prevent snippet paths from accessing files outside workspace
boundaries.

**Requirements:**

- Validate all paths resolve within workspace folder
- Normalize paths and check resolved absolute paths
- Block paths with `..` that escape workspace
- Add `enablePathTraversalProtection` setting (enabled by default)
- Log all blocked access attempts to output channel
- Show error diagnostic for blocked paths

**Implementation Notes:**

- Use `workspace.getWorkspaceFolder()` to determine boundaries
- Normalize paths using `path.resolve()` and `path.normalize()`
- Compare resolved paths against workspace root
- Handle Windows drive letters and UNC paths

**Testing:**

- Unit tests with malicious path patterns (`../../../etc/passwd`)
- Test absolute paths outside workspace
- Test Windows-specific paths (`C:/Windows/System32/...`)
- Cross-platform path resolution testing

**Effort:** 2-3 days

#### 2. Symlink Validation - Issue #54

**Priority:** HIGH - Security requirement

**Description:** Safely resolve and validate symbolic links.

**Requirements:**

- Resolve symlinks to final target paths
- Validate final target is within workspace
- Detect and block circular symlinks
- Implement symlink depth limit (40 levels)
- Add `followSymlinks` setting (consider defaulting to false)
- Handle broken/dangling symlinks gracefully

**Implementation Notes:**

- Use `fs.realpath()` for symlink resolution
- Track resolution depth to prevent infinite loops
- Validate final path after resolution
- Log symlink resolutions to output channel

**Testing:**

- Unit tests for symlink resolution
- Test circular symlinks (A → B → A)
- Test deep symlink chains (>40 levels)
- Test symlinks pointing outside workspace
- Test broken symlinks

**Effort:** 3-4 days

#### 3. Performance and File Size Limits - Issue #51

**Priority:** HIGH - Performance requirement

**Description:** Implement safeguards for large files and many snippets.

**Requirements:**

- Maximum file size limit (default 1MB, configurable)
- Asynchronous file I/O with cancellation tokens
- Debounce snippet detection during typing
- Limit concurrent file operations (max 10)
- Implement incremental processing
- LRU cache with size limits
- Display warnings for oversized files

**Implementation Notes:**

- Check file size before reading with `fs.stat()`
- Use `workspace.fs.readFile()` (async API)
- Implement cancellation token pattern
- Add timeouts to prevent hanging (5 seconds max)
- Cache with TTL and size limits

**Testing:**

- Unit tests with various file sizes
- Test files at/near/over limit
- Test concurrent operations
- Performance benchmarks

**Effort:** 4-5 days

#### 4. Asynchronous File Loading (continued from above)

**Description:** Load snippet files asynchronously to avoid blocking UI.

**Requirements:**

- Use `workspace.fs.readFile()` (async)
- Show loading indicator in preview: "Loading..."
- Use cancellation tokens
- Handle concurrent requests properly

**Implementation Notes:**

- Implement async/await pattern
- Cache loaded content with TTL
- Debounce rapid toggle requests

**Testing:**

- Unit tests with mocked file system
- Test cancellation behavior
- Test race conditions

#### 5. Recursive Snippet Processing

**Description:** Expand nested snippet references in previews.

**Requirements:**

- Process `--8<--` directives in snippet files recursively
- Maximum depth: 100 levels
- Circular reference detection
- Show error for circular references
- Maintain processing chain for error context

**Implementation Notes:**

- Implement recursive snippet expander
- Track visited files with normalized paths
- Add depth counter
- Timeout protection (5 seconds max)

**Testing:**

- Unit tests for circular detection
- Test various depth levels
- Test mixed valid/circular references
- Fuzz testing with random chains

#### 6. Auto-Refresh on File Changes

**Description:** Update previews when snippet files are modified.

**Requirements:**

- Watch referenced snippet files using `FileSystemWatcher`
- Invalidate cache when files change
- Re-render affected previews
- Handle dependency chains (A includes B includes C)
- Debounce rapid changes (500ms)

**Implementation Notes:**

- Create watchers for all referenced files
- Track reverse dependencies (which files include which)
- Dispose watchers when not needed
- Limit concurrent watchers (resource management)

**Testing:**

- Integration tests with file modifications
- Test dependency chain updates
- Test debouncing behavior

#### 7. Comprehensive Error Handling

**Description:** Handle all error conditions specified in requirements.

**Requirements:**

- Missing files
- Permission denied
- Invalid path syntax
- Invalid section specifications
- Line ranges out of bounds
- Unsaved file warnings
- Proper error context chains for recursive snippets

**Implementation Notes:**

- Standardize error message formatting
- Implement error context tracking
- Create diagnostic for each error type
- Log errors to output channel

**Testing:**

- Unit tests for each error condition
- Integration tests verifying diagnostics
- Test error messages format

#### 8. File Size Limits

**Description:** Prevent loading extremely large files.

**Settings:**

```json
{
  "mkdocsLens.maxFileSize": {
    "type": "number",
    "default": 1048576,
    "description": "Maximum file size in bytes (default 1MB)"
  }
}
```

**Requirements:**

- Check file size before loading
- Show warning if file exceeds limit
- Display in preview: "File too large (X MB). Limit: Y MB."
- Don't crash or hang on large files

**Implementation Notes:**

- Use `fs.stat()` to check size before reading
- Enforce timeout on file reads (5 seconds)

**Testing:**

- Unit tests with various file sizes
- Test with files at/near/over limit

#### 9. State Persistence

**Description:** Remember preview state across VS Code sessions.

**Settings:**

```json
{
  "mkdocsLens.defaultPreviewState": {
    "type": "string",
    "enum": ["on", "off", "remember"],
    "default": "off",
    "description": "Default preview state"
  }
}
```

**Requirements:**

- "on": All previews shown by default
- "off": All previews hidden by default
- "remember": Restore last global toggle state per workspace
- Use workspace state storage

**Implementation Notes:**

- Use `context.workspaceState` API
- Store per-document or per-workspace
- Restore on document open

**Testing:**

- Integration tests for state persistence
- Test all three modes
- Test workspace changes

### Development Tasks

**Phase 1: Security (Weeks 1-2)**

- [ ] Implement path traversal protection (Issue #52)
  - [ ] Path validation logic
  - [ ] Workspace boundary checking
  - [ ] Unit tests with malicious paths
  - [ ] Cross-platform testing
- [ ] Implement symlink validation (Issue #54)
  - [ ] Symlink resolution with `fs.realpath()`
  - [ ] Circular reference detection
  - [ ] Depth limit enforcement
  - [ ] Comprehensive testing

**Phase 2: Performance (Weeks 3-4)**

- [ ] Implement file size limits (Issue #51)
  - [ ] Add `maxFileSize` setting
  - [ ] Check size before loading
  - [ ] Display warnings for large files
  - [ ] Unit tests
- [ ] Implement async file loading
  - [ ] Use `workspace.fs.readFile()`
  - [ ] Cancellation token pattern
  - [ ] Loading indicators
  - [ ] Race condition tests

**Phase 3: Advanced Features (Weeks 5-7)**

- [ ] Recursive snippet processing
  - [ ] Recursive expander implementation
  - [ ] Circular reference detection
  - [ ] Depth limit and timeout
  - [ ] Extensive testing
- [ ] Auto-refresh on file changes
  - [ ] File system watchers
  - [ ] Dependency tracking
  - [ ] Cache invalidation
  - [ ] Debouncing logic

**Phase 4: Error Handling & Polish (Week 8)**

- [ ] Comprehensive error handling
  - [ ] All error types from requirements
  - [ ] Error context chains
  - [ ] Improved error messages
  - [ ] Integration tests
- [ ] State persistence
  - [ ] Implement workspace state storage
  - [ ] Test all three modes
  - [ ] Test across sessions

**Phase 5: Multi-Root Workspaces (Weeks 9-10, if included)**

- [ ] Implement multi-root workspace support (Issue #47, if deferred from v0.3.0)
  - [ ] Per-folder config loading
  - [ ] Multiple file watchers
  - [ ] DiagnosticManager refactor
  - [ ] Comprehensive testing

**Phase 6: Testing & Release (Weeks 9-10 or 11-12)**

- [ ] Achieve 100% test coverage
- [ ] Configure tests to fail if coverage < 100%
- [ ] Cross-platform testing
- [ ] Performance benchmarks
  - [ ] Large file handling
  - [ ] Many snippets in one file
  - [ ] Recursive depth testing
- [ ] Security testing
  - [ ] Penetration testing with malicious paths
  - [ ] Symlink exploit attempts
- [ ] Documentation updates
  - [ ] README with security features
  - [ ] CHANGELOG (auto-generated)
  - [ ] Security documentation
- [ ] Create v0.4.0 release
- [ ] Publish to marketplace

---

## v0.5.0 - URL Snippets and Remote Content

**Goal:** Support including content from remote URLs with proper caching and
security.

**Timeline:** TBD

**Success Criteria:**

- URL snippets functional with HTTP/HTTPS
- Download caching implemented (memory + disk)
- Timeout and size limits enforced
- Security validation for URL schemes
- Code coverage == 100%
- Tests fail if coverage < 100%

### Features In Scope

#### 1. URL Snippets

**Description:** Support including content from remote URLs.

**Syntax:**

```markdown
--8<-- "https://raw.githubusercontent.com/user/repo/main/file.md"
```

**Requirements:**

- Download content from HTTP/HTTPS URLs
- Apply configurable timeout (default: 10 seconds)
- Apply configurable max size (default: ~32 MiB)
- Show diagnostic on download failure
- Cache downloaded content (memory + disk)
- Support all line range/section syntax with URLs
- Nested snippets within URL content must also be URLs (no local files)

**Security Considerations:**

- Validate URL schemes (only http/https)
- Respect max size limits
- Handle timeouts gracefully
- Consider workspace trust settings

**Implementation Notes:**

- Use VS Code's fetch API or Node.js https module
- Implement download cache with TTL
- Add configuration settings for timeout/size
- Path resolver must distinguish URLs from local paths

**Testing:**

- Unit tests for URL detection
- Integration tests with mock HTTP server
- Test timeout and size limit enforcement
- Test nested snippet restrictions

#### 2. HTTP Retry Logic

**Description:** Retry failed downloads with exponential backoff.

**Requirements:**

- Configurable retry count (default: 3)
- Exponential backoff strategy
- Show progress in status bar
- Allow user to cancel retries

**Testing:**

- Unit tests for retry logic
- Integration tests with simulated failures

#### 3. Custom HTTP Headers

**Description:** Allow custom headers for authenticated requests.

**Settings:**

```json
{
  "mkdocsLens.httpHeaders": {
    "type": "object",
    "default": {},
    "description": "Custom HTTP headers for URL snippets"
  }
}
```

**Security Notes:**

- Never log header values
- Support authentication tokens securely

### Development Tasks

- [ ] Implement URL detection and validation
- [ ] HTTP client with timeout and size limits
- [ ] Download cache implementation
- [ ] Retry logic with exponential backoff
- [ ] Custom HTTP headers support
- [ ] Security testing for URL schemes
- [ ] Integration tests with mock HTTP server
- [ ] Create v0.5.0 release

---

## v1.0.0 - Production Ready

**Status:** Planned

**Goal:** Security hardening, performance optimization, complete documentation,
accessibility features. Ready for marketplace publication.

**Timeline:** Q3 2026 (estimated 6-8 weeks)

**Success Criteria:**

- All security requirements met
- Performance targets achieved (< 50ms sync, < 200ms perceived)
- Full accessibility features implemented (Issue #53)
- Full documentation complete
- Code coverage == 100%
- Tests fail if coverage < 100%
- CI/CD pipeline operational (fails on coverage < 100%)
- Published to VS Code Marketplace

**Related GitHub Issues:**

- [#53 - Accessibility: Add screen reader support and keyboard
  navigation](https://github.com/main-branch/mkdocs-snippet-lens/issues/53)

### Features In Scope

#### 1. Security Hardening

**Requirements:**

- Path traversal protection (workspace boundary enforcement)
- Symlink handling with security validation
- `enablePathTraversalProtection` setting (default: true)
- `followSymlinks` setting (default: true)
- Security logging to output channel
- Code security review

**Implementation Notes:**

- Normalize and validate all resolved paths
- Implement symlink resolution with depth limits
- Detect circular symlinks
- Log all blocked access attempts

**Testing:**

- Security-focused unit tests
- Penetration testing with malicious paths
- Symlink attack scenarios

#### 2. Performance Optimization

**Requirements:**

- Meet performance targets from requirements
- Implement LRU cache (100 entries or 10MB)
- Limit concurrent file I/O (10 max)
- Incremental processing
- Memory usage < 50MB typical, < 200MB max

**Implementation Notes:**

- Profile extension with DevTools
- Optimize hot paths
- Implement request coalescing
- Use incremental document parsing

**Testing:**

- Performance benchmarks
- Load testing with many snippets
- Memory profiling

#### 3. Accessibility Features - Issue #53

**Priority:** HIGH - User inclusion requirement

**Requirements:**

- Follow VS Code accessibility guidelines
- Ensure all commands are keyboard accessible
- Add screen reader support for snippet previews
- Add status announcements for actions
- Test with NVDA, JAWS, VoiceOver
- Add ARIA labels for UI elements
- Prepare messages for future localization

**Implementation Notes:**

- Implement `HoverProvider`
- Use theme colors exclusively
- Test with screen readers
- Add ARIA labels where applicable

**Testing:**

- Manual testing with NVDA/JAWS/VoiceOver
- High contrast theme testing
- Keyboard-only workflow testing

#### 4. Complete Documentation

**Requirements:**

- README with screenshots/GIFs
- CHANGELOG
- LICENSE (MIT)
- Contributing guidelines (basic)
- Code documentation (JSDoc)

**Implementation Notes:**

- Create high-quality screenshots
- Record demo GIFs
- Document all settings
- Include troubleshooting section

#### 5. Marketplace Publishing Automation

**Requirements:**

- Automated marketplace publishing on release
- VSCE integration with GitHub Actions
- .vsix upload to GitHub releases
- Pre-publish validation checks

**Implementation Notes:**

- Extend existing release workflow with publish job
- Configure VSCE_PAT secret in repository
- Test marketplace publish in fork/staging
- Document manual publish fallback process

**Testing:**

- Dry-run marketplace publish with --dry-run flag
- Test .vsix installation locally
- Verify all marketplace metadata

### Development Tasks

**Week 13: Security**

- [ ] Implement path traversal protection
- [ ] Symlink security handling
- [ ] Security testing and review
- [ ] Security logging

**Week 14: Performance**

- [ ] Performance profiling
- [ ] Implement caching
- [ ] Optimize critical paths
- [ ] Memory optimization

**Week 15: Accessibility & Docs**

- [ ] Implement accessibility features
- [ ] Complete README with visuals
- [ ] Write contributing guidelines
- [ ] Code documentation review

**Week 16: Marketplace Publishing & Release**

- [ ] Configure VSCE_PAT secret
- [ ] Add marketplace publish job to release workflow
- [ ] Test publish workflow in staging
- [ ] Publish v1.0.0 to marketplace
- [ ] Verify marketplace listing

---

## Command Implementation Schedule

This section maps the commands defined in [REQUIREMENTS.md Section
2.5](REQUIREMENTS.md#25-feature-command-palette-commands) to their implementation
phases.

### v0.1.0 - MVP Commands

**Essential for basic functionality:**

- `mkdocsLens.toggleAllPreviews` - Core command for showing/hiding all previews

**Rationale:** Start with single toggle command to prove concept and get user
feedback.

### v0.2.0 - Enhanced Control Commands

**Added for better UX:**

- `mkdocsLens.showAllPreviews` - Explicit show (clearer intent than toggle)
- `mkdocsLens.hideAllPreviews` - Explicit hide (clearer intent than toggle)
- `mkdocsLens.toggleCurrentPreview` - Per-snippet control via CodeLens
- `mkdocsLens.refreshAllPreviews` - Manual refresh capability

**Context Keys Implemented:**

- `mkdocsLens:hasSnippetAtCursor` - Enables commands for current snippet
- `mkdocsLens:hasSnippets` - Enables document-level commands

**Rationale:** Users need granular control. Explicit show/hide commands avoid
confusion about toggle state.

### v0.3.0 - Navigation & Refresh Commands

**Added for workflow efficiency:**

- `mkdocsLens.refreshCurrentPreview` - Refresh single snippet
- `mkdocsLens.goToNextSnippet` - Navigate forward through snippets
- `mkdocsLens.goToPreviousSnippet` - Navigate backward through snippets

**Rationale:** Navigation commands improve productivity when working with many
snippets. Targeted refresh reduces unnecessary reloads.

### v1.1.0+ - Future Commands

**Deferred for user feedback:**

- `mkdocsLens.copySnippetContent` - Accessibility feature for screen readers
- `mkdocsLens.openSnippetBeside` - Power user feature for split editing
- `mkdocsLens.clearCache` - Debug/troubleshooting utility
- `mkdocsLens.showOutputChannel` - Debug/troubleshooting utility

**Rationale:** Prioritize core functionality first. Add utility commands based on
user requests and issues.

---

## Future Releases (v1.1.0+)

### Potential Features (Not Yet Scheduled)

**Advanced Syntax Support:**

- Multiple line ranges: `file.ext:1:3,5:6`
- Negative indexes: `file.ext:-5`
- More complex range expressions

**Multi-Root Workspace Support:**

- Cross-folder snippet references
- Folder-specific configuration
- Workspace-wide snippet search

**Enhanced UX:**

- Inline decorations showing snippet type (section, lines, etc.)
- Quick fix actions for errors
- Snippet content search
- Copy snippet to clipboard command

**Advanced Settings:**

- Custom snippet syntax patterns
- Preview styling customization
- File type filters
- Ignore patterns

**Performance:**

- Virtual scrolling for large previews
- Incremental syntax highlighting
- Worker threads for heavy processing

**Accessibility:**

- Alternative text for all visual elements
- Customizable announcements
- Enhanced screen reader support

**Developer Experience:**

- API for other extensions to use snippet parser
- Extension point for custom snippet processors
- Telemetry (opt-in) for usage analytics

### Prioritization Criteria for Future Features

1. **User demand** - requested by multiple users
2. **Value delivered** - high impact on productivity
3. **Implementation cost** - effort required
4. **Risk** - technical complexity and potential issues
5. **Strategic fit** - aligns with extension vision

### Feature Request Process

1. User submits GitHub issue with feature request template
2. Maintainer reviews and labels (enhancement, needs-discussion, etc.)
3. Community discussion and voting (thumbs up)
4. Prioritization in quarterly planning
5. Assignment to milestone (v1.1, v1.2, etc.)
6. Implementation and release

---

## Release Process

### Version Numbering

Follow **Semantic Versioning (SemVer)**:

- **MAJOR** (1.0.0): Breaking changes (rare)
- **MINOR** (1.1.0): New features, backwards compatible
- **PATCH** (1.0.1): Bug fixes

Pre-1.0 versions (0.x.y):

- MINOR for features
- PATCH for bug fixes
- Breaking changes allowed without major bump

### Release Checklist

Before each release:

- [ ] All planned features complete
- [ ] Test coverage == 100%
- [ ] Tests configured to fail if coverage < 100%
- [ ] CI configured to fail on insufficient coverage
- [ ] All tests passing on all platforms
- [ ] No known critical bugs
- [ ] CHANGELOG updated
- [ ] README updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] GitHub release created
- [ ] Marketplace updated (v1.0+)

### Post-Release Activities

- [ ] Monitor GitHub issues for bug reports
- [ ] Check marketplace reviews
- [ ] Monitor telemetry (if implemented)
- [ ] Announce on social media/communities
- [ ] Plan next iteration

---

## Development Standards

### Development Methodology

**This project uses Test Driven Development (TDD).**

#### TDD Process (Mandatory)

All features must be developed using the Red-Green-Refactor cycle:

1. **Write a failing test** - Write only enough test code to fail
2. **Make it pass** - Write minimal implementation to pass the test
3. **Refactor** - Improve code quality while keeping tests green
4. **Repeat** - Continue with next test

**Key Principles:**
- Tests written BEFORE implementation
- No code written without a failing test first
- Highly iterative - many small cycles
- No premature implementation or features
- Tests drive the design

### Code Quality

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with recommended rules
- **Formatting:** Prettier (or consistent manual formatting)
- **Testing:** 100% coverage required, enforced by test runner and CI
- **Documentation:** JSDoc for all public APIs

### Git Workflow

- **Branch:** Feature branches from main (`feat/snippet-detection`)
- **Commits:** Conventional Commits format
- **PR:** Required for all changes, self-review thoroughly
- **Main:** Always deployable, protected branch

### Testing Strategy

**All testing follows TDD methodology - tests written before implementation.**

- **Unit tests:** 70-80% of test suite (written first, drive implementation)
- **Integration tests:** 15-25% of test suite (written before integration code)
- **E2E tests:** 5-10% of test suite (written before end-to-end features)
- **Manual testing:** Before each release, all platforms
- **Coverage requirement:** 100% across all test types
- **Enforcement:** Tests must fail if coverage < 100%, CI must fail

**TDD Workflow:**
- Write failing test → Run test (verify RED) → Write minimal code → Run test (verify
  GREEN) → Refactor → Repeat

### Performance Budgets

- **Activation time:** < 500ms
- **Sync operations:** < 50ms
- **User-perceived actions:** < 200ms
- **Memory footprint:** < 50MB typical, < 200MB max
- **Extension size:** < 5MB

### Documentation Requirements

- **Code comments:** For complex logic, security-critical code
- **JSDoc:** All exported functions/classes
- **README:** Up-to-date with features and screenshots
- **CHANGELOG:** Updated with every release
- **Implementation.md:** Updated as plans change

---

## Risk Mitigation

Refer to [RISKS.md](RISKS.md) for comprehensive risk assessment.

**Key Risks to Monitor:**

1. **VS Code API limitations** - Prototype early
2. **Performance issues** - Profile and optimize continuously
3. **Scope creep** - Stick to plan, defer features to later versions
4. **Security vulnerabilities** - Review code carefully, use security tools
5. **Low adoption** - Focus on quality and user experience

---

## Success Metrics

### Technical Metrics

- Test coverage == 100% (enforced)
- Tests fail if coverage < 100%
- CI fails on insufficient coverage
- Performance targets met
- Zero critical bugs in production
- Clean security audit

### User Metrics (Post-1.0)

- 1,000+ installations in first 3 months
- 4+ star average rating
- < 10% negative reviews
- Active issue engagement (responses within 48 hours)

### Project Health

- Regular releases (monthly or quarterly)
- Maintainable codebase (low technical debt)
- Sustainable maintenance burden
- Positive community engagement

---

**Document Version:** 1.0 **Last Updated:** December 10, 2025 **Next Review:** After
v0.1.0 release
