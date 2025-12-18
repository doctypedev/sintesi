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
    - If `--base` is omitted, the command attempts to resolve the baseline from repository lineage and previously recorded state (for example cached SHAs, a `.sintesi` state file, or other recorded baseline). This is a runtime resolution and not a fixed literal default such as `origin/main`. The implementation tries inferred repository parent refs and any prior cached state before failing.
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

CI Usage: The command implementation does not explicitly call process.exit. Under normal Node semantics a successful run typically results in an exit code of 0. If drift is detected and `--strict` is true the command will produce an error (or throw), which leads to a non-zero exit code when the process terminates; configuration errors (such as a missing baseline) will similarly propagate as exceptions and result in non-zero exits. CI consumers should rely on standard exit-code semantics (non-zero for errors) and/or examine error output rather than expecting an explicit process.exit call.

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
- The command may use configured AI integrations to assist generation. The exact generation flow (single-agent vs. multi-agent pipelines, planner/writer/reviewer splits) is implementation-dependent; consult the `readme` implementation for details. If AI initialization or required integrations are not available the command will abort with an error.

### Examples

```bash
# Generate README
sintesi readme

# Force overwrite
sintesi readme --force
```

**CI Usage**: Run to generate or update README. In normal Node runs a successful completion will typically exit with code 0; errors propagate as exceptions and produce non-zero exit codes.

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

- The command performs multiple optimizations and checks before generating content:
    - If the docs output directory exists and appears up-to-date the command may perform a "smart check" and skip generation. If the directory is missing or empty the smart check is skipped and generation is forced.
    - Using `--force` (or `-f`) overrides cached state and pipeline checks: the CLI treats the run as a greenfield generation, skips state validation, clears any computed git diff, and performs a full regeneration (not a surgical update).
- Hybrid generation workflow:
    - The Planner (architect) proposes a plan of files to create or update. Before writing, the builder runs a batch Research phase that populates a RAG (semantic) index (via `ensureRAGIndex`) and retrieves contextual search results to ground writing.
    - When a target file already exists and `--force` is not used, the builder enters "surgical-update" mode: instead of fully rewriting files, it runs an agent using a structured `DOC_UPDATE_PROMPT` and provides a small in-process tool (`patch_file`) that performs precise search-and-replace edits on the existing content. The agent is given the `patch_file` tool (via the provider's tools API) and may perform multiple patch operations (bounded by a configured maxSteps). Because `patch_file` applies exact literal-snippet replacements, surgical updates rely on exact matches and are intentionally conservative to avoid overwriting unrelated content.
        - Important implementation detail: the `patch_file` tool applies edits to the in-memory file context (e.g., mutating a `fileContext.content` buffer/object). Patches are applied in-memory during the agent's run; the builder writes the final, patched content back to disk (or the output artifact) only after the agent has completed its bounded patch operations. The tool does not stream individual writes to disk for every patch—changes are composed in-memory and then persisted once the surgical update completes.
    - If the target file does not exist, or `--force` is specified, the builder uses the standard full-generation flow (`DOC_GENERATION_PROMPT`) to produce complete file content.
- AI/RAG implications and safety:
    - The builder initializes AI agents and ensures a RAG index is available; generation and research phases use both prompt-based LLM calls and semantic search results for grounding. If AI integrations or required API keys are not available the command will abort.
    - Surgical-update mode exposes a `patch_file` tool to agents. Because this tool mutates file content by exact replacement, the system requires agents to produce precise snippets and will include review/refinement steps. Users should inspect diffs before committing changes.
- Update state / baseline object:
    - The CLI records and consults a compact state object describing the last known generated state for the documentation output. The ground-truth state JSON includes the following keys:
        - `timestamp` — ISO timestamp of the last generation run.
        - `lastGeneratedSha` — the SHA (commit or recorded baseline) that was used for the last generation.
        - `documentation` — an object with fields such as:
            - `hasDrift` (boolean) — whether drift was detected since `lastGeneratedSha`.
            - `reason` (string) — a short explanation for detected drift (if any).
        - (optional) `originalPath` — when present, indicates an original/legacy file path used by the planner for migration purposes (see note below).
    - Listing all keys reduces ambiguity when interpreting cached state and when the builder attempts to resolve runtime baselines.
- Migration notes (optional):
    - The planner may record an `originalPath` for legacy content that has been migrated to a new location. Surgical updates can target files that were migrated from an `originalPath` to their new destination; the planner uses this information to map update intents against the current output layout.

### Examples

```bash
# Generate documentation
sintesi documentation

# Force full regeneration
sintesi documentation --force
```

**CI Usage**: The documentation command implementation does not explicitly call process.exit. Under normal Node semantics a successful run generally results in exit code 0; errors (including failures to initialize AI integrations, configuration errors, or unhandled exceptions) will propagate and cause a non-zero exit when the process terminates. CI consumers should detect non-zero exit codes and/or examine error output rather than relying on an explicit process.exit call.

---

::: info Note
This reference is generated from the current source code and tests in the repository. Flags and behavior shown here reflect the implemented CLI options at the time this doc was produced. Flags labeled as runtime-resolved are not hard-coded literal defaults but are determined at runtime (for example baseline resolution for `--base` in `sintesi check`). CLI flags may change across releases — consult the CLI index and repository releases (links at the top of this page) before scripting against these flags.
:::
