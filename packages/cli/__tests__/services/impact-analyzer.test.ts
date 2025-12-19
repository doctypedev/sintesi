import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImpactAnalyzer } from '../../src/services/impact-analyzer';
import { Logger } from '../../src/utils/logger';
import { filterGitDiff } from '../../src/utils/diff-utils';

// Mock dependencies
vi.mock('../../src/utils/diff-utils');
vi.mock('../../src/utils/logger');

describe('ImpactAnalyzer', () => {
    let analyzer: ImpactAnalyzer;
    let logger: Logger;

    beforeEach(() => {
        vi.resetAllMocks();
        logger = new Logger(false);
        analyzer = new ImpactAnalyzer(logger);

        vi.mocked(filterGitDiff).mockReturnValue('cleaned diff');
    });

    it('should exclude README.md for readme type', async () => {
        const agents: any = {
            reviewer: { generateText: vi.fn().mockResolvedValue('{"update":false}') },
            planner: { generateText: vi.fn().mockResolvedValue('{"update":false}') },
        };

        await analyzer.shouldUpdateDocs('diff', 'readme', agents);

        expect(filterGitDiff).toHaveBeenCalledWith('diff', ['README.md']);
    });

    it('should exclude docs/ and documentation/ for documentation type', async () => {
        const agents: any = {
            reviewer: { generateText: vi.fn().mockResolvedValue('{"update":false}') },
            planner: { generateText: vi.fn().mockResolvedValue('{"update":false}') },
        };

        await analyzer.shouldUpdateDocs('diff', 'documentation', agents);

        expect(filterGitDiff).toHaveBeenCalledWith('diff', []);
    });
});
