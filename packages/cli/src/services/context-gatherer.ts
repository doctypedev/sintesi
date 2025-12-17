
import { ProjectContext } from '@sintesi/core';
import { resolve, dirname, relative, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { ProjectConfig, TechStack } from './generation-context';
import { getContextPrompt } from '../prompts/analysis';

export class ContextGatherer {
    constructor() { }

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

    /**
     * Helper to consistently provide repository information instructions.
     */
    getSafeRepoInstructions(packageJson: any): string {
        let repoUrl = typeof packageJson?.repository === 'string'
            ? packageJson.repository
            : packageJson?.repository?.url;

        // Fallback: Try to detect from git config if missing in package.json
        if (!repoUrl) {
            try {
                const url = execSync('git config --get remote.origin.url', { encoding: 'utf-8', stdio: 'pipe' }).trim();
                if (url) repoUrl = url;
            } catch (e) {
                // Ignore
            }
        }

        if (repoUrl) {
            return `> **REPOSITORY**: The git repository is defined as "${repoUrl}". Use this URL for any clone instructions.\n\n`;
        } else {
            return `> **REPOSITORY**: No git repository is defined in package.json. DO NOT hallucinate a git clone URL. Use local installation instructions or assume published package usage.\n\n`;
        }
    }

    /**
     * Generates a shared context prompt string including package info, CLI details, and git diff.
     */
    generateContextPrompt(context: ProjectContext, gitDiff: string, projectConfig: ProjectConfig, techStack?: TechStack): string {
        // Ensure repo URL is present in context if possible (prevent hallucinations)
        if (context.packageJson) {
            const pkg = context.packageJson as any;
            if (!pkg.repository) {
                try {
                    const url = execSync('git config --get remote.origin.url', { encoding: 'utf-8', stdio: 'pipe' }).trim();
                    if (url) pkg.repository = url;
                } catch (e) {
                    // Ignore
                }
            }
        }
        return getContextPrompt(context, gitDiff, projectConfig, techStack);
    }
}
