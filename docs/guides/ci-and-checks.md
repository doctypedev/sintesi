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
npx sintesi check --documentation --base origin/main
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

---

## CLI Flags Reference

| Flag                 | Description                               | Default     |
| :------------------- | :---------------------------------------- | :---------- |
| `--verbose`          | Enable verbose logging.                   | `false`     |
| `--strict`           | Exit with error code if drift detected.   | `true`      |
| `--base <ref>`       | Explicit baseline for drift comparison.   |             |
| `--readme`           | Check only README drift.                  | `false`     |
| `--documentation`    | Check only documentation drift.           | `false`     |
| `--output <path>`    | Output path for README check.             | `README.md` |
| `--output-dir <dir>` | Output directory for documentation check. | `docs`      |

::: info Usage Note
The `check` command stores per-run state under `.sintesi` to help determine baselines. In CI, plan how you want to handle this ephemeral state (persist or override with a baseline flag).
:::
