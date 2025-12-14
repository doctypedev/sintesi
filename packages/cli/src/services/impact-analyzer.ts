
import { Logger } from '../utils/logger';
import { AIAgents } from '../../../ai';
import { filterGitDiff } from '../utils/diff-utils';
import { getImpactAnalysisPrompt } from '../prompts/analysis';

export class ImpactAnalyzer {
    constructor(private logger: Logger) { }

    /**
     * Helper to centralize the check & logging logic.
     * Returns TRUE if we should proceed with generation (update needed), FALSE if we should skip.
     */
    async checkWithLogging(options: {
        gitDiff: string,
        docType: 'readme' | 'documentation',
        aiAgents: AIAgents,
        force?: boolean,
        targetExists?: boolean,
        outputDir?: string
    }): Promise<{ shouldProceed: boolean; reason?: string }> {
        const { gitDiff, docType, aiAgents, force = false, targetExists = true, outputDir } = options;

        if (!gitDiff) return { shouldProceed: true, reason: 'No git diff provided (or forced).' };

        // 1. Existence Check: If the target file/folder is missing, we MUST generate.
        if (targetExists === false) {
            this.logger.info(`${docType === 'readme' ? 'README' : 'Documentation'} missing: Skipping semantic impact analysis to ensure generation.`);
            return { shouldProceed: true, reason: 'Target missing' };
        }

        const impact = await this.shouldUpdateDocs(gitDiff, docType, aiAgents, outputDir);

        if (!impact.update && !force) {
            this.logger.success(`✨ Impact Analysis: No relevant changes detected. Skipping generation.`);
            this.logger.info(`   Reason: ${impact.reason}`);
            return { shouldProceed: false, reason: impact.reason }; // Skip
        } else if (impact.update) {
            this.logger.info(`✨ Impact Analysis: Update required.`);
            this.logger.info(`   Reason: ${impact.reason}`);
        }

        return { shouldProceed: true, reason: impact.reason }; // Proceed
    }

    /**
     * Analyzes the git diff and determines if the documentation needs to be updated.
     * Returns a reason if NO update is needed.
     */
    async shouldUpdateDocs(
        gitDiff: string,
        docType: 'readme' | 'documentation',
        aiAgents: AIAgents,
        outputDir?: string
    ): Promise<{ update: boolean; reason: string }> {
        if (!gitDiff || gitDiff.trim().length === 0) {
            return { update: false, reason: 'No git diff provided.' };
        }

        // 1. Clean the diff (remove lockfiles, noise)
        const exclusions: string[] = [];
        if (docType === 'readme') {
            exclusions.push('README.md');
            if (outputDir) exclusions.push(outputDir);
        } else if (docType === 'documentation') {
            if (outputDir) {
                // Ensure directory paths end with / for proper filtering if needed by filterGitDiff
                // But filterGitDiff usually handles glob patterns.
                // If outputDir is 'docs', we want to exclude 'docs/' and contents.
                const dir = outputDir.endsWith('/') ? outputDir : `${outputDir}/`;
                exclusions.push(dir);
            } else {
                exclusions.push('docs/');
                exclusions.push('documentation/');
            }
        }

        const cleanDiff = filterGitDiff(gitDiff, exclusions);

        // 2. Short-circuit: If filtering removed everything, we don't need to ask AI
        if (!cleanDiff || cleanDiff.trim().length === 0) {
            return {
                update: false,
                reason: 'All changes were filtered out (likely docs-only changes).'
            };
        }

        // 2. Safety Check: Truncation Risk
        // If the cleaned diff is still massive, we risk truncating critical changes.
        // Fallback to safe update.
        if (cleanDiff.length > 20000) {
            return {
                update: true,
                reason: 'Diff is too large (>20k chars) for semantic analysis. Forcing update to ensure no breaking changes are missed.'
            };
        }

        this.logger.info(`🔍 Performing Semantic Impact Analysis on ${docType}...`);

        const prompt = getImpactAnalysisPrompt(docType, cleanDiff);

        try {
            // Use the Planner or Reviewer (usually stronger models) for this logic
            const agent = aiAgents.reviewer || aiAgents.planner;
            let response = await agent.generateText(prompt, {
                maxTokens: 500,
                temperature: 0.1
            });

            response = response.trim();
            // Clean up markdown code blocks
            if (response.startsWith('```json')) response = response.replace(/^```json\s*/, '').replace(/```$/, '');
            else if (response.startsWith('```')) response = response.replace(/^```\s*/, '').replace(/```$/, '');

            const result = JSON.parse(response);
            return {
                update: result.update === true,
                reason: result.reason || 'No reason provided.'
            };

        } catch (e) {
            this.logger.warn(`Impact analysis failed (JSON parse error or AI error): ${e}. Defaulting to TRUE (safe mode).`);
            return { update: true, reason: 'Analysis failed (fallback to safe update).' };
        }
    }


}
