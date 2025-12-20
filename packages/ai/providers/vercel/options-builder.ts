import { AIModel, GenerateTextOptions } from '../../core/types';
import { isReasoningModel } from './utils';

export class OptionsBuilder {
    readonly #config: AIModel;

    constructor(config: AIModel) {
        this.#config = config;
    }

    /**
     * Build base options for AI SDK generation functions
     */
    buildBaseOptions(model: any, prompt: string, overrides: Record<string, unknown> = {}) {
        const options: Record<string, unknown> = {
            model,
            prompt,
            ...overrides,
        };

        // Reasoning models (o1, o3) handle tokens/temperature differently
        if (!isReasoningModel(this.#config.modelId)) {
            if (this.#config.maxTokens && options.maxTokens === undefined) {
                options.maxTokens = this.#config.maxTokens;
            }

            if (this.#config.temperature !== undefined && options.temperature === undefined) {
                options.temperature = this.#config.temperature;
            }
        }

        return options;
    }

    /**
     * Build options specifically for generateText
     */
    buildTextOptions(
        model: any,
        prompt: string,
        options: GenerateTextOptions,
    ): Record<string, unknown> {
        const baseOptions = this.buildBaseOptions(model, prompt, {});

        if (!isReasoningModel(this.#config.modelId)) {
            baseOptions.temperature = options.temperature ?? this.#config.temperature;
            baseOptions.maxTokens = options.maxTokens ?? this.#config.maxTokens ?? 1000;
        }

        if (options.tools) {
            baseOptions.tools = options.tools;
        }

        if (options.maxSteps) {
            baseOptions.maxSteps = options.maxSteps;
        }

        return baseOptions;
    }
}
