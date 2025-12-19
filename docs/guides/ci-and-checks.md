---
title: 'CI & Checks: Running Sintesi drift checks in CI'
description: 'How to run the Sintesi check command in CI to detect documentation drift, with GitHub Actions example, exit behavior, and troubleshooting.'
icon: '🧪'
order: 20
---

# CI Guide: Running Sintesi Check

This guide explains how to run the Sintesi `check` command in CI to detect drift between code and documentation. It covers enabling drift checks, exit behavior, GitHub Actions example, and troubleshooting.

**Key Ideas**:

- **Dual Checks**: Verifies both README and Documentation Site drift.
- **Noise Reduction**: Sintesi uses ChangeAnalysis and git-diff filtering to reduce noise, but the filtering behavior differs by path:
    - Documentation content path: the DocumentationBuilder applies per-page git-diff filtering (via ChangeAnalysisService.filterGitDiff) so only files relevant to each doc page are considered and passed to AI checks. This reduces AI calls and false positives on large repos.
    - README drift path: README drift is evaluated by a separate readme-drift checker (SmartChecker). It does not apply the same per-page git-diff filtering across the entire git diff; it uses readme-specific heuristics and self-update handling. In short — per-page filtering is applied for documentation site checks, while README uses a separate readme-focused check.
- **Targeted Analysis**: SmartChecker and DocumentationBuilder use deterministic, pre-AI heuristics (keyword and file filters) to reduce unnecessary AI checks.
- **Strict Mode**: Controls exit behavior (fail CI on drift when enabled).
- **Baseline**: The CLI honors an explicit `--base` first (recommended). If `--base` is not provided, the CLI will attempt to derive a baseline from stored `.sintesi` state (lineage / last known baseline). If no baseline can be found, the CLI will warn and return a configuration error — CI should handle this as a non-zero exit condition or supply an explicit `--base`.

---

## How drift detection works (high level)

- README drift:
    - Uses the readme-drift checker (SmartChecker) with README-specific heuristics.
    - Does not rely on documentation per-page git-diff filtering; instead it runs a targeted README analysis and handles self-updates according to readme-specific logic.
- Documentation site drift:
    - DocumentationBuilder constructs a per-page list of relevant files, then applies ChangeAnalysisService.filterGitDiff to restrict diffs per page before any AI calls.
    - This per-page filtering is what prevents unrelated changes elsewhere from triggering checks for a given page.
- Baselines and storage:
    - Baseline precedence: 1) `--base <ref>` if provided, 2) lineage / last-run baseline stored in `.sintesi` (if available), 3) otherwise the CLI will emit a warning/config error and exit non-zero.
    - The `check` command stores per-run state under `.sintesi` to support subsequent baseline derivation (if you rely on automatic baselines).

A short flow:

- User runs `sintesi check`.
- If `--base` provided → compare against that ref.
- Else, attempt to use `.sintesi` lineage / last baseline.
- If baseline found → compute git-diff(s).
    - For docs: filter diffs per-page, then run AI checks on filtered content.
    - For README: run README-specific drift check.
- Return success or non-zero based on results and strict mode / config state.

---

## What You Can Run in CI

Recommended patterns that give deterministic results and minimize noise:

- Default dual-checks (README + docs), filtered diff + targeted analysis:

```bash
# Ensure you compare against a stable baseline (recommended)
npx sintesi check --verbose --base origin/main
```

- Check only README drift (README uses its own readme-drift logic):

```bash
npx sintesi check --readme --base origin/main
```

- Check only documentation drift (DocumentationBuilder applies per-page relevant file lists to restrict diffs):

```bash
npx sintesi check --documentation --base origin/main
```

- Strict mode (fail CI on drift):

```bash
npx sintesi check --verbose --strict --base origin/main
```

- Non-strict (report drift without failing CI):

```bash
npx sintesi check --verbose --base origin/main --no-strict
```

Notes:

- Always prefer passing an explicit `--base` (for example `origin/main`) in CI so diffs are deterministic.
- The runtime will apply deterministic heuristics (ChangeAnalysis) and per-page git-diff filtering for documentation checks. README checks use a readme-specific checker and do not apply the same per-page filtering across the whole repo.
- For reproducible comparisons in CI, ensure the workflow fetches sufficient git history for the target baseline (see GitHub Actions example below). Shallow clones can break baseline/diff calculations.

---

## GitHub Actions Example

This workflow installs dependencies and runs the drift check in a PR or push workflow. Important: ensure the checkout step fetches enough history (use `fetch-depth: 0`) so diffs against `origin/main` are deterministic.

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
              with:
                  # Fetch full history so git-diff / baselines against origin/main are deterministic.
                  fetch-depth: 0

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

Notes:

- Shallow clones (default small fetch depths) can break baseline/diff calculations — `fetch-depth: 0` ensures the full history is available for accurate diffs.
- If you cannot fetch full history, fetch the specific baseline ref (e.g., `git fetch origin main --depth=1`) or configure your CI to fetch sufficient history for deterministic diffs.

---

## Non-GitHub CI Example (GitLab CI)

Example GitLab CI job that ensures baseline refs are available and uses a secret variable for the OpenAI key:

```yaml
stages:
    - check

sintesi_check:
    image: node:18
    variables:
        # Set this CI variable in GitLab CI/CD > Variables: OPENAI_API_KEY
        OPENAI_API_KEY: $OPENAI_API_KEY
    script:
        - corepack enable || true
        - pnpm install
        # Ensure we have the baseline ref; unshallow if needed
        - git fetch origin main --depth=0 || git fetch origin main
        - npx sintesi check --verbose --base origin/main
```

- In GitLab, add OPENAI_API_KEY as a CI/CD variable (masked/protected) and reference it as above.
- The `git fetch origin main --depth=0` ensures a full/relevant baseline is present for diffs.

---

## Exit Behavior (Concrete mapping)

The CLI returns semantic results; the host process (shell/CI) receives an exit code:

- Success: CLI indicates success (no drift / no config error) → exit code 0.
- Drift detected and strict mode enabled (`--strict`): CLI will return a non-zero exit code (CI job fails).
- Config error or other fatal error (e.g., missing baseline, invalid config, missing required files): CLI returns a non-zero exit code.

Example in a shell (behaves like any tool in CI):

```bash
npx sintesi check --base origin/main
if [ $? -ne 0 ]; then
  echo "Sintesi reported drift or an error. Exiting non-zero to fail CI."
  exit 1
fi
```

Note: The CLI exposes semantic return values (success vs error/configError); CI tooling should treat any non-zero exit as failure. If you need exact numeric exit codes for programmatic handling, consult the CLI host or wrapper implementation for the exact numeric mappings.

---

## Troubleshooting

### No Baseline Found

Symptom: Warning about missing baseline and `configError`.

Resolution:

- Preferred: pass an explicit baseline: `--base origin/main`.
- If you rely on automatic baselines: run `sintesi documentation` locally to establish `.sintesi` state, then persist `.sintesi` between runs (see CI-state persistence below).
- If neither baseline nor `.sintesi` lineage exists, the CLI will return a configuration error (non-zero exit) — CI should catch this.

### AI Agents Failed

Symptom: "Failed to initialize AI agents".

Resolution:

- Ensure `OPENAI_API_KEY` (or other provider keys) are available in CI secrets/vars.
- Verify network access from CI runners to the AI provider endpoints if your environment restricts outbound traffic.

### README or Docs Missing

Symptom: Drift reported due to missing files.

Resolution:

- Confirm `README.md` and the documentation directory (often `docs/`) exist at the expected paths in the repo and in the CI checkout.
- If your project uses different paths, pass the appropriate flags or configure the CLI accordingly.

### Baseline Drift (Ephemeral CI)

Symptom: Re-runs produce drift due to different SHA references or lack of `.sintesi` lineage.

Resolution:

- Prefer passing a stable `--base` reference (e.g., `origin/main`) for deterministic comparisons.
- Persist `.sintesi` state between CI runs if you want the tool to derive baselines automatically across runs (see CI-state persistence below).
- Consider creating a process to update baseline state only from trusted runs (e.g., after merges to main) to keep lineage deterministic.

---

## CI-state persistence guidance

CI workspaces are ephemeral. Sintesi stores run state under `.sintesi` to enable baseline lineage across runs. Options to handle this:

- Prefer explicit `--base` in CI so you do not rely on persisted state.
- Persist `.sintesi` between runs:
    - GitHub Actions: use actions/cache to cache `.sintesi` or a workflow artifact to restore it.
    - GitLab CI: use the cache or artifacts feature to persist `.sintesi`.
    - Jenkins: stash/unstash or archive the `.sintesi` directory between stages.
- Example GitHub Actions caching step:

```yaml
- name: Cache .sintesi
  uses: actions/cache@v4
  with:
      path: .sintesi
      key: sintesi-state-${{ github.ref }}-${{ github.sha }}
      restore-keys: |
          sintesi-state-${{ github.ref }}-
```

Implications:

- Persisting `.sintesi` allows the CLI to derive baselines automatically, but it also requires careful cache key management so you don't end up comparing against stale baselines unintentionally.
- For deterministic CI runs, passing an explicit `--base` is simpler and less error-prone.

---

## Edge Cases & CI gotchas

- Shallow clones:
    - Many CI checkouts use shallow clones by default. Shallow clones can break diff/baseline calculations.
    - Ensure you fetch sufficient history (e.g., `fetch-depth: 0` in GitHub Actions or `git fetch origin main --depth=0`) so baseline diffs are accurate.
- Missing directories or files:
    - If README or the docs directory are absent in the working tree, the CLI may report config errors or report drift. Ensure files exist or adjust flags to point to the correct paths.
- Non-existent baseline refs:
    - If `--base` points to a ref that isn't available in the runner, `git` operations will fail; ensure the ref is fetched beforehand.
- Network / API restrictions:
    - If your CI runner blocks outbound connections, AI-based checks will fail. Ensure required network access or run in non-AI (heuristic-only) mode if supported.

---

## CLI Flags Reference

| Flag                 | Description                                                                                                                                        | Default     |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `--verbose`          | Enable verbose logging.                                                                                                                            | `false`     |
| `--strict`           | Exit with error code if drift detected. Recommended to pass explicitly in CI. Defaults to `false` unless overridden in your CLI config or wrapper. | `false`     |
| `--base <ref>`       | Explicit baseline for drift comparison. (Recommended in CI.)                                                                                       |             |
| `--readme`           | Check only README drift.                                                                                                                           | `false`     |
| `--documentation`    | Check only documentation drift.                                                                                                                    | `false`     |
| `--output <path>`    | Output path for README check.                                                                                                                      | `README.md` |
| `--output-dir <dir>` | Output directory for documentation check.                                                                                                          | `docs`      |

Note: Defaults can vary by CLI version or wrapper configuration. For CI, explicitly pass flags (especially `--base` and `--strict` / `--no-strict`) to avoid ambiguity.

::: info Usage Note
The `check` command stores per-run state under `.sintesi` to help determine baselines. In CI, plan how you want to handle this ephemeral state: either persist `.sintesi` between runs (cache/artifact) or pass an explicit `--base` for deterministic comparisons.
:::
