
import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { ReviewService } from './review-service';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { spinner } from '@clack/prompts';

interface ReadmeOptions {
    output?: string;
    force?: boolean;
    verbose?: boolean;
}

export class ReadmeBuilder {
    constructor(
        private logger: Logger,
        private reviewService: ReviewService,
        private contextService: GenerationContextService
    ) { }

    async buildReadme(
        options: ReadmeOptions,
        context: ProjectContext,
        gitDiff: string,
        outputPath: string,
        aiAgents: AIAgents,
        smartSuggestion: string = ''
    ): Promise<void> {
        let existingContent = '';
        let isUpdate = false;

        if (existsSync(outputPath) && !options.force) {
            try {
                existingContent = readFileSync(outputPath, 'utf-8');
                isUpdate = true;
                this.logger.info('Found existing README, checking for updates...');
            } catch (e: any) {
                this.logger.warn('Could not read existing README: ' + e);
            }
        } else if (options.force) {
            this.logger.info('Force flag detected: ignoring existing README and regenerating from scratch.');
            existingContent = '';
            isUpdate = false;
        }

        const s = spinner();
        s.start(isUpdate ? 'Updating README...' : 'Generating README...');

        // Format context for AI
        const fileSummary = context.files
            .map(function (f) {
                const importInfo = f.importedBy.length > 0 ? ` (imported by ${f.importedBy.length} files)` : '';
                return '- ' + f.path + importInfo;
            })
            .join('\n');

        const cliConfig = this.contextService.detectCliConfig(context);
        const techStack = this.contextService.detectTechStack(context);

        // Use Service to generate context prompt (centralized)
        // This includes the Repository URL logic internally via generateContextPrompt -> getSafeRepoInstructions
        const sharedContextPrompt = this.contextService.generateContextPrompt(context, gitDiff, cliConfig, techStack);

        let prompt = '';

        prompt += "You are an expert technical writer. Your task is to " + (isUpdate ? "update and improve the" : "write a comprehensive") + " README.md for a software project.\n\n";
        prompt += "Here is the context of the project:\n\n";
        prompt += sharedContextPrompt;

        if (smartSuggestion) {
            prompt += "## Specific Suggestion (IMPORTANT)\n" + "A previous analysis identified a specific issue to address:\n> " + smartSuggestion + "\n\nPlease ensure this suggestion is addressed in your update.\n\n";
        }

        prompt += "## File Structure & Dependencies\n" + fileSummary + "\n\n";

        let instructions = '';

        if (isUpdate) {
            instructions += "\n## Current README Content\n";
            instructions += "```markdown\n";
            instructions += existingContent;
            instructions += "\n```\n\n";

            instructions += "## Instructions for UPDATE\n";
            instructions += "1. **STRICTLY PRESERVE STYLE**: You MUST write in the EXACT same language, tone, and style as the 'Current README Content'.\n";
            instructions += "2. **MINIMAL CHANGES**: Only update sections that are factually incorrect or missing based on the **Recent Code Changes**.\n";
            instructions += "3. **NO REWRITING**: Do NOT rephrase existing sentences just to 'improve' them. If it's not broken, don't fix it. This is critical to avoid unnecessary git diffs.\n";
            instructions += "4. **Detect New Features**: Look closely at the Git Diff and File Structure. If new files were added to 'commands', 'routes', or 'scripts', implies new functionality.\n";
            instructions += "5. **Update Usage Section**: IF you detect new CLI commands (e.g. in `src/commands/`), scripts, or API endpoints, YOU MUST document them in the Usage section.\n";
            instructions += "   - *Example*: If you see `src/commands/readme.ts`, ensure `readme` command is listed.\n";
            instructions += "6. **Keep manual details**: Preserve specific configuration details, project philosophy, or manual instructions that cannot be inferred from code.\n";
            instructions += "7. **Delete Obsolete**: Remove commands or features that were deleted, but do not touch valid ones.\n";
        } else {
            instructions += "\n## Instructions for NEW CREATION\n";
            instructions += "1. Analyze the file structure, package.json, and **Recent Code Changes**.\n";
            instructions += "2. **Identify Project Type**: Is it a CLI? A Web App? A Library? Adjust the 'Usage' section accordingly.\n";
            instructions += "   - *CLI*: List available commands (inferred from 'bin', 'commands' folder, or library structure). Look for files like `src/commands/foo.ts` -> command `foo`.\n";
            instructions += "   - *Web*: How to start dev server, build, test.\n";
            instructions += "   - *Library*: How to import and use main functions.\n";
            instructions += "3. Write a professional README.md that includes:\n";
            instructions += "   - **Project Title & Description**\n";
            instructions += "   - **Features**: Deduce key features from the file names, dependencies, and git diff.\n";
            instructions += "   - **Installation**\n";
            instructions += "   - **Usage**: Detailed instructions on how to run/use the project.\n";
            instructions += "   - **Project Structure**\n";
        }

        prompt += instructions;

        // Apply shared safety rules
        prompt += "\n## Rules & Safety\n";
        prompt += "- Use Markdown formatting.\n";
        prompt += "- Be concise but informative.\n";
        prompt += "- Do not include placeholder text like '[Insert description here]'. Infer the best possible description.\n";
        prompt += "- Return ONLY the Markdown content.\n";

        // Anti-Hallucination & Flag Protection Rules (Similar to DocumentationBuilder)
        prompt += "- **NO HALLUCINATIONS**: Only document commands/flags/props you see in the Context or Git Diff.\n";
        prompt += "- **PROTECT CLI FLAGS**: If updating, PRESERVE existing CLI flags (e.g. --no-strict) in usage examples unless you have proof they are removed. Assume implicit framework flags are valid.\n";
        prompt += "- **STRICT REPO URLS**: Use the Repository URL defined in package.json (see context above). DO NOT guess or hallucinate git URLs like 'git clone https://github.com/your-username/...'.\n";

        try {
            let readmeContent = await aiAgents.writer.generateText(prompt, {
                maxTokens: 4000,
                temperature: 0.1
            });

            // Cleanup
            readmeContent = readmeContent.trim();
            if (readmeContent.startsWith('```markdown')) {
                readmeContent = readmeContent.replace(/^```markdown\s*/, '').replace(/```$/, '');
            } else if (readmeContent.startsWith('```')) {
                readmeContent = readmeContent.replace(/^```\s*/, '').replace(/```$/, '');
            }
            readmeContent = readmeContent.trim();

            // Review
            if (aiAgents.reviewer) {
                readmeContent = await this.reviewService.reviewAndRefine(readmeContent, outputPath, 'Project README', aiAgents);
            }

            s.stop(isUpdate ? 'Update complete' : 'Generation complete');

            writeFileSync(outputPath, readmeContent);
            if (isUpdate && !options.force) {
                this.logger.success('README updated at ' + Logger.path(outputPath));
            } else {
                this.logger.success('README generated at ' + Logger.path(outputPath));
            }

        } catch (error: any) {
            s.stop('Generation failed');
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error('AI generation failed: ' + msg);
        }
    }
}
