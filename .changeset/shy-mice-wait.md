---
"@sintesi/sintesi": minor
---

Introduces the `--force` flag for `documentation` and `readme` commands.

This flag allows bypassing the smart check and incremental caching system. When enabled:
- Ignores `.sintesi/state.json` validation and drift detection.
- Disables impact analysis, forcing a run even if no semantic code changes are detected.
- Treats the generation as "greenfield," ignoring existing markdown content to ensure a complete regeneration from scratch.
