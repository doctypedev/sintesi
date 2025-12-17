---
title: "AI Tools Guide"
description: "Comprehensive guide on using the AI toolset in sintesi-monorepo-root."
icon: "🤖"
order: 2
---

# AI Tools Guide

The `sintesi-monorepo-root` project includes a powerful AI toolset designed to enhance your documentation workflow. This guide provides an overview of the available tools and how to utilize them effectively.

## Overview of AI Tools

The AI toolset includes the following functionalities:

- **Search**: Find specific text patterns in your codebase using regex.
- **ReadFile**: Access the content of files directly.
- **ListFiles**: Retrieve a list of files in a specified directory.
- **GetDependencies**: Analyze file dependencies within your project.

## Getting Started

To use the AI tools, you need to import and configure them via the `createTools` function. Below is a basic example of how to set this up:

```javascript
import { createTools } from 'sintesi-monorepo-root/ai/tools';

const tools = createTools(rootPath);
```

### Parameters

- `rootPath` (string): The root directory of your project.
- `contextFiles` (string[]): Optional. An array of context files to consider.
- `debug` (boolean): Optional. Set to `true` to enable debug logging.

## Tool Descriptions

### 1. Search Tool

The search tool allows you to search for text patterns within your codebase. It supports regex for advanced searching.

#### Usage

```javascript
const results = await tools.search({ query: 'your-regex-pattern' });
```

#### Input Schema

- `query` (string): The text or regex pattern to search for.

#### Example

```javascript
const searchResults = await tools.search({ query: 'function\\s+\\w+' });
console.log(searchResults);
```

### 2. ReadFile Tool

This tool enables you to read the content of a specified file.

#### Usage

```javascript
const content = await tools.readFile({ filePath: 'path/to/your/file.js' });
```

#### Input Schema

- `filePath` (string): The path to the file you want to read.

#### Example

```javascript
const fileContent = await tools.readFile({ filePath: 'src/index.js' });
console.log(fileContent);
```

### 3. ListFiles Tool

Use this tool to retrieve a list of files in a specified directory.

#### Usage

```javascript
const files = await tools.listFiles({ directory: 'src' });
```

#### Input Schema

- `directory` (string): The directory path to list files from.

#### Example

```javascript
const fileList = await tools.listFiles({ directory: 'src' });
console.log(fileList);
```

### 4. GetDependencies Tool

Analyze the dependencies of files within your project.

#### Usage

```javascript
const dependencies = await tools.getDependencies({ filePath: 'src/index.js' });
```

#### Input Schema

- `filePath` (string): The path to the file for which you want to analyze dependencies.

#### Example

```javascript
const fileDependencies = await tools.getDependencies({ filePath: 'src/index.js' });
console.log(fileDependencies);
```

## Conclusion

The AI toolset in `sintesi-monorepo-root` provides essential functionalities to streamline your documentation process. By leveraging these tools, you can enhance your productivity and ensure your documentation is accurate and up-to-date.

For further assistance or to report issues, please visit our [GitHub Issues](https://github.com/doctypedev/sintesi/issues) page.
