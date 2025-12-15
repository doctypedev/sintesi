
import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { README_GENERATION_PROMPT } from '../prompts/readme';
import { ReviewService } from './review-service';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { spinner } from '@clack/prompts';
import { SemanticService } from './semantic-service';
import { join } from 'path';

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
        smartSuggestion: string = '',
        semanticService?: SemanticService
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

        // RAG Semantic Search (if enabled)
        let semanticHighlights = '';
        if (semanticService) {
            s.message('Indexing and searching project context (RAG)...');
            try {
                // Index files present in context
                const filesToIndex = context.files.map(f => f.path);
                await semanticService.indexProject(filesToIndex);
                
                // Search for key concepts
                const searchResults = await semanticService.search("Project entry point, core architecture, main configuration, key features");
                
                semanticHighlights = searchResults.map(doc => {
                    try {
                        const content = readFileSync(join(process.cwd(), doc.path), 'utf-8');
                        // Slice to avoid token overflow
                        return `File: ${doc.path}\n\`\`\`typescript\n${content.slice(0, 2000)}\n...\n\`\`\``;
                    } catch (e) { return ''; }
                }).join('\n\n');
                
                if (semanticHighlights) {
                    this.logger.info(`RAG retrieved ${searchResults.length} relevant context files.`);
                }
            } catch (e: any) {
                this.logger.warn('Semantic RAG failed, proceeding without it: ' + e.message);
            }
            s.message(isUpdate ? 'Updating README...' : 'Generating README...');
        }

        // Format context for AI
        const fileSummary = context.files
            .map(function (f) {
                const importInfo = f.importedBy.length > 0 ? ` (imported by ${f.importedBy.length} files)` : '';
                return '- ' + f.path + importInfo;
            })
            .join('\n');

        const projectConfig = this.contextService.detectProjectConfig(context);
        const techStack = this.contextService.detectTechStack(context);

        // Use Service to generate context prompt (centralized)
        // This includes the Repository URL logic internally via generateContextPrompt -> getSafeRepoInstructions
        const sharedContextPrompt = this.contextService.generateContextPrompt(context, gitDiff, projectConfig, techStack);

        const prompt = README_GENERATION_PROMPT(
            isUpdate,
            sharedContextPrompt,
            smartSuggestion,
            fileSummary,
            existingContent,
            semanticHighlights
        );

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
                // We use sharedContextPrompt as the source of truth for the reviewer
                readmeContent = await this.reviewService.reviewAndRefine(readmeContent, outputPath, 'Project README', sharedContextPrompt, aiAgents);
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
