/**
 * CLI command: check
 *
 * Verifies that documentation is in sync with code by detecting drift
 */

import { Logger } from '../utils/logger';
import { CheckResult, CheckOptions } from '../types';
import { GenerationContextService } from '../services/generation-context';
import { LineageService } from '../services/lineage-service';
import { SemanticVerifier } from '../services/semantic-verifier';
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join, relative } from 'path';

import { execSync } from 'child_process';

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

    // Load Lineage Service early to check for shared baseline
    const lineageService = new LineageService(logger, codeRoot);
    const lineageSha = lineageService.getLastGeneratedSha();

    // Determine Base Ref
    // If user provided --base, use it. Otherwise use Lineage SHA.
    // Priority:
    // 1. Explicit --base flag
    // 2. Lineage SHA (Shared/Committed baseline)
    const baseRef = options.base || lineageSha;

    if (baseRef && !options.base) {
        logger.info(
            `Using cached state SHA ${baseRef.substring(0, 7)} as baseline for drift detection.`,
        );
    } else if (!baseRef) {
        // CASE: First run / No state found
        logger.warn('⚠️  No baseline found (no previous run state and no --base flag provided).');
        logger.warn('   Run has never been performed or state file is missing.');
        logger.warn('   Cannot perform accurate drift detection.');
        logger.warn('   👉 Run "sintesi documentation" to establish a baseline.');

        return {
            totalEntries: 0,
            driftedEntries: 0,
            missingEntries: 0,
            untrackedEntries: 0,
            drifts: [],
            missing: [],
            success: false, // Fail check because we can't verify
            configError: 'No baseline found. Run "sintesi documentation" first.',
        };
    }

    // Analyze Project (Get Git Diff & Changed Files)
    logger.info('Analyzing project changes...');
    const { gitDiff, changedFiles: absoluteChangedFiles } =
        await contextService.analyzeProject(baseRef);

    // Normalize to relative paths for compatibility with LineageService local logic
    const changedFiles = absoluteChangedFiles.map((f) => relative(codeRoot, f));

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

    // 1. README Check (Lineage-based)
    let readmeDriftDetected = false;
    let readmeReason: string | undefined;

    if (shouldCheckReadme) {
        if (!readmeExists) {
            readmeDriftDetected = true;
            readmeReason = 'README file is missing.';
            logger.warn('⚠️ Drift detected: README is missing');
        } else if (gitDiff) {
            logger.info('Performing Lineage Check (README vs Code)...');

            // README is tracked in lineage with key 'README.md'
            const readmeKey = options.output || 'README.md';
            const readmeSources = lineageService.getSources(readmeKey);

            if (readmeSources.length === 0) {
                logger.warn('⚠️  README not found in lineage graph.');
                logger.warn('   Run "sintesi readme" to establish a baseline.');
                readmeDriftDetected = true;
                readmeReason = 'README not tracked in lineage. Run "sintesi readme" first.';
            } else if (changedFiles.length > 0) {
                // Check if any changed files are tracked as README sources
                const impactedSources = readmeSources.filter((s) => changedFiles.includes(s));

                if (impactedSources.length === 0) {
                    logger.success('✅ No README source files changed (Lineage Check).');
                } else {
                    logger.info(
                        `🔍 ${impactedSources.length} README source files changed. Verifying semantically...`,
                    );

                    // Perform semantic verification
                    const semanticVerifier = new SemanticVerifier(logger);

                    // Extract targeted diff for README sources
                    let readmeSpecificDiff = '';
                    try {
                        const fileArgs = impactedSources.map((f) => `"${f}"`).join(' ');
                        readmeSpecificDiff = execSync(
                            `git diff ${baseRef || 'HEAD'} -- ${fileArgs}`,
                            {
                                cwd: codeRoot,
                                encoding: 'utf-8',
                            },
                        ).trim();
                    } catch (e) {
                        logger.debug(`Failed to extract targeted diff for README: ${e}`);
                        readmeSpecificDiff = gitDiff;
                    }

                    const verification = await semanticVerifier.verify(
                        readmeKey,
                        readmeSpecificDiff,
                        `Changes involved: ${impactedSources.join(', ')}`,
                        aiAgents,
                    );

                    if (verification.isDrift) {
                        readmeDriftDetected = true;
                        readmeReason = verification.reason || 'Semantic conflict detected';
                        logger.warn(`⚠️ Drift detected in README: ${readmeReason}`);
                    } else {
                        logger.success('✅ README validated as safely in-sync.');
                    }
                }
            } else {
                logger.success('No source files changed.');
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

            let impactedDocsSize = 0;

            if (changedFiles.length > 0) {
                logger.info(`Detected ${changedFiles.length} changed source files.`);

                // LineageService is already initialized above

                // Warning if lineage is missing (User Feedback)
                const lineagePath = join(codeRoot, '.sintesi', 'lineage.json');
                if (!existsSync(lineagePath)) {
                    logger.warn('⚠️  Lineage graph not found (.sintesi/lineage.json).');
                    logger.warn('   Semantic Check might be skipped or incomplete.');
                    logger.warn('   Run "sintesi documentation" to generate the dependency graph.');
                }

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
                    let meaningfulDriftCount = 0;

                    for (const docPath of impactedDocs) {
                        // Targeted Diff Extraction (User Feedback)
                        // Instead of sending the global diff, we extract diff only for the source files
                        // that impact THIS specific document.
                        const sources = lineageService.getSources(docPath);
                        // Filter sources to only those that actually changed
                        // changedFiles are relative to codeRoot. sources are relative to codeRoot (?)
                        // LineageService.track ensures sources are relative.
                        const relevantSources = sources.filter((s) => changedFiles.includes(s));

                        let docSpecificDiff = '';
                        if (relevantSources.length > 0) {
                            try {
                                // Add quotes to paths to handle spaces
                                const fileArgs = relevantSources.map((f) => `"${f}"`).join(' ');
                                docSpecificDiff = execSync(
                                    `git diff ${baseRef || 'HEAD'} -- ${fileArgs}`,
                                    {
                                        cwd: codeRoot,
                                        encoding: 'utf-8',
                                    },
                                ).trim();
                            } catch (e) {
                                logger.debug(
                                    `Failed to extract targeted diff for ${docPath}: ${e}`,
                                );
                                // Fallback to global diff if extraction fails
                                docSpecificDiff = gitDiff;
                            }
                        } else {
                            // Should rarely happen if graph is correct, but safe fallback
                            docSpecificDiff = gitDiff;
                        }

                        const verification = await semanticVerifier.verify(
                            docPath,
                            docSpecificDiff,
                            `Changes involved: ${relevantSources.join(', ')}`,
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
                        readme: {
                            hasDrift: readmeDriftDetected,
                            reason: readmeReason,
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
