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

## Incremental Indexing Feature

### Overview

The new incremental indexing feature optimizes the RAG pipeline by leveraging Git-based diffing to only process changed files. This is achieved through the `GitBinding` class, which analyzes changes between commits and maintains a local state file at `.sintesi/rag-state.json`.

### Key Components

- **GitBinding**: A Rust-powered NAPI binding that provides methods for analyzing changes in the Git repository.
- **IndexingStateManager**: Manages the state of the indexing process, including the last processed commit SHA and metadata for each file.

### How It Works

1. **State Persistence**: The last indexed commit SHA and per-file embedding metadata are stored in `.sintesi/rag-state.json`.
2. **Incremental Check**: On each run, the current commit SHA is compared with the last indexed SHA. If they match and the workspace is clean, the indexing process is short-circuited.
3. **Diffing**: If the commit has changed, `GitBinding.analyzeChanges(lastSha)` is invoked to get a semantic diff of the modified files. If this fails, a fallback to file timestamps is used.
4. **Updating State**: Stale vector chunks are deleted for removed or updated files, and new embeddings are created for changed files. The state is then updated with the new chunk IDs and timestamps.

### Configuration and Caching

To optimize performance, it is recommended to cache the `.sintesi` state in CI environments. Below is an example configuration for GitHub Actions:

```yaml
- name: Cache Sintesi RAG State
  uses: actions/cache@v4
  with:
      path: .sintesi
      key: sintesi-rag-${{ runner.os }}-${{ github.sha }}
      restore-keys: |
          sintesi-rag-${{ runner.os }}-
```

## Environment Variable Setup

To utilize the RAG pipeline, you need to configure the following environment variables in your `.env` file:

| Name             | Required? | Effect                                                                                 |
| ---------------- | --------- | -------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY` | Yes       | Required for initializing the EmbeddingService and RetrievalService.                   |
| `COHERE_API_KEY` | No        | Enables the RerankingService to utilize the Cohere API for improved context retrieval. |

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
const context: string = await service.retrieveContext('How does authentication work?');
console.log(context);
```

## Integration in Documentation Generation

When generating documentation, ensure the RAG index is built before fetching context. This can be done using the `GenerationContextService`.

### Example Integration

```typescript
// Before generating each documentation page
await generationContextService.ensureRAGIndex();

// To fetch semantic context for a query
const ragContext = await generationContextService.retrieveContext('How does auth work?');
```

## Troubleshooting Tips

- **Missing API Keys**: Ensure that both `OPENAI_API_KEY` and `COHERE_API_KEY` are set in your environment. The `EmbeddingService` will warn if the `OPENAI_API_KEY` is missing.
- **Indexing Issues**: If the index does not seem to update, check the file modification times and ensure that the files are not being ignored (e.g., `node_modules`, `dist`, `.git`).
- **Empty Context**: If the retrieved context is empty, verify that the query is relevant and that the index has been built successfully.

## Conclusion

The Retrieval-Augmented Generation (RAG) pipeline significantly enhances the documentation generation process by providing relevant context from your codebase. By following this guide, you can effectively set up and utilize the RAG features in your projects.

For further assistance or to report issues, please consult the [Sintesi GitHub repository](https://github.com/doctypedev/sintesi).
