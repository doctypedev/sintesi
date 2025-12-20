import { AIProvider, AIModel, AIAgentRoleConfig } from './types';
import { DEFAULT_MODELS, DEFAULT_TEMPERATURES } from './constants';

export interface AIAgentsConfig {
    roles: Record<string, AIAgentRoleConfig>;
    globalModel: AIModel;
}

export class ConfigLoader {
    /**
     * Loads agent configurations from environment variables
     */
    static loadFromEnv(): AIAgentsConfig {
        const provider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
        const apiKey = this.getApiKey(provider);

        const globalModel: AIModel = {
            provider,
            apiKey,
            modelId: process.env.AI_MODEL_ID || DEFAULT_MODELS[provider],
            maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
            temperature: parseFloat(
                process.env.AI_TEMPERATURE || String(DEFAULT_TEMPERATURES.writer),
            ),
            endpoint: process.env.AI_ENDPOINT,
            observability: {
                heliconeApiKey: process.env.HELICONE_API_KEY,
            },
        };

        const roles = {
            planner: this.loadRoleConfig('PLANNER', globalModel, DEFAULT_TEMPERATURES.planner),
            researcher: this.loadRoleConfig(
                'RESEARCHER',
                globalModel,
                DEFAULT_TEMPERATURES.researcher,
            ),
            writer: this.loadRoleConfig('WRITER', globalModel, DEFAULT_TEMPERATURES.writer),
            reviewer: this.loadRoleConfig('REVIEWER', globalModel, DEFAULT_TEMPERATURES.reviewer),
        };

        return { globalModel, roles };
    }

    private static loadRoleConfig(
        prefix: string,
        fallback: AIModel,
        defaultTemp: number,
    ): AIAgentRoleConfig {
        const provider = (process.env[`${prefix}_PROVIDER`] as AIProvider) || fallback.provider;
        return {
            provider,
            modelId: process.env[`${prefix}_MODEL_ID`] || DEFAULT_MODELS[provider],
            temperature: process.env[`${prefix}_TEMPERATURE`]
                ? parseFloat(process.env[`${prefix}_TEMPERATURE`]!)
                : defaultTemp,
            maxTokens: process.env[`${prefix}_MAX_TOKENS`]
                ? parseInt(process.env[`${prefix}_MAX_TOKENS`]!)
                : fallback.maxTokens,
        };
    }

    private static getApiKey(provider: AIProvider): string {
        const keys: Record<AIProvider, string | undefined> = {
            openai: process.env.OPENAI_API_KEY || process.env.LDR_OPENAI_API_KEY,
            gemini: process.env.GEMINI_API_KEY || process.env.LDR_GEMINI_API_KEY,
            anthropic: process.env.ANTHROPIC_API_KEY || process.env.LDR_ANTHROPIC_API_KEY,
            mistral: process.env.MISTRAL_API_KEY || process.env.LDR_MISTRAL_API_KEY,
        };

        const key = keys[provider];
        if (!key) {
            throw new Error(
                `API Key for provider ${provider} is missing (tried ${provider.toUpperCase()}_API_KEY and LDR_${provider.toUpperCase()}_API_KEY)`,
            );
        }
        return key;
    }
}
