import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { DOC_PLANNING_PROMPT } from '../prompts/documentation';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';

export interface DocPlan {
    path: string;
    description: string;
    type: 'guide' | 'api' | 'config' | 'intro';
    relevantPaths?: string[];
    originalPath?: string;
}

export class DocumentationPlanner {
    constructor(private logger: Logger) {}

    private recursiveGetAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
        if (!existsSync(dirPath)) return arrayOfFiles;
        const files = readdirSync(dirPath);
        files.forEach((file) => {
            if (
                file === 'node_modules' ||
                file === '.git' ||
                file === 'dist' ||
                file === '.sintesi' ||
                file === '.idea' ||
                file === '.vscode'
            ) {
                return;
            }
            const fullPath = join(dirPath, file);
            if (statSync(fullPath).isDirectory()) {
                this.recursiveGetAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });
        return arrayOfFiles;
    }

    async createPlan(
        context: ProjectContext,
        outputDir: string,
        aiAgents: AIAgents,
        contextService: GenerationContextService,
        gitDiff: string,
        force: boolean = false,
    ): Promise<DocPlan[]> {
        this.logger.info('Planning documentation structure...');

        const priorityPatterns = [
            'commands/',
            'cli/',
            'bin/',
            'pages/',
            'app/',
            'routes/',
            'router/',
            'components/',
            'features/',
            'store/',
            'services/',
            'hooks/',
            'context/',
            'api/',
            'controllers/',
            'models/',
            'schemas/',
            'lib/',
            'src/index',
            'main',
        ];

        const interestingFiles = context.files.filter(
            (f) =>
                priorityPatterns.some((p) => f.path.toLowerCase().includes(p)) ||
                !f.path.includes('/'),
        );

        const fileSummary = interestingFiles
            .map(function (f) {
                const importInfo =
                    f.importedBy.length > 0 ? ` (imported by ${f.importedBy.length} files)` : '';
                return '- ' + f.path + importInfo;
            })
            .join('\n');

        let specificContext = '';

        // Use Service to detect Project config (CLI, Web, etc.)
        const projectConfig = contextService.detectProjectConfig(context);

        // --- CLI CONTEXT ---
        if (projectConfig.appType === 'cli') {
            if (projectConfig.relevantCommands && projectConfig.relevantCommands.length > 0) {
                specificContext += `\n## Detected CLI Commands:\n${projectConfig.relevantCommands.map((c) => `- ${c}`).join('\n')}\n`;
                specificContext += `\n> **VERIFIED AVAILABLE COMMANDS**: [${projectConfig.relevantCommands.join(', ')}]\n`;
                specificContext += `\n> **INSTRUCTION**: Strictly limit documentation to these verified commands. Ignore references to deleted commands (like 'fix') in changelogs.\n`;
            }

            if (projectConfig.binName) {
                specificContext += `\n> NOTE: This project exports a CLI binary named "${projectConfig.binName}".\n> The detected commands above are likely executed as: ${projectConfig.binName} <command>\n`;
            }
        }

        if (projectConfig.packageName) {
            specificContext += `\n> NOTE: The official package name is "${projectConfig.packageName}".\n`;
        }

        // --- ENTRY POINT CONTEXT (Generic) ---
        if (projectConfig.entryPoint && existsSync(projectConfig.entryPoint)) {
            try {
                const entryContent = readFileSync(projectConfig.entryPoint, 'utf-8');
                const safeContent =
                    entryContent.length > 10000
                        ? entryContent.substring(0, 10000) + '\n... (truncated)'
                        : entryContent;

                let typeLabel = 'Application Entry Point';
                if (projectConfig.appType === 'cli')
                    typeLabel = 'CLI Entry Definition (Yargs/Command Config)';
                else if (projectConfig.appType === 'web')
                    typeLabel = 'Frontend App Entry / Mount Point';
                else if (projectConfig.appType === 'backend')
                    typeLabel = 'Backend Server Bootstrap';

                specificContext += `\n## ${typeLabel}:\n> **CRITICAL**: Use this definition as the SOURCE OF TRUTH for command arguments, routing configuration, or app initialization.\n\`\`\`typescript\n${safeContent}\n\`\`\`\n`;
            } catch (e) {
                /* ignore */
            }
        }

        // 2. Web Routes Detection
        const routeFiles = context.files.filter(
            (f) =>
                f.path.includes('routes') ||
                f.path.includes('routing') ||
                f.path.match(/app\/.*page\.(tsx|vue|js)/),
        );
        if (routeFiles.length > 0) {
            specificContext += `\n## Detected Routes / Pages:\n${routeFiles
                .slice(0, 20)
                .map((f) => `- ${f.path}`)
                .join('\n')}\n`;
        }

        // 3. Tech Stack Detection
        const techStack = contextService.detectTechStack(context);
        if (techStack.frameworks.length || techStack.libraries.length) {
            specificContext += `\n## Detected Tech Stack:\n`;
            if (techStack.frameworks.length)
                specificContext += `- Frameworks: ${techStack.frameworks.join(', ')}\n`;
            if (techStack.libraries.length)
                specificContext += `- Libraries: ${techStack.libraries.join(', ')}\n`;
            if (techStack.infrastructure.length)
                specificContext += `- Infrastructure: ${techStack.infrastructure.join(', ')}\n`;
        }

        const packageJsonSummary = context.packageJson
            ? JSON.stringify(context.packageJson, null, 2)
            : 'No package.json found';

        let existingDocsList: string[] = [];
        let existingDocsSummary = 'No existing documentation found.';
        let hasExistingDocs = false;

        if (!force) {
            // Only read existing docs if not in force mode
            try {
                const allFiles = this.recursiveGetAllFiles(outputDir);
                existingDocsList = allFiles.map((f) => relative(outputDir, f));
                if (existingDocsList.length > 0) {
                    existingDocsSummary = existingDocsList.join('\n');
                    hasExistingDocs = true;
                }
            } catch (e) {
                // Ignore error if docs folder doesn't exist or is empty
            }
        }

        let strategyInstructions = '';

        if (hasExistingDocs && !force) {
            strategyInstructions = `
### Strategy: IMPROVEMENT MODE (Existing Docs Detected)
- **RESPECT EXISTING STRUCTURE**: The user has an existing documentation structure. Do NOT propose completely new filenames unless the current ones are insufficient.
- **AVOID DUPLICATION**: If a file like 'setup.md' exists, do NOT propose 'installation.md'. Use the existing one.
- **NO FORCED FILES**: Do NOT force standard files (like 'installation.md' or 'CLI.md') if they appear to be missing. The user may have deleted them intentionally. Only propose them if there is a CRITICAL gap.
- **FOCUS**: Your primary goal is to identifying *missing* concepts or *outdated* files, not re-architecting the folder structure.
`;
        } else {
            strategyInstructions = `
### Strategy: GREENFIELD MODE (New Documentation)
- **CLI Tool**: Suggest "commands.md", "installation.md".
- **Web Application**: Suggest "getting-started.md", "architecture.md".
- **Backend / API**: Suggest "endpoints.md", "authentication.md".
- **Library / SDK**: Suggest "usage.md", "api-reference.md".
`;
        }

        const planPrompt = DOC_PLANNING_PROMPT(
            packageJsonSummary,
            fileSummary,
            specificContext,
            outputDir,
            existingDocsSummary,
            strategyInstructions,
            existingDocsList,
            gitDiff,
        );

        try {
            let response = await aiAgents.planner.generateText(planPrompt, {
                maxTokens: 2000,
                temperature: 0.1,
            });

            response = response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const plan: DocPlan[] = JSON.parse(response);

            this.logger.info(`Plan generated: ${plan.length} files proposed`);
            plan.forEach((p) => this.logger.info(`- ${p.path}: ${p.description}`));

            return plan;
        } catch (e) {
            this.logger.error('Failed to generate documentation plan: ' + e);
            return [];
        }
    }
}
