
import { Logger } from '../utils/logger';
import { AIAgents, createTools } from '../../../ai';
import { ProjectContext } from '@sintesi/core';
import { DOC_RESEARCH_AGENT_PROMPT } from '../prompts/documentation';
import { DocPlan } from './documentation-planner';

export class ResearcherService {
    constructor(private logger: Logger, private cwd: string) { }

    async research(
        item: DocPlan,
        context: ProjectContext,
        aiAgents: AIAgents,
        detailedSourceContext?: string,
        packageJsonSummary?: string
    ): Promise<string> {
        let finalContext = detailedSourceContext || '(No specific source files matched, rely on general context)';

        if (!aiAgents.researcher) {
            return finalContext;
        }

        try {
            this.logger.info(`  ↳ 🔍 Researcher analyzing context (Agentic Mode)...`);

            // Extract file paths from context
            const allFilePaths = context.files.map(f => f.path);

            // Initialize Tools with context
            const tools = createTools(
                this.cwd,
                allFilePaths,
                aiAgents.researcher.debug
            );

            // Use Agentic Prompt
            const researchPrompt = DOC_RESEARCH_AGENT_PROMPT(
                item.path,
                item.description,
                packageJsonSummary || '',
                item.relevantPaths, // Pass heuristic paths as hints
                detailedSourceContext || '' // Pass initial context (was previously ignored)
            );

            const researchOutput = await aiAgents.researcher.generateText(researchPrompt, {
                maxTokens: 8000,
                temperature: 0.0,
                tools,
                maxSteps: 10 // Enable Agent Loop
            });

            finalContext = `
            *** RESEARCHER TECHNICAL BRIEF ***
            (The following information was extracted and verified by the Autonomous Researcher Agent)

            ${researchOutput}
            
            *** END RESEARCHER BRIEF ***
            `;
        } catch (e) {
            this.logger.debug(`Researcher failed, falling back to raw context: ${e}`);
            // Fallback to old behavior if agent fails
            if (detailedSourceContext && detailedSourceContext.length > 100) {
                finalContext = detailedSourceContext;
            }
        }

        return finalContext;
    }
}
