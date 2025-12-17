import * as lancedb from '@lancedb/lancedb';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../utils/logger';

export interface CodeChunk {
    id: string; // Mandatory for LanceDB
    content: string;
    filePath: string;
    startLine: number;
    endLine: number;
    functionName?: string; // Optional
    vector: number[]; // Embedding vector
}

export class VectorStoreService {
    private dbPath: string;
    private db: lancedb.Connection | null = null;
    private tableName = 'code_chunks';

    constructor(
        private logger: Logger,
        projectRoot: string,
    ) {
        this.dbPath = join(projectRoot, '.sintesi', 'lancedb');
    }

    /**
     * Connects to the local LanceDB instance
     */
    async connect(): Promise<void> {
        try {
            const parentDir = join(this.dbPath, '..');
            if (!existsSync(parentDir)) {
                mkdirSync(parentDir, { recursive: true });
            }

            // LanceDB creates the directory if it doesn't exist
            this.db = await lancedb.connect(this.dbPath);
            this.logger.debug(`Connected to LanceDB at ${this.dbPath}`);
        } catch (error: any) {
            this.logger.error(`Failed to connect to LanceDB: ${error.message}`);
            throw error;
        }
    }

    /**
     * Adds chunks to the vector database (Appending).
     */
    async addChunks(chunks: Omit<CodeChunk, 'id'>[]): Promise<string[]> {
        if (!this.db) await this.connect();
        if (!this.db) throw new Error('Database connection failed');

        if (chunks.length === 0) return [];

        const chunksWithIds = chunks.map((chunk) => ({
            id: uuidv4(),
            ...chunk,
            functionName: chunk.functionName || '',
        }));

        const data = chunksWithIds;

        try {
            const tableNames = await this.db.tableNames();
            let table;

            if (tableNames.includes(this.tableName)) {
                table = await this.db.openTable(this.tableName);
                await table.add(data);
            } else {
                table = await this.db.createTable(this.tableName, data);
            }

            this.logger.debug(`Added ${chunks.length} chunks to Vector DB.`);
            return chunksWithIds.map((c) => c.id);
        } catch (error: any) {
            this.logger.error(`Failed to add chunks: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes chunks by their IDs.
     */
    async deleteChunks(ids: string[]): Promise<void> {
        if (!this.db) await this.connect();
        if (!this.db) throw new Error('Database connection failed');
        if (ids.length === 0) return;

        try {
            const tableNames = await this.db.tableNames();
            if (!tableNames.includes(this.tableName)) return;

            const table = await this.db.openTable(this.tableName);

            // LanceDB SQL-style deletion
            // "id IN ('id1', 'id2')"
            // Warning: large lists might hit SQL limits. Batch if necessary.
            // For now, let's try batch deletions of 100.

            const BATCH_SIZE = 50;
            for (let i = 0; i < ids.length; i += BATCH_SIZE) {
                const batch = ids.slice(i, i + BATCH_SIZE);
                const idsString = batch.map((id) => `'${id}'`).join(', ');
                await table.delete(`id IN (${idsString})`);
            }

            this.logger.debug(`Deleted ${ids.length} chunks from Vector DB.`);
        } catch (error: any) {
            this.logger.error(`Failed to delete chunks: ${error.message}`);
            throw error;
        }
    }

    /**
     * Searches for similar code chunks.
     * @param queryVector The embedding of the query
     * @param limit Number of results to return (default 20 to allow reranking later)
     */
    async search(queryVector: number[], limit: number = 20): Promise<CodeChunk[]> {
        if (!this.db) await this.connect();
        if (!this.db) throw new Error('Database connection failed');

        try {
            const tableNames = await this.db.tableNames();
            if (!tableNames.includes(this.tableName)) {
                this.logger.warn('Vector DB table not found. Has context been indexed?');
                return [];
            }

            const table = await this.db.openTable(this.tableName);
            const results = await table.vectorSearch(queryVector).limit(limit).toArray();

            // Map back to CodeChunk interface
            return results.map((row: any) => ({
                id: row.id,
                content: row.content,
                filePath: row.filePath,
                startLine: row.startLine,
                endLine: row.endLine,
                functionName: row.functionName,
                vector: row.vector, // Usually not needed in return but good for completeness
            }));
        } catch (error: any) {
            this.logger.error(`Vector search failed: ${error.message}`);
            return [];
        }
    }
}
