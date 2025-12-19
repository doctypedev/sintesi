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
- The command requires the `@changesets/cli` package to be installed in the project. The implementation uses a createRequire-based resolution (falling back to resolving from the project root) and will emit a clear error with installation instructions if not found.
- Diff-aware, package-scoped analysis: when running in a monorepo and a package is selected, the analyzer filters symbol-level changes and changed files to the package's path(s) (absolute paths) before invoking the AI generator. The total change count is updated after filtering so the generated changeset focuses only on changes relevant to the selected package(s).
- `--force-fetch` triggers a fetch of remote refs before analyzing (logged and passed to the analyzer) to ensure the diff is computed against an up-to-date baseline.

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

- The changeset command implementation does not explicitly call process.exit to enforce particular exit codes for success/failure. The command returns structured results (or throws errors) and the surrounding CLI wrapper/harness maps those outcomes to process exit codes.
- CI consumers should detect failure by checking the CLI wrapper's exit codes and/or examining error output; do not rely on the command implementation itself to call process.exit.

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
    - If `--base` is omitted, the command attempts to resolve the baseline from repository lineage / previously recorded state (cached SHAs recorded in `.sintesi` state files). This is a runtime resolution and not a fixed literal default such as `origin/main`.
    - If no usable baseline is found the behavior is nuanced: depending on flags and context the CLI may (a) fail with a configuration error and recommend establishing baseline state (for example by running `sintesi documentation`), or (b) proceed with a standalone/greenfield evaluation. The exact behavior depends on the chosen subcommand/flags and the presence or absence of cached state files. Consult the command implementation for the precise behavior in edge cases.
- The smart check is diff-aware: the command calls the project analyzer to obtain a git diff (using the resolved baseline) and will only run the AI-driven SmartChecker when a git diff is present and the target files (README/docs) exist. If there is no git diff and the relevant outputs exist, the command typically returns success immediately and skips expensive AI checks (this is a common fast-path implemented to avoid unnecessary work).
- Note: analyzeProject returns a single git diff for the chosen baseline. If running both README and documentation checks and their last-generated SHAs differ, there can be ambiguity because a single diff is used for both checks; the CLI resolves this by priority when choosing the baseline but callers should be aware of this case.
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

CI Usage:

- The command produces structured results (and may throw errors). The CLI wrapper/harness is responsible for mapping those results to process exit codes for CI. Typically a successful check is reported with an exit code 0 by the CLI harness; detected drift or configuration errors will normally result in non-zero exit codes via the harness.
- CI consumers should rely on the CLI wrapper's exit behavior and/or examine structured output to determine pass/fail, rather than assuming the command itself calls process.exit.

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

- By default generation may be skipped if a recent pipeline/state check validated the README as in-sync. Use `--force` to regenerate regardless.
- Smart README checks are guarded by diff analysis and state checks:
    - The SmartChecker is only invoked when the project analyzer reports a git diff for the resolved baseline and/or when the state indicates the README may be out-of-date.
    - If no diff is found and the existing README is present, the check will typically report the README as in-sync and generation may be skipped (fast-path).
    - If no baseline/state is available, behavior is nuanced: the command may treat the run as a greenfield generation, or it may rely on existing README presence to fast-path and skip expensive AI checks. Use `--force` to override and force generation in these cases.
- The command may use configured AI integrations to assist generation. The exact generation flow (single-agent vs. multi-agent pipelines, planner/writer/reviewer splits) is implementation-dependent; consult the `readme` implementation for details. If AI initialization or required integrations are not available the command will abort with an error.
- State persistence: the implementation persists pipeline/state files under the repository's `.sintesi` directory (for example `.sintesi/readme.state.json` for the README pipeline and `.sintesi/documentation.state.json` for the documentation pipeline). These state files are used for later fast-path checks and baseline resolution.

### Examples

```bash
# Generate README
sintesi readme

# Force overwrite
sintesi readme --force
```

CI Usage: Run to generate or update README. The CLI wrapper maps the command result to process exit codes; a successful generation is typically reflected as exit code 0 by the harness.

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
- The command resets/ignores the git diff when `--force` is passed or when the docs output directory is missing/empty; in those cases generation proceeds as a greenfield run.
- When a git diff is present and not forcing, the implementation will run impact/semantic analysis (e.g. ImpactAnalyzer) to focus generation on changed files. This diff-aware behavior reduces unnecessary work and token usage.
- State persistence: the implementation persists pipeline/state files under the repository's `.sintesi` directory. The current implementation writes `.sintesi/documentation.state.json` for the documentation pipeline (and `.sintesi/readme.state.json` for the readme pipeline). These files are used for baseline resolution and fast-path checks on subsequent runs.
- RAG/grounding notes: the current code paths reference impact analysis and planning/generation components (e.g., ImpactAnalyzer, planner/architect, builder). The repository does not persist or reference a `.sintesi/rag-state.json` file, nor does the current documentation command implement an explicit RAG-budgeting workflow limiting assembled context to a fixed 8k-character budget. If an explicit RAG subsystem or budgeting behavior is intended, that is not currently exposed in the implementation and would require future updates to the codebase and this documentation.
- The planner/architect will propose a documentation plan; the builder generates pages and may use configured AI agents depending on available integrations. State is recorded under `.sintesi` to enable future incremental checks.

### Examples

```bash
# Generate documentation
sintesi documentation

# Force full regeneration
sintesi documentation --force
```

CI Usage: Run to generate the documentation site. The command returns structured results and the CLI wrapper/harness is responsible for mapping those to process exit codes; CI should rely on the wrapper's exit code conventions (typically exit code 0 for success).

---

Notes about flags, aliases and exit behavior

- Alias wiring (for example `--doc` mapping to the documentation check or `--base` for check) is defined in the CLI index/manifest. The exact alias mapping can change between releases; consult the authoritative CLI reference at https://sintesicli.dev/reference/commands.html for the current mapping to avoid drift.
- Many commands return structured results (or throw) and do not directly call process.exit. The process exit code seen by CI is typically determined by the CLI wrapper/harness that invokes the commands. CI integrations should use the wrapper's documented exit semantics and/or inspect structured output.

---

::: info Note
This reference is generated from the current source code and tests in the repository. Flags and behavior shown here reflect the implemented CLI options at the time this doc was produced. Flags labeled as runtime-resolved are not hard-coded literal defaults but are determined at runtime (for example baseline resolution for `--base` in `sintesi check`). CLI flags and alias mappings may change across releases — consult the CLI index and repository releases (links at the top of this page) before scripting against these flags.
:::
