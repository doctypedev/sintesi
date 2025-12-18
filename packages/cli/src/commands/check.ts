/**
 * CLI command: check
 *
 * Verifies that documentation is in sync with code by detecting drift
 */

import { Logger } from '../utils/logger';
import { CheckResult, CheckOptions } from '../types';
import { SmartChecker } from '../services/smart-checker';
import { GenerationContextService } from '../services/generation-context';
import { LineageService } from '../services/lineage-service';
import { SemanticVerifier } from '../services/semantic-verifier';
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Execute the check command
 */
export async function checkCommand(options: CheckOptions): Promise<CheckResult> {
    const logger = new Logger(options.verbose);

    logger.header('🔍 Sintesi Check - Drift Detection');

    // Determine which checks to run
    // If neither flag is set, run both (default behavior)
    const shouldCheckReadme = options.readme || (!options.readme && !options.documentation);
    const shouldCheckDocs = options.documentation || (!options.readme && !options.documentation);

    if (shouldCheckReadme) logger.info('Enabled: README Check');
    if (shouldCheckDocs) logger.info('Enabled: Documentation Site Check');

    // Resolve the root directory for source code
    const codeRoot = process.cwd();

    // Initialize Services
    const contextService = new GenerationContextService(logger, codeRoot);
    const aiAgents = await contextService.getAIAgents(options.verbose || false);

    if (!aiAgents) {
        logger.error('Failed to initialize AI agents. Cannot perform smart check.');
        return {
            totalEntries: 0,
            driftedEntries: 0,
            missingEntries: 0,
            untrackedEntries: 0,
            drifts: [],
            missing: [],
            success: false,
            configError: 'Failed to initialize AI agents',
        };
    }

    // Load detailed state to check for last logic
    let lastDocSha: string | undefined;
    let lastReadmeSha: string | undefined;

    try {
        const sintesiDir = resolve(process.cwd(), '.sintesi');
        if (existsSync(join(sintesiDir, 'documentation.state.json'))) {
            const docState = JSON.parse(
                readFileSync(join(sintesiDir, 'documentation.state.json'), 'utf-8'),
            );
            if (docState.lastGeneratedSha) {
                lastDocSha = docState.lastGeneratedSha;
                logger.info(
                    `Found previous documentation state (SHA: ${(docState.lastGeneratedSha as string).substring(0, 7)})`,
                );
            }
        }
        if (existsSync(join(sintesiDir, 'readme.state.json'))) {
            const readmeState = JSON.parse(
                readFileSync(join(sintesiDir, 'readme.state.json'), 'utf-8'),
            );
            if (readmeState.lastGeneratedSha) {
                lastReadmeSha = readmeState.lastGeneratedSha;
            }
        }
    } catch (e) {
        logger.debug(`Failed to load previous state: ${e}`);
    }

    // Determine Base Ref
    // If user provided --base, use it. Otherwise use last SHA if available.
    // Note: If checking BOTH, and they have different SHAs, we might have a conflict if asking for a single "changes" analysis.
    // 'analyzeProject' returns a single git diff.
    // For now, prioritize Documentation SHA if available, as that's the primary "drift" target.
    const baseRef = options.base || lastDocSha || lastReadmeSha;

    if (baseRef && !options.base) {
        logger.info(
            `Using cached state SHA ${baseRef.substring(0, 7)} as baseline for drift detection.`,
        );
    }

    // Analyze Project (Get Git Diff)
    logger.info('Analyzing project changes...');
    const { gitDiff } = await contextService.analyzeProject(baseRef);

    // 0. Existence Check
    let readmeExists = true;
    let docsExist = true;

    if (shouldCheckReadme) {
        const readmePath = resolve(codeRoot, options.output || 'README.md');
        readmeExists = existsSync(readmePath);
    }

    if (shouldCheckDocs) {
        const docsDir = resolve(codeRoot, options.outputDir || 'docs'); // Default docs dir or override
        docsExist = existsSync(docsDir) && readdirSync(docsDir).length > 0;
    }

    // If no changes AND everything relevant exists, we are good.
    const readmeOK = !shouldCheckReadme || (shouldCheckReadme && readmeExists);
    const docsOK = !shouldCheckDocs || (shouldCheckDocs && docsExist);

    if (!gitDiff && readmeOK && docsOK) {
        logger.success(
            'No relevant changes detected since last generation. Everything is in sync.',
        );
        return {
            totalEntries: 0,
            driftedEntries: 0,
            missingEntries: 0,
            untrackedEntries: 0,
            drifts: [],
            missing: [],
            success: true,
        };
    }

    if (shouldCheckReadme && !readmeExists) logger.info('README.md is missing.');
    if (shouldCheckDocs && !docsExist) logger.info('Documentation directory is missing or empty.');

    // 1. README Check (SmartChecker)
    let readmeDriftDetected = false;
    let readmeReason: string | undefined;
    let readmeSuggestion: string | undefined;

    if (shouldCheckReadme) {
        if (!readmeExists) {
            readmeDriftDetected = true;
            readmeReason = 'README file is missing.';
            readmeSuggestion = 'Generate a new README.';
            logger.warn('⚠️ Drift detected: README is missing');
        } else if (gitDiff) {
            // Only run smart checker if we have diffs and the file exists
            logger.info('Performing smart check (README vs Code)...');
            const smartChecker = new SmartChecker(logger, codeRoot);
            const smartResult = await smartChecker.checkReadme({
                baseBranch: options.base || lastReadmeSha, // Use specific SHA for readme if available
                readmePath: resolve(codeRoot, options.output || 'README.md'),
            });

            if (smartResult.hasDrift) {
                logger.warn('⚠️ Drift detected: README might be outdated');
                if (smartResult.reason) logger.log(`  Reason: ${smartResult.reason}`);
                if (smartResult.suggestion) logger.log(`  Suggestion: ${smartResult.suggestion}`);

                readmeDriftDetected = true;
                readmeReason = smartResult.reason;
                readmeSuggestion = smartResult.suggestion;
            } else {
                logger.success('README appears to be in sync.');
            }
        }
    }

    logger.newline();

    // 2. Documentation Check
    let docDriftDetected = false;
    let docReason: string | undefined;

    if (shouldCheckDocs) {
        if (!docsExist) {
            docDriftDetected = true;
            docReason = 'Documentation directory is missing or empty.';
            logger.warn('⚠️ Drift detected: Documentation is missing');
        } else if (gitDiff) {
            logger.info('Performing Semantic Analysis (Documentation Site vs Code)...');

            const { execSync } = await import('child_process');
            const changedFilesOutput = execSync(`git diff --name-only ${baseRef || 'HEAD'}`, {
                cwd: codeRoot,
            })
                .toString()
                .trim();
            const changedFiles = changedFilesOutput.split('\n').filter((f) => f.length > 0);

            let impactedDocsSize = 0;

            if (changedFiles.length > 0) {
                logger.info(`Detected ${changedFiles.length} changed source files.`);

                const lineageService = new LineageService(logger, codeRoot);
                const impactedDocs = new Set<string>();

                for (const file of changedFiles) {
                    const docs = lineageService.getImpactedDocs(file);
                    docs.forEach((d) => impactedDocs.add(d));
                }

                impactedDocsSize = impactedDocs.size;

                if (impactedDocs.size === 0) {
                    logger.success(
                        '✅ No documentation pages rely on the changed source files (Lineage Check).',
                    );
                } else {
                    logger.info(
                        `🔍 ${impactedDocs.size} documentation pages potentially impacted. deeply verifying...`,
                    );

                    const semanticVerifier = new SemanticVerifier(logger);

                    // TODO: We need the specific diff PER file for best results, but using global diff + changed file name is a decent start-
                    // or we can fetch file-specific diffs inside the verifier.
                    // For now, let's allow the Verifier to extract or just use the global diff context.

                    let meaningfulDriftCount = 0;

                    for (const docPath of impactedDocs) {
                        const verification = await semanticVerifier.verify(
                            docPath,
                            gitDiff, // Global diff for now, ideally per-file diff
                            `Changes involved: ${changedFiles.join(', ')}`,
                            aiAgents,
                        );

                        if (verification.isDrift) {
                            meaningfulDriftCount++;
                            docReason = verification.reason || 'Semantic conflict detected';
                            logger.warn(`  ❌ Drift in ${docPath}: ${docReason}`);
                        } else {
                            logger.success(`  ✅ ${docPath} validated as safely in-sync.`);
                        }
                    }

                    docDriftDetected = meaningfulDriftCount > 0;
                }
            } else {
                logger.success('No source files changed.');
            }

            if (docDriftDetected) {
                logger.warn(
                    '⚠️ Drift detected: Documentation site likely needs updates based on recent changes.',
                );
            } else if (!docDriftDetected && impactedDocsSize > 0) {
                logger.success(
                    'All impacted documentation pages verified as semantically consistent.',
                );
            }
        }
    }

    // Save State for subsequent pipeline steps
    try {
        const sintesiDir = resolve(process.cwd(), '.sintesi');
        if (!existsSync(sintesiDir)) mkdirSync(sintesiDir, { recursive: true });

        const sintesiGitignorePath = join(sintesiDir, '.gitignore');
        if (!existsSync(sintesiGitignorePath)) {
            // We ignore everything by default (state is local), BUT we must whitelist lineage.json
            // because it is the "Shared Knowledge Graph" required for other devs to run checks.
            const gitignoreContent = [
                '# IMPORTANT: Please commit this file to your repository.',
                '# It ensures that the lineage graph is shared, enabling distributed semantic checks.',
                '*',
                '!lineage.json',
            ].join('\n');

            writeFileSync(sintesiGitignorePath, gitignoreContent);
            logger.debug(`Created .gitignore in ${sintesiDir}`);
        }

        // Save README state if checked
        if (shouldCheckReadme) {
            const statePath = join(sintesiDir, 'readme.state.json');
            writeFileSync(
                statePath,
                JSON.stringify(
                    {
                        timestamp: Date.now(),
                        lastGeneratedSha: lastReadmeSha, // Preserve SHA
                        readme: {
                            hasDrift: readmeDriftDetected,
                            reason: readmeReason,
                            suggestion: readmeSuggestion,
                        },
                    },
                    null,
                    2,
                ),
            );
            logger.debug(`Saved README state to ${statePath}`);
        }

        // Save Docs state if checked
        if (shouldCheckDocs) {
            const statePath = join(sintesiDir, 'documentation.state.json');
            writeFileSync(
                statePath,
                JSON.stringify(
                    {
                        timestamp: Date.now(),
                        lastGeneratedSha: lastDocSha, // Preserve SHA
                        documentation: {
                            hasDrift: docDriftDetected,
                            reason: docReason,
                        },
                    },
                    null,
                    2,
                ),
            );
            logger.debug(`Saved Documentation state to ${statePath}`);
        }
    } catch (e) {
        logger.debug(`Failed to save pipeline state: ${e}`);
    }

    logger.divider();

    const anyDrift = readmeDriftDetected || docDriftDetected;

    // Return a simplified result since we don't have detailed entry tracking anymore
    const result: CheckResult = {
        totalEntries: 0,
        driftedEntries: anyDrift ? 1 : 0,
        missingEntries:
            (shouldCheckReadme && !readmeExists ? 1 : 0) + (shouldCheckDocs && !docsExist ? 1 : 0),
        untrackedEntries: 0,
        drifts: [],
        missing: [],
        success: !anyDrift,
    };

    return result;
}
