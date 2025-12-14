
import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { ReviewService } from './review-service';
import { DocPlan } from './documentation-planner';
import { DOC_GENERATION_PROMPT } from '../prompts/documentation';
import { pMap } from '../utils/concurrency';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname, relative } from 'path';

export class DocumentationBuilder {
    constructor(
        private logger: Logger,
        private reviewService: ReviewService,
        private generationContextService: GenerationContextService
    ) { }

    /**
     * Reads the content of relevant files to provide context to the LLM.
     * Uses the Project Context dependency graph to find related files (imports)
     * and includes associated tests.
     */
    private readRelevantContext(item: DocPlan, context: ProjectContext): string {
        const MAX_CONTEXT_CHARS = 30000;
        let content = '';
        let chars = 0;

        // 1. Identify Target Files (Seeds)
        let targetFiles: string[] = [];

        if (item.relevantPaths && item.relevantPaths.length > 0) {
            targetFiles = item.relevantPaths.filter(rp => existsSync(rp));
        } else {
            // Fallback Heuristics to find seeds if planner didn't provide paths
            const lowerPath = item.path.toLowerCase();
            const lowerDesc = item.description.toLowerCase();

            if (lowerPath.includes('command') || lowerDesc.includes('cli')) {
                targetFiles = context.files
                    .filter(f => f.path.includes('commands/') || f.path.includes('cli/') || f.path.endsWith('src/index.ts') || f.path.endsWith('src/main.ts'))
                    .map(f => f.path);
            } else if (lowerPath.includes('routing') || lowerDesc.includes('architecture')) {
                targetFiles = context.files
                    .filter(f => f.path.includes('routes') || f.path.includes('router') || f.path.includes('pages/'))
                    .map(f => f.path);
            } else {
                // General Fallback
                targetFiles = context.files
                    .filter(f => f.path.endsWith('index.ts') || f.path.endsWith('main.ts'))
                    .slice(0, 3)
                    .map(f => f.path);
            }
        }

        // 2. Expand Context using Dependency Graph (1 level deep)
        const expandedFiles = new Set<string>(targetFiles);
        for (const seedPath of targetFiles) {
            const fileNode = context.files.find(f => f.path === seedPath);
            if (fileNode && fileNode.imports) {
                for (const importPath of fileNode.imports) {
                    try {
                        if (importPath.startsWith('.')) {
                            const absoluteImport = resolve(dirname(seedPath), importPath);
                            const resolvedNode = context.files.find(f => {
                                const fNoExt = f.path.replace(/\.[^.]+$/, '');
                                const impNoExt = absoluteImport.replace(/\.[^.]+$/, '');
                                return fNoExt === impNoExt;
                            });

                            if (resolvedNode) {
                                expandedFiles.add(resolvedNode.path);
                            }
                        }
                    } catch (e) {
                        // Ignore resolution errors
                    }
                }
            }
        }

        // 3. Read Content
        const sortedFiles = Array.from(expandedFiles).sort();

        for (const filePath of sortedFiles) {
            if (chars >= MAX_CONTEXT_CHARS) break;

            try {
                if (!existsSync(filePath)) continue;

                const fileContent = readFileSync(filePath, 'utf-8');
                const isSeed = targetFiles.includes(filePath);

                const limit = isSeed ? 6000 : 2000;

                content += `\n\n--- FILE: ${filePath} ---\n${fileContent.substring(0, limit)}`;
                chars += Math.min(fileContent.length, limit);

                // 4. Associated Tests (Usage Examples)
                const testCandidates = [
                    filePath.replace(/\.ts$/, '.test.ts'),
                    filePath.replace(/\.ts$/, '.spec.ts'),
                    join(dirname(filePath), '__tests__', relative(dirname(filePath), filePath).replace(/\.ts$/, '.test.ts'))
                ];

                for (const testPath of testCandidates) {
                    if (existsSync(testPath)) {
                        const testContent = readFileSync(testPath, 'utf-8');
                        content += `\n\n--- ASSOCIATED TEST (Usage Example): ${testPath} ---\n${testContent.substring(0, 3000)}`;
                        chars += Math.min(testContent.length, 3000);
                        break;
                    }
                }
            } catch (e) {
                // Ignore read errors
            }
        }

        return content;
    }

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

            const detailedSourceContext = this.readRelevantContext(item, context);

            // FIX: Use shared logic for Repository URL to prevent hallucination
            const repoInstructions = this.generationContextService.getSafeRepoInstructions(context.packageJson);

            const packageJsonSummary = context.packageJson
                ? JSON.stringify(context.packageJson, null, 2)
                : 'No package.json found';

            const genPrompt = DOC_GENERATION_PROMPT(
                context.packageJson?.name || 'Project',
                item.path,
                item.description,
                detailedSourceContext || '(No specific source files matched, rely on general context)',
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
                    content = await this.reviewService.reviewAndRefine(content, item.path, item.description, aiAgents);
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
