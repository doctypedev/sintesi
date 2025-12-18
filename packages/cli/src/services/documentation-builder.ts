import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents, ObservabilityMetadata } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { ReviewService } from './review-service';
import { createObservabilityMetadata, extendMetadata } from '../utils/observability';
import { DocPlan } from './documentation-planner';
import {
    DOC_GENERATION_PROMPT,
    DOC_RESEARCH_PROMPT,
    DOC_QUERY_PROMPT,
} from '../prompts/documentation';
import { pMap } from '../utils/concurrency';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export class DocumentationBuilder {
    constructor(
        private logger: Logger,
        private reviewService: ReviewService,
        private generationContextService: GenerationContextService,
    ) {}

    async buildDocumentation(
        plan: DocPlan[],
        context: ProjectContext,
        gitDiff: string,
        outputDir: string,
        aiAgents: AIAgents,
        force: boolean = false,
    ): Promise<void> {
        this.logger.info('\nStarting content generation...');

        // Create observability metadata for this documentation generation session
        const sessionMetadata: ObservabilityMetadata = createObservabilityMetadata({
            feature: 'documentation-generation',
            projectName: context.packageJson?.name,
            additionalTags: ['writing'],
        });

        // Initialize RAG Index (Async, but awaited to ensure context is ready)
        // Only if not skipped by config? For now assuming if code loads, we want it.
        await this.generationContextService.ensureRAGIndex();

        await pMap(
            plan,
            async (item) => {
                const fullPath = join(outputDir, item.path);
                let currentContent = '';

                // Check if the target file already exists OR if there's an originalPath to migrate from
                if (existsSync(fullPath) && !force) {
                    currentContent = readFileSync(fullPath, 'utf-8');
                } else if (item.originalPath) {
                    const originalFullPath = join(outputDir, item.originalPath);
                    if (existsSync(originalFullPath)) {
                        currentContent = readFileSync(originalFullPath, 'utf-8');
                        this.logger.debug(
                            `Migrating content from ${item.originalPath} to ${item.path}`,
                        );
                    }
                }

                if (force && existsSync(fullPath)) {
                    this.logger.debug(`Force mode: Ignoring existing content for ${item.path}`);
                }

                this.logger.info(`> Processing ${item.path}...`);

                const detailedSourceContext = this.generationContextService.readRelevantContext(
                    item,
                    context,
                );

                // FIX: Use shared logic for Repository URL to prevent hallucination
                const repoInstructions = this.generationContextService.getSafeRepoInstructions(
                    context.packageJson,
                );

                const packageJsonSummary = context.packageJson
                    ? JSON.stringify(context.packageJson, null, 2)
                    : 'No package.json found';

                // --- RESEARCHER STEP ---
                let finalContext =
                    detailedSourceContext ||
                    '(No specific source files matched, rely on general context)';

                // Try RAG retrieval to augment context
                let ragContext = '';

                // AGENTIC QUERY GENERATION
                // Instead of guessing, we ask the Researcher what to look for.
                if (aiAgents.researcher) {
                    try {
                        const queryPrompt = DOC_QUERY_PROMPT(
                            item.path,
                            item.description,
                            detailedSourceContext.substring(0, 1000),
                        );
                        const queriesJson = await aiAgents.researcher.generateText(
                            queryPrompt,
                            {
                                maxTokens: 500,
                                temperature: 0.2,
                            },
                            extendMetadata(sessionMetadata, {
                                feature: 'rag-query-generation',
                                properties: { documentPath: item.path },
                                tags: ['rag', 'query-generation'],
                            }),
                        );

                        let queries: string[] = [];
                        try {
                            const cleanJson = queriesJson
                                .replace(/```json/g, '')
                                .replace(/```/g, '')
                                .trim();
                            queries = JSON.parse(cleanJson);
                        } catch (e) {
                            // Fallback if JSON fails
                            queries = [item.description, item.path];
                        }

                        if (Array.isArray(queries) && queries.length > 0) {
                            this.logger.debug(
                                `  ↳ 🧠 Researcher formulated queries: ${queries.join(', ')}`,
                            );

                            // Execute searches in parallel
                            const searchResults = await Promise.all(
                                queries.map((q) =>
                                    this.generationContextService.retrieveContext(q),
                                ),
                            );

                            // Deduplicate and join
                            ragContext = Array.from(new Set(searchResults)).join('\n\n');
                        }
                    } catch (e) {
                        this.logger.debug(`RAG Query generation failed: ${e}`);
                    }
                } else {
                    // Fallback if no researcher agent
                    try {
                        const query = `Explain ${item.path}: ${item.description}`;
                        ragContext = await this.generationContextService.retrieveContext(query);
                    } catch (e) {
                        // Ignore RAG errors in fallback
                    }
                }

                if (ragContext) {
                    this.logger.debug(`  ↳ 🤖 RAG Context found (${ragContext.length} chars)`);
                }

                if (
                    aiAgents.researcher &&
                    (detailedSourceContext.length > 100 || ragContext.length > 100)
                ) {
                    try {
                        this.logger.info(`  ↳ 🔍 Researcher analyzing context...`);

                        const combinedContext = `
                    ${detailedSourceContext ? `--- DETECTED SOURCE FILES ---\n${detailedSourceContext}` : ''}
                    
                    ${ragContext ? `--- SEMANTIC SEARCH RESULTS (RAG) ---\n${ragContext}` : ''}
                    `;

                        const researchPrompt = DOC_RESEARCH_PROMPT(
                            item.path,
                            item.description,
                            combinedContext,
                            packageJsonSummary,
                        );

                        const researchOutput = await aiAgents.researcher.generateText(
                            researchPrompt,
                            {
                                maxTokens: 4000,
                                temperature: 0.0,
                            },
                            extendMetadata(sessionMetadata, {
                                feature: 'content-research',
                                properties: { documentPath: item.path },
                                tags: ['research', 'context-analysis'],
                            }),
                        );

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
                    currentContent,
                );

                try {
                    let content = await aiAgents.writer.generateText(
                        genPrompt,
                        {
                            maxTokens: 4000,
                            temperature: 0.1,
                        },
                        extendMetadata(sessionMetadata, {
                            feature: 'content-generation',
                            properties: {
                                documentPath: item.path,
                                documentType: item.type,
                            },
                            tags: ['content', item.type],
                        }),
                    );

                    content = content.trim();
                    if (content.startsWith('```markdown'))
                        content = content.replace(/^```markdown\s*/, '').replace(/```$/, '');
                    else if (content.startsWith('```'))
                        content = content.replace(/^```\s*/, '').replace(/```$/, '');

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
                        content = await this.reviewService.reviewAndRefine(
                            content,
                            item.path,
                            item.description,
                            reviewerContext,
                            aiAgents,
                            sessionMetadata,
                        );
                    }

                    mkdirSync(dirname(fullPath), { recursive: true });
                    writeFileSync(fullPath, content);
                    this.logger.success(`✔ Wrote ${item.path}`);
                } catch (e) {
                    this.logger.error(`✖ Failed ${item.path}: ${e}`);
                }
            },
            3,
        );

        this.logger.success(`\nDocumentation successfully generated in ${outputDir}/\n`);
    }
}
