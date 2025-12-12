# Contributing to MkDocs Snippet Lens

First, thank you for considering contributing to MkDocs Snippet Lens. This project is
a community effort, and every contribution is valued.

This guide outlines the standards and procedures for contributing, from setting up your
environment to submitting your changes. Please read it carefully to ensure your
contributions can be merged smoothly.

- [TLDR](#tldr)
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
  - [Prerequisites](#prerequisites)
  - [Install Dependencies and Tooling](#install-dependencies-and-tooling)
  - [Editor Setup (VS Code)](#editor-setup-vs-code)
- [Development Workflow](#development-workflow)
  - [Main Command](#main-command)
  - [Other Useful Commands](#other-useful-commands)
- [Testing \& Coverage](#testing--coverage)
  - [Coverage Requirement](#coverage-requirement)
  - [Running Tests Locally](#running-tests-locally)
  - [Adding Tests for New Code](#adding-tests-for-new-code)
  - [Common Patterns for Testability](#common-patterns-for-testability)
  - [Viewing Coverage Reports](#viewing-coverage-reports)
- [Submitting Changes](#submitting-changes)
  - [Commit Message Format](#commit-message-format)
  - [Pull Request Process](#pull-request-process)
- [Automation Pipeline](#automation-pipeline)

## TLDR

Here are the most important guidelines:

- **Prerequisites**: You must have Node.js (>= 20) and npm installed.
- **One-Time Setup**: Run `npm ci` after cloning to install all development dependencies
  and Git hooks.
- **Conventional Commits**: All commit messages must follow the Conventional Commits
  standard (e.g., `feat: ...`, `fix: ...`). A local Git hook will enforce this.
- **Tests are Required**: All new features or bug fixes must include corresponding
  tests.
- **Update Documentation**: Any change that impacts users (new features, settings, etc.)
  must be documented appropriately.
- **Ensure CI passes locally**: Before submitting a pull request, run `npm run test:all`
  and ensure all checks (linting, testing, building) pass.
- **Rebase Workflow**: Always work on a new branch. Your pull request must be rebased on
  the latest `main` branch before it will be merged with a fast-forward merge.

## Code of Conduct

This project and everyone participating in it is governed by our community standards.
By participating, you are expected to uphold respectful and professional behavior.

## Getting Started

Before you begin, you'll need to fork and clone the repository.

1. Fork the repository on GitHub.

2. Clone your fork to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/mkdocs-snippet-lens.git
   cd mkdocs-snippet-lens
   ```

3. Add the upstream remote to keep your fork in sync:

   ```bash
   git remote add upstream https://github.com/main-branch/mkdocs-snippet-lens.git
   ```

## Development Environment Setup

This project uses Node.js and TypeScript for the VS Code extension, with npm for
dependency management and tooling.

### Prerequisites

You must have the following tools installed on your local machine:

- **Node.js**: Version 20.0.0 or newer.
- **npm**: This is included with Node.js.
- **Visual Studio Code**: For testing the extension.

### Install Dependencies and Tooling

Once you have the prerequisites, you can install all project dependencies and
development tools by running:

```bash
npm ci
```

This command will:

1. Install all Node.js dependencies from the `package-lock.json` file.
2. Run the `prepare` script in `package.json`, which uses Husky to set up the
   `commit-msg` Git hook (`.husky/commit-msg`).

The development tools (`eslint`, `typescript`, `mocha`, `c8`) are managed via
`package.json` and invoked with npm scripts. You do not need to install them globally.

If you later pull changes that modify `package-lock.json`, re-run `npm ci` to keep
local development tooling in sync.

### Editor Setup (VS Code)

For the best development experience, we recommend using VS Code with the following
extensions:

- **ESLint**: `dbaeumer.vscode-eslint`
- **TypeScript and JavaScript Language Features**: Built-in

This repository includes a `.vscode/settings.json` file that will automatically
configure these extensions to use the project's rules.

## Development Workflow

The `package.json` scripts are the single source of truth for all common development
tasks.

### Main Command

Before submitting a pull request, you must run the full test suite locally:

```bash
npm run test:all
```

This command runs unit tests and integration tests on your local machine. This is
similar to what our GitHub workflow uses.

### Other Useful Commands

- `npm run lint` - Run ESLint to check code style
- `npm run check-types` - Run TypeScript type checking
- `npm run test:unit` - Run unit tests with coverage
- `npm run test:integration` - Run integration tests in VS Code
- `npm run compile` - Build the extension
- `npm run watch` - Watch mode for development

## Testing & Coverage

This project enforces 100% statement coverage on business logic modules to maintain
code quality and ensure all code paths are tested.

### Coverage Requirement

All contributions must maintain 100% statement coverage for business logic modules. The
CI pipeline will automatically fail if coverage drops below this threshold.

Note: VS Code integration modules (`extension.ts`, `snippetLinkProvider.ts`,
`snippetHoverProvider.ts`, `previewManager.ts`, `diagnosticManager.ts`) are excluded
from coverage requirements as they are tested via integration tests.

### Running Tests Locally

```bash
# Run unit tests with coverage
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

### Adding Tests for New Code

When adding new features or fixing bugs:

1. Write tests that cover all new code paths
2. Run `npm run test:unit` to verify 100% coverage on business logic
3. If coverage is below 100%, review the coverage report to identify uncovered lines
4. Add tests for the uncovered statements

### Common Patterns for Testability

The codebase follows these patterns to enable testing:

- **Separate business logic from VS Code integration**: Business logic modules are in
  pure TypeScript functions that can be tested in isolation.
- **Integration tests for VS Code features**: Features that require VS Code APIs are
  tested via integration tests that run in a real VS Code environment.

Example:

```typescript
// Business logic (100% coverage required)
export function createDiagnosticInfos(
  locations: SnippetLocation[],
  resolver: (path: string) => string | null
): DiagnosticInfo[] {
  // Pure function - easily testable
}

// VS Code integration (integration tests)
export class DiagnosticManager {
  updateDiagnostics(document: vscode.TextDocument): void {
    // Uses VS Code APIs - tested via integration
  }
}
```

### Viewing Coverage Reports

After running `npm run test:unit`, you can view the coverage report:

1. Open `coverage/lcov-report/index.html` in your browser
2. Click on individual files to see line-by-line coverage

## Submitting Changes

### Commit Message Format

This project uses Conventional Commits. This format is strictly enforced by a Git hook
and our CI pipeline.

For the full specification and examples, see the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) website.

After running `npm ci`, a `commit-msg` hook is installed that automatically lints your
commit message with `commitlint`.

- Your commit message must follow the format: `<type>(<scope>): <subject>`.
- Allowed types are: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`, `revert`.
- For details on all rules, see `.commitlintrc.yml`.

Examples:

- `feat(diagnostics): add error highlighting for missing files`
- `fix: correct path resolution on Windows`
- `docs: update installation instructions in README`

### Pull Request Process

1. Create a feature branch from the `main` branch.

2. Make your changes.

   **Important Contributor Requirements**

   - **All new code requires tests**: Any new feature or bug fix must be accompanied by
     corresponding tests.
   - **Documentation must be updated**: Any change that impacts user behavior (new
     commands, settings, etc.) must be documented in the `README.md`.

3. Ensure your code passes all local checks by running `npm run test:all`.

4. Rebase your branch on the latest `main`:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

   If you encounter conflicts during the rebase, resolve them and continue:

   ```bash
   git add <files>
   git rebase --continue
   ```

5. Push your branch and open a pull request against `main-branch/mkdocs-snippet-lens:main`.

6. Ensure all CI checks on the pull request pass.

## Automation Pipeline

We use a set of GitHub Actions to automate linting, testing, and quality checks.

- **Continuous Integration**: On every pull request,
  `.github/workflows/continuous-integration.yml` runs linting, type checking, unit
  tests, integration tests (on Ubuntu, macOS, and Windows), and builds the extension.
- **Conventional Commits**: Commit messages are validated during CI to ensure they
  follow the Conventional Commits standard.
- **100% Coverage**: The CI pipeline enforces 100% statement coverage on business logic
  modules.
