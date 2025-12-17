
import { IndexingStateManager } from '../src/services/rag/indexing-state';
import { Logger } from '../src/utils/logger';
import { join } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('IndexingStateManager', () => {
    const loggerMock = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        success: vi.fn(),
    } as unknown as Logger;

    const testRoot = join(__dirname, 'temp-rag-test');

    beforeAll(() => {
        if (!existsSync(testRoot)) {
            mkdirSync(testRoot);
        }
        const sintesiDir = join(testRoot, '.sintesi');
        if (!existsSync(sintesiDir)) {
            mkdirSync(sintesiDir);
        }
    });

    afterAll(() => {
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should load empty state if file not exists', () => {
        const manager = new IndexingStateManager(loggerMock, testRoot);
        manager.load();
        expect(manager.getTrackedFiles()).toEqual([]);
    });

    it('should save and reload state', () => {
        const manager = new IndexingStateManager(loggerMock, testRoot);
        manager.updateFileState('file1.ts', 12345, ['chunk1', 'chunk2']);
        manager.save();

        const manager2 = new IndexingStateManager(loggerMock, testRoot);
        manager2.load();

        const state = manager2.getFileState('file1.ts');
        expect(state).toBeDefined();
        expect(state?.lastModified).toBe(12345);
        expect(state?.chunkIds).toEqual(['chunk1', 'chunk2']);
    });

    it('should remove file state', () => {
        const manager = new IndexingStateManager(loggerMock, testRoot);
        manager.updateFileState('file2.ts', 999, []);
        manager.removeFileState('file2.ts');
        expect(manager.getFileState('file2.ts')).toBeUndefined();
    });
});
