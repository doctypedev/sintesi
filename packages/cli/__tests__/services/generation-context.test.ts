import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerationContextService } from '../../src/services/generation-context';
import { Logger } from '../../src/utils/logger';
import { SmartChecker } from '../../src/services/smart-checker';
import { createAIAgentsFromEnv } from '../../../ai';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

// Mock dependencies
vi.mock('child_process', () => ({
    execSync: vi.fn(),
}));
vi.mock('../../src/services/smart-checker');
vi.mock('../../src/services/analysis-service');
vi.mock('fs');
vi.mock('path');
vi.mock('../../src/utils/logger');
vi.mock('../../../ai', () => ({
    createAIAgentsFromEnv: vi.fn(),
}));
vi.mock('@sintesi/core', () => ({
    getProjectContext: vi.fn(),
}));
import { getProjectContext } from '@sintesi/core';

describe('GenerationContextService', () => {
    let logger: Logger;
    let service: GenerationContextService;
    const mockCwd = '/test/cwd';

    beforeEach(() => {
        vi.resetAllMocks();
        logger = new Logger(false);
        service = new GenerationContextService(logger, mockCwd);
        
        (vi.mocked(execSync) as any).mockReturnValue('');

        // Default mocks
        // fs.resolve is not a function, removing it. path.relative and path.resolve are enough.

        vi.mocked(path.relative).mockImplementation((from, to) => to.replace(from + '/', ''));
        vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
        (vi.mocked(getProjectContext) as any).mockReturnValue({
            files: [],
            packageJson: { name: 'test-pkg' }
        });
    });

    describe('performSmartCheck', () => {
        it('should return true immediately if force is true', async () => {
            const result = await service.performSmartCheck(true);
            expect(result).toBe(true);
            expect(SmartChecker).not.toHaveBeenCalled();
        });

        it('should delegate to SmartChecker if force is false', async () => {
            const mockSmartChecker = {
                hasRelevantCodeChanges: vi.fn().mockResolvedValue(true)
            };
            (vi.mocked(SmartChecker) as any).mockImplementation(() => mockSmartChecker);

            const result = await service.performSmartCheck(false);
            expect(result).toBe(true);
            expect(mockSmartChecker.hasRelevantCodeChanges).toHaveBeenCalled();
        });
    });

    describe('getAIAgents', () => {
        it('should return agents if valid', async () => {
            const mockAgents = {
                writer: {
                    validateConnection: vi.fn().mockResolvedValue(true),
                    getModelId: vi.fn().mockReturnValue('m'),
                    getProvider: vi.fn().mockReturnValue('p')
                },
                planner: {
                    validateConnection: vi.fn().mockResolvedValue(true),
                    getModelId: vi.fn().mockReturnValue('m'),
                    getProvider: vi.fn().mockReturnValue('p')
                }
            };
            (vi.mocked(createAIAgentsFromEnv) as any).mockReturnValue(mockAgents);

            const result = await service.getAIAgents(false);
            expect(result).toBe(mockAgents);
        });

        it('should return null if connection fails', async () => {
            const mockAgents = {
                writer: { validateConnection: vi.fn().mockResolvedValue(false) },
                planner: { validateConnection: vi.fn().mockResolvedValue(true) }
            };
            (vi.mocked(createAIAgentsFromEnv) as any).mockReturnValue(mockAgents);

            const result = await service.getAIAgents(false);
            expect(result).toBeNull();
        });
    });

    describe('detectProjectConfig', () => {
        it('should detect commands and bin name for CLI', () => {
            const mockFiles = [
                { path: '/test/cwd/src/commands/foo.ts' },
                { path: '/test/cwd/src/commands/bar.ts' },
                { path: '/test/cwd/src/utils/helper.ts' }
            ];
            (vi.mocked(getProjectContext) as any).mockReturnValue({
                files: mockFiles,
                packageJson: { name: 'test-pkg', bin: { 'test-bin': './bin.js' } }
            });

            // Mock relative path behavior for specific test paths
            vi.mocked(path.relative).mockImplementation((from, to) => {
                if (to === '/test/cwd/src/commands/foo.ts') return 'src/commands/foo.ts';
                if (to === '/test/cwd/src/commands/bar.ts') return 'src/commands/bar.ts';
                return 'src/utils/helper.ts';
            });

            const config = service.detectProjectConfig(getProjectContext('/test/cwd'));
            expect(config.binName).toBe('test-bin');
            expect(config.packageName).toBe('test-pkg');
            expect(config.relevantCommands).toContain('bar');
            expect(config.appType).toBe('cli');
        });


        it('should detect Web appType based on React dependency', () => {
            (vi.mocked(getProjectContext) as any).mockReturnValue({
                files: [{ path: '/test/cwd/src/App.tsx' }],
                packageJson: { dependencies: { 'react': '18.0.0' } }
            });

            // Mock existence
            vi.mocked(fs.existsSync).mockImplementation((p: string) => p.includes('src/App.tsx'));

            const config = service.detectProjectConfig(getProjectContext('/test/cwd'));
            expect(config.appType).toBe('web');
            expect(config.entryPoint).toContain('src/App.tsx');
        });

        it('should detect Backend appType based on NestJS dependency', () => {
            (vi.mocked(getProjectContext) as any).mockReturnValue({
                files: [{ path: '/test/cwd/src/main.ts' }],
                packageJson: { dependencies: { '@nestjs/core': '9.0.0' } }
            });

            // Mock existence
            vi.mocked(fs.existsSync).mockImplementation((p: string) => p.includes('src/main.ts'));

            const config = service.detectProjectConfig(getProjectContext('/test/cwd'));
            expect(config.appType).toBe('backend');
            expect(config.entryPoint).toContain('src/main.ts');
        });
    });

    describe('generateContextPrompt', () => {
        it('should include repository explicitly if present', () => {
            const context: any = {
                packageJson: {
                    name: 'test-pkg',
                    repository: 'https://github.com/test/repo.git'
                },
                files: []
            };
            const projectConfig: any = { relevantCommands: [], packageName: 'test-pkg' };

            const prompt = service.generateContextPrompt(context, '', projectConfig);
            expect(prompt).toContain('https://github.com/test/repo.git');
            expect(prompt).toContain('REPOSITORY');
        });

        it('should warn against hallucination if no repository', () => {
            const context: any = {
                packageJson: {
                    name: 'test-pkg'
                },
                files: []
            };
            const projectConfig: any = { relevantCommands: [], packageName: 'test-pkg' };

            const prompt = service.generateContextPrompt(context, '', projectConfig);
            expect(prompt).toContain('No git repository is defined');
            expect(prompt).toContain('DO NOT hallucinate');
        });
    });
});
