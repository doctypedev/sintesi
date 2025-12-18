import { tool } from 'ai';
import { z } from 'zod';

const patchParametersSchema = z.object({
    original_text_snippet: z
        .string()
        .describe(
            'The exact literal text snippet to replace (including newlines/indentation). Must uniquely identify the section.',
        ),
    new_text_snippet: z.string().describe('The new text content to replace the old snippet with.'),
    reason: z.string().describe('The reason for this change.'),
});

/**
 * Creates a tool that can patch a file's content in-memory.
 * The tool modifies the `fileContext.content` property directly.
 */
export function createPatchFileTool(fileContext: { content: string; path: string }) {
    return tool({
        description:
            'Update a specific section of the documentation file. Use this to perform surgical edits (search & replace) instead of rewriting the whole file.',
        // NOTE: using inputSchema as per working reference in feat/tools
        inputSchema: patchParametersSchema,
        execute: async (args) => {
            const { original_text_snippet, new_text_snippet, reason } = args;

            // 1. Check for existence
            if (!fileContext.content.includes(original_text_snippet)) {
                // Try to be helpful with whitespace mismatch
                const normalizedContent = fileContext.content.replace(/\r\n/g, '\n');
                const normalizedSnippet = original_text_snippet.replace(/\r\n/g, '\n');

                if (normalizedContent.includes(normalizedSnippet)) {
                    // Check uniqueness on normalized content
                    const occurrences = normalizedContent.split(normalizedSnippet).length - 1;
                    if (occurrences > 1) {
                        return `Error: The snippet provided matches ${occurrences} locations in ${fileContext.path} (after normalizing line endings). Please provide more surrounding context to ensure uniqueness.`;
                    }

                    fileContext.content = normalizedContent.replace(
                        normalizedSnippet,
                        new_text_snippet,
                    );
                    return `Success: Applied patch for "${reason}" (normalized line endings).`;
                }

                return `Error: Could not find the exact snippet in ${fileContext.path}. Ensure you are quoting the existing text exactly.`;
            }

            // 2. Check for uniqueness
            const occurrences = fileContext.content.split(original_text_snippet).length - 1;
            if (occurrences > 1) {
                return `Error: The snippet provided matches ${occurrences} locations in ${fileContext.path}. Please provide more surrounding context to ensure uniqueness.`;
            }

            fileContext.content = fileContext.content.replace(
                original_text_snippet,
                new_text_snippet,
            );
            return `Success: Applied patch for "${reason}".`;
        },
    });
}
