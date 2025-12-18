/**
 * CLI command: documentation
 *
 * Generates a full documentation site structure based on the project context.
 */

import { Logger } from '../utils/logger';
import { spinner } from '@clack/prompts';
import { resolve } from 'path';
import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { GenerationContextService } from '../services/generation-context';
import { ReviewService } from '../services/review-service';
import { DocumentationPlanner } from '../services/documentation-planner';
import { DocumentationBuilder } from '../services/documentation-builder';

export interface DocumentationOptions {
    outputDir?: string;
    verbose?: boolean;
    force?: boolean;
}

export async function documentationCommand(options: DocumentationOptions): Promise<void> {
    const logger = new Logger(options.verbose);
    logger.header('📚 Sintesi Documentation - Intelligent Doc Generation');

    const cwd = process.cwd();
    const contextService = new GenerationContextService(logger, cwd);
    const reviewService = new ReviewService(logger);
    const planner = new DocumentationPlanner(logger);
    const builder = new DocumentationBuilder(logger, reviewService, contextService);

    let forceSmartCheck = false;

    // 0. Pipeline Optimization: Check State File
    if (options.force) {
        logger.info(
            'Force flag detected: skipping state checks and treating as greenfield generation.',
        );
        forceSmartCheck = true;
    } else {
        try {
            const statePath = resolve(cwd, '.sintesi/documentation.state.json');
            if (existsSync(statePath)) {
                const state = JSON.parse(readFileSync(statePath, 'utf-8'));

                // Timeout Logic: 20 mins locally, unlimited in CI
                const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
                const stateTimeout = isCI ? Infinity : 20 * 60 * 1000;

                if (Date.now() - state.timestamp < stateTimeout) {
                    if (state.documentation) {
                        if (state.documentation.hasDrift === false) {
                            logger.success(
                                '✅ Skipping Documentation generation (validated as sync by check command).',
                            );
                            return;
                        } else {
                            logger.info(
                                'ℹ️  Pipeline check indicated drift. Proceeding with generation.',
                            );
                            forceSmartCheck = true;
                        }
                    }
                }
            }
        } catch (e) {
            logger.debug('Failed to read state file: ' + e);
        }
    }

    // 0. Smart Check
    if (!options.force) {
        const checkDir = resolve(cwd, options.outputDir || 'docs');
        const docsExist = existsSync(checkDir) && readdirSync(checkDir).length > 0;

        if (!docsExist) {
            logger.info(
                'Documentation directory missing or empty. Skipping smart check and forcing generation.',
            );
        } else {
            const hasChanges = await contextService.performSmartCheck(forceSmartCheck);
            if (!hasChanges) return;
        }
    }

    const outputDir = resolve(cwd, options.outputDir || 'docs');

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    // 1. Initialize AI Agents
    const aiAgents = await contextService.getAIAgents(options.verbose || false);
    if (!aiAgents) return;

    // 2. Get Project Context & Changes
    const spinnerLogger = spinner();
    spinnerLogger.start('Analyzing project structure...');

    let context;
    let gitDiff = '';

    try {
        const analysis = await contextService.analyzeProject();
        context = analysis.context;
        gitDiff = analysis.gitDiff;
        spinnerLogger.stop('Analyzed ' + context.files.length + ' files');

        // 2.1 RESET DIFF IF FORCE OR MISSING
        // If we are forcing, or if the docs don't exist, we don't want to rely on the "last commit" diff.
        const docsDirNotEmpty = existsSync(outputDir) && readdirSync(outputDir).length > 0;
        if (options.force || !docsDirNotEmpty) {
            gitDiff = '';
        }

        // Impact Analysis (Semantic Check)
        if (gitDiff && !options.force) {
            const { ImpactAnalyzer } = await import('../services/impact-analyzer');
            const impactAnalyzer = new ImpactAnalyzer(logger);
            // const docsDirNotEmpty = existsSync(outputDir) && readdirSync(outputDir).length > 0; // Already defined above

            const impactResult = await impactAnalyzer.checkWithLogging({
                gitDiff,
                docType: 'documentation',
                aiAgents,
                force: true, // Keeping 'true' to preserve existing behavior
                targetExists: docsDirNotEmpty,
                outputDir: options.outputDir || 'docs',
            });

            if (!impactResult.shouldProceed) return;

            if (impactResult.reason) {
                gitDiff = `> **IMPACT ANALYSIS SUMMARY**: ${impactResult.reason}\n\n${gitDiff}`;
            }
        }
    } catch (error) {
        spinnerLogger.stop('Analysis failed');
        logger.error('Failed to analyze project: ' + error);
        return;
    }

    // 3. PHASE 1: The Architect (Planning)
    const plan = await planner.createPlan(
        context,
        outputDir,
        aiAgents,
        contextService,
        gitDiff,
        options.force,
    );
    if (plan.length === 0) return;

    // 4. PHASE 2: The Builder (Generation)
    await builder.buildDocumentation(plan, context, gitDiff, outputDir, aiAgents, options.force);

    // 5. Update State
    try {
        const sintesiDir = resolve(cwd, '.sintesi');
        if (!existsSync(sintesiDir)) mkdirSync(sintesiDir, { recursive: true });

        // Ensure .gitignore exists to protect local state vs shared lineage
        const gitignorePath = resolve(sintesiDir, '.gitignore');
        if (!existsSync(gitignorePath)) {
            const gitignoreContent = [
                '# IMPORTANT: Please commit this file to your repository.',
                '# It ensures that the lineage graph is shared, enabling distributed semantic checks.',
                '*',
                '!lineage.json',
            ].join('\n');
            writeFileSync(gitignorePath, gitignoreContent);
        }

        const statePath = resolve(sintesiDir, 'documentation.state.json');

        // Get current HEAD SHA
        const { execSync } = await import('child_process');
        const currentSha = execSync('git rev-parse HEAD', { cwd }).toString().trim();

        writeFileSync(
            statePath,
            JSON.stringify(
                {
                    timestamp: Date.now(),
                    lastGeneratedSha: currentSha,
                    documentation: {
                        hasDrift: false,
                        reason: null,
                    },
                },
                null,
                2,
            ),
        );
        logger.debug(`Updated documentation state with SHA: ${currentSha}`);
    } catch (e) {
        logger.warn('Failed to save documentation state: ' + e);
    }
}
