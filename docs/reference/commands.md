---
title: Sintesi CLI Commands Reference
description: 'Verified CLI subcommands for sintesi-monorepo-root: changeset, check, readme, and documentation.'
icon: 🧭
order: 3
---

# Sintesi CLI Command Reference

This document lists the verified CLI subcommands exposed by the Sintesi tool in this monorepo.

**Available Commands**:

- `changeset`
- `check`
- `readme`
- `documentation`

---

## `changeset`

**Purpose**: Generate a changeset file from code changes using AI (with optional manual overrides).

### Flags

| Flag             | Alias | Description                         | Default      |
| :--------------- | :---- | :---------------------------------- | :----------- |
| `--base-branch`  | `-b`  | Base branch to compare against      | `main`       |
| `--staged-only`  | `-s`  | Only analyze staged changes         | `false`      |
| `--package-name` | `-p`  | Package name for the changeset      | (auto)       |
| `--output-dir`   | `-o`  | Output directory                    | `.changeset` |
| `--skip-ai`      |       | Skip AI analysis (use defaults)     | `false`      |
| `--version-type` | `-t`  | `major` \| `minor` \| `patch`       |              |
| `--description`  | `-d`  | Manually specify description        |              |
| `--verbose`      |       | Enable verbose logging              | `false`      |
| `--interactive`  | `-i`  | Force interactive package selection | `false`      |
| `--force-fetch`  |       | Fetch latest changes from remote    | `false`      |

### Examples

```bash
# Basic usage (AI-assisted)
sintesi changeset

# Scoped to staged changes
sintesi changeset --staged-only

# Manual override
sintesi changeset -t minor -d "Add new feature" --skip-ai

# Force fetch before analysis
sintesi changeset --force-fetch
```

**CI Usage**: Exits with code 0 on success, 1 on failure. Requires `@changesets/cli` installed.

---

## `check`

**Purpose**: Verify that documentation is in sync with code. Supports both README drift and documentation site drift checks, with AI-assisted drift detection.

### Flags

| Flag              | Alias   | Description                              | Default |
| :---------------- | :------ | :--------------------------------------- | :------ |
| `--verbose`       |         | Enable verbose logging                   | `false` |
| `--strict`        |         | Exit with error code if drift detected   | `true`  |
| `--smart`         |         | Use AI to detect high-level drift        | `true`  |
| `--base`          |         | Base ref for drift comparison            |         |
| `--readme`        |         | Check only README drift                  | `false` |
| `--documentation` | `--doc` | Check only documentation drift           | `false` |
| `--output`        | `-o`    | Output file path for README check        |         |
| `--output-dir`    | `-d`    | Output directory for documentation check |         |

### Examples

```bash
# Standard check
sintesi check

# Verbose output
sintesi check --verbose

# Scope to README only
sintesi check --readme

# Scope to documentation site only
sintesi check --documentation
```

**CI Usage**: Exits with code 0 if no drift is detected (or strict is false). Exits with code 1 if drift is detected in strict mode.

---

## `readme`

**Purpose**: Generate a `README.md` based on project context.

### Flags

| Flag        | Alias | Description             | Default     |
| :---------- | :---- | :---------------------- | :---------- |
| `--output`  | `-o`  | Output file path        | `README.md` |
| `--force`   | `-f`  | Overwrite existing file | `false`     |
| `--verbose` |       | Enable verbose logging  | `false`     |

### Examples

```bash
# Generate README
sintesi readme

# Force overwrite
sintesi readme --force
```

**CI Usage**: Run to generate or update README. Exits with code 0 on success.

---

## `documentation`

**Purpose**: Generate comprehensive documentation site structure and content.

### Flags

| Flag           | Alias | Description             | Default |
| :------------- | :---- | :---------------------- | :------ |
| `--output-dir` | `-o`  | Output directory        | `docs`  |
| `--force`      | `-f`  | Force full regeneration | `false` |
| `--verbose`    |       | Enable verbose logging  | `false` |

### Examples

```bash
# Generate documentation
sintesi documentation

# Force full regeneration
sintesi documentation --force
```

**CI Usage**: Run to generate the documentation site. Exits with code 0 on success.

---

::: info Note
Flags shown above reflect what is implemented in the source code and tests. The command context relies on the repository URL defined in the package context.
:::
