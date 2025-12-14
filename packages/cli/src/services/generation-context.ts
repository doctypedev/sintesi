
import { Logger } from '../utils/logger';
import { getProjectContext, ProjectContext } from '@sintesi/core';
import { resolve, relative, dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { SmartChecker } from './smart-checker';
import { ChangeAnalysisService } from './analysis-service';
import { createAIAgentsFromEnv, AIAgents, AIAgentRoleConfig } from '../../../ai';
import { getContextPrompt } from '../prompts/analysis';

export interface ProjectConfig {
    binName?: string;
    packageName?: string;
    relevantCommands?: string[];
    entryPoint?: string;
    appType?: 'cli' | 'web' | 'library' | 'backend' | 'unknown';
}



export interface TechStack {
    frameworks: string[];
    languages: string[]; // e.g. TypeScript, Python
    libraries: string[]; // e.g. Tailwind, Zod
    infrastructure: string[]; // e.g. Vercel, Docker
}

export class GenerationContextService {
    constructor(private logger: Logger, private cwd: string) { }

    /**
     * Performs a smart check to see if generation is necessary based on code changes.
     */
    async performSmartCheck(force: boolean = false): Promise<boolean> {
        if (force) return true;

        this.logger.info('Performing smart check (Code Changes)...');
        const smartChecker = new SmartChecker(this.logger, this.cwd);
        const hasChanges = await smartChecker.hasRelevantCodeChanges();

        if (!hasChanges) {
            this.logger.success('No relevant code changes detected (heuristic check). Content is likely up to date.');
        }
        return hasChanges;
    }

    /**
     * Initializes AI Agents from environment variables.
     */
    async getAIAgents(verbose: boolean, plannerModelId?: string, writerModelId?: string): Promise<AIAgents | null> {
        try {
            const plannerConfig: AIAgentRoleConfig = {
                modelId: plannerModelId || process.env.SINTESI_PLANNER_MODEL_ID || '',
                provider: process.env.SINTESI_PLANNER_PROVIDER as any,
            };
            const writerConfig: AIAgentRoleConfig = {
                modelId: writerModelId || process.env.SINTESI_WRITER_MODEL_ID || '',
                provider: process.env.SINTESI_WRITER_PROVIDER as any,
            };

            const aiAgents = createAIAgentsFromEnv(
                { debug: verbose },
                { planner: plannerConfig, writer: writerConfig }
            );

            const writerConnected = await aiAgents.writer.validateConnection();

            // If planner is different from writer, check it too, otherwise we assume if writer works, planner likely works (or it's the same)
            // But let's be safe if they are distinct instances
            let plannerConnected = true;
            if (aiAgents.planner !== aiAgents.writer) {
                plannerConnected = await aiAgents.planner.validateConnection();
            }

            if (!writerConnected || !plannerConnected) {
                this.logger.error('AI provider connection failed. Please check your API key.');
                return null;
            }

            if (verbose) {
                this.logger.info(`Using AI Planner: ${aiAgents.planner.getModelId()} (${aiAgents.planner.getProvider()})`);
                this.logger.info(`Using AI Writer: ${aiAgents.writer.getModelId()} (${aiAgents.writer.getProvider()})`);
            }

            return aiAgents;

        } catch (error: any) {
            this.logger.error('No valid AI API key found or agent initialization failed: ' + error.message);
            return null;
        }
    }

    /**
     * Analyzes the project structure and retrieves the git diff.
     */
    async analyzeProject(): Promise<{ context: ProjectContext; gitDiff: string }> {
        // Structural Context
        const context = getProjectContext(this.cwd);

        // Recent Changes Context
        let gitDiff = '';
        try {
            const analysisService = new ChangeAnalysisService(this.logger);
            const analysis = await analysisService.analyze({
                fallbackToLastCommit: true,
                includeSymbols: false,
                stagedOnly: false
            });

            gitDiff = analysis.gitDiff;
            if (gitDiff.length > 15000) {
                gitDiff = gitDiff.substring(0, 15000) + '\n... (truncated)';
            }
        } catch (e: any) {
            this.logger.debug('Could not fetch git diff, skipping: ' + e);
        }

        return { context, gitDiff };
    }

    /**
     * Detects Project configuration (binary name, package name, entry point, app type).
     */
    detectProjectConfig(context: ProjectContext): ProjectConfig {
        let binName = '';
        let packageName = context.packageJson?.name || '';
        let relevantCommands: string[] = [];
        let appType: ProjectConfig['appType'] = 'unknown';

        // 1. Detect Commands (CLI specific)
        const commandFiles = context.files.filter(f => {
            const relativePath = relative(this.cwd, f.path);
            return (
                relativePath.includes('commands/') ||
                relativePath.includes('cli/') ||
                (relativePath.includes('bin/') && !relativePath.includes('node_modules'))
            );
        });

        // Extract command names from file paths (e.g. src/commands/foo.ts -> foo)
        relevantCommands = commandFiles
            // eslint-disable-next-line
            .filter(f => f.path.match(/[\/\\]commands[\/\\][a-zA-Z0-9-]+\.ts$/))
            .map(f => {
                const parts = f.path.split(/[\\/]/);
                return parts[parts.length - 1].replace(/\.ts$/, '');
            })
            .filter(name => !['index', 'main', 'types', 'cli'].includes(name));

        if (relevantCommands.length > 0) {
            appType = 'cli';
        }

        // 2. Detect Monorepo / Binary Name
        const pkg = context.packageJson as any;
        const isMonorepo = pkg?.private === true || !!pkg?.workspaces;

        // --- NEW: Detect AppType from Dependencies (Reduce fragility) ---
        if (pkg && (pkg.dependencies || pkg.devDependencies)) {
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            const depNames = Object.keys(allDeps);

            if (depNames.some(d => d.includes('react') || d.includes('vue') || d.includes('nuxt') || d.includes('next'))) {
                appType = 'web';
            } else if (depNames.some(d => d.includes('@angular/core') || d.includes('svelte'))) {
                appType = 'web';
            } else if (depNames.some(d => d.includes('nestjs') || d.includes('fastify') || d.includes('express'))) {
                appType = 'backend';
            } else if (depNames.some(d => d.includes('yargs') || d.includes('commander') || d.includes('cac') || d.includes('oclif'))) {
                appType = 'cli';
            }
        }

        if (isMonorepo) {
            const subPackageFiles = context.files.filter(f => f.path.endsWith('package.json') && f.path !== 'package.json');
            for (const pkgFile of subPackageFiles) {
                try {
                    const pkgContent = JSON.parse(readFileSync(resolve(this.cwd, pkgFile.path), 'utf-8'));
                    if (pkgContent.bin && pkgContent.name) {
                        // Prefer "cli" packages
                        if (!binName || pkgContent.name.includes('cli')) {
                            packageName = pkgContent.name;
                            if (typeof pkgContent.bin === 'string') {
                                const pName = pkgContent.name;
                                binName = pName.startsWith('@') ? pName.split('/')[1] : pName;
                            } else if (typeof pkgContent.bin === 'object') {
                                binName = Object.keys(pkgContent.bin)[0];
                            }
                            appType = 'cli';
                        }
                    }
                } catch (e) { /* ignore */ }
            }
        }

        // Fallback if no binary found in monorepo, or it's a single repo
        // Only mark as CLI if we have a bin AND appType wasn't forcefully set to web/backend (mixed projects?)
        // Actually, bin implies CLI access, but it could be a dev tool for a webapp. 
        // Let's stick to CLI if bin is present, UNLESS strong web signal exists?
        // Usage decision: If bin exists, it HAS a CLI component. 
        if (!binName && pkg?.bin) {
            if (typeof pkg.bin === 'string') {
                const pkgName = pkg.name || '';
                binName = pkgName.startsWith('@') ? pkgName.split('/')[1] : pkgName;
            } else if (typeof pkg.bin === 'object') {
                binName = Object.keys(pkg.bin)[0];
            }
            if (appType === 'unknown') appType = 'cli';
        }

        // 3. Detect Entry Point (Generic)
        let entryPoint: string | undefined;

        // Candidate patterns in priority order
        const entryCandidates = [
            // CLI
            'src/index.ts', 'src/cli.ts', 'src/main.ts',
            // Top Level
            'index.ts', 'cli.ts', 'main.ts',
            // Web / Frameworks
            'src/App.tsx', 'src/App.js',
            'src/app/page.tsx', 'src/app/page.js', // Next.js App Router
            'pages/index.tsx', 'pages/index.js',   // Next.js Pages Router
            'src/main.tsx', // Vite + React/Vue
            'src/main.ts'   // Angular / NestJS
        ];

        for (const candidate of entryCandidates) {
            const candidatePath = resolve(this.cwd, candidate);
            if (existsSync(candidatePath)) {
                // Heuristic: If we already know the appType (e.g. from dependencies), we might just accept the first existing candidate 
                // that matches the expected pattern, WITHOUT reading content.
                // However, for CLI vs Library disambiguation, reading might still be useful.

                // If AppType is definitively known (e.g. 'web' or 'backend' from deps), and this file looks like an entry point, just take it.
                if ((appType === 'web' || appType === 'backend') && !entryPoint) {
                    entryPoint = candidatePath;
                    break;
                }

                // If AppType is 'cli' (from deps), we still want to confirm if it's the *correct* entry point (e.g. not just index.ts but cli.ts),
                // or if we have multiple candidates. But sticking to first match is usually fine for 90% cases.
                // Let's optimize: Read only if we really need to disambiguate or if appType is unknown.

                try {
                    // Only read if we don't have an AppType OR if we want to confirm CLI specific traits (rare case if deps already said CLI)
                    if (appType === 'unknown' || appType === 'cli') {
                        const content = readFileSync(candidatePath, 'utf-8');

                        // Refine AppType if unknown
                        if (appType === 'unknown') {
                            if (content.includes('yargs') || content.includes('commander') || content.includes('cac')) {
                                appType = 'cli';
                                entryPoint = candidatePath;
                                break;
                            }
                            if (content.includes('react') || content.includes('vue') || content.includes('@angular')) {
                                appType = 'web';
                                entryPoint = candidatePath;
                                break;
                            }
                            if (content.includes('express') || content.includes('fastify') || content.includes('nestjs')) {
                                appType = 'backend';
                                entryPoint = candidatePath;
                                break;
                            }
                        } else if (appType === 'cli') {
                            // If we already think it's CLI, just confirming valid entry point
                            if (content.includes('yargs') || content.includes('commander') || content.includes('cac') || candidatePath.endsWith('cli.ts')) {
                                entryPoint = candidatePath;
                                break;
                            }
                        }
                    }

                    // If we found a file but didn't break yet (e.g. appType was known but we want to be sure?), 
                    // actually if appType was known we handled it above.
                    // Fallback storage
                    if (!entryPoint) {
                        entryPoint = candidatePath;
                    }

                } catch (e) { /* ignore */ }
            }
        }

        // Final fallback for libraries
        if (appType === 'unknown' && !entryPoint && pkg.main) {
            entryPoint = resolve(this.cwd, pkg.main);
            appType = 'library';
        }

        return { binName, packageName, relevantCommands, entryPoint, appType };
    }

    /**
     * Analyze package.json to detect the technology stack.
     */
    detectTechStack(context: ProjectContext): TechStack {
        const stack: TechStack = {
            frameworks: [],
            languages: [],
            libraries: [],
            infrastructure: []
        };

        const pkg = context.packageJson;
        if (!pkg) return stack;

        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...(pkg as any).peerDependencies
        };
        const depNames = Object.keys(allDeps);

        // Languages
        if (depNames.some(d => d.includes('typescript'))) stack.languages.push('TypeScript');
        if (depNames.some(d => d.includes('@types/node'))) stack.languages.push('Node.js');

        // Frameworks
        if (depNames.includes('react')) stack.frameworks.push('React');
        if (depNames.includes('vue')) stack.frameworks.push('Vue');
        if (depNames.includes('next')) stack.frameworks.push('Next.js');
        if (depNames.includes('nuxt')) stack.frameworks.push('Nuxt');
        if (depNames.includes('@angular/core')) stack.frameworks.push('Angular');
        if (depNames.includes('svelte')) stack.frameworks.push('Svelte');
        if (depNames.includes('express')) stack.frameworks.push('Express');
        if (depNames.includes('fastify')) stack.frameworks.push('Fastify');
        if (depNames.includes('@nestjs/core')) stack.frameworks.push('NestJS');

        // Libraries
        if (depNames.some(d => d.includes('tailwind'))) stack.libraries.push('TailwindCSS');
        if (depNames.includes('zod')) stack.libraries.push('Zod');
        if (depNames.includes('prisma')) stack.libraries.push('Prisma');
        if (depNames.includes('mongoose')) stack.libraries.push('Mongoose');
        if (depNames.includes('redux') || depNames.includes('@reduxjs/toolkit')) stack.libraries.push('Redux');
        if (depNames.includes('zustand')) stack.libraries.push('Zustand');
        if (depNames.includes('vitest') || depNames.includes('jest')) stack.libraries.push('Testing (Vitest/Jest)');

        // Infrastructure / Tools
        if (depNames.includes('vercel')) stack.infrastructure.push('Vercel');
        if (depNames.includes('vite')) stack.infrastructure.push('Vite');
        if (depNames.includes('webpack')) stack.infrastructure.push('Webpack');
        if (depNames.includes('turbo')) stack.infrastructure.push('Turborepo');

        return stack;
    }

    /**
     * Generates a shared context prompt string including package info, CLI details, and git diff.
     */
    generateContextPrompt(context: ProjectContext, gitDiff: string, projectConfig: ProjectConfig, techStack?: TechStack): string {
        return getContextPrompt(context, gitDiff, projectConfig, techStack);
    }

    /**
     * Helper to consistently provide repository information instructions.
     */
    getSafeRepoInstructions(packageJson: any): string {
        const repoUrl = typeof packageJson?.repository === 'string'
            ? packageJson.repository
            : packageJson?.repository?.url;

        if (repoUrl) {
            return `> **REPOSITORY**: The git repository is defined as "${repoUrl}". Use this URL for any clone instructions.\n\n`;
        } else {
            return `> **REPOSITORY**: No git repository is defined in package.json. DO NOT hallucinate a git clone URL. Use local installation instructions or assume published package usage.\n\n`;
        }
    }

    /**
     * Reads the content of relevant files to provide context to the LLM.
     */
    readRelevantContext(item: { path: string; description: string; relevantPaths?: string[] }, context: ProjectContext): string {
        const MAX_CONTEXT_CHARS = 30000;
        let content = '';
        let chars = 0;

        // 1. Identify Target Files (Seeds)
        let targetFiles: string[] = [];

        if (item.relevantPaths && item.relevantPaths.length > 0) {
            targetFiles = item.relevantPaths.filter((rp: string) => {
                try { return existsSync(rp); } catch (e) { return false; }
            });
        } else {
            // Fallback Heuristics
            const lowerPath = item.path.toLowerCase();
            const lowerDesc = item.description.toLowerCase();

            if (lowerPath.includes('command') || lowerDesc.includes('cli')) {
                const results = context.files
                    .filter(f => f.path.includes('commands/') || f.path.includes('cli/') || f.path.endsWith('src/index.ts') || f.path.endsWith('src/main.ts'))
                    .map(f => f.path);
                targetFiles = [...new Set(results)]; // unique
            } else if (lowerPath.includes('routing') || lowerDesc.includes('architecture')) {
                const results = context.files
                    .filter(f => f.path.includes('routes') || f.path.includes('router') || f.path.includes('pages/'))
                    .map(f => f.path);
                targetFiles = [...new Set(results)];
            } else {
                // General Fallback
                const results = context.files
                    .filter(f => f.path.endsWith('index.ts') || f.path.endsWith('main.ts'))
                    .slice(0, 3)
                    .map(f => f.path);
                targetFiles = [...new Set(results)];
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
                            // Attempt to match against known files in context
                            // This is a fuzzy match because imports might lack extensions
                            const resolvedNode = context.files.find(f => {
                                // Simple check: does the absolute import path match the file path (ignoring extension)?
                                const fNoExt = f.path.replace(/\.[^.]+$/, '');
                                const impNoExt = absoluteImport.replace(/\.[^.]+$/, '');
                                return fNoExt === impNoExt;
                            });

                            if (resolvedNode) {
                                expandedFiles.add(resolvedNode.path);
                            }
                        }
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }

        // 3. Read Content
        // Prioritize entry points to ensure CLI definition (Yargs) is always included
        const priorityFiles = Array.from(expandedFiles).filter(f =>
            f.endsWith('src/index.ts') ||
            f.endsWith('src/main.ts') ||
            f.endsWith('package.json')
        );
        const otherFiles = Array.from(expandedFiles).filter(f => !priorityFiles.includes(f)).sort();

        const sortedFiles = [...priorityFiles, ...otherFiles];

        for (const filePath of sortedFiles) {
            if (chars >= MAX_CONTEXT_CHARS) break;

            try {
                if (!existsSync(filePath)) continue;

                const fileContent = readFileSync(filePath, 'utf-8');
                const isSeed = targetFiles.includes(filePath);

                // Give more space to configuration/entry files
                const limit = (isSeed || priorityFiles.includes(filePath)) ? 8000 : 2000;

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
}

