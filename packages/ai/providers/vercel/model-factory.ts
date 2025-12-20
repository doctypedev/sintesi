import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createHelicone } from '@helicone/ai-sdk-provider';
import { AIModel, ILogger, ObservabilityMetadata } from '../../core/types';
import { log } from './utils';

export interface ModelFactoryConfig {
    modelConfig: AIModel;
    debug?: boolean;
    logger?: ILogger;
}

export class ModelFactory {
    readonly #config: ModelFactoryConfig;

    constructor(config: ModelFactoryConfig) {
        this.#config = config;
    }

    getModel(metadata?: ObservabilityMetadata) {
        if (metadata) {
            const heliconeModel = this.tryCreateHeliconeModel(metadata);
            if (heliconeModel) {
                log(
                    this.#config.logger,
                    this.#config.debug || false,
                    'info',
                    '📊 Helicone observability enabled',
                );
                return heliconeModel;
            }
        }

        return this.getNativeModel();
    }

    getNativeModel() {
        return this.createProviderModel()(this.#config.modelConfig.modelId);
    }

    private createProviderModel(): (id: string) => any {
        const factories = {
            openai: createOpenAI,
            gemini: createGoogleGenerativeAI,
            anthropic: createAnthropic,
            mistral: createMistral,
        } as const;

        const factory = factories[this.#config.modelConfig.provider];
        if (!factory) {
            throw new Error(`Unsupported provider: ${this.#config.modelConfig.provider}`);
        }

        const instance = factory({
            apiKey: this.#config.modelConfig.apiKey,
            baseURL: this.#config.modelConfig.endpoint,
        } as any);

        return instance;
    }

    private tryCreateHeliconeModel(metadata: ObservabilityMetadata) {
        const heliconeApiKey = this.#config.modelConfig.observability?.heliconeApiKey;
        if (!heliconeApiKey) return null;

        try {
            const helicone = createHelicone({ apiKey: heliconeApiKey });

            return helicone(this.#config.modelConfig.modelId, {
                extraBody: {
                    helicone: this.buildHeliconeConfig(metadata),
                },
            });
        } catch (error) {
            log(
                this.#config.logger,
                this.#config.debug || false,
                'warn',
                `[ModelFactory] Helicone initialization failed, falling back to native provider`,
                error,
            );
            return null;
        }
    }

    private buildHeliconeConfig(metadata: ObservabilityMetadata) {
        const heliconeConfig: Record<string, unknown> = {};

        if (metadata.sessionId) {
            heliconeConfig.sessionId = metadata.sessionId;
        }

        if (metadata.sessionName) {
            heliconeConfig.sessionName = metadata.sessionName;
        }

        if (metadata.userId) {
            heliconeConfig.userId = metadata.userId;
        }

        if (metadata.tags || metadata.agentRole) {
            heliconeConfig.tags = [
                ...(metadata.tags || []),
                ...(metadata.agentRole ? [metadata.agentRole] : []),
            ];
        }

        if (metadata.properties) {
            heliconeConfig.properties = metadata.properties;
        }

        return heliconeConfig;
    }
}
