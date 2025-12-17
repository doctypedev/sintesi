import { embedMany } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Logger } from '../../utils/logger';

export class EmbeddingService {
    private openai;
    // Default to text-embedding-3-small for cost/speed balance in CI
    private modelId = 'text-embedding-3-small';

    constructor(private logger: Logger) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY not found. Embedding service will fail if used.');
        }
        this.openai = createOpenAI({
            apiKey: apiKey || '',
        });
    }

    /**
     * Generates embeddings for a batch of text chunks.
     * @param texts Array of text strings to embed
     * @returns Array of embedding vectors
     */
    async embedDocuments(texts: string[]): Promise<number[][]> {
        if (!texts.length) return [];

        try {
            this.logger.debug(
                `Generating embeddings for ${texts.length} chunks using ${this.modelId}...`,
            );

            // embedMany handles batching automatically to some extent, but strict API limits might apply.
            // For very large arrays, we might need manual chunking, but for typical project size (sliced by files) it might be fine.
            const { embeddings } = await embedMany({
                model: this.openai.embedding(this.modelId),
                values: texts,
            });

            return embeddings;
        } catch (error: any) {
            this.logger.error(`Embedding generation failed: ${error.message}`);
            throw error;
        }
    }
}
