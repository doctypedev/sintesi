---
title: Observability Guide
description: A comprehensive guide on setting up and using observability features, including Helicone integration.
icon: 📊
order: 3
---

# Observability Guide

## Overview

This guide provides detailed instructions on setting up and utilizing observability features within the Sintesi documentation generation tool. By integrating with Helicone, you can effectively track AI requests and associated costs, enhancing your monitoring capabilities.

## Core Concepts

The observability features in Sintesi are primarily centered around the following components:

- **AIAgent**: Manages AI interactions for documentation generation.
- **VercelAIProvider**: Handles AI model selection and integrates with Helicone for observability.
- **createObservabilityMetadata**: Generates metadata for observability tracking.

## Setting Up Observability

### Environment Variables

To enable observability features, you need to configure the following environment variables in your `.env` file:

```plaintext
# OpenAI API Key (REQUIRED for AI-powered documentation)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Helicone API Key (OPTIONAL for AI observability and cost tracking)
HELICONE_API_KEY=sk-helicone-your-api-key-here
```

Ensure that the `HELICONE_API_KEY` is set if you wish to track AI requests in the Helicone dashboard.

## API / Interface Details

### Functions

#### createObservabilityMetadata

This function generates metadata for observability tracking.

```typescript
createObservabilityMetadata(options: {
    feature?: string;
    projectName?: string;
    sessionId?: string;
    additionalProperties?: Record<string, string | number | boolean>;
    additionalTags?: string[];
}): ObservabilityMetadata
```

- **Arguments**:
    - `options`: An object containing optional properties for observability.
- **Return Value**: Returns an `ObservabilityMetadata` object.

**Example Usage**:

```typescript
const metadata = createObservabilityMetadata({
    feature: 'smart-check-readme',
    projectName: 'MyProject',
    additionalTags: ['check', 'analysis'],
});
```

#### VercelAIProvider.getModel

This method retrieves the AI model instance, optionally using observability metadata.

```typescript
private getModel(metadata?: ObservabilityMetadata): any
```

- **Arguments**:
    - `metadata`: Optional observability metadata.
- **Return Value**: Returns the model instance.

**Example Usage**:

```typescript
const model = this.getModel(metadata);
```

### CLI Commands

#### sintesi documentation

Generate documentation with the following command:

```bash
sintesi documentation --output-dir <dir> --force
```

- `--output-dir <dir>`: Specifies the output directory for generated documentation (default: `docs`).
- `--force`: Regenerate documentation, ignoring existing files.

#### sintesi check

Verify documentation integrity with:

```bash
sintesi check --readme --doc --no-strict
```

- `--readme`: Check README for drift.
- `--doc`: Check documentation for drift.
- `--no-strict`: Allow non-blocking CI usage.

## Usage Patterns

### Observability Metadata Creation

To create observability metadata, use the `createObservabilityMetadata` function as shown in the example above.

### Using Helicone in VercelAIProvider

When utilizing Helicone, you can retrieve the model instance with observability metadata:

```typescript
const model = this.getModel(metadata);
```

## Troubleshooting and FAQs

### Common Issues

- **Documentation not updating**: Ensure that your CI/CD pipeline is correctly configured and that the `sintesi check` command is included.
- **API key errors**: Double-check that your API keys are correctly set in your environment variables.

### Frequently Asked Questions

- **Can I use Sintesi with any programming language?**
  Yes, Sintesi is designed to work with various programming languages by analyzing the code structure.

- **How do I contribute to Sintesi?**
  We welcome contributions! Please check out our [Contributing Guide](./docs/community/contributing.md).

## Conclusion

By following this guide, you can effectively set up and utilize observability features in Sintesi, allowing for better tracking and monitoring of AI interactions. For further assistance, refer to the official documentation or reach out to the community.
