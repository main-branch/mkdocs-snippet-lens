# MkDocs Snippet Lens

[![CI](https://github.com/main-branch/mkdocs-snippet-lens/actions/workflows/ci.yml/badge.svg)](https://github.com/main-branch/mkdocs-snippet-lens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Visual Studio Code extension that provides inline previews, clickable links, and
diagnostics for MkDocs `--8<--` snippet references in Markdown files.

## Features

- **Inline Previews**: See snippet content directly in your editor without opening the
  file
- **Clickable Links**: Navigate to snippet files with a single click
- **Error Diagnostics**: Get immediate feedback when snippet files are missing
- **Hover Previews**: View full snippet content on hover

## Installation

Install from the VS Code Marketplace or build from source.

## Extension Settings

This extension contributes the following settings:

- `mkdocsSnippetLens.basePath`: Base directory for resolving snippet paths (relative to
  workspace root)
- `mkdocsSnippetLens.previewMaxLines`: Maximum number of lines to show in inline preview
  (default: 20)
- `mkdocsSnippetLens.previewMaxChars`: Maximum number of characters to show in inline
  preview (default: 200)

## Commands

- `MkDocs Snippet Lens: Toggle All Previews`: Toggle inline previews on/off

## Known Issues

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
