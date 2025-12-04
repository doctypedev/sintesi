---
"@doctypedev/core": patch
"@doctypedev/doctype": patch
---

Replace TypeScript markdown parser with Rust NAPI implementation using pulldown-cmark

- Migrate markdown extraction logic from TypeScript to Rust for improved performance
- Use pulldown-cmark for proper Markdown AST parsing (best practice, avoids regex fragility)
- Automatically ignores HTML comments in code blocks (impossible with regex)
- Add `extractAnchors`, `validateMarkdownAnchors`, and `parseCodeRef` functions via NAPI bindings
- Remove `@doctypedev/core-native` workspace dependency (not needed)
- Add type definitions for markdown extraction to native-types.d.ts
- Remove old packages/content/markdown-parser.ts file
- Maintain 0-indexed line numbers for TypeScript compatibility
