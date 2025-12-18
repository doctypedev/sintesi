import { Logger } from '../utils/logger';
import { AIAgents, ObservabilityMetadata } from '../../../ai';

export class ReviewService {
    constructor(private logger: Logger) {}

    /**
     * Reviews and refines content using the Review and Writer agents.
     * If the reviewer flags issues, the writer is asked to refine the content once.
     */
    async reviewAndRefine(
        content: string,
        itemPath: string,
        itemDescription: string,
        sourceContext: string,
        agents: AIAgents,
        sessionMetadata?: ObservabilityMetadata,
    ): Promise<string> {
        if (!agents.reviewer) {
            return content;
        }

        this.logger.info(`> Reviewing ${itemPath}...`);

        const reviewPrompt = `
    You are a Senior Technical Reviewer.
    Your task is to review the following documentation file content.

    File: "${itemPath}"
    Purpose: ${itemDescription}

    ## Content to Review:
    \`\`\`markdown
    ${content}
    \`\`\`

    ## Source Context (GROUND TRUTH):
    Use this context to verify facts.
    \`\`\`
    ${sourceContext.substring(0, 20000)} 
    \`\`\`

    ## Evaluation Criteria:
    1. **Accuracy (CRITICAL)**: Check if commands, flags, and APIs mentioned in the content ACTUALLY EXIST in the Source Context. Flag any hallucination as a CRITICAL issue.
    2. **Clarity**: Is it easy to read?
    3. **Consistency**: Does it follow the style guide?
    4. **Completeness**: Does it cover the purpose?

    ## Output
    Return ONLY a JSON object:
    {
      "score": number, // 1-5 (5 is perfect)
      "critique": string, // Detailed feedback. If hallucinations found, list them explicitly.
      "critical_issues": boolean // True if factual errors (hallucinations) are found
    }
    `;

        try {
            let reviewRaw = await agents.reviewer.generateText(
                reviewPrompt,
                {
                    maxTokens: 1000,
                    temperature: 0.1,
                },
                sessionMetadata
                    ? {
                          ...sessionMetadata,
                          properties: {
                              ...sessionMetadata.properties,
                              feature: 'content-review',
                              documentPath: itemPath,
                          },
                          tags: [...(sessionMetadata.tags || []), 'review', 'validation'],
                      }
                    : undefined,
            );
            reviewRaw = reviewRaw
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const review = JSON.parse(reviewRaw);

            if (review.score < 4 || review.critical_issues) {
                this.logger.warn(
                    `⚠ Reviewer flagged ${itemPath} (Score: ${review.score}/5): ${review.critique.substring(0, 100)}... Refining...`,
                );

                const refinePrompt = `
        The previous draft of "${itemPath}" received the following CRITIQUE from the Reviewer:
        "${review.critique}"

        ## Task
        Refine the content to address the critique.
        Fix factual errors and improve clarity.
        Return the FULLY rewritten Markdown file.

        ## Previous Content:
        \`\`\`markdown
        ${content}
        \`\`\`
        `;

                // Use Writer to refine
                let refinedContent = await agents.writer.generateText(
                    refinePrompt,
                    {
                        maxTokens: 4000,
                        temperature: 0.1,
                    },
                    sessionMetadata
                        ? {
                              ...sessionMetadata,
                              properties: {
                                  ...sessionMetadata.properties,
                                  feature: 'content-refinement',
                                  documentPath: itemPath,
                              },
                              tags: [...(sessionMetadata.tags || []), 'refinement', 'revision'],
                          }
                        : undefined,
                );

                // Clean content again
                refinedContent = refinedContent.trim();
                if (refinedContent.startsWith('```markdown'))
                    refinedContent = refinedContent
                        .replace(/^```markdown\s*/, '')
                        .replace(/```$/, '');
                else if (refinedContent.startsWith('```'))
                    refinedContent = refinedContent.replace(/^```\s*/, '').replace(/```$/, '');

                this.logger.success(`✔ Refined ${itemPath} based on feedback.`);
                return refinedContent;
            } else {
                this.logger.success(`✔ Reviewer passed ${itemPath} (Score: ${review.score}/5)`);
                return content;
            }
        } catch (e) {
            this.logger.warn(
                'Review failed (using unknown/custom JSON?), keeping original draft: ' + e,
            );
            return content;
        }
    }
}
