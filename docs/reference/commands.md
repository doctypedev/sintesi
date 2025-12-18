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

Note: Command flags and exact flag names can change between releases. Always consult the official CLI index or the repository releases for the most up-to-date information:

- CLI reference (authoritative): https://sintesicli.dev/reference/commands.html
- Repository releases / changelog: https://github.com/doctypedev/sintesi/releases

Also note: boolean flags declared with yargs typically support implicit negation (for example `--strict` ⇄ `--no-strict`). Do not rely on implicit `--no-*` flags being removed unless the changelog or CLI index explicitly documents that change.

---

## `changeset`

**Purpose**: Generate a changeset file from code changes using AI (with optional manual overrides).

### Flags

| Flag             | Alias | Description                                       | Default                                            |
| :--------------- | :---- | :------------------------------------------------ | :------------------------------------------------- |
| `--base-branch`  | `-b`  | Base branch to compare against                    | `main`                                             |
| `--staged-only`  | `-s`  | Only analyze staged changes                       | `false`                                            |
| `--package-name` | `-p`  | Package name for the changeset                    | (auto-detected from package.json if not specified) |
| `--output-dir`   | `-o`  | Output directory for changeset                    | `.changeset`                                       |
| `--skip-ai`      |       | Skip AI analysis and use defaults                 | `false`                                            |
| `--version-type` | `-t`  | `major` \| `minor` \| `patch`                     | (auto)                                             |
| `--description`  | `-d`  | Manually specify description                      |                                                    |
| `--verbose`      |       | Enable verbose logging                            | `false`                                            |
| `--interactive`  | `-i`  | Force interactive package selection               | `false`                                            |
| `--force-fetch`  |       | Fetch latest changes from remote before analyzing | `false`                                            |

Notes:

- The CLI option `--skip-ai` maps to the internal `noAI` option when calling the command implementation.
- The command requires the `@changesets/cli` package to be installed in the project. If it's not present the command will fail with guidance on how to install it.

### Examples

```bash
# Basic usage (AI-assisted)
sintesi changeset

# Scoped to staged changes
sintesi changeset --staged-only

# Manual override (no AI)
sintesi changeset -t minor -d "Add new feature" --skip-ai

# Force fetch before analysis
sintesi changeset --force-fetch
```

CI Usage:

- The changeset command implementation does not explicitly call process.exit to enforce particular exit codes for success/failure. In normal runs the Node process will exit with code 0 if the command completes without throwing an unhandled error; if the command throws an unhandled error the process will exit with a non-zero code.
- CI consumers should detect failure by checking for non-zero exit codes and/or examining error output; do not rely on the handler emitting an explicit numeric exit via process.exit in the changeset path.
- Requires `@changesets/cli` installed.

---

## `check`

**Purpose**: Verify that documentation is in sync with code. Supports both README drift and documentation site drift checks, with AI-assisted drift detection.

### Flags

| Flag              | Alias   | Description                                                                                                                                                                                            | Default                        |
| :---------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------- |
| `--verbose`       |         | Enable verbose logging                                                                                                                                                                                 | `false`                        |
| `--strict`        |         | Exit with error code if drift detected                                                                                                                                                                 | `true`                         |
| `--smart`         |         | Use AI to detect high-level drift (e.g. README updates).                                                                                                                                               | `true`                         |
| `--base`          |         | Base ref / branch for smart check comparison. If provided, this explicit ref is used; if omitted the baseline is resolved from repository lineage / previous cached state (not a fixed `origin/main`). | (runtime-resolved — see notes) |
| `--readme`        |         | Check only README drift                                                                                                                                                                                | `false`                        |
| `--documentation` | `--doc` | Check only documentation site drift                                                                                                                                                                    | `false`                        |
| `--output`        | `-o`    | Output file path for README check                                                                                                                                                                      | `README.md` (if not provided)  |
| `--output-dir`    | `-d`    | Output directory for documentation check                                                                                                                                                               | `docs` (if not provided)       |

Notes:

- If neither `--readme` nor `--documentation` is specified the command runs both checks by default.
- The `--smart` option currently controls the AI-driven README check; it defaults to true and may be removed in a future major release once behavior is consolidated.
- Baseline resolution for the smart check:
    - If `--base` is provided, that explicit ref is used as the baseline for diffs/comparisons.
    - If `--base` is omitted, the command attempts to resolve the baseline from repository lineage / previously recorded state (cached SHAs or `.sintesi` state). This is a runtime resolution and not a fixed literal default such as `origin/main`.
    - If no usable baseline is found (neither an explicit `--base` nor prior cached state), the command will fail with a configuration error and suggest running `sintesi documentation` (or otherwise establishing baseline state).
- The table above indicates runtime-resolved defaults for flags that are not hard-coded literal defaults in the CLI implementation.

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

**CI Usage**: Exits with code 0 if no drift is detected (or if `--strict` is set to `false`). Exits with code 1 if drift is detected and `--strict` is true. Configuration errors (missing baseline/state) always exit with a non-zero code.

---

## `readme`

**Purpose**: Generate a `README.md` based on project context.

### Flags

| Flag        | Alias | Description             | Default     |
| :---------- | :---- | :---------------------- | :---------- |
| `--output`  | `-o`  | Output file path        | `README.md` |
| `--force`   | `-f`  | Overwrite existing file | `false`     |
| `--verbose` |       | Enable verbose logging  | `false`     |

Notes:

- By default generation may be skipped if a recent pipeline/state check validated the README as in-sync. The command checks for a pipeline state file at `.sintesi/readme.state.json` and, if the state is recent and indicates no drift, the generation will be skipped. Use `--force` to regenerate regardless.
- If no valid state is found and the target README exists, the command runs a standalone smart check (via SmartChecker.checkReadme). If the smart check reports no drift the command will exit early. If the smart check reports drift it may provide a short suggestion (smartSuggestion) which the generator will use to focus the update.
- When proceeding, the command initializes configured AI agents (abort if AI agents cannot be initialized) and analyzes the project context. If a Git diff is present and `--force` is not used, a semantic impact analysis is performed (ImpactAnalyzer.checkWithLogging) to determine whether generation should continue.
- The actual content generation is delegated to the ReadmeBuilder (builder.buildReadme). After a successful build the command attempts to update `.sintesi/readme.state.json` recording a timestamp and the current HEAD SHA (lastGeneratedSha) and marking the readme state as in-sync.
- The command may use configured AI integrations to assist generation (planner/writer/reviewer flows). If AI initialization or required integrations are not available the command will abort with an error.

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

| Flag           | Alias | Description                                      | Default |
| :------------- | :---- | :----------------------------------------------- | :------ |
| `--output-dir` | `-o`  | Output directory                                 | `docs`  |
| `--force`      | `-f`  | Force full regeneration (ignores existing state) | `false` |
| `--verbose`    |       | Enable verbose logging                           | `false` |

Notes:

- If the docs output directory exists and appears up-to-date the command may perform a "smart check" and skip generation. Use `--force` to force full regeneration.
- The planner/architect will propose a documentation plan; the builder generates pages and may use configured AI agents depending on available integrations. State is recorded under `.sintesi` to enable future incremental checks.

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
This reference is generated from the current source code and tests in the repository. Flags and behavior shown here reflect the implemented CLI options at the time this doc was produced. Flags labeled as runtime-resolved are not hard-coded literal defaults but are determined at runtime (for example baseline resolution for `--base` in `sintesi check`). CLI flags may change across releases — consult the CLI index and repository releases (links at the top of this page) before scripting against these flags.
:::
