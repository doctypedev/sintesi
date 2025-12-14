
/**
 * Shared prompt rules and constants for Sintesi AI Agents.
 */

export const SHARED_SAFETY_RULES = `
## Rules & Safety
- Use Markdown formatting.
- Be concise but informative.
- Do not include placeholder text like '[Insert description here]'. Infer the best possible description.
- Return ONLY the Markdown content.

### Anti-Hallucination & Integrity
- **NO HALLUCINATIONS**: Only document commands/flags/props you see in the Context or Git Diff.
- **PROTECT CLI FLAGS**: If updating, PRESERVE existing CLI flags (e.g. --no-strict) in usage examples unless you have proof they are removed.
  - **IMPLICIT NEGATION**: In Yargs/Commander, boolean flags like \`--strict\` automatically create \`--no-strict\`. If you see a \`no-*\` flag, check if the base flag exists. If so, IT IS VALID. DO NOT REMOVE.
- **STRICT REPO URLS**: Use the Repository URL defined in package.json (see context above). DO NOT guess or hallucinate git URLs like 'git clone https://github.com/your-username/...'.
- **NO DEAD LINKS**: Do NOT link to files like 'CODE_OF_CONDUCT.md' or 'CONTRIBUTING.md' unless you are absolutely sure they exist in the file list. Use absolute paths (starting with '/') for internal documentation links (e.g., '/guide/installation.md').
`;

export const CLEANUP_INSTRUCTIONS = `
Return ONLY the Markdown content.
If the content is wrapped in markdown code blocks like \`\`\`markdown ... \`\`\`, strip them.
`;
