import { existsSync, readFileSync } from 'fs';
import { resolve, basename } from 'path';
import { Logger } from '../utils/logger';
import { createAIAgentsFromEnv, AIAgents } from '../../../ai'; // Updated import
import { getSmartCheckReadmePrompt } from '../prompts/analysis';
import { ChangeAnalysisService } from './analysis-service';
import { filterGitDiff } from '../utils/diff-utils';

export interface SmartCheckResult {
    hasDrift: boolean;
    reason?: string;
    suggestion?: string;
}

export class SmartChecker {
    private logger: Logger;
    private analysisService: ChangeAnalysisService;
    private projectRoot: string;

    constructor(logger: Logger, projectRoot: string = process.cwd()) {
        this.logger = logger;
        this.analysisService = new ChangeAnalysisService(logger);
        this.projectRoot = projectRoot;
    }

    /**
     * Determine if we should analyze changes with AI based on heuristics
     * This saves tokens by avoiding AI calls for trivial changes
     */
    private shouldAnalyzeWithAI(changedFiles: string[], gitDiff: string): boolean {
        // 1. File Name Filtering
        const relevantFiles = changedFiles.filter(file => {
            // Ignore test files
            if (file.match(/\.(test|spec)\.(ts|js|rs)$/) || file.includes('__tests__') || file.includes('tests/')) return false;
            // Ignore lockfiles and internal configs
            if (file.includes('lock.yaml') || file.includes('lock.json') || file.includes('lock')) return false;
            if (file.includes('.gitignore') || file.includes('.editorconfig')) return false;
            // Ignore Changelogs and Changesets (Version bumps)
            if (file.includes('CHANGELOG.md') || file.includes('.changeset/')) return false;

            // Focus on source code (TS/JS/Rust) and existing docs and configs
            return file.endsWith('.ts') ||
                file.endsWith('.js') ||
                file.endsWith('.rs') ||
                file.endsWith('package.json') ||
                file.endsWith('Cargo.toml');
        });

        // 2. Critical Path "Always Check"
        // If the file is in a critical directory (like commands or routes), we analyze it regardless of specific keywords.
        // NOTE: We removed package.json/Cargo.toml from here to avoid triggering on simple version bumps. 
        // We rely on content heuristics (below) to catch "dependencies" or "scripts" changes.
        const isCriticalChange = relevantFiles.some(file =>
            file.includes('/commands/') ||
            file.includes('/routes/')
        );

        if (isCriticalChange) {
            this.logger.debug('Critical file changed (commands/routes). Skipping keyword heuristics and forcing AI check.');
            return true;
        }

        // 3. Content Heuristics (Regex Scan on Diff)
        // We look for keywords that suggest meaningful API/CLI changes in both ADDED (+) and REMOVED (-) lines
        // Deletions are breaking changes and require docs updates too.
        const changedLines = gitDiff.split('\n').filter(line =>
            (line.startsWith('+') && !line.startsWith('+++')) ||
            (line.startsWith('-') && !line.startsWith('---'))
        );
        const changedContent = changedLines.join('\n');

        // Keywords for public API or CLI changes (TS + Rust)
        const meaningfulKeywords = [
            // TypeScript / JavaScript
            // Support 'export default', 'export async', 'export abstract', etc.
            /export\s+(default\s+|async\s+|abstract\s+)*(class|interface|type|enum|const|function|let|var)/,
            /command\(/, // Yargs or CLI commands
            /route\(/,   // API routes matches
            /"bin":/,    // package.json bin
            /"scripts":/, // package.json scripts
            /"dependencies":/, // package.json dependencies
            /"peerDependencies":/, // package.json peerDependencies

            // Rust
            /pub\s+(struct|enum|fn|mod|trait|impl|const|static|type)/, // Public Rust items
            /#\[derive\(.*Args.*\)\]/, // Clap Args
            /#\[derive\(.*Parser.*\)\]/, // Clap Parser
            /#\[derive\(.*Subcommand.*\)\]/, // Clap Subcommand
            /#\[command/, // Clap command attribute
            /\[dependencies\]/ // Cargo.toml dependencies
        ];

        const hasMeaningfulChange = meaningfulKeywords.some(regex => regex.test(changedContent));

        if (!hasMeaningfulChange) {
            this.logger.debug('Changes detected but no meaningful keywords found (e.g. exports, commands). Skipping AI check.');
            return false;
        }

        return true;
    }

    /**
     * Checks if there are relevant code changes that might affect documentation
     * using the deterministic heuristics (no AI cost).
     */
    async hasRelevantCodeChanges(options?: { baseBranch?: string }): Promise<boolean> {
        const baseBranch = options?.baseBranch || 'origin/main';
        try {
            const context = await this.analysisService.analyze({
                baseBranch,
                projectRoot: this.projectRoot,
                fallbackToLastCommit: true,
                includeSymbols: false,
                stagedOnly: false
            });

            if (!context.gitDiff) {
                return false;
            }

            return this.shouldAnalyzeWithAI(context.changedFiles, context.gitDiff);
        } catch (error) {
            this.logger.warn('Failed to check for relevant changes: ' + error);
            return true; // Default to true on error to be safe
        }
    }

    /**
     * Check if the README needs to be updated based on recent code changes
     */
    async checkReadme(options?: { baseBranch?: string, readmePath?: string }): Promise<SmartCheckResult> {
        const readmePath = options?.readmePath || resolve(this.projectRoot, 'README.md');
        const baseBranch = options?.baseBranch || 'origin/main';

        if (!existsSync(readmePath)) {
            return { hasDrift: false }; // No README to check
        }

        // 1. Get recent changes via shared service
        let gitDiff = '';
        let changedFiles: string[] = [];

        try {
            const context = await this.analysisService.analyze({
                baseBranch,
                projectRoot: this.projectRoot,
                fallbackToLastCommit: true,
                includeSymbols: false, // We don't need semantic symbol analysis for this, just diffs + files
                stagedOnly: false
            });

            gitDiff = context.gitDiff;
            changedFiles = context.changedFiles;

            if (!gitDiff) {
                this.logger.debug('No code changes detected to analyze.');
                return { hasDrift: false };
            }

            // FILTER: Remove README.md changes from the diff to prevent self-triggering
            // Using shared utility for consistent logic
            gitDiff = filterGitDiff(gitDiff, ['README.md', basename(readmePath)]);

            if (!gitDiff.trim()) {
                this.logger.debug('No code changes detected (after filtering README changes).');
                return { hasDrift: false };
            }

            // Optimization: Deterministic Pre-filter
            // We pass the ALREADY FILTERED diff here, so keywords in README.md don't trigger the AI check.
            if (!this.shouldAnalyzeWithAI(changedFiles, gitDiff)) {
                return { hasDrift: false };
            }

            // Truncate to avoid token limits
            if (gitDiff.length > 8000) {
                gitDiff = gitDiff.substring(0, 8000) + '\n... (truncated)';
            }
        } catch (error) {
            this.logger.warn('Failed to get changes: ' + error);
            return { hasDrift: false };
        }

        // 2. Read README content
        const readmeContent = readFileSync(readmePath, 'utf-8');

        // 3. Consult AI
        try {
            this.logger.info('🤖 Asking AI if README needs updates based on recent changes...');
            const aiAgents: AIAgents = createAIAgentsFromEnv({ debug: this.logger.getVerbose() });
            const plannerAgent = aiAgents.planner;

            if (!await plannerAgent.validateConnection()) {
                this.logger.warn('AI connection failed. Skipping smart check.');
                return { hasDrift: false };
            }

            const prompt = getSmartCheckReadmePrompt(readmeContent, gitDiff);

            const response = await plannerAgent.generateText(prompt, {
                temperature: 0
            });

            // Parse JSON response
            let result;
            try {
                // Strip markdown code blocks if present
                const cleanJson = response.replace(/^```json\s*/, '').replace(/```$/, '').trim();
                result = JSON.parse(cleanJson);
            } catch (e) {
                this.logger.debug('Failed to parse AI response as JSON: ' + response);
                return { hasDrift: false };
            }

            if (result && result.hasDrift) {
                return {
                    hasDrift: true,
                    reason: result.reason,
                    suggestion: result.suggestion
                };
            }

        } catch (error) {
            this.logger.warn('Smart check failed: ' + error);
        }

        return { hasDrift: false };
    }
}
