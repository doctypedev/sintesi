---
title: Troubleshooting Guide
description: A comprehensive guide to resolving common issues with Sintesi, including API key errors and documentation drift detection.
icon: ⚙️
order: 3
---

# Troubleshooting Guide

If you encounter issues while using Sintesi, this guide provides solutions to common problems, including API key errors and documentation drift detection.

## Common Issues

### 1. API Key Errors

Sintesi requires specific API keys to function correctly. If you encounter an error related to API keys, consider the following:

- **Missing OpenAI API Key**:
  If the `OPENAI_API_KEY` is not set in your environment variables, Sintesi will throw an error indicating that it is required. Ensure that you have added the key to your `.env` file as follows:

    ```plaintext
    OPENAI_API_KEY=sk-your-openai-api-key-here
    ```

- **Incorrect API Key**:
  Verify that the API key you are using is valid and has the necessary permissions. You can check your API keys on the respective provider's dashboard.

### 2. Documentation Drift Detection

Sintesi includes a drift detection feature to ensure that your documentation remains in sync with your codebase. If you encounter issues with drift detection, follow these steps:

- **Drift Detected**:
  If Sintesi reports drift but you believe the documentation is accurate, you can run the drift check with the `--no-strict` flag to bypass strict checks temporarily:

    ```bash
    npx sintesi check --verbose --smart --base main --no-strict
    ```

- **Documentation Not Updating**:
  Ensure that your code changes are committed and that the CI/CD pipeline is correctly configured to trigger Sintesi. If you are manually generating documentation, use the following command to force regeneration:

    ```bash
    npx sintesi documentation --force
    ```

### 3. General Troubleshooting Steps

- **Verbose Logging**:
  Enable verbose logging to get more detailed output, which can help identify issues:

    ```bash
    npx sintesi check --verbose
    ```

- **Check Environment Variables**:
  Ensure that all required environment variables are set correctly. You can refer to the `.env.example` file for guidance on the necessary keys.

## Usage Examples

Here are some examples of how to use Sintesi commands effectively:

- **Check for Documentation Drift**:

    ```bash
    npx sintesi check --verbose --smart --base main
    ```

- **Generate Documentation**:

    ```bash
    npx sintesi documentation --force
    ```

## Additional Resources

For further assistance, consider checking the following resources:

- [Sintesi GitHub Repository](https://github.com/doctypedev/sintesi)
- [Documentation](https://github.com/doctypedev/sintesi/tree/main/docs)

If you continue to experience issues, please reach out to the community or file an issue on the GitHub repository.
