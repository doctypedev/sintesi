import { Logger } from '../utils/logger';
import { ProjectContext } from '@sintesi/core';
import { AIAgents } from '../../../ai';
import { GenerationContextService } from './generation-context';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

export interface DocPlan {
    path: string;
    description: string;
    type: 'guide' | 'api' | 'config' | 'intro';
    relevantPaths?: string[];
    originalPath?: string;
}

export class DocumentationPlanner {
    constructor(private logger: Logger) { }

    private recursiveGetAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
        if (!existsSync(dirPath)) return arrayOfFiles;
        const files = readdirSync(dirPath);
        files.forEach((file) => {
            if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.sintesi' || file === '.idea' || file === '.vscode') {
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
        force: boolean = false
    ): Promise<DocPlan[]> {
        this.logger.info('Planning documentation structure...');

        const priorityPatterns = [
            'commands/', 'cli/', 'bin/',
            'pages/', 'app/', 'routes/', 'router/', 'components/', 'features/', 'store/', 'services/', 'hooks/', 'context/',
            'api/', 'controllers/', 'models/', 'schemas/',
            'lib/', 'src/index', 'main'
        ];

        const interestingFiles = context.files.filter(f =>
            priorityPatterns.some(p => f.path.toLowerCase().includes(p)) || !f.path.includes('/')
        );

        const fileSummary = interestingFiles
            .map(function (f) {
                const importInfo = f.importedBy.length > 0 ? ` (imported by ${f.importedBy.length} files)` : '';
                return '- ' + f.path + importInfo;
            })
            .join('\n');

        let specificContext = '';

        // Use Service to detect CLI config
        const cliConfig = contextService.detectCliConfig(context);

        if (cliConfig.relevantCommands && cliConfig.relevantCommands.length > 0) {
            specificContext += `\n## Detected CLI Commands:\n${cliConfig.relevantCommands.map(c => `- ${c}`).join('\n')}\n`;

            if (cliConfig.relevantCommands.length > 0) {
                specificContext += `\n> **VERIFIED AVAILABLE COMMANDS**: [${cliConfig.relevantCommands.join(', ')}]\n`;
                specificContext += `\n> **INSTRUCTION**: Strictly limit documentation to these verified commands. Ignore references to deleted commands (like 'fix') in changelogs.\n`;
            }

            if (cliConfig.binName) {
                specificContext += `\n> NOTE: This project exports a CLI binary named "${cliConfig.binName}".\n> The detected commands above are likely executed as: ${cliConfig.binName} <command>\n`;
            }
            if (cliConfig.packageName) {
                specificContext += `\n> NOTE: The official package name is "${cliConfig.packageName}".\n`;
            }
        }

        // 2. Web Routes Detection
        const routeFiles = context.files.filter(f =>
            f.path.includes('routes') || f.path.includes('routing') || f.path.match(/app\/.*page\.(tsx|vue|js)/)
        );
        if (routeFiles.length > 0) {
            specificContext += `\n## Detected Routes / Pages:\n${routeFiles.slice(0, 20).map(f => `- ${f.path}`).join('\n')}\n`;
        }

        // 3. Tech Stack Detection
        const techStack = contextService.detectTechStack(context);
        if (techStack.frameworks.length || techStack.libraries.length) {
            specificContext += `\n## Detected Tech Stack:\n`;
            if (techStack.frameworks.length) specificContext += `- Frameworks: ${techStack.frameworks.join(', ')}\n`;
            if (techStack.libraries.length) specificContext += `- Libraries: ${techStack.libraries.join(', ')}\n`;
            if (techStack.infrastructure.length) specificContext += `- Infrastructure: ${techStack.infrastructure.join(', ')}\n`;
        }

        const packageJsonSummary = context.packageJson
            ? JSON.stringify(context.packageJson, null, 2)
            : 'No package.json found';

        let existingDocsList: string[] = [];
        try {
            const allFiles = this.recursiveGetAllFiles(outputDir);
            existingDocsList = allFiles.map(f => relative(outputDir, f));
        } catch (e) {
            // Ignore error if docs folder doesn't exist or is empty
        }

        const existingDocsSummary = existingDocsList.length > 0
            ? existingDocsList.join('\n')
            : 'No existing documentation found.';

        const hasExistingDocs = existingDocsList.length > 0;
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

        const planPrompt = `
You are an expert Product Manager and Technical Writer.
Your goal is to design a documentation structure for the End User / Developer who uses this software.

## Project Context
Package.json:
${packageJsonSummary}

File Structure (Filtered for relevance):
${fileSummary}
${specificContext}

## Existing Documentation (in ${outputDir}/)
${existingDocsSummary}

## Task
Analyze the project "DNA" to determine its TYPE.
Then, propose a list of documentation files tailored SPECIFICALLY to that type.

> **IMPORTANT**:
> - **ONLY** propose files that need creation or updates based on the "Recent Changes" and "Impact Analysis Summary".
> - **DO NOT** feel matched to propose 3-6 files. If only 1 file needs update, propose 1 file.
> - **DO NOT** halluncinate features. If the git diff is about a "typo fix", do not propose "New Feature Guide".


${strategyInstructions}

## STRUCTURED DOCUMENTATION MODE
- **Structure**: Group files into folders for a better sidebar (e.g., 'guide/installation.md', 'reference/commands.md').
- **Index**: Ensure there is a 'index.md' or 'intro.md' as entry point.

## Existing Flat Documentation for Reorganization
${existingDocsList.map(p => `- ${p}`).join('\n')}

**Instruction for MIGRATION:**
When creating the 'Output' JSON, if a proposed file path (e.g., 'guide/installation.md') is conceptually similar or a direct migration of an existing flat file (e.g., 'installation.md'), include the 'originalPath' field in the JSON object like this:
\`\`\`json
{
  "path": "guide/installation.md",
  "description": "How to install the project",
  "type": "guide",
  "originalPath": "installation.md" // Path relative to outputDir
}
\`\`\`
This indicates that the content for 'guide/installation.md' should be sourced from 'installation.md' (if it exists) and then updated.

## Rules
- **User-Centric**: Document *how to use it*.
- **Smart Updates**: Reuse existing files if relevant.

## Output
Return ONLY a valid JSON array.
[
  {
    "path": "commands.md", 
    "description": "Reference of all CLI commands.", 
    "type": "guide",
    "relevantPaths": ["packages/cli/src/commands/check.ts", "packages/cli/src/commands/readme.ts"]
  }
]
`;

        try {
            let response = await aiAgents.planner.generateText(planPrompt, {
                maxTokens: 2000,
                temperature: 0.1
            });
            response = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const plan: DocPlan[] = JSON.parse(response);

            this.logger.info(`Plan generated: ${plan.length} files proposed`);
            plan.forEach(p => this.logger.info(`- ${p.path}: ${p.description}`));

            return plan;
        } catch (e) {
            this.logger.error('Failed to generate documentation plan: ' + e);
            return [];
        }
    }
}
