/**
 * CLI command: check
 *
 * Verifies that documentation is in sync with code by detecting drift
 */

import { Logger } from '../utils/logger';
import { CheckResult, CheckOptions } from '../types';
import { SmartChecker } from '../services/smart-checker';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Execute the check command
 */
export async function checkCommand(options: CheckOptions): Promise<CheckResult> {
  const logger = new Logger(options.verbose);

  logger.header('🔍 Sintesi Check - Drift Detection');

  // Smart Check (High-level drift detection)
  // This is now the only check we perform as map-based checking has been removed.
  
  // Resolve the root directory for source code
  // We assume current working directory is the project root
  const codeRoot = process.cwd();
  
  logger.info('Performing smart check (README vs Code)...');
  logger.newline();
  
  const smartChecker = new SmartChecker(logger, codeRoot);
  const smartResult = await smartChecker.checkReadme({ baseBranch: options.base });

  let smartDriftDetected = false;

  if (smartResult.hasDrift) {
    logger.warn('⚠️ High-level drift detected: README might be outdated');
    if (smartResult.reason) logger.log(`  Reason: ${smartResult.reason}`);
    if (smartResult.suggestion) logger.log(`  Suggestion: ${smartResult.suggestion}`);
    logger.newline();

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

    smartDriftDetected = true;
  } else {
    logger.success('README appears to be in sync with recent changes');
  }
  
  logger.divider();

  // Return a simplified result since we don't have detailed entry tracking anymore
  const result: CheckResult = {
    totalEntries: 0,
    driftedEntries: smartDriftDetected ? 1 : 0,
    missingEntries: 0,
    untrackedEntries: 0,
    drifts: [],
    missing: [],
    success: !smartDriftDetected,
  };

  return result;
}
