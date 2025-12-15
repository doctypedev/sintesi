
import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { ReviewService } from './review-service';
import { DocPlan } from './documentation-planner';
import { DOC_GENERATION_PROMPT, DOC_RESEARCH_PROMPT } from '../prompts/documentation';
import { pMap } from '../utils/concurrency';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export class DocumentationBuilder {
    constructor(
        private logger: Logger,
        private reviewService: ReviewService,
        private generationContextService: GenerationContextService
    ) { }



    async buildDocumentation(
        plan: DocPlan[],
        context: ProjectContext,
        gitDiff: string,
        outputDir: string,
        aiAgents: AIAgents,
        force: boolean = false
    ): Promise<void> {
        this.logger.info('\nStarting content generation...');

        await pMap(plan, async (item) => {
            const fullPath = join(outputDir, item.path);
            let currentContent = '';

            // Check if the target file already exists OR if there's an originalPath to migrate from
            if (existsSync(fullPath) && !force) {
                currentContent = readFileSync(fullPath, 'utf-8');
            } else if (item.originalPath) {
                const originalFullPath = join(outputDir, item.originalPath);
                if (existsSync(originalFullPath)) {
                    currentContent = readFileSync(originalFullPath, 'utf-8');
                    this.logger.debug(`Migrating content from ${item.originalPath} to ${item.path}`);
                }
            }

            if (force && existsSync(fullPath)) {
                this.logger.debug(`Force mode: Ignoring existing content for ${item.path}`);
            }

            this.logger.info(`> Processing ${item.path}...`);

            const detailedSourceContext = this.generationContextService.readRelevantContext(item, context);

            // FIX: Use shared logic for Repository URL to prevent hallucination
            const repoInstructions = this.generationContextService.getSafeRepoInstructions(context.packageJson);

            const packageJsonSummary = context.packageJson
                ? JSON.stringify(context.packageJson, null, 2)
                : 'No package.json found';

            // --- RESEARCHER STEP ---
            let finalContext = detailedSourceContext || '(No specific source files matched, rely on general context)';
            
            if (aiAgents.researcher && detailedSourceContext && detailedSourceContext.length > 100) {
                try {
                    this.logger.info(`  ↳ 🔍 Researcher analyzing context...`);
                    const researchPrompt = DOC_RESEARCH_PROMPT(
                        item.path,
                        item.description,
                        detailedSourceContext,
                        packageJsonSummary
                    );
                    
                    const researchOutput = await aiAgents.researcher.generateText(researchPrompt, {
                        maxTokens: 4000,
                        temperature: 0.0
                    });

                    finalContext = `
                    *** RESEARCHER TECHNICAL BRIEF ***
                    (The following information was extracted and verified by the Researcher Agent from the raw source code)

                    ${researchOutput}
                    
                    *** END RESEARCHER BRIEF ***
                    `;
                } catch (e) {
                    this.logger.debug(`Researcher failed, falling back to raw context: ${e}`);
                }
            }

            const genPrompt = DOC_GENERATION_PROMPT(
                context.packageJson?.name || 'Project',
                item.path,
                item.description,
                finalContext,
                packageJsonSummary,
                repoInstructions,
                gitDiff,
                currentContent
            );

            try {
                let content = await aiAgents.writer.generateText(genPrompt, {
                    maxTokens: 4000,
                    temperature: 0.1
                });

                content = content.trim();
                if (content.startsWith('```markdown')) content = content.replace(/^```markdown\s*/, '').replace(/```$/, '');
                else if (content.startsWith('```')) content = content.replace(/^```\s*/, '').replace(/```$/, '');

                // Reviewer
                if (aiAgents.reviewer) {
                    const reviewerContext = `
                    --- Package.json ---
                    ${packageJsonSummary}

                    --- Recent Changes ---
                    ${gitDiff}

                    --- Source Code Analysis ---
                    ${detailedSourceContext || 'No specific source files matched.'}
                    `;
                    content = await this.reviewService.reviewAndRefine(content, item.path, item.description, reviewerContext, aiAgents);
                }

                mkdirSync(dirname(fullPath), { recursive: true });
                writeFileSync(fullPath, content);
                this.logger.success(`✔ Wrote ${item.path}`);
            } catch (e) {
                this.logger.error(`✖ Failed ${item.path}: ${e}`);
            }
        }, 3);

        this.logger.success(`\nDocumentation successfully generated in ${outputDir}/\n`);
    }
}
