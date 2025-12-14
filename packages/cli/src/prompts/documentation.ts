
import { SHARED_SAFETY_RULES } from './shared';

export const DOC_PLANNING_PROMPT = (
  packageJsonSummary: string,
  fileSummary: string,
  specificContext: string,
  outputDir: string,
  existingDocsSummary: string,
  strategyInstructions: string,
  existingDocsList: string[],
  recentChanges: string
) => `
You are an expert Product Manager and Technical Writer.
Your goal is to design a documentation structure for the End User / Developer who uses this software.

## Project Context
Package.json:
${packageJsonSummary}

File Structure (Filtered for relevance):
${fileSummary}
${specificContext}

## Recent Changes / Logic (Git Diff)
${recentChanges}

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

export const DOC_GENERATION_PROMPT = (
  projectName: string,
  path: string,
  description: string,
  sourceContext: string,
  packageJsonSummary: string,
  repoInstructions: string,
  gitDiff: string,
  currentContent: string
) => `
You are writing technical documentation.
Project Name: ${projectName}

## Task
Write the content for the file: "${path}"
Purpose: ${description}

## Source Code Context (IMPORTANT)
The following is the ACTUAL source code relevant to this file. 
Use it to extract real flags, parameters, exports, and logic.
IF TESTS ARE INCLUDED, use them to write "Usage Examples".

${sourceContext}

## General Context
Package.json:
${packageJsonSummary}

## Repository Info
${repoInstructions}

Recent Changes (Git Diff):
${gitDiff || 'None'}


${currentContent ? `## Existing Content (UPDATE THIS)
${currentContent}

User Instruction: Update this content to reflect recent changes/source code.
IMPORTANT:
1. **PRESERVE STYLE**: Keep the same tone, language, and formatting as the existing content.
2. **MINIMAL DIFF**: Do NOT rephrase existing sentences unless they are factually incorrect. ONLY add new info or remove obsolete info.
3. **USAGE EXAMPLES**: Do NOT modify "Usage Examples" code blocks unless the CLI command signature has changed in a way that breaks them.
    - **BOOLEAN FLAGS**: If a boolean flag \`--foo\` exists in the source, the CLI likely supports \`--no-foo\` for negation. DO NOT remove \`--no-foo\` from examples just because you only see \`foo\` in the interface.
    - **FLAGS**: Do NOT hallucinate new flags. Only use flags found in the Source Code Context.
4. **NO HALLUCINATIONS**: If the "Recent Changes" are unrelated to this file's topic, make NO CHANGES or only minimal stylistic fixes.` : 'User Instruction: Write this file from scratch. Be comprehensive and professional.'}

${SHARED_SAFETY_RULES}

## SITE STRUCTURE MODE specific rules:
1. **Frontmatter**: Start with YAML frontmatter containing 'title', 'description', 'icon' (emoji), and 'order' (number).
2. **Mermaid**: If explaining a flow/process, use a \`\`\`mermaid\`\`\` block.
3. **Components**: Use <Callout type="info"> text </Callout> for notes if appropriate.
`;
