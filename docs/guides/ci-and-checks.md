---
title: 'CI & Checks: Running Sintesi drift checks in CI'
description: 'How to run the Sintesi check command in CI to detect documentation drift, with GitHub Actions example, exit behavior, and troubleshooting.'
icon: '🧪'
order: 20
---

# CI Guide: Running Sintesi Check

This guide explains how to run the Sintesi `check` command in CI to detect drift between code and documentation. It covers enabling drift checks, exit behavior, GitHub Actions examples, and troubleshooting.

**Key Ideas**:

- **Dual Checks**: Verifies both README and Documentation Site drift.
- **Strict Mode**: Controls exit behavior (fails CI on drift).
- **Baseline**: Uses a baseline SHA (default or explicit) for comparison.

---

## What You Can Run in CI

**Default dual-checks (README + docs):**

```bash
npx sintesi check --verbose --base origin/main
```

**Check only README drift:**

```bash
npx sintesi check --readme --base origin/main
```

**Check only documentation drift:**

```bash
npx sintesi check --doc --base origin/main
```

**Strict mode (fail CI on drift):**

```bash
npx sintesi check --verbose --strict --base origin/main
```

**Non-strict (surface drift without failing):**

```bash
npx sintesi check --verbose --base origin/main --no-strict
```

---

## GitHub Actions Example

This workflow installs dependencies and runs the drift check in a PR or push workflow.

```yaml
name: Sintesi Drift Check

on:
    pull_request:
        branches: [main]
    push:
        branches: [main]

jobs:
    sintesi-check:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout repository
              uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '18'

            - name: Install dependencies
              run: |
                  corepack enable || true
                  pnpm install

            - name: Run drift check (strict)
              env:
                  CI: true
                  # Ensure AI keys are set if using smart checks
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
              run: |
                  npx sintesi check --verbose --strict --base origin/main
```

---

## Smart Rust Build (CI optimization)

We introduced an internal GitHub Action named "Smart Rust Build" to avoid rebuilding the Rust core unless necessary. This action is used in the main CI workflows (ci.yml, publish.yml, and sintesi.yml).

Key behavior:

- Action file: .github/actions/smart-build-rust/action.yml
- Purpose: Build the Rust core and prepare generated native TypeScript types only when needed (or when forced).

How it decides to run:

- It uses dorny/paths-filter with a filter named rust that matches the path pattern `crates/core/**`.
- The build steps run only if either:
    - steps.filter.outputs.rust == 'true' (i.e., changes detected under crates/core/\*\*), OR
    - inputs.force == 'true' (force input provided to the action).

What the action does when it runs:

1. Setup Rust toolchain: uses dtolnay/rust-toolchain@stable.
2. Build the Rust core types inside crates/core:
    - cd crates/core
    - pnpm install
    - pnpm run build
3. Copy generated native types:
    - cp crates/core/index.d.ts packages/core/native-types.d.ts
      This prepares the packages/core build by providing the generated native type declarations.

Force input:

- The action supports an input named force (string), with default 'false'.
- To force a build regardless of detected changes, pass with: force: 'true' in your workflow step.

Example (force the Smart Rust Build step in a workflow):

```yaml
- name: Smart Rust Build (forced)
  uses: ./.github/actions/smart-build-rust
  with:
      force: 'true'
```

Notes about usage in existing workflows:

- ci.yml and publish.yml call the Smart Rust Build step unconditionally in the workflow steps; the action itself performs the conditional logic described above.
- sintesi.yml calls the Smart Rust Build step behind the workflow's "skip sintesi" label check (it runs only if the check_skip job output indicates the workflow should not be skipped).

Impact on generated native types:

- The authoritative generated types are produced at `crates/core/index.d.ts` by the crates/core build and then copied to `packages/core/native-types.d.ts` by the action.
- If the Smart Rust Build step does not run (no changes in crates/core and not forced), the packages/core build will use whatever `packages/core/native-types.d.ts` already exists in the repo. This means native types can become stale if crates/core changes but the action was skipped (for example, if changes were not detected by the path filter or the build was intentionally skipped).
- If you suspect stale native types (or after changing build scripts, Cargo.toml, or platform-related code), run the action with force: 'true' or locally run:
    ```bash
    cd crates/core
    pnpm install
    pnpm run build
    cp index.d.ts ../../packages/core/native-types.d.ts
    ```

---

## Exit Behavior

- **Strict Mode** (`--strict`): If drift is detected, exits with a non-zero code (fails CI).
- **Config Errors**: Always return a non-zero exit code.
- **Success**: Exits with code 0 if no drift is detected (or strict is false).

---

## Troubleshooting

### No Baseline Found

**Symptom**: Warning about missing baseline and `configError`.
**Resolution**:

- Run `sintesi documentation` to establish a baseline.
- Explicitly provide a base with `--base origin/main`.

### AI Agents Failed

**Symptom**: "Failed to initialize AI agents".
**Resolution**:

- Ensure `OPENAI_API_KEY` (or other provider keys) are available in CI secrets.

### README or Docs Missing

**Symptom**: Drift reported due to missing files.
**Resolution**:

- Confirm `README.md` and `docs/` exist at expected paths.

### Baseline Drift (Ephemeral CI)

**Symptom**: Re-runs produce drift due to different SHA references.
**Resolution**:

- Persist `.sintesi` state between runs.
- Explicitly pass a stable `--base` reference (e.g., `origin/main`).

### Native types out of sync

**Symptom**: packages/core build fails or TypeScript types for the native addon look incorrect after changes to crates/core.
**Cause**: The Smart Rust Build step did not run (no detected changes and not forced), so `packages/core/native-types.d.ts` was not regenerated.
**Resolution**:

- Rerun the Smart Rust Build action with `force: 'true'` in CI, or
- Locally rebuild crates/core and copy `index.d.ts` to `packages/core/native-types.d.ts` (see commands above).

---

## CLI Flags Reference

| Flag                 | Description                               | Default     |
| :------------------- | :---------------------------------------- | :---------- |
| `--verbose`          | Enable verbose logging.                   | `false`     |
| `--strict`           | Exit with error code if drift detected.   |             |
| `--base <ref>`       | Explicit baseline for drift comparison.   |             |
| `--readme`           | Check only README drift.                  | `false`     |
| `--doc`              | Check only documentation drift.           | `false`     |
| `--output <path>`    | Output path for README check.             | `README.md` |
| `--output-dir <dir>` | Output directory for documentation check. | `docs`      |

Note: The provided code snippets describe strict mode behavior but do not explicitly specify a default value for `--strict`. Use `--strict` to enforce failing CI on detected drift, or `--no-strict` to surface drift without failing.

::: info Usage Note
The `check` command stores per-run state under `.sintesi` to help determine baselines. In CI, plan how you want to handle this ephemeral state (persist or override with a baseline flag). Also be aware of the Smart Rust Build action: if you modify the Rust core or type generation logic, either force the action in CI or regenerate and commit the updated `packages/core/native-types.d.ts` so downstream package builds see the new types.
:::
