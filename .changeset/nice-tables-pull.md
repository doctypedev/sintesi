---
"@sintesi/sintesi": patch
---

- Fixed improper removal of CLI flags (e.g., --no-strict) in documentation by ensuring entry points like src/index.ts are included in the AI context.
- Refactored `documentation` and `readme` commands into dedicated Planner/Builder services (`DocumentationPlanner`, `DocumentationBuilder`, `ReadmeBuilder`) to improve maintainability and enforce consistent safety rules (Anti-Hallucination, Flag Protection).