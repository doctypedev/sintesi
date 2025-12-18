---
title: patch_file tool
description: Reference for the patch_file tool used by the documentation builder — API, behavior, constraints, and example usage.
icon: 🩹
order: 6
---

# patch_file tool (createPatchFileTool)

This page documents the surgical "patch_file" tool used by the documentation builder to apply targeted, in-memory edits to an existing Markdown file. The tool is intended for small, precise updates (e.g., fix a sentence, update a flag table row, adjust a code example) so the writer agent does not need to rewrite the whole document.

Contents:

- Overview
- API / schema
- In-memory mutation behavior
- Constraints, error messages and normalization
- Recommended usage patterns
- Example: how DocumentationBuilder uses the tool (with DOC_UPDATE_PROMPT)
- Example tool call

## Overview

- The tool is created by createPatchFileTool(fileContext) and returned in the form expected by the AI SDK's tool interface.
- It mutates fileContext.content in-memory. The caller (documentation builder) is responsible for persisting the modified content to disk.
- The tool is used in "surgical update" (partial update) mode: agents call the tool one or more times to apply specific replacements rather than returning full-file content.

Export:

- createPatchFileTool(fileContext: { content: string; path: string })

Source:

- packages/cli/src/tools/patch-file.ts

## API / Schema

Input schema (Zod) — all fields are strings:

- original_text_snippet (string)
    - Description: The exact literal text snippet to replace (including newlines/indentation). Must uniquely identify the section.
    - Key name: original_text_snippet

- new_text_snippet (string)
    - Description: The new text content to replace the old snippet with.
    - Key name: new_text_snippet

- reason (string)
    - Description: The reason for this change (used for human-readable success messages).
    - Key name: reason

Notes:

- The tool expects the snake_case keys shown above.
- The tool is created with the `tool({... inputSchema: patchParametersSchema, execute: ...})` pattern.

## In-memory mutation behavior

- The tool locates original_text_snippet inside fileContext.content and replaces it with new_text_snippet.
- The tool enforces uniqueness: if the snippet matches more than one occurrence, it returns an error and does not modify fileContext.content.
- If the original snippet is not found, the tool attempts a normalization pass:
    - Converts CRLF (\r\n) to LF (\n) in both file content and the provided snippet.
    - If the normalized snippet is found and uniquely matches, the replacement is applied to the normalized content and assigned back to fileContext.content (note: this may change line endings to LF).
    - Success responses indicate when normalization was used.
- The replacement uses String.replace (first occurrence) after uniqueness checks (uniqueness is verified by counting occurrences using split(...).length - 1).
- The tool returns a short string message describing success or the specific error.

Important: the tool only mutates fileContext.content in-memory. The DocumentationBuilder writes fileContext.content to disk after the agent run completes.

## Constraints & error messages

- Exact-literal matching: original_text_snippet must match the existing text exactly (including whitespace & indentation) unless normalization catches only line-ending differences.
- Uniqueness:
    - If occurrences > 1, the tool returns:
        - "Error: The snippet provided matches {n} locations in {path}. Please provide more surrounding context to ensure uniqueness."
    - If normalized content finds multiple matches:
        - "Error: The snippet provided matches {n} locations in {path} (after normalizing line endings). Please provide more surrounding context to ensure uniqueness."
- Not found:
    - If the snippet cannot be found (even after normalization), the tool returns:
        - "Error: Could not find the exact snippet in {path}. Ensure you are quoting the existing text exactly."
- Success responses:
    - Normal replace: `Success: Applied patch for "{reason}".`
    - Normalized line endings replace: `Success: Applied patch for "{reason}" (normalized line endings).`

Guidance:

- Provide surrounding context in original_text_snippet if a snippet is ambiguous.
- Preserve the document's existing style/formatting when composing new_text_snippet (the writer prompt instructs agents to preserve tone and formatting).

## Recommended usage patterns

- Surgical updates: use the tool to change small factual drift (flag names, short paragraphs, code sample lines, tables). Avoid using it for large rewrites.
- Multiple sequential patches: the agent may call the tool multiple times in sequence (builder uses maxSteps to allow several tool roundtrips).
- Preserve style: new_text_snippet should match existing document tone, indentation, and fencing (code blocks, tables, lists).
- Provide exact snippets: include surrounding lines if necessary (table header + row, fenced code block markers) to guarantee unique matching.

## Example: How DocumentationBuilder uses the tool

High-level flow (implementation in packages/cli/src/services/documentation-builder.ts):

1. When an existing file is detected and not forcing a full regeneration, DocumentationBuilder prepares:
    - fileContext = { content: currentContent, path: item.path }
    - patchTool = createPatchFileTool(fileContext)

2. The builder constructs an update prompt (DOC_UPDATE_PROMPT) containing:
    - Source code context (ground truth)
    - Git diff / Impact summary
    - The existing file content (for reference)
    - Instructions telling the writer agent to call patch_file(original_text, new_text) for each correction and to preserve style.

3. The writer agent is executed with GenerateTextOptions that include:
    - tools: { patch_file: patchTool }
    - maxSteps: N (e.g., 5) — allows multiple tool roundtrips

4. The agent calls patch_file multiple times (if needed). Each successful call mutates fileContext.content in-memory.

5. When the agent finishes, DocumentationBuilder uses fileContext.content as the final file content and writes it to disk:
    - finalContent = fileContext.content
    - writeFileSync(fullPath, finalContent)

Key points visible in the code:

- The builder sets tools: { patch_file: patchTool } and maxSteps: 5 when invoking aiAgents.writer.generateText in surgical-update mode.
- The DOC_UPDATE_PROMPT explicitly instructs the agent to call patch_file(original_text, new_text) for each correction and to avoid returning the whole file.

## DOC_UPDATE_PROMPT (writer instructions)

The DOC_UPDATE_PROMPT instructs the writer:

- "Do NOT rewrite the file. Use the `patch_file` tool to surgically modify ONLY the outdated sections."
- Provide the existing file content as read-only reference.
- For each correction, call patch_file(original_text, new_text).
- Preserve style and formatting exactly when composing new_text.
- If you cannot find a unique match, include more surrounding context in the snippet.
- Do NOT return the full file content as the final LLM output — return a brief summary of applied changes instead.

(Refer to packages/cli/src/prompts/documentation.ts for the full prompt text.)

## Example tool call

Tool input (JSON):

{
"original_text_snippet": "Old API name: `doThing()`\n",
"new_text_snippet": "Old API name: `doThingV2()`\n",
"reason": "rename doThing -> doThingV2 in source"
}

Possible return values:

- Success: Applied patch for "rename doThing -> doThingV2 in source".
- Error: Could not find the exact snippet in docs/reference/commands.md. Ensure you are quoting the existing text exactly.
- Error: The snippet provided matches 2 locations in docs/guide/usage.md. Please provide more surrounding context to ensure uniqueness.
- Success: Applied patch for "reason" (normalized line endings).

After success:

- fileContext.content is updated in-memory to include the replacement.
- DocumentationBuilder later writes fileContext.content to disk.

## Practical tips for prompt authors and agent writers

- Always include a little extra context (one or two surrounding lines) in original_text_snippet to make matches unique and robust against similar repeated phrases.
- When replacing code blocks or table rows, include fence markers (```lang) or the full table row with pipe separators to avoid accidental partial matches.
- If a replacement affects line endings, be aware that the tool's normalization pass will convert them to LF for the modified content.
- Limit number of patches per run to keep tool interactions deterministic (builder config uses maxSteps, e.g., 5).

## Summary

- createPatchFileTool provides a safe, surgical way for writer agents to apply targeted, in-memory updates to existing documentation.
- It enforces exact-literal matching and uniqueness, offers a helpful normalization fallback for line endings, and returns explicit success/error messages.
- The DocumentationBuilder supplies this tool to writer agents (via GenerateTextOptions.tools) and persists the mutated fileContext.content after the agent completes its patches.
