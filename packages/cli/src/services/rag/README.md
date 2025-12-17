# RAG Service Module

This module implements Retrieval-Augmented Generation for the Sintesi documentation tool.
It acts as the core of the "Researcher" agent.

## Components

- **VectorStoreService**: Wraps [LanceDB](https://lancedb.com/) to store code chunks and embeddings locally in `.sintesi/lancedb`.
- **EmbeddingService**: Uses `text-embedding-3-small` (via OpenAI compatible API) to generate vectors.
- **RerankingService**: Uses Cohere Rerank API to refine search results.
- **CodeChunkingService**: Splits TypeScript/JavaScript files into semantic chunks (functions, classes) using AST.
- **RetrievalService**: The main orchestrator.

## Usage

```typescript
import { RetrievalService } from './services/rag';
import { Logger } from './utils/logger';

const logger = new Logger();
const service = new RetrievalService(logger, process.cwd());

// 1. Index the project (Run this periodically or on significant changes)
await service.indexProject();

// 2. Retrieve context for a query
const context = await service.retrieveContext('How does authentication work?');

console.log(context);
```

## Requirements

- `OPENAI_API_KEY`: Required for embeddings.
- `COHERE_API_KEY`: Optional. If provided, reranking is enabled.
