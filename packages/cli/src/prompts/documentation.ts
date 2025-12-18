import { SHARED_SAFETY_RULES } from './shared';

export const DOC_PLANNING_PROMPT = (
    packageJsonSummary: string,
    fileSummary: string,
    specificContext: string,
    outputDir: string,
    existingDocsSummary: string,
    strategyInstructions: string,
    existingDocsList: string[],
    recentChanges: string,
) => `
You are an expert Product Manager and Technical Writer.
Your goal is to design a documentation structure for the End User / Developer who uses this software.

## Project Context
Package.json:
${packageJsonSummary}

## File Structure (Filtered for relevance):
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
${existingDocsList.map((p) => `- ${p}`).join('\n')}

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
    currentContent: string,
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


${
    currentContent
        ? `## Existing Content (UPDATE THIS)
${currentContent}

User Instruction: Update this content to reflect recent changes/source code.
IMPORTANT:
1. **PRESERVE STYLE**: Keep the same tone, language, and formatting as the existing content.
2. **MINIMAL DIFF**: Do NOT rephrase existing sentences unless they are factually incorrect. ONLY add new info or remove obsolete info.
3. **USAGE EXAMPLES**: Do NOT modify "Usage Examples" code blocks unless the CLI command signature has changed in a way that breaks them.
    - **BOOLEAN FLAGS**: If a boolean flag \`--foo\` exists in the source, the CLI likely supports \`--no-foo\` for negation. DO NOT remove \`--no-foo\` from examples just because you only see \`foo\` in the interface.
    - **FLAGS**: Do NOT hallucinate new flags. Only use flags found in the Source Code Context.
4. **NO HALLUCINATIONS**: If the "Recent Changes" are unrelated to this file's topic, make NO CHANGES or only minimal stylistic fixes.`
        : 'User Instruction: Write this file from scratch. Be comprehensive and professional.'
}

${SHARED_SAFETY_RULES}

## SITE STRUCTURE MODE specific rules:
1. **Frontmatter**: Start with YAML frontmatter containing 'title', 'description', 'icon' (emoji), and 'order' (number).
2. **Mermaid**: If explaining a flow/process, use a \`\`\`mermaid\`\`\` block.
3. **Components**: Use <Callout type="info"> text </Callout> for notes if appropriate.

## OUTPUT FORMAT RULES (CRITICAL)
- **STRICTLY MARKDOWN ONLY**: The output must be the raw file content.
- **NO CONVERSATIONAL TEXT**: Do NOT write "Here is the file", "I have updated...", or "Let me know if...".
- **NO CHATTER**: Just output the document.
`;

export const DOC_RESEARCH_PROMPT = (
    path: string,
    description: string,
    sourceContext: string,
    packageJsonSummary: string,
) => `
You are the **Researcher** (The Scout).
Your goal is to analyze the raw source code and extract ONLY the technical facts, API signatures, and configuration options required to write the documentation page: "${path}".

## Target Page
- **Path**: ${path}
- **Description**: ${description}

## Raw Source Code Context
${sourceContext}

## Project Context
${packageJsonSummary}

## Task
Create a **Technical Brief** for the Writer.
The Writer is lazy and will blindly trust your specific details. Do NOT provide "summary" or "fluff". Provide **HARD DATA**.

### Required Output Format (Markdown)

#### 1. Core Concepts
- Briefly explain the primary purpose of the code found in the context.
- Identify key classes, functions, or commands.

#### 2. API / Interface Details (CRITICAL)
- **Functions/Methods**: List precise signatures (arguments, types, return values).
- **CLI Commands**: List precise command name, arguments, and flags (alias, type, default value, description).
- **Configuration**: List interface properties and their types.
- **REST/HTTP**: List endpoints, methods, and payload schemas.

#### 3. Usage Patterns
- Extract 1-2 code snippets or usage examples found in tests or comments.
- Note any specific constraints or edge cases handled in the code.

#### 4. Changes / Deprecations
- Note any code marked as @deprecated.
- Note any new features that seem recently added (based on "New" comments or distinct lack of legacy patterns).

**Constraint**: If the raw context contains NO relevant information for this page, explicitly state: "NO RELEVANT CONTEXT FOUND."
`;

export const DOC_QUERY_PROMPT = (
    path: string,
    description: string,
    existingFileSummary: string,
) => `
You are the **Researcher**.
You need to search the project codebase to find information for writing the documentation page: "${path}".

## Target
- Path: ${path}
- Description: ${description}

## Existing File Context
${existingFileSummary}

## Task
Generate 3-5 distinct, targeted search queries to retrieve relevant code chunks from the vector database.
Focus on:
1. High-level concepts (e.g., "Authentication flow").
2. Specific class/function names implied by the description.
3. Configuration files or schemas.

Provide the output as a JSON array of strings.

### Examples:
- Target: "auth/login.md" (How to log in)
  Output: ["UserLoginController.authenticate", "AuthConfig interface", "JWT token generation logic"]
- Target: "cli/commands/deploy.ts" (Deploy command)
  Output: ["DeployCommand definition", "DeployOptions interface", "uploadToS3 function"]

Example Output: ["Authentication logic in user controller", "JWT configuration", "login function signature"]
`;

export const DOC_DISCOVERY_PROMPT = (
    packageJsonSummary: string,
    fileSummary: string,
    readmeSummary: string,
) => `
You are the **Lead Architect Agent** (The Explorer).
Your goal is to perform a high-level "Discovery" scan of this project to guide the Documentation Planner.

## Project Context
Package.json:
${packageJsonSummary}

## File Structure (Roots & Key Files)
${fileSummary}

## README Context (if available)
${readmeSummary || 'No README found.'}

## Task
Analyze the provided context to identify the core architectural patterns and domain concepts of the application.
The Planner will use your output to decide **which documentation chapters** are needed.

### Focus on:
1. **Application Type**: Is it a CLI? A REST API? A Next.js App? A Monorepo?
2. **Key Concepts**: Does it use specific patterns like CQRS, Event Sourcing, Plugins, Adapters?
3. **Data Flows**: What are the main data entities or pipelines implied by the file names?

### Output format
Return a concise **Technical Architectural Brief**.
Use bullet points. Be technically precise.

Example Output:
- **Architecture**: Monorepo using Turborepo. Core logic is in \`packages/core\` (Rust), consumed by \`packages/cli\` (Node.js).
- **Pattern**: The CLI uses a Command Pattern approach (see \`commands/\` folder).
- **Key Flow**: The \`Planner\` service orchestrates \`Agents\` (see \`packages/ai\`).
`;

export const DOC_REVIEW_PROMPT = (
    path: string,
    description: string,
    content: string,
    sourceContext: string,
) => `
You are a Senior Technical Reviewer.
Your task is to review the following documentation file content against the actual Source Code (Ground Truth).

File: "${path}"
Purpose: ${description}

## Content to Review:
\`\`\`markdown
${content}
\`\`\`

## Source Context (GROUND TRUTH):
Use this context to verify facts.
\`\`\`
${sourceContext}
\`\`\`

## Evaluation Criteria:
1. **Hallucinations (CRITICAL)**: specific checks:
    - Do explicitly mentioned flags/arguments exist in Source Context?
    - Do mentioned API keys/Env vars exist?
    - Do imported modules exist?
2. **Accuracy**: Is the explanation technically correct?
3. **Completeness**: Does it cover the purpose?

## Output
Return ONLY a JSON object:
{
  "score": number, // 1-5 (5 is perfect)
  "critique": string, // High level summary
  "specific_critiques": [
     // List specific, actionable fixes. Use "Line X" or "Section Y" references.
     "The flag '--fast' does not exist in the source code. Remove it.",
     "The function 'login' actually returns a Promise<void>, not boolean."
  ],
  "critical_issues": boolean // True if factual errors (hallucinations) are found
}
`;

export const DOC_REFINE_PROMPT = (path: string, critiques: string[], originalContent: string) => `
You are the Technical Writer.
Your previous draft for "${path}" was reviewed and needs specific fixes.

## Reviewer Feedback (Fix These Issues):
${critiques.map((c) => `- ${c}`).join('\n')}

## Instruction
Refine the content to address the feedback.
- **APPLY FIXES**: Directly address the specific critiques.
- **RESTORE**: Keep the rest of the document as is (unless it needs flow adjustments).
- **OUTPUT**: Return the FULLY rewritten Markdown file.
- **NO CONVERSATIONAL TEXT**: Do NOT include "Here is the fixed file" or "I updated section X". Just the file content.

## Previous Content:
\`\`\`markdown
${originalContent}
\`\`\`
`;
