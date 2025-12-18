import { Logger } from '../utils/logger';
import { AIAgents } from '../../../ai';
import { createObservabilityMetadata } from '../utils/observability';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface SemanticVerificationResult {
    isDrift: boolean;
    reason?: string;
    relevantSection?: string;
}

export class SemanticVerifier {
    constructor(private logger: Logger) {}

    /**
     * Semantically verifies if a documentation file is impacted by a code change.
     *
     * @param docPath Path to the documentation file
     * @param changedFileContent Content of the changed source file (or diff)
     * @param diffSummary A summary of the diff for the changed file
     * @param aiAgents Initialized AI agents
     */
    async verify(
        docPath: string,
        changedFileContent: string,
        diffSummary: string,
        aiAgents: AIAgents,
    ): Promise<SemanticVerificationResult> {
        this.logger.debug(`[Semantic] Verifying ${docPath} against changes in source...`);

        // 1. Read Documentation Content
        const absDocPath = resolve(process.cwd(), docPath);
        if (!existsSync(absDocPath)) {
            return { isDrift: true, reason: 'Documentation file missing' };
        }
        const docContent = readFileSync(absDocPath, 'utf-8');

        // 2. RAG Lookup: Find relevant sections in the doc that might relate to the "diff keywords"
        // We use the diff keywords to search the *static doc content* (or we could just scan the doc if small)
        // Optimization: If doc is small (< 8k tokens), just read it all. If huge, maybe split?
        // Most docs are single pages, so reading full content is efficient enough and deeper.

        // 3. LLM Judge

        // 3. LLM Judge
        const prompt = `
You are a Senior Technical Editor and Code Auditor. 
Your task is to determine if a specific CODE CHANGE invalidates or conflicts with the existing DOCUMENTATION.

CONTEXT:
We have a documentation file: "${docPath}"
We have a source code change: "${diffSummary}"

--- EXISTING DOCUMENTATION CONTENT (Target) ---
${docContent.substring(0, 50000)}

--- CODE CHANGE SUMMARY (Source) ---
${changedFileContent.substring(0, 20000)}

INSTRUCTIONS:
1. Read the Documentation and the Code Change.
2. Determine if the Code Change *contradicts*, *updates*, or *adds new behavior* that makes the current Documentation factually incorrect or significantly incomplete.
3. Ignore minor refactors, styling changes, or internal logic that doesn't affect the documented behavior (unless the doc describes internal logic).
4. If the documentation is broad/high-level and the change is low-level implementation detail, it might NOT be a drift.

OUTPUT:
Return a JSON object:
{
  "drift": boolean, // true if documentation needs update
  "reason": "explanation of why",
  "relevant_section": "quote from doc that is now wrong (optional)"
}
`;

        try {
            const resultJson = await aiAgents.planner.generateText(
                prompt,
                { temperature: 0.1, maxTokens: 300 },
                createObservabilityMetadata({
                    feature: 'semantic-verification',
                    additionalProperties: { docPath, diffSummary },
                }),
            );

            let result;
            try {
                const cleanJson = resultJson
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                result = JSON.parse(cleanJson);
            } catch (e) {
                // Fallback if structured output fails
                const lower = resultJson.toLowerCase();
                return {
                    isDrift: lower.includes('true'),
                    reason: resultJson,
                };
            }

            return {
                isDrift: result.drift,
                reason: result.reason,
                relevantSection: result.relevant_section,
            };
        } catch (error) {
            this.logger.warn(`Semantic verification failed for ${docPath}: ${error}`);
            // Fallback to strict: if check fails, assume drift to be safe?
            // Or assume no drift to avoid noise?
            // "Deep Check" implies we want high precision. If tool fails, maybe fallback to "Changed" warning.
            return {
                isDrift: true,
                reason: 'Semantic check failed, falling back to strict drift.',
            };
        }
    }
}
