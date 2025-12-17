import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '../../utils/logger';

export interface FileState {
    lastModified: number;
    chunkIds: string[];
}

export interface IndexState {
    files: Record<string, FileState>;
}

export class IndexingStateManager {
    private statePath: string;
    private state: IndexState = { files: {} };

    constructor(
        private logger: Logger,
        projectRoot: string,
    ) {
        this.statePath = join(projectRoot, '.sintesi', 'rag-state.json');
    }

    /**
     * Loads the current state from disk.
     */
    load(): void {
        try {
            if (existsSync(this.statePath)) {
                this.state = JSON.parse(readFileSync(this.statePath, 'utf-8'));
            }
        } catch (e) {
            this.logger.warn('Failed to load RAG state, starting fresh: ' + e);
            this.state = { files: {} };
        }
    }

    /**
     * Saves the current state to disk.
     */
    save(): void {
        try {
            writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
        } catch (e) {
            this.logger.error('Failed to save RAG state: ' + e);
        }
    }

    /**
     * Gets the state for a specific file.
     */
    getFileState(filePath: string): FileState | undefined {
        return this.state.files[filePath];
    }

    /**
     * Updates the state for a file.
     */
    updateFileState(filePath: string, lastModified: number, chunkIds: string[]): void {
        this.state.files[filePath] = {
            lastModified,
            chunkIds,
        };
    }

    /**
     * Removes a file from the state.
     */
    removeFileState(filePath: string): void {
        delete this.state.files[filePath];
    }

    /**
     * Returns all tracked file paths.
     */
    getTrackedFiles(): string[] {
        return Object.keys(this.state.files);
    }
}
