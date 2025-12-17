import { CohereClient } from 'cohere-ai';
import { Logger } from '../../utils/logger';

export class RerankingService {
    private cohere: CohereClient | null = null;
    private enabled = false;

    constructor(private logger: Logger) {
        const apiKey = process.env.COHERE_API_KEY;
        if (apiKey) {
            this.cohere = new CohereClient({
                token: apiKey,
            });
            this.enabled = true;
        } else {
            this.logger.debug(
                'COHERE_API_KEY not found. Reranking will be disabled (fallback to vector search order).',
            );
        }
    }

    /**
     * Reranks a list of documents based on a query.
     * @param query The search query
     * @param documents Array of document strings to rerank
     * @param topN Number of top results to return
     * @returns Array of indices of the documents in the original list, ordered by relevance.
     */
    async rerank(query: string, documents: string[], topN: number = 5): Promise<number[]> {
        if (!this.enabled || !this.cohere) {
            // Fallback: Return first N indices as they are already sorted by vector similarity
            return documents.slice(0, topN).map((_, i) => i);
        }

        try {
            this.logger.debug(`Reranking ${documents.length} documents...`);
            const response = await this.cohere.rerank({
                documents: documents.map((doc) => ({ text: doc })),
                query: query,
                topN: topN,
                model: 'rerank-english-v3.0', // Standard high-performance model
            });

            // Map result indices back
            return response.results.map((r) => r.index);
        } catch (error: any) {
            this.logger.warn(`Reranking failed: ${error.message}. Falling back to vector order.`);
            return documents.slice(0, topN).map((_, i) => i);
        }
    }
}
