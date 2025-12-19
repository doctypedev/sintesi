---
title: 'CLI Commands Reference'
description: 'Authoritative reference for the Sintesi CLI commands: changeset, check, readme, documentation — usage, flags, exit codes, and CI examples.'
icon: '📦'
order: 10
---

# Sintesi CLI — Commands Reference

This page documents the verified Sintesi CLI commands implemented in the repository: `changeset`, `check`, `readme`, and `documentation`. For each command you will find a short description, usage examples, the supported flags (exact names and aliases as implemented), expected exit behaviors, and recommended CI patterns.

Repository (for clone instructions)

- Use your project's repository URL. The CLI implementation and command wiring live under the repository's packages/cli directory (see packages/cli in your source tree).

Note: These flags and behaviors reflect the CLI implementation present in the repository source. Do not assume flags or behaviors not present in the code.

---

## Common usage

Run any command with `--help` for a short usage summary:

```bash
sintesi <command> --help
```

All examples below assume `sintesi` is available on PATH (installed globally or via a project script).

---

## Command: readme

Generate or update `README.md` for the current project using the project context.

Usage:

```bash
sintesi readme [options]
```

Description:

- Generates a README for the current project using project context and AI helpers (if configured).
- Will not overwrite an existing file unless `--force` is provided.

Flags

| Flag        | Alias | Type    | Default | Description                                                                                                                                                         |
| ----------- | ----- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--output`  | `-o`  | string  | (none)  | Output file path for the generated README. If not provided, the command logic defaults to `README.md` (the option definition itself does not hardcode the default). |
| `--force`   | `-f`  | boolean | `false` | Overwrite existing file if present.                                                                                                                                 |
| `--verbose` |       | boolean | `false` | Enable verbose logging during generation.                                                                                                                           |

Exit behavior:

- Exits with status `0` on success.
- If the command encounters an unhandled fatal error the process may exit non-zero. (The CLI handler for `readme` does not explicitly call `process.exit` on command-level failures in the source.)

Example:

```bash
# Generate README.md in place (no overwrite)
sintesi readme

# Force overwrite README.md
sintesi readme --force

# Custom path with verbose logging
sintesi readme --output docs/README.md --verbose
```

---

## Command: documentation

Generate a full documentation site structure (e.g., `docs/`) from project sources.

Usage:

```bash
sintesi documentation [options]
```

Description:

- Produces a structured documentation site in a target directory (default `docs`).
- Designed to generate site-friendly file structure (e.g., for VitePress) by default.

Flags

| Flag           | Alias | Type    | Default | Description                                                    |
| -------------- | ----- | ------- | ------- | -------------------------------------------------------------- |
| `--output-dir` | `-o`  | string  | `docs`  | Directory where generated documentation files will be written. |
| `--force`      | `-f`  | boolean | `false` | Force full regeneration, ignoring existing state.              |
| `--verbose`    |       | boolean | `false` | Enable verbose logging during generation.                      |

Exit behavior:

- Exits with status `0` on success.
- If the command encounters an unhandled fatal error the process may exit non-zero.

Example:

```bash
# Generate docs in the default `docs` directory
sintesi documentation

# Regenerate docs from scratch and show verbose logs
sintesi documentation --force --verbose

# Write docs to a custom directory
sintesi documentation --output-dir site/docs
```

---

## Command: check

Verify that the README and/or documentation are in sync with the code (drift detection).

Usage:

```bash
sintesi check [options]
```

Description:

- Performs drift detection for README and/or documentation using smart (AI-powered) checks.
- By default it checks both README and documentation unless flags restrict to one target.
- The command integrates with a local state or lineage state to determine a baseline (SHA) for change comparison.

Flags

| Flag              | Alias   | Type    | Default | Description                                                                                                                                                                                                                                                  |
| ----------------- | ------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--verbose`       |         | boolean | `false` | Enable verbose logging.                                                                                                                                                                                                                                      |
| `--strict`        |         | boolean | `true`  | If true, the CLI will exit with an error code when drift is detected. (Yargs also provides `--no-strict` automatically.)                                                                                                                                     |
| `--smart`         |         | boolean | `true`  | Use AI to detect high-level drift (default true).                                                                                                                                                                                                            |
| `--base`          |         | string  | (none)  | Explicit base ref/branch/SHA to use for comparison (overrides cached state). If not provided, the command will attempt to compute a baseline from saved lineage/lastGenerated SHAs; there is no hardcoded default such as `origin/main` in the command code. |
| `--readme`        |         | boolean | `false` | Check only README drift.                                                                                                                                                                                                                                     |
| `--documentation` | `--doc` | boolean | `false` | Check only documentation site drift.                                                                                                                                                                                                                         |
| `--output`        | `-o`    | string  | (none)  | Output path used by README-specific checks (if applicable).                                                                                                                                                                                                  |
| `--output-dir`    | `-d`    | string  | (none)  | Output directory used by documentation checks (if applicable).                                                                                                                                                                                               |

Important behavior (exit codes and conditions):

- If AI agents cannot be initialized (configuration error), the command returns a result containing `configError` and the CLI wrapper explicitly calls `process.exit(1)` (exit code 1). This configuration error causes an immediate exit with code 1 regardless of the `--strict`/`--no-strict` setting.
- If drift is detected (the result `success` is false) and `--strict` is enabled (default), the CLI wrapper calls `process.exit(1)` (exit code 1).
- If no baseline can be determined (no previous run state and no `--base` provided), the command logs warnings and returns failure (`success: false`). The CLI handler in this case will cause a failing exit if `--strict` is still true.
- If `--no-strict` is provided (the Yargs-created negation for `--strict`), the command will not force a non-zero exit on drift, allowing non-blocking CI usage.

Examples:

```bash
# Run both checks (default). Exit code 1 if drift is found (strict).
sintesi check

# Only check README and allow non-blocking CI (do not fail on drift)
sintesi check --readme --no-strict

# Use a specific base SHA/branch for comparison
sintesi check --base origin/main

# Check only documentation site
sintesi check --doc
```

---

## Command: changeset

Generate a Changeset file describing the version bump and release notes inferred from code changes (uses AI by default to classify and describe changes).

Usage:

```bash
sintesi changeset [options]
```

Description:

- Analyzes git changes (or staged changes) and performs symbol-level analysis to determine the meaningful changes.
- Uses AI to infer version type (`major`/`minor`/`patch`) and to produce a human-friendly description unless AI is disabled.
- Generates a changeset file under the configured `.changeset` directory (default `.changeset`).
- Requires the `@changesets/cli` package to be installed in the project; the command checks for it and will return an error result if missing.

Flags

| Flag             | Alias | Type    | Default         | Description                                                                                |
| ---------------- | ----- | ------- | --------------- | ------------------------------------------------------------------------------------------ |
| `--base-branch`  | `-b`  | string  | `main`          | Base branch to compare changes against.                                                    |
| `--staged-only`  | `-s`  | boolean | `false`         | Analyze only staged changes (git index).                                                   |
| `--package-name` | `-p`  | string  | (auto-detected) | Target package name for the changeset (auto-detected from `package.json` if not provided). |
| `--output-dir`   | `-o`  | string  | `.changeset`    | Output directory where changeset files will be written.                                    |
| `--skip-ai`      |       | boolean | `false`         | Skip AI analysis and fall back to defaults (i.e., do not call the AI generator).           |
| `--version-type` | `-t`  | string  | (none)          | Manually specify the version bump: one of `major`, `minor`, `patch`.                       |
| `--description`  | `-d`  | string  | (none)          | Manually specify the changeset description.                                                |
| `--verbose`      |       | boolean | `false`         | Enable verbose logging during generation.                                                  |

Notes and important runtime behavior:

- The command first checks that `@changesets/cli` is installed (attempts to resolve it relative to the project). If it is not present, the command logs installation instructions and returns a failure result:
    - It prints guidance to install with: `npm install -D @changesets/cli`, `pnpm add -D @changesets/cli`, or `yarn add -D @changesets/cli`.
    - The command returns `{ success: false, error: '@changesets/cli not installed' }` rather than calling `process.exit()` in the changeset code path.
- The command supports analyzing changes in a monorepo: it detects packages and filters the analysis so AI focuses only on changes relevant to the selected package(s).
- When no changes are detected, the command returns a failure result indicating "No changes detected to generate changeset".
- The CLI wrapper does not explicitly call `process.exit` based on the `changeset` result in the code; it returns the result to the caller. In CI you should check for the presence of generated files or inspect the exit code / output to determine success.

Examples:

```bash
# Generate a changeset comparing against main
sintesi changeset --base-branch main

# Analyze only staged changes
sintesi changeset --staged-only

# Force a specific version type and provide a description
sintesi changeset --version-type minor --description "Add new feature X" --package-name @my/pkg

# Write changeset files to a custom directory
sintesi changeset --output-dir .changeset-prod
```

Tip: Ensure `@changesets/cli` is installed in the project before running this command in CI.

---

## Exit codes summary

- check
    - Exit 1: configuration error (AI agents cannot be initialized) — the CLI wrapper explicitly calls `process.exit(1)`. This exit happens regardless of the `--strict`/`--no-strict` setting.
    - Exit 1: drift detected and `--strict` enabled (default) — the CLI wrapper explicitly calls `process.exit(1)`.
    - Exit 0: success (no drift, or `--no-strict` used and drift allowed).
- readme / documentation / changeset
    - Exit 0: success.
    - If a fatal, unhandled error occurs the process may exit non-zero (not explicitly governed by the top-level CLI wrapper in the repository for these commands).
    - changeset returns failure results (e.g., `success: false` and `error` string) when preconditions fail (for example `@changesets/cli` missing or no changes detected) but the CLI wrapper does not call `process.exit(1)` in the same way `check` does.

---

## CI examples

Below are minimal CI examples showing typical usage patterns. Adjust to your CI environment.

GitHub Actions — run checks and fail the build if documentation drift is found:

```yaml
name: docs-check

on: [pull_request]

jobs:
    sintesi-check:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v4

            - name: Setup Node
              uses: actions/setup-node@v4
              with:
                  node-version: 18

            - name: Install CLI (if needed)
              run: npm install -g @sintesi/sintesi

            - name: Run Sintesi check (fail on drift)
              run: sintesi check
              env:
                  # Provide API keys for AI agents if your configuration requires them
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

GitHub Actions — run README-only check but do not fail CI on drift (non-blocking):

```yaml
name: readme-check

on: [pull_request]

jobs:
    readme:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 18

            - run: npm install -g @sintesi/sintesi

            - name: Check README (non-blocking)
              run: sintesi check --readme --no-strict
              env:
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

GitHub Actions — generate a changeset in CI (ensure @changesets/cli is installed in repo):

```yaml
name: generate-changeset

on:
    push:
        branches: [main]

jobs:
    changeset:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 18

            - name: Install project dev dependencies (include @changesets/cli)
              run: npm ci

            - name: Generate changeset
              run: sintesi changeset --base-branch main --output-dir .changeset
              env:
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

Notes for CI:

- Provide the necessary AI API keys (for OpenAI, Anthropic, Cohere, Mistral, etc.) via secrets if you rely on the smart checks or generation features.
- For `changeset` runs, ensure `@changesets/cli` is available (installed) in the repository before running the command.

---

If you need a quick pointer to the code that wires these commands, see the CLI entrypoint in `packages/cli/src/index.ts` (commands and flags are defined there) and command implementations under `packages/cli/src/commands/` for authoritative behavior.
