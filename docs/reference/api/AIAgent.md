---
title: AIAgent API Reference
description: Comprehensive reference for the AIAgent class and related exports in the sintesi-monorepo-root project.
icon: 🤖
order: 1
---

# AIAgent API Reference

The `AIAgent` class is a core component of the sintesi-monorepo-root project, providing functionalities for generating text and interacting with AI tools. This document outlines the class methods, options, and related exports.

## AIAgent Class

### Constructor

```typescript
constructor(config: AIAgentConfig)
```

- **Parameters**:
  - `config`: Configuration object for the agent, including model settings and debug flags.

### Methods

#### `generateText`

```typescript
async generateText(prompt: string, options: { temperature?: number; maxTokens?: number; tools?: any; maxSteps?: number } = {}): Promise<string>
```

- **Parameters**:
  - `prompt`: The input text to generate a response for.
  - `options`: An optional object that can include:
    - `temperature`: Controls the randomness of the output (default: 1).
    - `maxTokens`: The maximum number of tokens to generate (default: 1000).
    - `tools`: An array of tools to be used during text generation.
    - `maxSteps`: The maximum number of steps for the generation process.

- **Returns**: A promise that resolves to the generated text.

- **Usage Example**:

```typescript
const agent = new AIAgent(config);
const response = await agent.generateText("What is the capital of France?", {
  temperature: 0.7,
  maxTokens: 50,
  tools: ["search", "readFile"],
  maxSteps: 5
});
console.log(response);
```

#### `get debug`

```typescript
public get debug(): boolean
```

- **Returns**: The current state of the debug flag, indicating whether debug logging is enabled.

### Related Exports

#### `createAIAgentsFromEnv`

```typescript
createAIAgentsFromEnv(): AIAgent[]
```

- **Description**: A function that creates instances of `AIAgent` based on environment variables. This is useful for setting up multiple agents with different configurations.

#### `createTools`

```typescript
createTools(rootPath: string, contextFiles: string[] = [], debug: boolean = false): Tools
```

- **Parameters**:
  - `rootPath`: The root directory of the project.
  - `contextFiles`: An optional array of context files.
  - `debug`: A boolean flag to enable debug logging.

- **Returns**: An object containing various tools for interacting with the codebase.

- **Usage Example**:

```typescript
import { createTools } from 'sintesi-monorepo-root/ai/tools';

const tools = createTools('/path/to/project', [], true);
```

## Debugging

The `AIAgent` class includes a debug flag that can be accessed via the `debug` property. When enabled, it provides detailed logging of the text generation process, including tool calls and results.

### Example of Debug Logging

When the debug flag is set to true, the following information will be logged during text generation:

- Raw step details
- Finish reasons for each step
- Tool calls and their arguments
- Tool results

## Conclusion

The `AIAgent` class and its related exports provide a robust framework for generating text and utilizing AI tools within the sintesi-monorepo-root project. For further information, please refer to the [GitHub repository](https://github.com/doctypedev/sintesi).
