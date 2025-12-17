---
title: Retrieval-Augmented Generation (RAG) Guide
description: Comprehensive guide to the Retrieval-Augmented Generation (RAG) pipeline, including architecture, setup, usage, and troubleshooting.
icon: 📚
order: 20
---

# Retrieval-Augmented Generation (RAG) Guide

## Overview

The Retrieval-Augmented Generation (RAG) pipeline enhances the documentation generation process by implementing a local vector index over a project's source files. This allows for semantic search capabilities, enabling the retrieval of relevant code and context chunks to augment AI prompts during documentation generation.

## RAG Architecture

The RAG pipeline consists of several key components:

- **RetrievalService**: The core orchestrator that manages indexing and context retrieval.
- **VectorStoreService**: A wrapper for LanceDB that stores embedded code chunks.
- **EmbeddingService**: Utilizes OpenAI's `text-embedding-3-small` model for embedding text.
- **RerankingService**: Integrates with the Cohere API for reranking retrieved results.
- **CodeChunkingService**: An AST-based chunker that segments source files into manageable pieces.
- **IndexingStateManager**: Tracks the state of indexed files to optimize updates.
- **GenerationContextService**: Provides methods to ensure the RAG index is built and to retrieve context.

## Environment Variable Setup

To utilize the RAG pipeline, you need to configure the following environment variables in your `.env` file:

| Name               | Required? | Effect                                            |
|--------------------|-----------|---------------------------------------------------|
| `OPENAI_API_KEY`   | Yes       | Required for initializing the EmbeddingService and RetrievalService. |
| `COHERE_API_KEY`   | No        | Enables the RerankingService to utilize the Cohere API for improved context retrieval. |

### Example `.env` Configuration

```plaintext
OPENAI_API_KEY=sk-your-openai-api-key-here
COHERE_API_KEY=your-cohere-api-key-here
```

## Building and Using the RAG Index

### Indexing the Project

To build or update the RAG index, you can use the `indexProject` method from the `RetrievalService`. This method scans your project files, chunks them, and stores the embeddings in LanceDB.

### Example Usage

```typescript
import { Logger } from './utils/logger';
import { RetrievalService } from './services/rag';

const logger = new Logger();
const service = new RetrievalService(logger, process.cwd());

// Build or update the index
await service.indexProject();
```

### Retrieving Context

To retrieve relevant context for a specific query, use the `retrieveContext` method. This method will return formatted text blocks containing the relevant code and context.

### Example Query

```typescript
const context: string = await service.retrieveContext("How does authentication work?");
console.log(context);
```

## Integration in Documentation Generation

When generating documentation, ensure the RAG index is built before fetching context. This can be done using the `GenerationContextService`.

### Example Integration

```typescript
// Before generating each documentation page
await generationContextService.ensureRAGIndex();

// To fetch semantic context for a query
const ragContext = await generationContextService.retrieveContext("How does auth work?");
```

## CLI Initialization of the RAG Index

The RAG index can be initialized through the CLI using the `documentation` command. This command ensures that the RAG index is built before generating documentation.

### CLI Command

```
sintesi documentation [options]
```

#### Options

- `--output-dir`, `-o`  string  default: `"docs"`  
  Output directory.
- `--force`, `-f`       boolean default: `false`  
  Force full regeneration (ignores existing state).
- `--verbose`           boolean default: `false`  
  Enable verbose logging.

## Troubleshooting Tips

- **Missing API Keys**: Ensure that both `OPENAI_API_KEY` and `COHERE_API_KEY` are set in your environment. The `EmbeddingService` will warn if the `OPENAI_API_KEY` is missing.
- **Indexing Issues**: If the index does not seem to update, check the file modification times and ensure that the files are not being ignored (e.g., `node_modules`, `dist`, `.git`).
- **Empty Context**: If the retrieved context is empty, verify that the query is relevant and that the index has been built successfully.

## Conclusion

The Retrieval-Augmented Generation (RAG) pipeline significantly enhances the documentation generation process by providing relevant context from your codebase. By following this guide, you can effectively set up and utilize the RAG features in your projects.

For further assistance or to report issues, please consult the [Sintesi GitHub repository](https://github.com/doctypedev/sintesi).
