
# MkDocs Snippet Lens

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/main-branch.mkdocs-snippet-lens?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=main-branch.mkdocs-snippet-lens)
[![Open VSX](https://img.shields.io/open-vsx/v/main-branch/mkdocs-snippet-lens?label=Open%20VSX&logo=openvsx)](https://open-vsx.org/extension/main-branch/mkdocs-snippet-lens)
[![GitHub Releases](https://img.shields.io/github/v/release/main-branch/mkdocs-snippet-lens?label=GitHub%20Releases)](https://github.com/main-branch/mkdocs-snippet-lens/releases/latest)

[![Continuous Integration](https://github.com/main-branch/mkdocs-snippet-lens/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/main-branch/mkdocs-snippet-lens/actions/workflows/continuous-integration.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Visual Studio Code extension that provides inline previews, clickable links, and
diagnostics for MkDocs `--8<--` snippet references in Markdown files.

## Features

- **Inline Previews**: See snippet content directly in your editor without opening the file
- **Clickable Links**: Navigate to snippet files with a single click
- **Error Diagnostics**: Get immediate feedback when snippet files are missing
- **Hover Previews**: View full snippet content on hover

### Clickable Links & Inline Previews

<p align="center">
  <img
    src="./images/example01.gif"
    alt="Example showing basic snippet lens functionality"
    style="max-width: 700px; width: 100%;"
  >
</p>

### Error Diagnostics

<p align="center">
  <img
    src="./images/example02.gif"
    alt="Example showing how missing snippet files are handled"
    style="max-width: 700px; width: 100%;"
  >
</p>

### Planned Features

- Advanced line range syntax (start-only, end-only, negative indexes)
- Block format for multiple file inclusion
- Disabled and escaped snippet references
- URL snippets (include content from remote URLs)
- Recursive snippet expansion and circular reference detection
- Per-snippet preview toggles with CodeLens
- Performance and scalability for a large number of snippets or large snippet files
- Advanced error handling (invalid paths, permissions, section markers, recursion)
- Accessibility and i18n support
- Auto-refresh on snippet file changes

These features are planned for future releases.

## Installation

You can install MkDocs Snippet Lens from any of these sources:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=main-branch.mkdocs-snippet-lens)
- [Open VSX Registry](https://open-vsx.org/extension/main-branch/mkdocs-snippet-lens)
- [Download latest VSIX from GitHub Releases](https://github.com/main-branch/mkdocs-snippet-lens/releases/latest)

Or build from source.

## Extension Settings

This extension contributes the following settings:

- `mkdocsSnippetLens.basePath`: Base directory for resolving snippet paths (relative to
  workspace root)
- `mkdocsSnippetLens.previewMaxLines`: Maximum number of lines to show in inline preview
  (default: 20)
- `mkdocsSnippetLens.previewMaxChars`: Maximum number of characters to show in inline
  preview (default: 200)
- `mkdocsSnippetLens.strictMode`: Control diagnostic severity for missing snippets
  - `"auto"` (default): Automatically reads `check_paths` setting from `mkdocs.yml`
  - `"true"`: Always show errors (red squiggles)
  - `"false"`: Always show warnings (yellow squiggles)

## Commands

- `MkDocs Snippet Lens: Toggle All Previews`: Toggle inline previews on/off

## Known Issues

### Ambiguous Multi-Range Pattern Detection

When a multi-range pattern is malformed (e.g., `--8<-- "file.md:1:3,invalid"` where one
of the ranges contains non-numeric parts or is incomplete like `"file.md:1:,5:7"`), the
extension will:

1. Still parse the reference (falling back to treating it as a section reference)
2. Display a diagnostic warning to alert you about the ambiguous pattern
3. Show the specific issue in the error message (e.g., "Multi-range pattern contains
   non-numeric part: 'invalid'")

This helps catch typos in multi-range patterns while allowing the extension to continue
functioning. To avoid warnings, ensure multi-range patterns use the correct format with
all ranges as numeric pairs: `--8<-- "file.md:1:3,5:7"`

See the
[issue tracker](https://github.com/main-branch/mkdocs-snippet-lens/issues) for known
issues.

## Contributing

Contributions are welcome! Please read our
[Contributing Guide](CONTRIBUTING.md) for details on our development workflow,
including:

- Working on feature branches (never commit directly to `main`)
- Creating and submitting pull requests
- Rebase requirements for fast-forward merges
- Code review process

## License

This extension is licensed under the [MIT License](LICENSE).
