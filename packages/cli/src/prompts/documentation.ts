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
# ROLE: Product Manager & Tech Writer
# GOAL: Design documentation structure for User/Developer.

# CONTEXT
## Package.json
${packageJsonSummary}

## Files
${fileSummary}
${specificContext}

## Recent Changes
${recentChanges}

## Existing Docs (${outputDir}/)
${existingDocsSummary}

# TASK
1. Analyze project "DNA" and TYPE.
2. Propose tailored file structure.
3. **IMPORTANT**:
   - ONLY propose files needing updates/creation based on "Recent Changes".
   - NO HALLUCINATIONS.

${strategyInstructions}

# MODE: STRUCTURED
- **Goal**: Rich, navigational structure.
- **Archetypes**: \`guides/\`, \`reference/\`, \`concepts/\`.
- **Adaptability**: Use what fits (e.g., \`api/\`). Don't force 3 folders.
- **Index**: Ensure 'index.md' or 'intro.md'.

# EXISTING FLAT DOCS (For Migration)
${existingDocsList.map((p) => `- ${p}`).join('\n')}

**MIGRATION INSTRUCTION**:
If proposing a migration, include "originalPath":
\`\`\`json
{ "path": "guides/install.md", "type": "guide", "originalPath": "install.md" }
\`\`\`

# RULES
- **User-Centric**: "How-to", not just "What".
- **Smart Updates**: Reuse existing.

# OUTPUT (JSON Array ONLY)
[
  { "path": "reference/commands.md", "description": "CLI cmd ref", "type": "guide", "relevantPaths": ["src/commands/check.ts"] }
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
# ROLE: Tech Writer
# PROJECT: ${projectName}
# FILE: ${path}
# DESC: ${description}

# GOAL
Write/Update documentation based on context.

# CONTEXT
## Package.json
${packageJsonSummary}

## Repository
${repoInstructions}

## Source Code (GROUND TRUTH)
${sourceContext}

> **NOTE ON CONTEXT**: 
> - If code appears as a "Skeleton" (bodies hidden), TRUST the signatures and JSDoc. Do NOT hallucinate implementation details.
> - **USAGE EXAMPLES**: Rely heavily on "ASSOCIATED TEST" sections found in the context. They are the executable truth.
>   - **CRITICAL**: Transform test cases into clean user-friendly code snippets. Remove assertions (e.g., 'expect(result).toBe(...)') and setup boilerplate. Show only the usage path.
> - **CONCEPTS**: Use "CONCEPT / GUIDE" sections from RAG for high-level explanations.

## Recent Changes (Diff)
${gitDiff || 'None'}

${
    currentContent
        ? `## Existing Content
${currentContent}

# INSTRUCTION (UPDATE)
- **PRESERVE STYLE**: Keep tone/format.
- **MINIMAL DIFF**: Only add/remove changed info.
- **EXAMPLES**: Update ONLY if broken by changes.
- **FLAGS**: Use source code truth. NO HALLUCINATIONS.`
        : '# INSTRUCTION (CREATE)\nWrite comprehensive, professional content from scratch.'
}

${SHARED_SAFETY_RULES}

# FORMAT RULES
- **YAML Frontmatter**: title, description, icon (emoji), order. 
  - **CRITICAL**: Use double quotes for all string values to prevent YAML errors (e.g., title: "My Title: Subtitle").
- **Mermaid**: Use for flows/processes. **CRITICAL**: ALWAYS quote node labels (e.g., id["Label (text)"]) to prevent syntax errors with parentheses or special chars.
- **Callouts**: <Callout type="info"> text </Callout>
- **STRICT STYLING RULES**:
  - **NO WALL OF BULLETS**: Do NOT use bullet points for everything. Use paragraphs for explanations.
  - **BACKTICKS**: ALWAYS use backticks \`like this\` for: file paths, directory names, variable names, class names, function signatures, CLI flags.
  - **BOLD**: Use **bold** for key concepts or emphasis.
  - **HEADERS**: Use H2 (##) and H3 (###) to break up long sections. Do not nest bullets deeper than 2 levels.
  - **TABLES**: MUST use Markdown tables for: CLI Flags, Config Properties, Arguments. Do NOT use bullet lists for these.
  - **CODE BLOCKS**: Use fenced code blocks with language tags (e.g., \`\`\`typescript) for ALL examples.
- **MARKDOWN ONLY**: Raw content. No chatter.
`;

export const DOC_RESEARCH_PROMPT = (
    path: string,
    description: string,
    sourceContext: string,
    packageJsonSummary: string,
) => `
# ROLE: Researcher (The Scout)
# GOAL: Extract technical facts for writer. NO FLUFF.

# TARGET
- Path: ${path}
- Desc: ${description}

# CONTEXT
## Source Code
${sourceContext}

## Project
${packageJsonSummary}

# OUTPUT (Markdown)
#### 1. Core Concepts
Brief purpose. Key classes/functions.

#### 2. API / Interface (CRITICAL)
- **Signatures**: args, types, returns.
- **CLI**: Name, flags, defaults.
- **Config**: Properties, types.
- **HTTP**: Endpoints, payloads.

#### 3. Usage Patterns
Snippets/examples from tests/comments. Constraints.

#### 4. Changes
New features, deprecations.

**Constraint**: If no info, write "NO RELEVANT CONTEXT FOUND."
`;

export const DOC_QUERY_PROMPT = (
    path: string,
    description: string,
    existingFileSummary: string,
) => `
# ROLE: Researcher (RAG Specialist)
# GOAL: Generate 3-5 search queries for vector DB.

# TARGET
- Path: ${path}
- Desc: ${description}

# CONTEXT
${existingFileSummary}

# TASK
Generate queries for:
1. High-level concepts.
2. Specific class/function names.
3. Config schemas.

# OUTPUT (JSON Array of Strings)
Example: ["Authentication logic", "UserLoginController", "JWT config"]
`;

export const DOC_DISCOVERY_PROMPT = (
    packageJsonSummary: string,
    fileSummary: string,
    readmeSummary: string,
) => `
# ROLE: Lead Architect
# GOAL: Discovery scan for documentation planning.

# CONTEXT
## Package.json
${packageJsonSummary}

## Files
${fileSummary}

## README
${readmeSummary || 'None'}

# TASK
Identify:
1. **App Type** (CLI, API, Web, Mono?)
2. **Patterns** (CQRS, Plugins?)
3. **Data Flows**

# OUTPUT (Architectural Brief)
- **Architecture**: ...
- **Pattern**: ...
- **Key Flow**: ...
`;

export const DOC_REVIEW_PROMPT = (
    path: string,
    description: string,
    content: string,
    sourceContext: string,
) => `
# ROLE: Senior Reviewer
# GOAL: Review doc against code (Ground Truth).

# TARGET
- File: ${path}
- Purpose: ${description}

# DOC CONTENT
\`\`\`markdown
${content}
\`\`\`

# SOURCE CONTEXT (TRUTH)
\`\`\`
${sourceContext}
\`\`\`

# CRITERIA
1. **Hallucinations** (Flags, env vars, modules MUST exist).
2. **Accuracy**.
3. **Completeness**.

# OUTPUT (JSON)
{
  "score": number, // 1-5
  "critique": string,
  "specific_critiques": ["Line X: ..."],
  "critical_issues": boolean
}
`;

export const DOC_REFINE_PROMPT = (path: string, critiques: string[], originalContent: string) => `
# ROLE: Tech Writer
# FILE: ${path}
# GOAL: Fix doc based on feedback.

# FEEDBACK
${critiques.map((c) => `- ${c}`).join('\n')}

# CONTENT
\`\`\`markdown
${originalContent}
\`\`\`

# INSTRUCTION
- **APPLY FIXES**.
- **RESTORE** unaffected parts.
- **OUTPUT**: Full Markdown file. No conversational text.
`;

export const DOC_UPDATE_PROMPT = (
    projectName: string,
    path: string,
    description: string,
    sourceContext: string,
    gitDiff: string,
    currentContent: string,
) => `
# ROLE: Lead Tech Writer
# PROJECT: ${projectName}
# FILE: ${path}
# DESC: ${description}

# GOAL
Surgically update doc to match code.

# CONTEXT
## Source Code (New Truth)
${sourceContext}

## Diff
${gitDiff || 'None'}

## Existing File
\`\`\`markdown
${currentContent}
\`\`\`

# INSTRUCTION
1. **Analyze** Drift.
2. **Execute Patches**: Call \`patch_file(original, new)\`.
3. **Style**: Match existing.

# RULES
- **NO** full file return.
- **NO** rephrasing unless needed.
- **NO** touching unrelated sections.
- Return brief summary of changes.
- **YAML**: If updating frontmatter, ALWAYS use double quotes for string values (title: "Foo: Bar").
- **STYLE**: Maintain rich formatting. Use backticks for code elements, tables for properties, and bold for emphasis.
`;
