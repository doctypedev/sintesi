import { ProjectContext } from '@sintesi/core';
import { ProjectConfig, TechStack } from '../services/generation-context';

export function getImpactAnalysisPrompt(docType: string, cleanDiff: string): string {
    return `
You are a Senior Technical Editor.
Your job is to act as a GATEKEEPER to prevent unnecessary documentation updates.
You will evaluate the provided "Git Diff" and decide if the "${docType}" needs to be updated.

## Git Diff
\`\`\`diff
${cleanDiff}
\`\`\`

## Rules
1. **IGNORE** Trivial Changes:
   - Formatting/Linting fixes.
   - Version bumps in package.json.
   - Internal refactors that don't change behavior or APIs.
   - Changes to CI/CD workflows (.github, etc).
   - Changes to ignored files (.gitignore, etc).
   - Typos in comments.

2. **FLAG** Important Changes:
   - New CLI commands or flags.
   - New API endpoints.
   - Changes to configuration options.
   - New features visible to the end-user.
   - Breaking changes.

## Critical Instruction
**If you are unsure or if the context is ambiguous, lean towards TRUE (update).**
It is better to update unnecessarily than to miss a critical change.

## Output
Return a JSON object:
{
  "update": boolean, // true if docs MUST be updated, false otherwise
  "reason": "String explaining why. If false, explain why changes are trivial. If true, list the key feature that changed."
}
`;
}

export function getContextPrompt(
    context: ProjectContext,
    gitDiff: string,
    projectConfig: ProjectConfig,
    techStack?: TechStack,
): string {
    const packageJsonSummary = context.packageJson
        ? JSON.stringify(context.packageJson, null, 2)
        : 'No package.json found';

    let prompt = `## Package.json\n\`\`\`json\n${packageJsonSummary}\n\`\`\`\n\n`;

    if (techStack) {
        prompt += `## Detected Tech Stack\n`;
        if (techStack.frameworks.length)
            prompt += `- **Frameworks**: ${techStack.frameworks.join(', ')}\n`;
        if (techStack.languages.length)
            prompt += `- **Languages**: ${techStack.languages.join(', ')}\n`;
        if (techStack.libraries.length)
            prompt += `- **Libraries**: ${techStack.libraries.join(', ')}\n`;
        if (techStack.infrastructure.length)
            prompt += `- **Tools/Infra**: ${techStack.infrastructure.join(', ')}\n`;
        prompt += `> **INSTRUCTION**: Strictly adhere to the detected stack. Do not suggest libraries not listed here (like React if this is Vue) unless explicitly asked.\n\n`;
    }

    if (projectConfig.relevantCommands && projectConfig.relevantCommands.length > 0) {
        prompt += `> **VERIFIED AVAILABLE COMMANDS**: [${projectConfig.relevantCommands.join(', ')}]\n`;
        prompt += `> **INSTRUCTION**: ONLY document the commands listed above. Do NOT document commands inferred from Changelogs or other text if they are not in this list.\n\n`;
    }

    if (projectConfig.packageName) {
        prompt += `> NOTE: The official package name is "${projectConfig.packageName}". Use this EXACT name for installation instructions. Do not hallucinate suffixes.\n\n`;
    }

    // Repo Info - Prevent Hallucination
    const pkg = context.packageJson as any;
    const repoUrl = typeof pkg?.repository === 'string' ? pkg.repository : pkg?.repository?.url;

    if (repoUrl) {
        prompt += `> **REPOSITORY**: The git repository is defined as "${repoUrl}". Use this URL for any clone instructions.\n\n`;
    } else {
        prompt += `> **REPOSITORY**: No git repository is defined in package.json. DO NOT hallucinate a git clone URL. Use local installation instructions or assume published package usage.\n\n`;
    }

    if (projectConfig.binName) {
        prompt += `> NOTE: The CLI binary command is "${projectConfig.binName}". Use this for usage examples (e.g. ${projectConfig.binName} <command>).\n\n`;
    }

    prompt +=
        '## Recent Code Changes (Git Diff)\nUse this to understand what features were recently added or modified.\n```diff\n' +
        (gitDiff || 'No recent uncommitted changes detected.') +
        '\n```\n\n';

    return prompt;
}
