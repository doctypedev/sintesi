---
title: "createTools API Reference"
description: "Comprehensive reference for the createTools function, including configuration, returned toolset, and usage examples."
icon: "🛠️"
order: 2
---

# createTools API Reference

The `createTools` function is a key component of the Sintesi AI toolset, enabling users to configure and utilize various tools for enhanced documentation workflows. This document provides an overview of the function's configuration options, the toolset it returns, and practical usage examples.

## Function Signature

```typescript
createTools(rootPath: string, contextFiles?: string[], debug?: boolean): Toolset
```

### Parameters

- **rootPath** (string): The root directory of the project where the tools will operate.
- **contextFiles** (string[], optional): An array of context files that may be used by the tools.
- **debug** (boolean, optional): If set to `true`, enables debug logging for the tools.

### Returned Toolset

The `createTools` function returns an object containing the following tools:

1. **search**: 
   - **Description**: Searches the codebase for a text pattern (supports regex).
   - **Input Schema**:
     - `query` (string): The text or regex pattern to search for.

2. **readFile**: 
   - **Description**: Reads the content of a specified file.
   - **Input Schema**:
     - `filePath` (string): The path of the file to read.

3. **listFiles**: 
   - **Description**: Retrieves a list of files in a specified directory.
   - **Input Schema**:
     - `directoryPath` (string): The path of the directory to list files from.

4. **getDependencies**: 
   - **Description**: Analyzes file dependencies within the project.
   - **Input Schema**:
     - `filePath` (string): The path of the file for which to analyze dependencies.

## Usage Examples

### Basic Setup

To use the tools provided by `createTools`, you can import and configure them as follows:

```javascript
import { createTools } from 'sintesi-monorepo-root/ai/tools';

const rootPath = '/path/to/your/project';
const tools = createTools(rootPath, [], true); // Enable debug logging
```

### Searching for a Pattern

To search for a specific text pattern in your codebase, use the `search` tool:

```javascript
const searchResults = await tools.search({ query: 'functionName' });
console.log(searchResults);
```

### Reading a File

To read the content of a file, use the `readFile` tool:

```javascript
const fileContent = await tools.readFile({ filePath: '/path/to/your/file.js' });
console.log(fileContent);
```

### Listing Files in a Directory

To list all files in a specific directory, use the `listFiles` tool:

```javascript
const files = await tools.listFiles({ directoryPath: '/path/to/your/directory' });
console.log(files);
```

### Analyzing File Dependencies

To analyze the dependencies of a specific file, use the `getDependencies` tool:

```javascript
const dependencies = await tools.getDependencies({ filePath: '/path/to/your/file.js' });
console.log(dependencies);
```

## Conclusion

The `createTools` function provides a powerful set of utilities for enhancing your documentation workflow. By leveraging these tools, you can efficiently search, read, and analyze your codebase, ultimately improving the quality and accuracy of your documentation.

For more information, visit the [Sintesi GitHub Repository](https://github.com/doctypedev/sintesi).
