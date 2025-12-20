import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { checkCommand } from '../src/commands/check';
import { LineageService } from '../src/services/lineage-service';
import { GenerationContextService } from '../src/services/generation-context';
import { ImpactAnalyzer } from '../src/services/impact-analyzer';
import { Logger } from '../src/utils/logger'; // Import Logger to mock it
import * as fs from 'fs';

// Mock dependencies
vi.mock('../src/services/lineage-service');
vi.mock('../src/services/generation-context');
vi.mock('../src/services/impact-analyzer');
vi.mock('fs');
vi.mock('../src/utils/logger'); // Auto-mock first

// Mock child_process modules properly
vi.mock('child_process', async (importOriginal) => {
    const actual = await importOriginal<typeof import('child_process')>();
    return {
        ...actual,
        execSync: vi.fn().mockImplementation((cmd: string) => {
            return {
                toString: () => {
                    if (cmd.includes('rev-parse HEAD')) return 'dummy-sha';
                    if (cmd.includes('diff --name-only')) return 'file1.ts\nfile2.ts';
                    if (cmd.includes('diff')) return 'some diff content';
                    return '';
                },
                trim: () => 'dummy-output',
            };
        }),
    };
});

describe('CLI: check command', () => {
    let mockLineageServiceInstance: any;
    let mockContextServiceInstance: any;
    let mockImpactAnalyzerInstance: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock fs functions
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
        vi.mocked(fs.readdirSync).mockReturnValue(['file.md'] as any);

        // Setup Logger mock implementation
        (Logger as unknown as Mock).mockImplementation(() => ({
            header: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            success: vi.fn(),
            newline: vi.fn(),
            divider: vi.fn(),
            log: vi.fn(),
            getVerbose: vi.fn(),
        }));

        // Setup LineageService mock
        mockLineageServiceInstance = {
            getLastGeneratedSha: vi.fn().mockReturnValue('dummy-sha'),
            getSources: vi.fn().mockReturnValue(['file1.ts', 'file2.ts']),
            getImpactedDocs: vi.fn().mockReturnValue([]),
        };
        vi.mocked(LineageService).mockImplementation(() => mockLineageServiceInstance);

        // Setup GenerationContextService mock
        mockContextServiceInstance = {
            getAIAgents: vi.fn().mockResolvedValue({}), // Truthy agents
            analyzeProject: vi
                .fn()
                .mockResolvedValue({ gitDiff: 'some changes', changedFiles: [] }), // Truthy diff
        };
        vi.mocked(GenerationContextService).mockImplementation(() => mockContextServiceInstance);

        // Setup ImpactAnalyzer mock
        mockImpactAnalyzerInstance = {
            checkWithLogging: vi.fn().mockResolvedValue({ shouldProceed: false, reason: '' }),
        };
        vi.mocked(ImpactAnalyzer).mockImplementation(() => mockImpactAnalyzerInstance);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should pass success=true when lineage check detects no drift', async () => {
        // Setup: README exists in lineage but no files changed
        mockLineageServiceInstance.getSources.mockReturnValue(['file1.ts', 'file2.ts']);
        mockContextServiceInstance.analyzeProject.mockResolvedValue({
            gitDiff: 'some changes',
            changedFiles: [], // No changed files
        });

        const result = await checkCommand({
            verbose: false,
            readme: true,
            base: 'main',
        });

        expect(result.success).toBe(true);
        expect(result.driftedEntries).toBe(0);
    });

    it('should pass success=false when README not in lineage', async () => {
        // Setup: README not tracked in lineage
        mockLineageServiceInstance.getSources.mockReturnValue([]);

        const result = await checkCommand({
            verbose: false,
            readme: true,
            base: 'main',
        });

        expect(result.success).toBe(false);
        expect(result.driftedEntries).toBe(1);
    });

    it('should use lineage SHA as baseline if no --base provided', async () => {
        mockLineageServiceInstance.getLastGeneratedSha.mockReturnValue('lineage-sha-123');
        mockLineageServiceInstance.getSources.mockReturnValue(['file1.ts']);
        mockContextServiceInstance.analyzeProject.mockResolvedValue({
            gitDiff: '',
            changedFiles: [],
        });

        const result = await checkCommand({
            verbose: false,
            readme: true,
            // No base provided
        });

        expect(mockContextServiceInstance.analyzeProject).toHaveBeenCalledWith('lineage-sha-123');
        expect(result.success).toBe(true);
    });
});
