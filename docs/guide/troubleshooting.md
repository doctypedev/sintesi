---
title: Troubleshooting
description: Common issues and solutions when using Sintesi.
icon: ⚙️
order: 3
---

# Troubleshooting

If you encounter issues while using Sintesi, this guide provides solutions to common problems.

## Installation Errors

### Issue
You may experience errors during the installation process.

### Solution
Ensure you are using the correct package name:
```bash
npm install -g sintesi-monorepo-root
```
If the error persists, check your internet connection and ensure that your Node.js and npm versions are up to date.

## Documentation Not Updating

### Issue
Your documentation may not reflect the latest changes in your codebase.

### Solution
Make sure to run the `sintesi check` command in your CI/CD pipeline to verify documentation integrity:
```bash
sintesi check
```
This command ensures that your documentation is in sync with your latest code changes.

## API Key Issues

### Issue
You may encounter problems related to your OpenAI API key.

### Solution
Double-check that your OpenAI API key is correctly set in your GitHub secrets. Ensure that the key is valid and has the necessary permissions.

## AI Toolset Issues

### Issue
Problems may arise when using the new AI toolset features.

### Solution
Ensure you are importing and configuring the tools correctly. Here’s how to set up the AI tools:
```javascript
import { createTools } from 'sintesi-monorepo-root/ai/tools';

const tools = createTools(rootPath);
```
If you encounter issues with specific tools, refer to the tool's documentation for usage examples.

### Usage Example: Search Tool
To search for a text pattern in your codebase, use the following code:
```javascript
const results = await tools.search({ query: 'your-regex-pattern' });
console.log(results);
```

## Debugging

### Issue
You may need to debug your AI tool interactions.

### Solution
Enable debug logging by setting the debug flag in your configuration:
```javascript
const tools = createTools(rootPath, [], true); // true enables debug mode
```
This will provide detailed logs of the tool's operations, helping you identify any issues.

## Further Assistance

If you continue to experience issues, please refer to our [GitHub Issues](https://github.com/doctypedev/sintesi/issues) page for additional support.
