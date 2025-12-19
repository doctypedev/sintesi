import { Logger } from '../../utils/logger';
import { VectorStoreService, CodeChunk } from './vector-store';
import { EmbeddingService } from './embedding-service';
import { RerankingService } from './reranker';
import { CodeChunkingService } from './chunking';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { IndexingStateManager } from './indexing-state';
import { statSync } from 'fs';
import { execSync } from 'child_process';
import { GitBinding } from '@sintesi/core';
import { resolve } from 'path';

export class RetrievalService {
    private vectorStore: VectorStoreService;
    private embeddingService: EmbeddingService;
    private reranker: RerankingService;
    private chunker: CodeChunkingService;
    private stateManager: IndexingStateManager;

    constructor(
        private logger: Logger,
        private projectRoot: string,
    ) {
        this.vectorStore = new VectorStoreService(logger, projectRoot);
        this.embeddingService = new EmbeddingService(logger);
        this.reranker = new RerankingService(logger);
        this.chunker = new CodeChunkingService(logger);
        this.stateManager = new IndexingStateManager(logger, projectRoot);
    }

    /**
     * incrementally index the project.
     * Checks filestamps to avoid re-embedding unchanged files.
     */
    async indexProject(): Promise<void> {
        this.logger.info('🔍 [RAG] Starting incremental project indexing...');
        this.stateManager.load();

        // Detect current commit SHA
        let currentSha = '';
        let isDirty = false;

        try {
            currentSha = execSync('git rev-parse HEAD', {
                encoding: 'utf-8',
                cwd: this.projectRoot,
                stdio: 'pipe',
            }).trim();

            const status = execSync('git status --porcelain', {
                encoding: 'utf-8',
                cwd: this.projectRoot,
                stdio: 'pipe',
            }).trim();

            isDirty = status.length > 0;
            if (isDirty) {
                this.logger.debug('[RAG] Indexing - Detected dirty working directory.');
            }
        } catch (e) {
            this.logger.debug('Could not determine current git SHA or status: ' + e);
        }

        const lastSha = this.stateManager.getLastCommitSha();
        let useGitDiff = false;
        let changedFilesFromGit: Set<string> | null = null;

        // If we have a SHAs match AND the workspace is clean, we can skip.
        // If workspace is dirty, we MUST proceed to check timestamps/content because
        // the SHA doesn't reflect the current state of files on disk.
        if (currentSha && lastSha && currentSha === lastSha && !isDirty) {
            this.logger.success(
                '✅ [RAG] Index is already up to date (SHA matches & clean workspace).',
            );
            return;
        }

        if (currentSha && lastSha && currentSha !== lastSha) {
            try {
                this.logger.info(
                    `[RAG] Detected previous state (SHA: ${lastSha.substring(0, 7)}). Computing diff using Rust GitBinding...`,
                );

                const gitBinding = new GitBinding(this.projectRoot);
                const summary = gitBinding.analyzeChanges(lastSha);

                if (summary.changedFiles) {
                    // changedFiles from Rust are relative paths
                    changedFilesFromGit = new Set(
                        summary.changedFiles.map((p) => resolve(this.projectRoot, p)),
                    );
                    useGitDiff = true;
                    this.logger.debug(
                        `[RAG] Rust Git diff found ${changedFilesFromGit.size} changed files.`,
                    );
                }
            } catch (e) {
                this.logger.warn(
                    `[RAG] Failed to compute git diff using Rust binding. Falling back to timestamp check: ${e}`,
                );
            }
        }

        // 1. Find Files
        const files = await glob('**/*.{ts,tsx,js,jsx,rs,md}', {
            cwd: this.projectRoot,
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
                '**/.git/**',
                '**/.sintesi/**',
            ],
            absolute: true,
        });

        // 2. Diffing (Identify what changed)
        const filesToProcess: string[] = [];
        const filesToDelete: string[] = [];

        // Check for modifications or new files
        for (const file of files) {
            try {
                // If using git diff, purely check membership
                if (useGitDiff && changedFilesFromGit) {
                    const absoluteFile = resolve(this.projectRoot, file);
                    if (changedFilesFromGit.has(absoluteFile)) {
                        filesToProcess.push(file);
                        const fileState = this.stateManager.getFileState(file);
                        if (fileState) {
                            filesToDelete.push(...fileState.chunkIds);
                        }
                    }
                    // If NOT in changedFilesFromGit, we skip it (assume valid)
                    // But we should verify if it's a NEW file that git diff might have caught?
                    // `git diff` usually captures new files if they are committed.
                    // If they are staged/unstaged, regular diff might catch them but we rely on committed state for "lastCommitSha".
                    // Actually, if we rely on CI, everything is committed.
                    // Localfy, we might want to check dirty state too?
                    // For safety, let's mix: if git diff identifies it, process it.
                    // If file is NOT tracked in state at all, process it (new file).
                    else if (!this.stateManager.getFileState(file)) {
                        filesToProcess.push(file);
                    }
                } else {
                    // Fallback to Timestamp
                    const stats = statSync(file);
                    const mtime = stats.mtimeMs;
                    const fileState = this.stateManager.getFileState(file);

                    if (!fileState || fileState.lastModified < mtime) {
                        filesToProcess.push(file);
                        // If it was modified, we mark old chunks for deletion
                        if (fileState) {
                            filesToDelete.push(...fileState.chunkIds);
                        }
                    }
                }
            } catch (e) {
                // Ignore access errors
            }
        }

        // Check for deleted files (in state but not on disk)
        const trackedFiles = this.stateManager.getTrackedFiles();
        for (const trackedFile of trackedFiles) {
            if (!files.includes(trackedFile)) {
                const fileState = this.stateManager.getFileState(trackedFile);
                if (fileState) {
                    filesToDelete.push(...fileState.chunkIds);
                    this.stateManager.removeFileState(trackedFile);
                }
            }
        }

        // 3. Process Deletions
        if (filesToDelete.length > 0) {
            this.logger.debug(`[RAG] Removing ${filesToDelete.length} stale chunks...`);
            await this.vectorStore.deleteChunks(filesToDelete);
        }

        if (filesToProcess.length === 0) {
            this.logger.success('✅ [RAG] Index is up to date.');
            return;
        }

        this.logger.info(`[RAG] Re-indexing ${filesToProcess.length} changed/new files...`);

        // 4. Process Additions/Updates
        const allChunks: Omit<CodeChunk, 'id'>[] = [];

        for (const file of filesToProcess) {
            try {
                const content = readFileSync(file, 'utf-8');
                const chunks = this.chunker.chunkFile(file, content);

                // Add metadata
                chunks.forEach((c) => {
                    allChunks.push({
                        ...c,
                        filePath: file,
                        vector: [],
                    });
                });
            } catch (e) {
                // Ignore read errors
            }
        }

        if (allChunks.length === 0) {
            // Just update state if empty files (rare)
            filesToProcess.forEach((f) => {
                this.stateManager.updateFileState(f, Date.now(), []);
            });
            this.stateManager.save();
            return;
        }

        // Embed
        const TEXTS_PER_BATCH = 20;

        for (let i = 0; i < allChunks.length; i += TEXTS_PER_BATCH) {
            const batch = allChunks.slice(i, i + TEXTS_PER_BATCH);
            const batchTexts = batch.map(
                (c) => `File: ${c.filePath}\nFunction: ${c.functionName || 'N/A'}\n\n${c.content}`,
            );

            try {
                const vectors = await this.embeddingService.embedDocuments(batchTexts);
                for (let j = 0; j < batch.length; j++) {
                    batch[j].vector = vectors[j];
                }
            } catch (e) {
                this.logger.error(`Failed to embed batch ${i}: ${e}`);
            }
        }

        const validChunks = allChunks.filter((c) => c.vector && c.vector.length > 0);

        // Store
        if (validChunks.length > 0) {
            const newIds = await this.vectorStore.addChunks(validChunks);

            // Map IDs back to files to update state
            // Logic: validChunks corresponds to filesToProcess but flat.
            // We need to know which IDs belong to which file.
            // We can iterate validChunks and assign them.

            // Group by file path
            const chunksByFile: Record<string, string[]> = {};

            validChunks.forEach((chunk, idx) => {
                if (!chunksByFile[chunk.filePath]) chunksByFile[chunk.filePath] = [];
                chunksByFile[chunk.filePath].push(newIds[idx]);
            });

            // Update State
            for (const file of filesToProcess) {
                const ids = chunksByFile[file] || [];
                const stats = statSync(file);
                this.stateManager.updateFileState(file, stats.mtimeMs, ids);
            }
        } else {
            // Even if no chunks valid (e.g. empty files), update timestamp so we don't check again
            filesToProcess.forEach((file) => {
                const stats = statSync(file);
                this.stateManager.updateFileState(file, stats.mtimeMs, []);
            });
        }

        if (currentSha) {
            this.stateManager.setLastCommitSha(currentSha);
        }
        this.stateManager.save();
        this.logger.success(`✅ [RAG] Incremental index complete.`);
    }

    /**
     * Retrieve relevant context for a specific query.
     */
    async retrieveContext(query: string, limit: number = 5): Promise<string> {
        this.logger.info(`🤖 [RAG] Researching context for: "${query.substring(0, 50)}..."`);

        // 1. Embed Query
        const [queryVector] = await this.embeddingService.embedDocuments([query]);
        if (!queryVector) {
            return '';
        }

        // 2. Vector Search (Get more candidates for reranking, e.g. 20)
        const candidates = await this.vectorStore.search(queryVector, 20);
        if (candidates.length === 0) return '';

        this.logger.debug(`Found ${candidates.length} vector candidates. Reranking...`);

        // 3. Rerank
        // Create candidate strings for reranker
        const candidateTexts = candidates.map((c) => c.content);
        const bestIndices = await this.reranker.rerank(query, candidateTexts, limit);

        const bestChunks = bestIndices.map((i) => candidates[i]);

        // 4. Format Output with Budgeting
        // Limit total context to avoid pollution (~8000 chars is approx 2000 tokens)
        const MAX_CONTEXT_CHARS = 8000;
        let currentChars = 0;
        let formattedContext = '';

        for (const chunk of bestChunks) {
            const header = `\n--- CONTEXT [File: ${chunk.filePath} | Lines: ${chunk.startLine}-${chunk.endLine}] ---\n`;
            const content = chunk.content;
            const entrySize = header.length + content.length;

            if (currentChars + entrySize > MAX_CONTEXT_CHARS) {
                // If this is the VERY first chunk and it's huge, maybe trim it?
                // But generally, just stop adding chunks.
                if (currentChars === 0) {
                    // Add truncated version if it's the only thing we have
                    formattedContext +=
                        header + content.substring(0, MAX_CONTEXT_CHARS) + '\n... (truncated)';
                }
                break;
            }

            formattedContext += header + content + '\n';
            currentChars += entrySize;
        }

        return formattedContext;
    }

    /**
     * Retrieves "Conceptual" context by prioritizing Markdown files and Glossary terms.
     * Useful for high-level documentation where code details are distractions.
     */
    async retrieveConceptualContext(query: string, limit: number = 3): Promise<string> {
        this.logger.info(`🧠 [RAG] Searching concepts for: "${query.substring(0, 50)}..."`);

        // 1. Embed Query
        const [queryVector] = await this.embeddingService.embedDocuments([query]);
        if (!queryVector) return '';

        // 2. Search deeper to find MD files
        const candidates = await this.vectorStore.search(queryVector, 40);
        if (candidates.length === 0) return '';

        // 3. Filter for Markdown OR high-relevance chunks
        const mdCandidates = candidates.filter((c) => c.filePath.endsWith('.md'));
        const codeCandidates = candidates.filter((c) => !c.filePath.endsWith('.md'));

        // Strategy: Take all found MD files (up to limit), fill rest with high-score code if really needed?
        // Actually for "Conceptual", we prefer MD.

        let pool = mdCandidates;
        if (pool.length < limit * 2) {
            // If we don't have enough MD, maybe take top code chunks but treat them as lower priority
            pool = [...mdCandidates, ...codeCandidates.slice(0, 5)];
        }

        if (pool.length === 0) return '';

        // 4. Rerank
        const poolTexts = pool.map((c) => c.content);
        const bestIndices = await this.reranker.rerank(query, poolTexts, limit);
        const bestChunks = bestIndices.map((i) => pool[i]);

        // 5. Format
        let formatted = '';
        for (const chunk of bestChunks) {
            const isMd = chunk.filePath.endsWith('.md');
            const typeLabel = isMd ? 'CONCEPT / GUIDE' : 'SOURCE REF';
            formatted += `\n--- ${typeLabel} [${chunk.filePath}] ---\n${chunk.content}\n`;
        }

        return formatted;
    }
}
