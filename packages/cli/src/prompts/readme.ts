import { SHARED_SAFETY_RULES } from './shared';

export const README_GENERATION_PROMPT = (
    isUpdate: boolean,
    sharedContextPrompt: string,
    smartSuggestion: string,
    fileSummary: string,
    existingContent: string,
) => `
You are an expert technical writer. Your task is to ${isUpdate ? 'update and improve the' : 'write a comprehensive'} README.md for a software project.

Here is the context of the project:

${sharedContextPrompt}

${smartSuggestion ? `## Specific Suggestion (IMPORTANT)\nA previous analysis identified a specific issue to address:\n> ${smartSuggestion}\n\nPlease ensure this suggestion is addressed in your update.\n\n` : ''}

## File Structure & Dependencies
${fileSummary}

${
    isUpdate
        ? `
## Current README Content
\`\`\`markdown
${existingContent}
\`\`\`

## Instructions for UPDATE
1. **STRICTLY PRESERVE STYLE**: You MUST write in the EXACT same language, tone, and style as the 'Current README Content'.
2. **MINIMAL CHANGES**: Only update sections that are factually incorrect or missing based on the **Recent Code Changes**.
3. **NO REWRITING**: Do NOT rephrase existing sentences just to 'improve' them. If it's not broken, don't fix it. This is critical to avoid unnecessary git diffs.
4. **Detect New Features**: Look closely at the Git Diff and File Structure. If new files were added to 'commands', 'routes', or 'scripts', implies new functionality.
5. **Update Usage Section**: IF you detect new CLI commands (e.g. in \`src/commands/\`), scripts, or API endpoints, YOU MUST document them in the Usage section.
   - *Example*: If you see \`src/commands/readme.ts\`, ensure \`readme\` command is listed.
6. **Keep manual details**: Preserve specific configuration details, project philosophy, or manual instructions that cannot be inferred from code.
7. **Delete Obsolete**: Remove commands or features that were deleted, but do not touch valid ones.
`
        : `
## Instructions for NEW CREATION
1. Analyze the file structure, package.json, and **Recent Code Changes**.
2. **Identify Project Type**: Is it a CLI? A Web App? A Library? Adjust the 'Usage' section accordingly.
   - *CLI*: List available commands (inferred from 'bin', 'commands' folder, or library structure). Look for files like \`src/commands/foo.ts\` -> command \`foo\`.
   - *Web*: How to start dev server, build, test.
   - *Library*: How to import and use main functions.
3. Write a professional README.md that includes:
   - **Project Title & Description**
   - **Features**: Deduce key features from the file names, dependencies, and git diff.
   - **Installation**
   - **Usage**: Detailed instructions on how to run/use the project.
   - **Project Structure**
`
}

${SHARED_SAFETY_RULES}
`;
