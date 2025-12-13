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
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Execute the check command
 */
export async function checkCommand(options: CheckOptions): Promise<CheckResult> {
  const logger = new Logger(options.verbose);

  logger.header('🔍 Sintesi Check - Drift Detection');

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
  
  if (!gitDiff) {
    logger.success('No recent code changes detected. Documentation is likely in sync.');
    return {
      totalEntries: 0, driftedEntries: 0, missingEntries: 0, untrackedEntries: 0,
      drifts: [], missing: [], success: true
    };
  }

  // 1. README Check (SmartChecker)
  logger.info('Performing smart check (README vs Code)...');
  const smartChecker = new SmartChecker(logger, codeRoot);
  const smartResult = await smartChecker.checkReadme({ baseBranch: options.base });

  let readmeDriftDetected = false;
  if (smartResult.hasDrift) {
    logger.warn('⚠️ Drift detected: README might be outdated');
    if (smartResult.reason) logger.log(`  Reason: ${smartResult.reason}`);
    if (smartResult.suggestion) logger.log(`  Suggestion: ${smartResult.suggestion}`);
    
    // Save context for other commands (like readme) to consume
    try {
      const sintesiDir = resolve(process.cwd(), '.sintesi');
      if (!existsSync(sintesiDir)) {
        mkdirSync(sintesiDir, { recursive: true });
      }
      const contextPath = join(sintesiDir, 'smart-context.json');
      writeFileSync(contextPath, JSON.stringify({
        reason: smartResult.reason,
        suggestion: smartResult.suggestion,
        timestamp: Date.now()
      }, null, 2));
      logger.debug(`Saved smart check context to ${contextPath}`);
    } catch (e) {
      logger.debug(`Failed to save smart context: ${e}`);
    }
    readmeDriftDetected = true;
  } else {
    logger.success('README appears to be in sync.');
  }
  
  logger.newline();

  // 2. Documentation Site Check (ImpactAnalyzer)
  logger.info('Performing impact analysis (Documentation Site vs Code)...');
  const impactAnalyzer = new ImpactAnalyzer(logger);
  // We use 'checkWithLogging' which returns shouldProceed=true if update is needed
  // So updateNeeded = shouldProceed
  const docImpact = await impactAnalyzer.checkWithLogging(gitDiff, 'documentation', aiAgents, false);
  const docDriftDetected = docImpact.shouldProceed;

  if (docDriftDetected) {
     logger.warn('⚠️ Drift detected: Documentation site likely needs updates based on recent changes.');
  } else {
     logger.success('Documentation site appears to be in sync.');
  }

  // Save State for subsequent pipeline steps
  try {
    const sintesiDir = resolve(process.cwd(), '.sintesi');
    if (!existsSync(sintesiDir)) mkdirSync(sintesiDir, { recursive: true });
    
    const statePath = join(sintesiDir, 'state.json');
    writeFileSync(statePath, JSON.stringify({
      timestamp: Date.now(),
      readme: {
        hasDrift: readmeDriftDetected,
        reason: smartResult.reason,
        suggestion: smartResult.suggestion
      },
      documentation: {
        hasDrift: docDriftDetected,
        reason: docImpact.reason
      }
    }, null, 2));
    logger.debug(`Saved pipeline state to ${statePath}`);
  } catch (e) {
    logger.debug(`Failed to save pipeline state: ${e}`);
  }

  logger.divider();

  const anyDrift = readmeDriftDetected || docDriftDetected;

  // Return a simplified result since we don't have detailed entry tracking anymore
  const result: CheckResult = {
    totalEntries: 0,
    driftedEntries: anyDrift ? 1 : 0,
    missingEntries: 0,
    untrackedEntries: 0,
    drifts: [],
    missing: [],
    success: !anyDrift,
  };

  return result;
}
