
import { Logger } from '../utils/logger';
import { getProjectContext, ProjectContext } from '@sintesi/core';
import { SmartChecker } from './smart-checker';
import { ChangeAnalysisService } from './analysis-service';
import { createAIAgentsFromEnv, AIAgents, AIAgentRoleConfig } from '../../../ai';
import { ProjectDetector } from './project-detector';
import { ContextGatherer } from './context-gatherer';

export interface ProjectConfig {
    binName?: string;
    packageName?: string;
    relevantCommands?: string[];
    entryPoint?: string;
    appType?: 'cli' | 'web' | 'library' | 'backend' | 'unknown';
}

export interface TechStack {
    frameworks: string[];
    languages: string[]; // e.g. TypeScript, Python
    libraries: string[]; // e.g. Tailwind, Zod
    infrastructure: string[]; // e.g. Vercel, Docker
}

export class GenerationContextService {
    private projectDetector: ProjectDetector;
    private contextGatherer: ContextGatherer;

    constructor(private logger: Logger, private cwd: string) {
        this.projectDetector = new ProjectDetector(cwd);
        this.contextGatherer = new ContextGatherer();
    }

    public getCwd(): string {
        return this.cwd;
    }

    /**
     * Performs a smart check to see if generation is necessary based on code changes.
     */
    async performSmartCheck(force: boolean = false): Promise<boolean> {
        if (force) return true;

        this.logger.info('Performing smart check (Code Changes)...');
        const smartChecker = new SmartChecker(this.logger, this.cwd);
        const hasChanges = await smartChecker.hasRelevantCodeChanges();

        if (!hasChanges) {
            this.logger.success('No relevant code changes detected (heuristic check). Content is likely up to date.');
        }
        return hasChanges;
    }

    /**
     * Initializes AI Agents from environment variables.
     */
    async getAIAgents(verbose: boolean, plannerModelId?: string, writerModelId?: string): Promise<AIAgents | null> {
        try {
            const plannerConfig: AIAgentRoleConfig = {
                modelId: plannerModelId || process.env.SINTESI_PLANNER_MODEL_ID || '',
                provider: process.env.SINTESI_PLANNER_PROVIDER as any,
            };
            const writerConfig: AIAgentRoleConfig = {
                modelId: writerModelId || process.env.SINTESI_WRITER_MODEL_ID || '',
                provider: process.env.SINTESI_WRITER_PROVIDER as any,
            };

            const aiAgents = createAIAgentsFromEnv(
                { debug: verbose },
                { planner: plannerConfig, writer: writerConfig }
            );

            const writerConnected = await aiAgents.writer.validateConnection();

            // If planner is different from writer, check it too, otherwise we assume if writer works, planner likely works (or it's the same)
            // But let's be safe if they are distinct instances
            let plannerConnected = true;
            if (aiAgents.planner !== aiAgents.writer) {
                plannerConnected = await aiAgents.planner.validateConnection();
            }

            if (!writerConnected || !plannerConnected) {
                this.logger.error('AI provider connection failed. Please check your API key.');
                return null;
            }

            if (verbose) {
                this.logger.info(`Using AI Planner: ${aiAgents.planner.getModelId()} (${aiAgents.planner.getProvider()})`);
                this.logger.info(`Using AI Writer: ${aiAgents.writer.getModelId()} (${aiAgents.writer.getProvider()})`);
            }

            return aiAgents;

        } catch (error: any) {
            this.logger.error('No valid AI API key found or agent initialization failed: ' + error.message);
            return null;
        }
    }

    /**
     * Analyzes the project structure and retrieves the git diff.
     */
    async analyzeProject(): Promise<{ context: ProjectContext; gitDiff: string }> {
        // Structural Context
        const context = getProjectContext(this.cwd);

        // Recent Changes Context
        let gitDiff = '';
        try {
            const analysisService = new ChangeAnalysisService(this.logger);
            const analysis = await analysisService.analyze({
                fallbackToLastCommit: true,
                includeSymbols: false,
                stagedOnly: false
            });

            gitDiff = analysis.gitDiff;
            if (gitDiff.length > 15000) {
                gitDiff = gitDiff.substring(0, 15000) + '\n... (truncated)';
            }
        } catch (e: any) {
            this.logger.debug('Could not fetch git diff, skipping: ' + e);
        }

        return { context, gitDiff };
    }

    /**
     * Detects Project configuration.
     * Delegates to ProjectDetector.
     */
    detectProjectConfig(context: ProjectContext): ProjectConfig {
        return this.projectDetector.detectProjectConfig(context);
    }

    /**
     * Analyze package.json to detect the technology stack.
     * Delegates to ProjectDetector.
     */
    detectTechStack(context: ProjectContext): TechStack {
        return this.projectDetector.detectTechStack(context);
    }

    /**
     * Generates a shared context prompt string.
     * Delegates to ContextGatherer.
     */
    generateContextPrompt(context: ProjectContext, gitDiff: string, projectConfig: ProjectConfig, techStack?: TechStack): string {
        return this.contextGatherer.generateContextPrompt(context, gitDiff, projectConfig, techStack);
    }

    /**
     * Helper to consistently provide repository information instructions.
     * Delegates to ContextGatherer.
     */
    getSafeRepoInstructions(packageJson: any): string {
        return this.contextGatherer.getSafeRepoInstructions(packageJson);
    }

    /**
     * Reads the content of relevant files.
     * Delegates to ContextGatherer.
     */
    readRelevantContext(item: { path: string; description: string; relevantPaths?: string[] }, context: ProjectContext): string {
        return this.contextGatherer.readRelevantContext(item, context);
    }
}

