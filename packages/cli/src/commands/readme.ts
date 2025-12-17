/**
 * CLI command: readme
 *
 * Generates a README.md file based on the project context.
 */

import { Logger } from '../utils/logger';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { GenerationContextService } from '../services/generation-context';
import { ReviewService } from '../services/review-service';
import { SmartChecker } from '../services/smart-checker';
import { ReadmeBuilder } from '../services/readme-builder';

export interface ReadmeOptions {
    output?: string;
    force?: boolean;
    verbose?: boolean;
}

export async function readmeCommand(options: ReadmeOptions): Promise<void> {
    const logger = new Logger(options.verbose);
    logger.header('✨ Sintesi Readme - Project Context Generation');

    const cwd = process.cwd();
    const contextService = new GenerationContextService(logger, cwd);
    const reviewService = new ReviewService(logger);
    const builder = new ReadmeBuilder(logger, reviewService, contextService);

    let smartSuggestion = '';

    // 0. Smart Check & State Verification
    if (!options.force) {
        let stateFound = false;

        // Strategy A: Check Pipeline State (.sintesi/readme.state.json)
        try {
            const statePath = resolve(cwd, '.sintesi/readme.state.json');
            if (existsSync(statePath)) {
                const state = JSON.parse(readFileSync(statePath, 'utf-8'));

                const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
                const stateTimeout = isCI ? Infinity : 20 * 60 * 1000;

                if (Date.now() - state.timestamp < stateTimeout) {
                    stateFound = true;
                    if (state.readme && state.readme.hasDrift === false) {
                        logger.success(
                            '✅ Skipping README generation (validated as sync by check command).',
                        );
                        return;
                    } else if (state.readme && state.readme.suggestion) {
                        smartSuggestion = state.readme.suggestion;
                        // logger.info('💡 Using suggestion from pipeline check: ' + smartSuggestion);
                    }
                }
            }
        } catch (e) {
            logger.debug('Failed to read state file: ' + e);
        }

        // Strategy B: Standalone Smart Check (if no valid state found)
        if (!stateFound) {
            const readmeTarget = resolve(cwd, options.output || 'README.md');
            if (!existsSync(readmeTarget)) {
                logger.info('README file not found. Skipping smart check and forcing generation.');
            } else {
                logger.info('Performing standalone smart check...');
                const smartChecker = new SmartChecker(logger, cwd);
                const result = await smartChecker.checkReadme();

                if (!result.hasDrift) {
                    logger.success(
                        '✅ No relevant changes detected (AI Smart Check). README is up to date.',
                    );
                    return;
                }

                if (result.suggestion) {
                    smartSuggestion = result.suggestion;
                    logger.info('💡 Drift detected. Suggestion: ' + smartSuggestion);
                }
            }
        }
    }

    // 1. Initialize AI Agents
    const aiAgents = await contextService.getAIAgents(options.verbose || false);
    if (!aiAgents) return;

    // 2. Analyze Project (Context & Diff)
    const spinnerLogger = {
        start: (msg: string) => logger.info(msg),
        stop: (msg: string) => logger.info(msg),
    };
    spinnerLogger.start('Analyzing project structure...');

    let context;
    let gitDiff = '';
    const outputPath = resolve(cwd, options.output || 'README.md');

    try {
        const analysis = await contextService.analyzeProject();
        context = analysis.context;
        gitDiff = analysis.gitDiff;
        spinnerLogger.stop('Analyzed ' + context.files.length + ' files');

        // 2.1 RESET DIFF IF FORCE OR MISSING
        // If we are forcing, or if the README doesn't exist, we don't want to rely on the "last commit" diff.
        // We want to generate based on the FULL current context.
        if (options.force || !existsSync(outputPath)) {
            gitDiff = '';
        }
    } catch (error) {
        spinnerLogger.stop('Analysis failed');
        logger.error('Failed to analyze project: ' + error);
        return;
    }

    // Semantic Impact Analysis (Optional but recommended to match logic)
    if (gitDiff && !options.force) {
        const { ImpactAnalyzer } = await import('../services/impact-analyzer');
        const impactAnalyzer = new ImpactAnalyzer(logger);
        const impactResult = await impactAnalyzer.checkWithLogging({
            gitDiff,
            docType: 'readme',
            aiAgents,
            force: options.force,
            targetExists: existsSync(outputPath),
            outputDir: options.output,
        });

        if (!impactResult.shouldProceed) return;
    }

    // 3. Delegate to Builder
    await builder.buildReadme(options, context, gitDiff, outputPath, aiAgents, smartSuggestion);
}
