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
            // Fallback: Local Keyword Reranking
            return this.localRerank(query, documents, topN);
        }

        try {
            this.logger.debug(`Reranking ${documents.length} documents...`);

            // Timeout promise
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Reranking timed out (10s)')), 10000),
            );

            const cohereCall = this.cohere.rerank({
                documents: documents.map((doc) => ({ text: doc })),
                query: query,
                topN: topN,
                model: 'rerank-english-v3.0', // Standard high-performance model
            });

            const response = await Promise.race([cohereCall, timeout]);

            // Map result indices back
            return response.results.map((r) => r.index);
        } catch (error: any) {
            this.logger.warn(`Reranking failed: ${error.message}. Falling back to vector order.`);
            return this.localRerank(query, documents, topN);
        }
    }

    /**
     * A simple local reranker based on keyword overlap.
     * It counts how many unique query terms appear in the document.
     */
    private localRerank(query: string, documents: string[], topN: number): number[] {
        const queryTerms = query
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((t) => t.length > 2); // Filter small words

        if (queryTerms.length === 0) {
            return documents.slice(0, topN).map((_, i) => i);
        }

        const scores = documents.map((doc, index) => {
            const docLower = doc.toLowerCase();
            let score = 0;
            // 1. Exact phrase match bonus
            if (docLower.includes(query.toLowerCase())) score += 10;

            // 2. Term overlap
            for (const term of queryTerms) {
                if (docLower.includes(term)) score += 1;
            }
            return { index, score };
        });

        // Sort by score desc, then by original index (stable sort)
        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.index - b.index;
        });

        return scores.slice(0, topN).map((s) => s.index);
    }
}
