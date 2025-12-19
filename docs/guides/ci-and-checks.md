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
- **Targeted Diffs / Token Efficiency**: Change analysis now supports filtering the unified git diff to only include files relevant to a specific documentation page. The CLI's DocumentationBuilder calls this filter per-page using the page's `relevantFiles` (populated from the page frontmatter or docs configuration), so AI agents receive a much smaller, focused diff rather than the repository-wide diff. This reduces noise and token usage and improves update accuracy.

---

## What You Can Run in CI

Use the canonical flag names shown below (`--documentation` for site checks). Examples show an explicit baseline (`--base origin/main`) — see Baseline & CI guidance later for recommended patterns.

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

This workflow installs dependencies, restores/persists Sintesi state, ensures a full history to resolve baselines, and runs the drift check in PR or push workflows.

Notes:

- We use a single cache step to persist the `.sintesi` state between runs (avoid duplicate restore steps).
- We set fetch-depth: 0 to ensure remote branch refs like origin/main are available for baseline resolution.
- We consistently use the canonical flag `--documentation` for documentation site checks.

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
            - name: Checkout repository (full history)
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '18'

            - name: Install dependencies
              run: |
                  corepack enable || true
                  pnpm install

            - name: Restore Sintesi state (cache .sintesi)
              uses: actions/cache@v4
              with:
                  path: .sintesi
                  key: ${{ runner.os }}-sintesi-${{ github.sha }}
                  restore-keys: |
                      ${{ runner.os }}-sintesi-

            - name: Ensure remote main is available
              run: |
                  # Make sure origin/main is fetched and up to date for baseline resolution
                  git fetch origin main --depth=1 || true

            - name: Run drift check (strict)
              env:
                  CI: true
                  # Ensure AI keys are set if using smart checks
                  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
              run: |
                  # Use the canonical flag name --documentation for site checks
                  npx sintesi check --verbose --strict --base origin/main

            - name: Persist Sintesi state (cache .sintesi)
              if: always()
              uses: actions/cache@v4
              with:
                  path: .sintesi
                  key: ${{ runner.os }}-sintesi-${{ github.sha }}
                  restore-keys: |
                      ${{ runner.os }}-sintesi-
```

If you prefer using a fixed baseline instead of persisting `.sintesi`, set `--base` explicitly (see Baseline & CI guidance below).

---

## Exit Behavior

- **Strict Mode** (`--strict`): If drift is detected, the command exits with a non-zero code (fails CI). Default: false. Use `--strict` to fail CI on drift; use `--no-strict` to surface drift without failing.
- **Config Errors**: Configuration or initialization errors always return a non-zero exit code.
- **Success**: Exits with code 0 if no drift is detected (or strict is false and only drift diagnostics were reported).

---

## Baseline & CI guidance

Baselines determine what revision the current tree is compared to. Be explicit in CI to avoid ephemeral drift due to ephemeral baselines.

Baseline resolution order (how the CLI picks a baseline if `--base` is not provided):

1. If `--base <ref>` is provided on the command line, that ref is used directly. This can be a remote ref (`origin/main`), a branch name (`main`), or a commit SHA.
2. Else, if a stored baseline SHA exists in `.sintesi/last-baseline` (or equivalent state file), that stored SHA will be used.
3. Else, the CLI tries to resolve `origin/main` (remote) if available in the local repository. If `origin/main` is not available but local `main` exists, it uses `main`.
4. If none of the above are resolvable, the CLI warns and treats the run as having no baseline (you may see a `configError` or "No baseline found" warning).

Recommended CI strategies:

- Persist `.sintesi` between runs using the CI cache (example above). This makes baselines stable across reruns and reduces ephemeral drift.
- Or, pass a stable explicit baseline, for example:
    - `--base origin/main` (recommended for PR/check workflows where origin/main is fetched).
    - `--base <commit-sha>` to pin to a specific commit if desired.
- Ensure your checkout fetches the remote branch refs (set `fetch-depth: 0` or run `git fetch origin main`) so `origin/main` is resolvable in CI.

Example: failing CI deterministically using remote main as baseline (as shown in the Actions sample):

npx sintesi check --documentation --strict --base origin/main

---

## Troubleshooting

### No Baseline Found

Symptom: Warning about missing baseline and `configError`.

Resolution:

- Run `npx sintesi documentation` locally or as a CI step to establish an initial baseline; persist the created `.sintesi` state in CI cache for later runs.
- Or explicitly provide a base with `--base origin/main` (ensure origin/main is fetched in CI).

### AI Agents Failed

Symptom: "Failed to initialize AI agents".

Resolution:

- Ensure `OPENAI_API_KEY` (or other provider keys) are available in CI secrets.
- Ensure network access and provider quotas are available for the CI environment.

### README or Docs Missing

Symptom: Drift reported due to missing files.

Resolution:

- Confirm `README.md` and your docs directory (default `docs/`) exist and are referenced in your config.
- If you use custom paths, pass `--output`/`--output-dir` or configure Sintesi to point at the correct locations.

### Baseline Drift (Ephemeral CI)

Symptom: Re-runs produce drift due to different SHA references or ephemeral baselines.

Resolution:

- Persist `.sintesi` state between runs (example cache step in the GitHub Actions workflow above).
- Or supply a stable explicit `--base` (for example, `--base origin/main`) and ensure your CI fetches the remote branch refs.

---

## Targeted Diffs / Token Efficiency — How relevantFiles are populated

DocumentationBuilder filters the unified git diff for each documentation page using that page's `relevantFiles` list so only changes relevant to the page are sent to the AI model. This is configured per-page (commonly via frontmatter in your docs) or via your docs configuration.

Frontmatter example (page-level):

```md
---
title: 'Using the Foo API'
relevantFiles:
    - src/foo.ts
    - src/lib/foo/**
    - README.md
---

# Using the Foo API

...
```

DocumentationBuilder uses that `relevantFiles` array when building the prompt:

DocumentationBuilder.ts (simplified, illustrative snippet — not full file):

```ts
// Example: where relevantFiles are used in prompt construction
function buildPagePrompt(projectName: string, page: DocPage, diffText: string) {
    // page.relevantFiles is read from frontmatter or docs config for the page
    const genPrompt = DOC_GENERATION_PROMPT({
        projectName,
        pagePath: page.path,
        pageTitle: page.title,
        pageContent: page.content,
        relevantFiles: page.relevantFiles, // the per-page filter
        diff: diffText, // the unified diff filtered to relevantFiles
    });

    return genPrompt;
}
```

How the diff is filtered (high-level):

- The CLI computes the unified git diff between the baseline and HEAD.
- For each page, Sintesi applies the `relevantFiles` globs/paths to the diff and produces a reduced diff to include only matching files/sections.
- That reduced diff is sent with the page data to the AI agent for targeted analysis.

Where to configure:

- Per-page frontmatter is the simplest method (as above).
- Alternatively, your docs tooling/config (e.g., a docs manifest or a global config file) can map pages to `relevantFiles` arrays; DocumentationBuilder will read the page object it receives and use `relevantFiles` if present.

If `relevantFiles` is absent:

- DocumentationBuilder falls back to sending the full repo diff (larger token usage, more noise). For best token efficiency, populate `relevantFiles` for pages that should receive targeted diffs.

---

## CLI Flags Reference

Canonical flag names are used throughout the examples above.

| Flag                 | Description                                                                                                                                                  | Default                      |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| `--verbose`          | Enable verbose logging.                                                                                                                                      | `false`                      |
| `--strict`           | Exit with error code if drift detected (fail CI).                                                                                                            | `false`                      |
| `--base <ref>`       | Explicit baseline ref for drift comparison (e.g., `origin/main` or SHA). If omitted, CLI uses stored baseline or attempts to resolve origin/main/local main. | (see Baseline & CI guidance) |
| `--readme`           | Check only README drift.                                                                                                                                     | `false`                      |
| `--documentation`    | Check only documentation site drift (canonical flag for docs).                                                                                               | `false`                      |
| `--output <path>`    | Output path for README check.                                                                                                                                | `README.md`                  |
| `--output-dir <dir>` | Output directory for documentation check.                                                                                                                    | `docs`                       |

::: info Usage Note
The `check` command stores per-run state under `.sintesi` to help determine baselines. In CI, either persist `.sintesi` between runs (via your CI cache) or provide an explicit `--base` ref (for example `origin/main`) to ensure stable comparison. Also ensure your checkout fetches remote refs (set `fetch-depth: 0` or run `git fetch origin main`) so `origin/main` can be resolved.
:::

---
