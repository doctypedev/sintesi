import { Logger } from '../utils/logger';
import { AIAgents, ObservabilityMetadata } from '../../../ai';
import { DOC_REVIEW_PROMPT, DOC_REFINE_PROMPT } from '../prompts/documentation';
import { extendMetadata } from '../utils/observability';

export class ReviewService {
    constructor(private logger: Logger) {}

    /**
     * Reviews and refines content using the Review and Writer agents.
     * Uses structured feedback (specific critiques) to guide the refinement.
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

        const reviewPrompt = DOC_REVIEW_PROMPT(
            itemPath,
            itemDescription,
            content,
            sourceContext || '(No specific source context available. Rely on general knowledge)',
        );

        try {
            const generatedOptions: any = {
                maxTokens: 1500,
                temperature: 0.1,
            };

            let metadataArg;
            if (sessionMetadata) {
                metadataArg = extendMetadata(sessionMetadata, {
                    feature: 'content-review',
                    properties: { documentPath: itemPath },
                    tags: ['review', 'validation'],
                });
            }

            let reviewRaw = await agents.reviewer.generateText(
                reviewPrompt,
                generatedOptions,
                metadataArg,
            );

            reviewRaw = reviewRaw
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            interface ReviewResult {
                score: number;
                critique: string;
                specific_critiques?: string[];
                critical_issues: boolean;
            }

            const review: ReviewResult = JSON.parse(reviewRaw);

            if (
                review.score < 4 ||
                review.critical_issues ||
                (review.specific_critiques && review.specific_critiques.length > 0)
            ) {
                const critiqueCount = review.specific_critiques?.length || 0;
                this.logger.warn(
                    `⚠ Reviewer flagged ${itemPath} (Score: ${review.score}/5). Issues: ${critiqueCount}. Refining...`,
                );
                if (critiqueCount > 0) {
                    this.logger.debug(`Critiques: ${review.specific_critiques?.join(' | ')}`);
                }

                // If no specific critiques but low score, use the general critique
                const critiquesToApply =
                    review.specific_critiques && review.specific_critiques.length > 0
                        ? review.specific_critiques
                        : [review.critique];

                const refinePrompt = DOC_REFINE_PROMPT(itemPath, critiquesToApply, content);

                const refineOptions: any = {
                    maxTokens: 4000,
                    temperature: 0.1,
                };

                let refineMetadata;
                if (sessionMetadata) {
                    refineMetadata = extendMetadata(sessionMetadata, {
                        feature: 'content-refinement',
                        properties: { documentPath: itemPath },
                        tags: ['refinement', 'revision'],
                    });
                }

                // Use Writer to refine
                let refinedContent = await agents.writer.generateText(
                    refinePrompt,
                    refineOptions,
                    refineMetadata,
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
                'Review failed (JSON parse error or agent error), keeping original draft: ' + e,
            );
            return content;
        }
    }
}
