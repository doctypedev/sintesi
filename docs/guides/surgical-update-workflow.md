---
title: Surgical Update Workflow
description: How Sintesi decides between full rewrites and surgical patches, how the patch_file tool works, how agents use DOC_UPDATE_PROMPT, and what operators/developers should expect.
icon: 🩹
order: 10
---

This guide explains the "surgical update" workflow used by the Sintesi documentation generator. It covers the decision logic (full generation vs. surgical patch), the patch_file tool implementation and schema, how the Writer agent is invoked (DOC_UPDATE_PROMPT), and the observable outcomes you should expect as a developer or operator.

<Callout type="info">
Surgical updates aim to produce minimal, precise edits to existing documentation files (small diffs / safer PRs). Use --force to bypass surgical updates and force a full regeneration.
</Callout>

## 1 — When Sintesi chooses surgical updates vs full rewrite

High-level rule (extracted from DocumentationBuilder and documentation command flow):

- If a target documentation file already exists and the CLI run is NOT forced (no `--force`), DocumentationBuilder attempts "Surgical Update Mode" for that file.
    - Implementation: DocumentationBuilder checks for existing file content (existsSync + readFileSync) and, when present and not forcing, sets up the surgical flow.
- If the file does not exist, an originalPath is not present, or the CLI was invoked with `--force`, Sintesi performs a full generation (rewrite) of the file using DOC_GENERATION_PROMPT.

Notes about pipeline integrations and "smart checks":

- The core decision in DocumentationBuilder is based on file existence and the `--force` flag. Some CI/pipeline integrations add an extra "smart check" step (outside DocumentationBuilder) that compares source and generated state and may skip invoking the documentation command when no drift is detected. That behavior is integration-level and not guaranteed by DocumentationBuilder alone.
- The `documentation` command accepts `--force` (alias `-f`) to force full regeneration and skip surgical updates.

Mermaid overview of the decision flow (note reviewer step is optional and implemented via a separate ReviewService or pipeline action):

```mermaid
flowchart TD
  A[Start: sintesi documentation] --> B{Docs exist & not --force?}
  B -- yes --> C[Surgical Update Mode]
  B -- no  --> D[Full Generation Mode]
  C --> E[Create patch tool + DOC_UPDATE_PROMPT]
  E --> F[Writer Agent (tools: patch_file, maxSteps:5)]
  F --> R[Optional: ReviewService / reviewer step]
  R --> H[Write updated file]
  F --> H[Write updated file]
  D --> I[Writer Agent (full generation)]
  I --> R
```

## 2 — How the surgical patch tool works (createPatchFileTool)

Sintesi exposes an in-memory patch tool constructed by createPatchFileTool(fileContext). Key facts:

- The tool mutates fileContext.content directly (in-memory). After the agent runs, DocumentationBuilder writes the mutated content back to disk.
- The tool is exposed to the Writer agent as `patch_file` when surgical mode is used.

Input schema (exact fields and purpose):

- original_text_snippet (string)
    - Description: "The exact literal text snippet to replace (including newlines/indentation). Must uniquely identify the section."
- new_text_snippet (string)
    - Description: "The new text content to replace the old snippet with."
- reason (string)
    - Description: "The reason for this change."

Behavior details (from implementation):

1. Existence check and normalization:
    - The tool first attempts to match the provided original snippet against the in-memory content exactly.
    - If the provided snippet is not found, the tool normalizes line endings in both the file content and the provided snippet by converting CRLF (\r\n) to LF (\n) and checks again. This CRLF -> LF normalization is applied for matching purposes.
    - If not found after normalization it returns an error string:
        - "Error: Could not find the exact snippet in <path>. Ensure you are quoting the existing text exactly."
2. Uniqueness check (performed on the normalized content):
    - Matching and uniqueness determination are performed on the normalized content (LF-only). If the snippet matches multiple locations in the normalized content, the tool returns an error string indicating how many matches were found and requests more surrounding context to ensure uniqueness.
3. Patch application:
    - If the snippet exists exactly and is unique (on normalized content), the tool replaces the first (and only) occurrence in the in-memory content and returns a success string: `Success: Applied patch for "<reason>".`
    - If normalization enabled a match and the patch is applied, the success message indicates that normalization was used.
4. Returns:
    - The tool returns a plain string describing success or the error. The Writer agent receives this result.
5. Note:
    - The tool operates in-memory; DocumentationBuilder writes the mutated content to disk only after the agent finishes and any configured review/refinement step is complete.

Practical guidance for snippets:

- Provide exact text including indentation and newlines. If you see line ending issues, normalize to LF (`\n`) when selecting the snippet; the tool will also try a CRLF -> LF normalization during matching.
- Because matching and uniqueness checks are performed on normalized content, ensure that the snippet is still unique when normalized.
- If a snippet appears multiple times, include surrounding header lines or nearby unique phrases to disambiguate.
- Keep replacements scoped — prefer replacing focused paragraphs, code blocks, or table rows instead of huge sections.

## 3 — Agent interaction: DOC_UPDATE_PROMPT and agent options

DOC_UPDATE_PROMPT (used in surgical mode) instructs the Writer agent to:

- Act as the Lead Technical Writer for the project and file.
- NOT rewrite the whole file.
- Use the provided `patch_file` tool to perform surgical edits only.
- Compare: Existing File Content (read-only) vs Source Code Context + Git Diff.
- Identify drift (specific inaccurate sentences, code blocks, tables).
- For each correction, call patch_file(original_text, new_text) (i.e., call the tool with the required snippet and a reason).
- Preserve existing style and formatting when creating new_text.
- Do not return the full file content in the final response; instead return a brief summary of changes applied (e.g., "Updated CLI flags table...").

How DocumentationBuilder invokes the Writer:

- It constructs a fileContext: { content: currentContent, path: item.path } and creates patchTool = createPatchFileTool(fileContext).
- It builds the update prompt (DOC_UPDATE_PROMPT) with sourceContext, gitDiff, and currentContent.
- It calls aiAgents.writer.generateText(updatePrompt, options, metadata) with:
    - maxTokens: 4000
    - temperature: 0.1
    - tools: { patch_file: patchTool }
    - maxSteps: 5 (allows the agent up to five tool roundtrips)
- The writer agent is expected to call the tool multiple times if needed. The tool mutates fileContext.content; after the agent completes, DocumentationBuilder uses fileContext.content as finalContent and then commits/writes that content to disk. Note: the Writer agent may perform multiple patch_file calls up to maxSteps (commonly 5); the final, mutated in-memory content is what gets written after agent completion.

GenerateTextOptions (propagated through AIAgent → provider):

- temperature?: number
- maxTokens?: number
- tools?: Record<string, unknown>
- maxSteps?: number

The Vercel AI provider implementation forwards tools and maxSteps into the underlying generateText options when present; AIAgent.generateText accepts GenerateTextOptions.

Observability/metadata:

- DocumentationBuilder extends session metadata with properties (documentPath, documentType, mode: 'surgical-update') and tags for tracing in logs/telemetry.

## 4 — Examples

Example: (illustrative payload the agent would send to the patch tool — this mirrors the input schema)

```json
{
    "original_text_snippet": "The CLI option --skip-ai maps to the internal noAI option when calling the command implementation.",
    "new_text_snippet": "The CLI option --skip-ai maps to the internal `noAI` option when calling the command implementation. Use `--no-skip-ai` to explicitly disable the flag in environments that support implicit negation.",
    "reason": "Clarify internal mapping and negation behavior after recent CLI changes"
}
```

Sequence summary:

1. Agent receives DOC_UPDATE_PROMPT containing the existing file and source context.
2. Agent identifies one or more outdated snippets.
3. Agent calls patch_file (up to maxSteps times) with payloads like above.
4. patch_file returns success/error strings; agent may retry or adjust snippet.
5. After the agent completes, DocumentationBuilder optionally runs a review/refinement step (via a ReviewService or pipeline-level reviewer) to validate the final text against sourceContext.
6. DocumentationBuilder writes the final content to disk (using the mutated fileContext.content).

## 5 — Expected developer and operator outcomes

What you should expect from surgical updates:

- Smaller, focused diffs (easier PR review).
- Fewer stylistic rewrites; changes limited to code-related factual corrections.
- The Writer agent will return a short summary of applied edits (not the whole file).
- If the patch tool errors (non-unique or missing snippet), the Writer agent should try again (DocumentationBuilder allows up to maxSteps, commonly set to 5). If retries exhaust, you may see a logged error for that page.
- When you need a full rewrite (e.g., large structural changes or you explicitly want fresh style), run with `--force` to bypass surgical updates.

Operational notes:

- CI workflows can choose to apply patches automatically or surface them for manual review depending on how you integrate the CLI/action.
- Some projects or CI setups record documentation state to support later smart checks (one common path used in some workflows is `.sintesi/documentation.state.json`), but this location and the practice of storing state are integration-level decisions and not strictly guaranteed by the core DocumentationBuilder implementation. If your pipeline relies on stored state for smart skipping, ensure your integration writes and reads that state consistently.
- If the Writer agent cannot find a unique snippet, it will receive an error string from the tool. Improve the snippet (more surrounding context, include headers or code fences) and re-run.

## 6 — Troubleshooting & best practices

- "Error: Could not find the exact snippet" — check that your original snippet matches file content exactly (including indentation and blank lines). Try normalizing line endings to LF.
- "Error: The snippet provided matches N locations" — include more surrounding context to make the snippet unique (e.g., preceding heading or trailing comment).
- Prefer patching semantic units: code examples, command tables, single paragraphs. Avoid attempting to replace very large contiguous blocks in a single patch.
- If you want to force a complete regeneration (ignore surgical/patch path), run:
    - sintesi documentation --force
- Logs: enable verbose (`--verbose`) when invoking the CLI to see more detailed notes about the chosen mode and agent activity.

## 7 — Implementation pointers (for maintainers)

- The surgical-update integration lives in DocumentationBuilder.buildDocumentation:
    - It creates a fileContext and patch tool (createPatchFileTool).
    - It calls aiAgents.writer.generateText with tools and maxSteps when current content exists and force is false.
    - After tool-driven edits, the mutated fileContext.content is the final content written.
- The patch tool uses Zod schema for inputs and returns human-readable success/error strings to the agent.
- GenerateTextOptions were extended to allow passing tools and maxSteps through AIAgent → provider → underlying SDK.

---

<Callout type="info">
Relevant source identifiers:
- createPatchFileTool(fileContext) — packages/cli/src/tools/patch-file.ts
- DOC_UPDATE_PROMPT(...) — packages/cli/src/prompts/documentation.ts
- DocumentationBuilder.buildDocumentation — packages/cli/src/services/documentation-builder.ts
- GenerateTextOptions and tool forwarding — packages/ai/types.ts and packages/ai/providers/vercel-ai-provider.ts
</Callout>
