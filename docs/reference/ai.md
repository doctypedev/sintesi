---
title: AI Integration & Generation Options
description: Developer reference for AI generation options, tool integration, and agent-driven behavior (GenerateTextOptions, tools, maxSteps).
icon: 🤖
order: 5
---

# AI Integration & Generation Options

This document describes the runtime options and behavior for generating text with the AI agents in this project. It covers the GenerateTextOptions type, how "tools" are passed to providers, and behavioral notes for agent-driven generation (tool roundtrips and maxSteps).

## GenerateTextOptions

Type (from packages/ai/types.ts)

- GenerateTextOptions
    - temperature?: number
        - Controls response randomness. If omitted, the provider falls back to model-configured temperature.
    - maxTokens?: number
        - Maximum number of tokens to generate for the completion. If omitted, provider uses model-configured maxTokens or a sensible default.
    - tools?: Record<string, unknown>
        - A record of provider/SDK-style tools. The code defines this as Record<string, unknown> to allow provider-specific tool objects.
        - Tools are passed directly to the underlying AI SDK; each entry is typically an SDK tool created with ai.tool(...) or an equivalent provider-specific tool object.
    - maxSteps?: number
        - Limits the maximum number of tool roundtrips / agent reasoning steps. Used for agent-style generations that call tools iteratively.

Notes:

- The GenerateTextOptions interface is intentionally generic (Record<string, unknown>) for tools because providers accept provider-specific tool objects. The Vercel provider forwards the options through to the underlying SDK unchanged (see "How tools are passed" below).
- For non-agent / single-shot generations, omit tools and maxSteps (providers assume a single-step generation by default).

## How tools are passed to providers

Implementation detail (VercelAIProvider - packages/ai/providers/vercel-ai-provider.ts):

- When generateText is called with a GenerateTextOptions object, the provider builds a genOptions object and attaches:
    - genOptions.tools = options.tools (if provided)
    - genOptions.maxSteps = options.maxSteps (if provided)
- These fields are forwarded to the underlying generateText SDK call (generateText(genOptions)).
- Helicone proxy usage:
    - When HELICONE_API_KEY is set and the request metadata indicates observability should be enabled, the provider attempts to initialize a Helicone-wrapped model and call through the Helicone proxy (the provider adds observability config).
    - If Helicone initialization fails (for example, an error occurs while obtaining the Helicone model wrapper during setup), the provider falls back to using the native provider implementation and calls the underlying SDK with the same genOptions (tools and maxSteps preserved).
    - Important: there is no automatic runtime retry from Helicone to the native provider if a Helicone call fails after initialization. The fallback happens only when Helicone cannot be initialized during setup; failed runtime calls through an initialized Helicone proxy are not automatically retried against the native backend by the provider.
- Tools and maxSteps are forwarded unchanged whether the call is made through Helicone (when initialization succeeds) or via the native provider (when a fallback happens during initialization).

Practical implications:

- Tools must match the shape expected by the SDK/provider you are using (e.g., Vercel AI SDK tool shapes). Because tools are typed as Record<string, unknown>, providers do not enforce tool types and will forward them as-is.
- Providers do not perform deep validation of tool objects in the AI module; they are attached as-is to the SDK call.

## Agent-driven generation: tool roundtrips and maxSteps

Behavioral overview:

- Agent-driven flows allow the model to call tools (provided in GenerateTextOptions.tools) during generation. Each tool invocation can:
    - Return data to the model (e.g., query results).
    - Mutate in-memory context (for example, the patch_file tool mutates fileContext.content).
- The maxSteps option controls how many back-and-forth "reasoning" / "tool call" iterations the model may perform. Each roundtrip typically includes:
    1. Model decides to call a tool and issues a call.
    2. Tool executes and returns a result.
    3. Model receives the tool output and may call another tool or emit final text.

Guidance and conventions:

- Default single-shot generation = 1 step. Agent workflows should set maxSteps > 1 when expecting multiple tool calls.
- Choose a conservative maxSteps (e.g., 2–5). The repository uses 5 in surgical update scenarios to allow multiple patch operations but limit runaway tool loops.
- Ensure tools are deterministic and idempotent where possible (tools may be invoked multiple times while the model reasons).
- Tools that mutate shared context (like the patch_file tool) should return clear success/error strings so the model can reason about the result.

Example: surgical document update flow (from packages/cli/src/services/documentation-builder.ts)

- When updating an existing file the builder creates an in-memory fileContext and a patch tool:
    - createPatchFileTool(fileContext)
- The writer agent is invoked with tools and a higher maxSteps so the model can call patch_file multiple times to apply targeted edits.

Example usage (extracted from the codebase)

```ts
// fileContext: { content: currentContent, path: item.path }
// patchTool: tool created by createPatchFileTool(fileContext)

// Agent call that enables surgical updates:
const summary = await aiAgents.writer.generateText(
    updatePrompt,
    {
        maxTokens: 4000,
        temperature: 0.1,
        tools: { patch_file: patchTool },
        maxSteps: 5, // allow up to 5 tool roundtrips
    },
    extendMetadata(sessionMetadata, {
        feature: 'content-update',
        properties: {
            documentPath: item.path,
            documentType: item.type,
            mode: 'surgical-update',
        },
        tags: ['content', 'update', item.type],
    }),
);

// After the agent run the tool mutates fileContext.content; the agent returns a short summary string.
const finalContent = fileContext.content;
```

Important behavioral note (surgical-update):

- The agent returns a human-readable summary (e.g., "Updated CLI flags table..."), while the actual file changes are applied by the tool mutating the in-memory fileContext. Consumers should use the mutated context (fileContext.content) as the authoritative output.

## Reasoning model restrictions

- The current VercelAIProvider implementation does not implement special handling that omits temperature or maxTokens for model IDs matching /^o[13]-/. In other words, temperature and maxTokens are forwarded to the SDK unchanged for those models.
- If your usage requires special parameter restrictions for certain model families (for example, omitting temperature/maxTokens for reasoning-focused models), that behavior must be implemented in the provider code; it is not present by default.
- Tools and maxSteps are forwarded to the SDK for all models.

## Best practices & pitfalls

- Always pass tools as a mapping (Record<string, unknown>) matching the provider SDK's expectations.
- Limit maxSteps to a reasonable number to avoid long-running or looping agent executions.
- Make tools idempotent where possible and return concise, machine-friendly results (success/error messages).
- When using Helicone for observability, be aware the provider may fall back to the native backend only if Helicone initialization fails during setup — there is no automatic runtime retry to the native provider for Helicone call errors. Tool objects are forwarded unchanged when such a fallback occurs.
- For single-shot text generation (no agent behavior), omit tools and maxSteps to keep calls simple and efficient.

## Reference: relevant symbols

- GenerateTextOptions (packages/ai/types.ts) — temperature, maxTokens, tools (Record<string, unknown>), maxSteps.
- VercelAIProvider.generateText (packages/ai/providers/vercel-ai-provider.ts)
    - Forwards tools and maxSteps to the underlying generateText SDK call.
    - Attempts Helicone proxy initialization when enabled; falls back to native provider only if Helicone initialization fails during setup.
    - Does not omit temperature/maxTokens for reasoning model IDs by default.
- createPatchFileTool (packages/cli/src/tools/patch-file.ts)
    - Example tool used for surgical updates (mutates fileContext.content).

---
