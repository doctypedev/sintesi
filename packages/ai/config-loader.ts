import { AIProvider, AIModel } from './types';
import { DEFAULT_MODELS, DEFAULT_TEMPERATURES } from './constants';

export interface AIAgentsConfig {
    roles: Record<string, AIModel>;
}

export class ConfigLoader {
    /**
     * Loads agent configurations from environment variables
     */
    static loadFromEnv(): AIAgentsConfig {
        const globalProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

        const globalDefaults = {
            provider: globalProvider,
            modelId: process.env.AI_MODEL_ID || DEFAULT_MODELS[globalProvider],
            maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
            temperature: parseFloat(
                process.env.AI_TEMPERATURE || String(DEFAULT_TEMPERATURES.writer),
            ),
            endpoint: process.env.AI_ENDPOINT,
            heliconeApiKey: process.env.HELICONE_API_KEY,
        };

        const roles = {
            planner: this.loadRoleModel('PLANNER', globalDefaults, DEFAULT_TEMPERATURES.planner),
            researcher: this.loadRoleModel(
                'RESEARCHER',
                globalDefaults,
                DEFAULT_TEMPERATURES.researcher,
            ),
            writer: this.loadRoleModel('WRITER', globalDefaults, DEFAULT_TEMPERATURES.writer),
            reviewer: this.loadRoleModel('REVIEWER', globalDefaults, DEFAULT_TEMPERATURES.reviewer),
        };

        return { roles };
    }

    private static loadRoleModel(
        prefix: string,
        fallback: {
            provider: AIProvider;
            modelId: string;
            maxTokens: number;
            temperature: number;
            endpoint?: string;
            heliconeApiKey?: string;
        },
        defaultTemp: number,
    ): AIModel {
        const provider = (process.env[`${prefix}_PROVIDER`] as AIProvider) || fallback.provider;
        const apiKey = this.getApiKey(provider);

        return {
            provider,
            apiKey,
            modelId:
                process.env[`${prefix}_MODEL_ID`] ||
                (provider === fallback.provider ? fallback.modelId : DEFAULT_MODELS[provider]),
            temperature: process.env[`${prefix}_TEMPERATURE`]
                ? parseFloat(process.env[`${prefix}_TEMPERATURE`]!)
                : provider === fallback.provider
                  ? fallback.temperature
                  : defaultTemp,
            maxTokens: process.env[`${prefix}_MAX_TOKENS`]
                ? parseInt(process.env[`${prefix}_MAX_TOKENS`]!)
                : fallback.maxTokens,
            endpoint: process.env[`${prefix}_ENDPOINT`] || fallback.endpoint,
            observability: {
                heliconeApiKey:
                    process.env[`${prefix}_HELICONE_API_KEY`] || fallback.heliconeApiKey,
            },
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
