import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents, ObservabilityMetadata } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { ReviewService } from './review-service';
import { createObservabilityMetadata, extendMetadata } from '../utils/observability';
import { DocPlan } from './documentation-planner';
import {
    DOC_GENERATION_PROMPT,
    DOC_QUERY_PROMPT,
    DOC_UPDATE_PROMPT,
} from '../prompts/documentation';
import { createPatchFileTool } from '../tools/patch-file';
import { pMap } from '../utils/concurrency';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { LineageService } from './lineage-service';
import { execSync } from 'child_process';
import { ChangeAnalysisService } from './analysis-service';

interface PageContext {
    item: DocPlan;
    sourceContext: string; // The "Ground Truth" from file system
    ragContext: string; // The RAG search results
    researchBrief: string; // The brief from Researcher Agent
    relevantFiles: string[]; // Files relevant to this page (for Diff filtering)
}

export class DocumentationBuilder {
    private lineageService: LineageService;
    private changeAnalysisService: ChangeAnalysisService;

    constructor(
        private logger: Logger,
        private reviewService: ReviewService,
        private generationContextService: GenerationContextService,
    ) {
        this.lineageService = new LineageService(logger);
        this.changeAnalysisService = new ChangeAnalysisService(logger);
    }

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
        await this.generationContextService.ensureRAGIndex();

        // PHASE 1: BATCH RESEARCH (High Concurrency)
        // We decouple research from writing to speed up the "reading" part.
        this.logger.info(
            `\n🚀 PHASE 1: Batch Research & Context Retrieval (${plan.length} items)...`,
        );

        const pageContexts = await this.performBatchResearch(
            plan,
            context,
            aiAgents,
            sessionMetadata,
        );

        // PHASE 2: GENERATION & REVIEW (Standard Concurrency)
        this.logger.info(`\n✍ PHASE 2: Content Generation & Review...`);

        const pkg = context.packageJson as any;
        const packageJsonSummary = pkg
            ? JSON.stringify(
                  {
                      name: pkg.name,
                      version: pkg.version,
                      description: pkg.description,
                      main: pkg.main,
                      bin: pkg.bin,
                      engines: pkg.engines,
                      dependencies: pkg.dependencies,
                      peerDependencies: pkg.peerDependencies,
                  },
                  null,
                  2,
              )
            : 'No package.json found';

        const repoInstructions = this.generationContextService.getSafeRepoInstructions(
            context.packageJson,
        );

        await pMap(
            pageContexts,
            async (pageCtx) => {
                const { item, sourceContext, ragContext, relevantFiles } = pageCtx;
                const fullPath = join(outputDir, item.path);

                // Filter Git Diff to reduce noise
                // We assume process.cwd() is the project root, which is standard for this CLI
                const filteredGitDiff = this.changeAnalysisService.filterGitDiff(
                    gitDiff,
                    relevantFiles,
                    process.cwd(),
                );

                if (filteredGitDiff.length < gitDiff.length) {
                    this.logger.debug(
                        `  ↳ Filtered Git Diff for ${item.path}: ${filteredGitDiff.length} chars (was ${gitDiff.length})`,
                    );
                }

                let currentContent = '';
                // Check if the target file already exists OR if there's an originalPath to migrate from
                if (existsSync(fullPath) && !force) {
                    currentContent = readFileSync(fullPath, 'utf-8');
                } else if (item.originalPath) {
                    const originalFullPath = join(outputDir, item.originalPath);
                    if (existsSync(originalFullPath)) {
                        currentContent = readFileSync(originalFullPath, 'utf-8');
                    }
                }

                this.logger.info(`> Writing ${item.path}...`);

                // Final Context composition for the Writer
                // We combine the Source Context and RAG Context directly.
                const writerContext = `
                *** RAW CONTEXT (Reference) ***
                ${sourceContext ? `--- DETECTED SOURCE FILES ---\n${sourceContext.substring(0, 20000)}` : ''}
                ${ragContext ? `\n--- SEMANTIC SEARCH RESULTS (RAG) ---\n${ragContext}` : ''}
                `;

                try {
                    let finalContent = '';

                    // STRATEGY SELECTION: UPDATE vs CREATE
                    if (currentContent && !force) {
                        this.logger.info(`  ↳ 🩹 Surgical Update Mode detected for ${item.path}`);

                        const fileContext = { content: currentContent, path: item.path };
                        const patchTool = createPatchFileTool(fileContext);

                        const updatePrompt = DOC_UPDATE_PROMPT(
                            context.packageJson?.name || 'Project',
                            item.path,
                            item.description,
                            writerContext,
                            filteredGitDiff,
                            currentContent,
                        );

                        // Execute Agent with Tools
                        const summary = await aiAgents.writer.generateText(
                            updatePrompt,
                            {
                                maxTokens: 4000,
                                temperature: 0.1,
                                tools: { patch_file: patchTool },
                                maxSteps: 5, // Allow up to 5 patch operations
                            },
                            extendMetadata(sessionMetadata, {
                                feature: 'content-update',
                                properties: {
                                    documentPath: item.path,
                                    documentType: item.type,
                                    mode: 'surgical-update',
                                },
                                tags: ['content', 'update', item.type],
                            }),
                        );

                        // In this mode, the tool mutates 'fileContext.content'
                        // The returned 'summary' is just the agent saying "I updated X".
                        finalContent = fileContext.content;
                        this.logger.debug(`  ↳ Agent summary: ${summary.substring(0, 100)}...`);
                    } else {
                        // LEGACY/CREATE MODE: Full rewrite
                        const genPrompt = DOC_GENERATION_PROMPT(
                            context.packageJson?.name || 'Project',
                            item.path,
                            item.description,
                            writerContext,
                            packageJsonSummary,
                            repoInstructions,
                            filteredGitDiff,
                            currentContent,
                        );

                        let generated = await aiAgents.writer.generateText(
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
                                    mode: 'full-generation',
                                },
                                tags: ['content', 'generation', item.type],
                            }),
                        );

                        // Clean Markdown
                        generated = generated.trim();
                        if (generated.startsWith('```markdown'))
                            generated = generated
                                .replace(/^```markdown\s*/, '')
                                .replace(/```$/, '');
                        else if (generated.startsWith('```'))
                            generated = generated.replace(/^```\s*/, '').replace(/```$/, '');

                        finalContent = generated;
                    }

                    // Reviewer
                    // We pass the RAW Source Context to the Reviewer for "Grounding"
                    // The Reviewer should strictly check against the code, not the Researcher's interpretation.
                    if (aiAgents.reviewer) {
                        finalContent = await this.reviewService.reviewAndRefine(
                            finalContent,
                            item.path,
                            item.description,
                            sourceContext, // GROUND TRUTH
                            aiAgents,
                            sessionMetadata,
                        );
                    }

                    mkdirSync(dirname(fullPath), { recursive: true });
                    writeFileSync(fullPath, finalContent);
                    this.logger.success(`✔ Wrote ${item.path}`);
                } catch (e) {
                    this.logger.error(`✖ Failed ${item.path}: ${e}`);
                }
            },
            3, // Concurrency for Writing (Keep manageable)
        );

        // Save Lineage Data with SHA
        try {
            const currentSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
            this.lineageService.setLastGeneratedSha(currentSha);
        } catch (e) {
            this.logger.warn('Failed to capture current git SHA for lineage: ' + e);
        }
        this.lineageService.save();

        // PHASE 3: FORMATTING
        await this.formatDocumentation(outputDir);

        this.logger.success(`\nDocumentation successfully generated in ${outputDir}/\n`);
    }

    /**
     * Executes the Research phase for all items in parallel.
     * Higher concurrency allowed here as it's mostly RAG lookups and one LLM call.
     */
    private async performBatchResearch(
        plan: DocPlan[],
        context: ProjectContext,
        aiAgents: AIAgents,
        sessionMetadata: ObservabilityMetadata,
    ): Promise<PageContext[]> {
        const results: PageContext[] = [];

        await pMap(
            plan,
            async (item) => {
                this.logger.debug(`[Research] Analyzing needs for ${item.path}...`);

                // 1. Get Static Source Context (File system)
                // We now capture the specific files used in this context
                const { content: detailedSourceContext, files: sourceFiles } =
                    this.generationContextService.readRelevantContextWithFiles(item, context);

                this.lineageService.track(item.path, sourceFiles);

                // 2. RAG Retrieval via Researcher (Dynamic)
                let ragContext = '';
                if (aiAgents.researcher) {
                    try {
                        const existingFileSummary = plan
                            .map((p) => `- ${p.path}: ${p.description}`)
                            .join('\n');
                        const queryPrompt = DOC_QUERY_PROMPT(
                            item.path,
                            item.description,
                            existingFileSummary.substring(0, 1000), // Summary of potential files
                        );

                        const queriesJson = await aiAgents.researcher.generateText(
                            queryPrompt,
                            { maxTokens: 500, temperature: 0.1 }, // Low temp for structured output
                            extendMetadata(sessionMetadata, {
                                feature: 'rag-query-generation',
                                properties: { documentPath: item.path },
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
                            queries = [item.description]; // Fallback
                        }

                        if (Array.isArray(queries) && queries.length > 0) {
                            this.logger.debug(`  ↳ 🔍 Searching: ${queries.join(', ')}`);

                            // Note: We currently don't track lineage from RAG chunks because
                            // RAG returns snippets, not full file identity easily in current impl.
                            // Future improvement: Return Metadata with RAG results.
                            const searchResults = await Promise.all(
                                queries.map((q) => {
                                    // SMART RAG STRATEGY:
                                    // If writing a User Guide/Concept, prioritize Markdown/Concepts.
                                    // If writing API Ref, prioritize Code.
                                    const isUserDoc = [
                                        'guide',
                                        'tutorial',
                                        'concepts',
                                        'intro',
                                    ].includes(item.type);

                                    if (isUserDoc) {
                                        return this.generationContextService.retrieveConceptualContext(
                                            q,
                                        );
                                    } else {
                                        return this.generationContextService.retrieveContext(q);
                                    }
                                }),
                            );
                            ragContext = Array.from(new Set(searchResults)).join('\n\n');
                        }
                    } catch (e) {
                        this.logger.debug(`RAG failed for ${item.path}: ${e}`);
                    }
                }

                // 3. Skip Research Brief (Optimization)
                // We pass raw context directly to the writer to save latency/cost.
                const researchBrief = '';

                results.push({
                    item,
                    sourceContext: detailedSourceContext,
                    ragContext,
                    researchBrief,
                    relevantFiles: sourceFiles,
                });
            },
            5, // Higher concurrency for Research
        );

        return results;
    }

    /**
     * Attempts to format the generated documentation using Prettier.
     * Degrades gracefully if Prettier is not found or fails.
     */
    private async formatDocumentation(outputDir: string): Promise<void> {
        this.logger.info('\n✨ PHASE 3: Formatting...');
        try {
            // We use npx to use the local project's prettier if available, or download if configured.
            // We adding --no-install to avoid downloading if not present?
            // Better: Just run it. If it fails, we catch.
            // We target all markdown files in the output directory.
            const targetPattern = `"${outputDir}/**/*.md"`;

            // Check if prettier is runnable first?
            // Simpler: Try running it.
            this.logger.debug(`  Running: npx prettier --write ${targetPattern}`);
            execSync(`npx prettier --write ${targetPattern}`, {
                stdio: 'inherit', // Let user see output/errors if they want
                encoding: 'utf-8',
            });
            this.logger.success('  ✔ Prettier formatting applied.');
        } catch (e: any) {
            // If exit code is non-zero, it likely means syntax errors or not found.
            // We don't want to crash the whole process, just warn.
            this.logger.warn(
                `  ⚠ Prettier formatting skipped or failed (likely syntax errors in MD): ${e.message?.split('\n')[0]}`,
            );
        }
    }
}
