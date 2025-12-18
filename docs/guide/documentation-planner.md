---
title: 'Sintesi Documentation Command Guide'
description: 'A comprehensive guide on the sintesi documentation command, including its architecture and customization options.'
icon: '📚'
order: 1
---

# Sintesi Documentation Command Guide

The `sintesi documentation` command is a powerful tool designed to automate the generation of project documentation. This guide provides an in-depth look at how the command operates, particularly focusing on the new architectural discovery step powered by the Researcher agent, and how to customize its behavior.

## Command Overview

### CLI Command

```bash
sintesi documentation [options]
```

### Options

- `--output-dir` or `-o`: Specify the output directory for generated documentation. Default is `docs`.
- `--force` or `-f`: Force the command to run without checking for existing documentation state. Default is `false`.
- `--verbose`: Enable verbose logging for detailed output. Default is `false`.

### Signature

The command is defined in the source code as follows:

```typescript
async function documentationCommand(options: DocumentationOptions): Promise<void>;
```

### DocumentationOptions Interface

```typescript
interface DocumentationOptions {
    outputDir?: string; // --output-dir, alias -o, default: 'docs'
    force: boolean; // --force, alias -f, default: false
    verbose: boolean; // --verbose, default: false
}
```

## Command Execution Pipeline

The execution of the `sintesi documentation` command follows a structured pipeline:

1. **Pipeline Optimization**:
    - If `options.force` is `true`, skip state checks and treat the process as a greenfield project.
    - If not forced, read the state from `.sintesi/documentation.state.json` and respect a 20-minute timeout (infinite in CI).
    - If the last state indicates no drift, exit early.

2. **Smart Check**:
    - If not forced and the `docs` folder exists and is non-empty, perform a smart check to determine if documentation needs updating.

3. **Initialize AI Agents**:
    - Initialize AI agents, including the planner, writer, and optionally the researcher and reviewer.

4. **Project Analysis**:
    - Analyze the project to gather context and git differences.

5. **Planning**:
    - Create a documentation plan based on the project context and AI agent inputs.

6. **Generation**:
    - Generate the documentation based on the created plan.

## Architectural Discovery Step

### Overview

A significant enhancement in the `sintesi documentation` command is the integration of a discovery step powered by the Researcher agent. This step analyzes the project's architecture and provides insights that guide the documentation planning process.

### Discovery Process

1. **Context Gathering**: The Researcher agent reads the `README.md` and other relevant documentation to understand the project structure.
2. **Prompt Generation**: The `DOC_DISCOVERY_PROMPT` is used to generate a high-level architectural brief based on the project's `package.json`, file structure, and existing documentation.
3. **Architectural Brief Generation**: The Researcher agent processes the prompt and returns a concise architectural brief, which is appended to the documentation context.

### Example Output

The architectural brief might include insights such as:

- **Architecture**: Monorepo using Turborepo. Core logic is in `packages/core` (Rust), consumed by `packages/cli` (Node.js).
- **Pattern**: The CLI uses a Command Pattern approach (see `commands/` folder).
- **Key Flow**: The `Planner` service orchestrates `Agents` (see `packages/ai`).

## Customization & Configuration

### Environment Variables

You can customize the behavior of the `sintesi documentation` command using environment variables:

- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `MISTRAL_API_KEY`: API keys for AI services.
- Override model IDs with:
    - `SINTESI_PLANNER_MODEL_ID`
    - `SINTESI_WRITER_MODEL_ID`
    - `SINTESI_RESEARCHER_MODEL_ID`
    - `SINTESI_REVIEWER_MODEL_ID`

### RAG / Semantic Retrieval

In later stages of documentation generation, you can enable semantic retrieval by setting the `COHERE_API_KEY`, which allows for reranking of results.

## Usage Examples

### Basic Command

To generate documentation with default settings:

```bash
sintesi documentation
```

### Specifying Output Directory

To specify a custom output directory:

```bash
sintesi documentation --output-dir custom_docs
```

### Forcing Documentation Generation

To force the generation of documentation without checking for existing state:

```bash
sintesi documentation --force
```

### Enabling Verbose Logging

To enable verbose logging for detailed output:

```bash
sintesi documentation --verbose
```

## Conclusion

The `sintesi documentation` command is a robust tool that leverages AI to streamline the documentation process. By understanding its architecture and customization options, you can effectively utilize it to maintain high-quality documentation for your projects.
