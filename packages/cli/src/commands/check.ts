/**
 * CLI command: check
 *
 * Verifies that documentation is in sync with code by detecting drift
 */

import { Logger } from '../utils/logger';
import { CheckResult, CheckOptions } from '../types';
import { SmartChecker } from '../services/smart-checker';
import { GenerationContextService } from '../services/generation-context';
import { ImpactAnalyzer } from '../services/impact-analyzer';
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
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
      totalEntries: 0, driftedEntries: 0, missingEntries: 0, untrackedEntries: 0,
      drifts: [], missing: [], success: false, configError: 'Failed to initialize AI agents'
    };
  }

  // Analyze Project (Get Git Diff)
  logger.info('Analyzing project changes...');
  const { gitDiff } = await contextService.analyzeProject();

  // 0. Existence Check
  let readmeExists = true;
  let docsExist = true;

  if (shouldCheckReadme) {
    const readmePath = resolve(codeRoot, 'README.md');
    readmeExists = existsSync(readmePath);
  }

  if (shouldCheckDocs) {
    const docsDir = resolve(codeRoot, 'docs'); // Default docs dir
    docsExist = existsSync(docsDir) && readdirSync(docsDir).length > 0;
  }

  // If no changes AND everything relevant exists, we are good.
  const readmeOK = !shouldCheckReadme || (shouldCheckReadme && readmeExists);
  const docsOK = !shouldCheckDocs || (shouldCheckDocs && docsExist);

  if (!gitDiff && readmeOK && docsOK) {
    logger.success('No recent code changes detected and required documentation exists. Everything is likely in sync.');
    return {
      totalEntries: 0, driftedEntries: 0, missingEntries: 0, untrackedEntries: 0,
      drifts: [], missing: [], success: true
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
      readmeReason = "README file is missing.";
      readmeSuggestion = "Generate a new README.";
      logger.warn('⚠️ Drift detected: README is missing');
    } else if (gitDiff) {
      // Only run smart checker if we have diffs and the file exists
      logger.info('Performing smart check (README vs Code)...');
      const smartChecker = new SmartChecker(logger, codeRoot);
      const smartResult = await smartChecker.checkReadme({ baseBranch: options.base });

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
      docReason = "Documentation directory is missing or empty.";
      logger.warn('⚠️ Drift detected: Documentation is missing');
    } else if (gitDiff) {
      logger.info('Performing impact analysis (Documentation Site vs Code)...');
      const impactAnalyzer = new ImpactAnalyzer(logger);
      // We use 'checkWithLogging' which returns shouldProceed=true if update is needed
      const docImpact = await impactAnalyzer.checkWithLogging({
        gitDiff,
        docType: 'documentation',
        aiAgents,
        force: false
      });
      docDriftDetected = docImpact.shouldProceed;
      docReason = docImpact.reason;

      if (docDriftDetected) {
        logger.warn('⚠️ Drift detected: Documentation site likely needs updates based on recent changes.');
      }
      else {
        logger.success('Documentation site appears to be in sync.');
      }
    }
  }

  // Save State for subsequent pipeline steps
  try {
    const sintesiDir = resolve(process.cwd(), '.sintesi');
    if (!existsSync(sintesiDir)) mkdirSync(sintesiDir, { recursive: true });

    const sintesiGitignorePath = join(sintesiDir, '.gitignore');
    if (!existsSync(sintesiGitignorePath)) {
      writeFileSync(sintesiGitignorePath, '*');
      logger.debug(`Created .gitignore in ${sintesiDir}`);
    }

    // Save README state if checked
    if (shouldCheckReadme) {
      const statePath = join(sintesiDir, 'readme.state.json');
      writeFileSync(statePath, JSON.stringify({
        timestamp: Date.now(),
        readme: {
          hasDrift: readmeDriftDetected,
          reason: readmeReason,
          suggestion: readmeSuggestion
        }
      }, null, 2));
      logger.debug(`Saved README state to ${statePath}`);
    }

    // Save Docs state if checked
    if (shouldCheckDocs) {
      const statePath = join(sintesiDir, 'documentation.state.json');
      writeFileSync(statePath, JSON.stringify({
        timestamp: Date.now(),
        documentation: {
          hasDrift: docDriftDetected,
          reason: docReason
        }
      }, null, 2));
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
    missingEntries: ((shouldCheckReadme && !readmeExists) ? 1 : 0) + ((shouldCheckDocs && !docsExist) ? 1 : 0),
    untrackedEntries: 0,
    drifts: [],
    missing: [],
    success: !anyDrift,
  };

  return result;
}
