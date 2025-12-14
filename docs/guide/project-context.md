---
title: Project Context Detection Features
description: Comprehensive guide on the new project context detection features, including app type and entry point detection.
icon: 🔍
order: 1
---

# Project Context Detection Features

## Overview

The sintesi-monorepo-root project has introduced enhanced project context detection capabilities. This feature allows the tool to intelligently determine the type of application (CLI, web, backend) and identify the appropriate entry point based on the project structure. These enhancements significantly improve documentation planning and generation, ensuring that the documentation accurately reflects the current state of the project.

## App Type Detection

The tool analyzes the `package.json` file and the project's dependencies to determine the application type. The following types are recognized:

- **CLI**: Detected when command files are present or when dependencies like `yargs`, `commander`, or `oclif` are found.
- **Web**: Identified through the presence of frameworks such as `React`, `Vue`, `Next.js`, or `Angular`.
- **Backend**: Recognized when dependencies like `NestJS`, `Express`, or `Fastify` are present.
- **Library**: If the project does not fit into the above categories but is structured as a reusable library.

### Example Detection Logic

The detection logic is implemented in the `detectProjectConfig` method, which checks for relevant command files and dependencies:

```typescript
if (depNames.some(d => d.includes('react') || d.includes('vue'))) {
    appType = 'web';
} else if (depNames.some(d => d.includes('nestjs') || d.includes('express'))) {
    appType = 'backend';
} else if (depNames.some(d => d.includes('yargs'))) {
    appType = 'cli';
}
```

## Entry Point Detection

The tool also identifies the entry point of the application, which serves as the main file for execution. This is crucial for generating accurate documentation regarding command arguments and routing configurations.

### Entry Point Logic

The entry point is determined based on the `entryPoint` property in the project configuration. If the entry point file exists, its content is read and used as the source of truth for command arguments and application initialization.

```typescript
if (projectConfig.entryPoint && existsSync(projectConfig.entryPoint)) {
    const entryContent = readFileSync(projectConfig.entryPoint, 'utf-8');
    // Process entryContent for documentation
}
```

## Impact on Documentation Planning

The enhancements in project context detection directly influence how documentation is structured and generated. The tool will now:

1. **Limit Documentation to Verified Commands**: Only document commands that are explicitly listed in the project configuration.
2. **Use Accurate Entry Points**: Ensure that the documentation reflects the actual entry points of the application, providing users with the correct initialization instructions.
3. **Adapt Documentation Based on App Type**: Tailor the documentation structure based on whether the project is a CLI, web application, or backend service.

### Verified Commands

The following commands are considered verified and should be documented:

- Commands detected in the project configuration.
- Commands that are critical for the application's functionality.

## Usage Examples

### CLI Command Example

For a CLI application, the command usage might look like this:

```bash
$ sintesi-cli <command> [options]
```

### Web Application Entry Point

For a web application, the entry point might be defined as follows:

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

## Conclusion

The new project context detection features enhance the sintesi-monorepo-root's ability to generate accurate and relevant documentation. By understanding the application type and entry points, the tool ensures that users receive the most pertinent information for their specific use cases.

For further details, please refer to the [official repository](https://github.com/sintesi/sintesi-monorepo-root).
