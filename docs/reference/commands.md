---
title: CLI Commands
description: Comprehensive reference for all available Sintesi CLI commands.
icon: ⌨️
order: 20
---

# CLI Commands Reference for sintesi-monorepo-root

This document provides a comprehensive reference for all available CLI commands in the `sintesi-monorepo-root` project. The commands are designed to facilitate various tasks within the monorepo, enhancing development efficiency and project management.

## Available Commands

### 1. `check`

The `check` command verifies that documentation is in sync with code by detecting drift.

#### Usage
```bash
sintesi check
```

#### Description
- Performs a smart check to validate that the README and documentation are in sync with the codebase.
- Saves context for other commands to consume if drift is detected.

#### Options
- `--verbose`: Provides detailed output of the checks performed.
- `--base <branch>`: Specifies the base branch for comparison (default is `main`).
- `--readme`: Checks only for README drift.
- `--documentation`: Checks only for documentation drift.
- `--strict`: Exit with error code if drift detected (default: true).

#### Usage Examples
```bash
sintesi check -- --verbose --base main
sintesi check -- --readme --no-strict --verbose
sintesi check -- --documentation --no-strict --verbose
```

---

### 2. `readme`

The `readme` command generates or updates the README file for the project.

#### Usage
```bash
sintesi readme
```

#### Description
- Creates or updates the README file based on the current project context.
- Integrates recent code changes and suggestions from previous checks.
- Skips generation if no relevant code changes are detected, unless forced.

#### Options
- `--output <path>`: Specifies the output path for the README file (default is `README.md`).
- `--force`: Forces a regeneration of README, bypassing existing checks.
- `--verbose`: Provides detailed output during the generation process.

#### Usage Examples
```bash
sintesi readme -- --output README.md --force
```

---

### 3. `changeset`

The `changeset` command generates changesets from code changes using AI.

#### Usage
```bash
sintesi changeset
```

#### Description
- Analyzes git diff to find changed files.
- Uses AI to determine version type (major/minor/patch) and description.
- Generates a changeset file in the `.changeset` directory.

#### Options
- `--base-branch <branch>`: Specifies the base branch for comparison (default is `main`).
- `--staged-only`: Analyzes only staged changes.
- `--package-name <name>`: Package name for the changeset (auto-detected from package.json if not specified).
- `--output-dir <path>`: Specifies the output directory for the changeset file (default is `.changeset`).
- `--no-ai`: Disables AI usage for version type and description.
- `--version-type <type>`: Manually specify version type (`major`, `minor`, `patch`).
- `--description <text>`: Manually specify description.
- `--interactive`: Enables interactive package selection.
- `--verbose`: Provides detailed output during the changeset generation process.
- `--force-fetch`: Fetches from the specified base branch when true.

#### Usage Examples
```bash
sintesi changeset -- --base-branch main --staged-only
sintesi changeset -- --no-ai --version-type minor --description "New feature"
```

---

### 4. `documentation`

The `documentation` command automates the generation of project documentation based on the current codebase.

#### Usage
```bash
sintesi documentation
```

#### Description
- Analyzes the project structure and generates documentation files.
- Skips generation if no relevant code changes are detected.

#### Options
- `--output-dir <path>`: Specifies the output directory for the generated documentation (default is `docs`).
- `--verbose`: Provides detailed output during the documentation process.
- `--force`: Forces a regeneration of documentation, bypassing existing checks.

#### Usage Examples
```bash
sintesi documentation -- --output-dir docs --verbose --force
```

---

## Conclusion

These CLI commands are integral to the development workflow of the `sintesi-monorepo-root` project. By utilizing these commands, developers can streamline their processes, maintain project integrity, and enhance productivity. For further assistance or to report issues, please refer to the project's documentation or contact the development team.
