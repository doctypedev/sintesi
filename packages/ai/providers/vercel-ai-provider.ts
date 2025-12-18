import {
    IAIProvider,
    AIProvider,
    DocumentationRequest,
    DocumentationResponse,
    AIModel,
    AIProviderError,
    BatchDocumentationResult,
    ILogger,
    ObservabilityMetadata,
} from '../types';
import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createHelicone } from '@helicone/ai-sdk-provider';
import {
    BatchDocumentationStructureSchema,
    DocumentationStructureSchema,
    type DocumentationStructure,
} from '../structured-schema';
import { buildMarkdownFromStructure } from '../markdown-builder';
import { z } from 'zod';

export class VercelAIProvider implements IAIProvider {
    readonly provider: AIProvider;
    private modelConfig: AIModel;
    private debug: boolean;
    private logger?: ILogger;

    constructor(config: AIModel, debug: boolean = false, logger?: ILogger) {
        this.provider = config.provider;
        this.modelConfig = config;
        this.debug = debug;
        this.logger = logger;
    }

    /**
     * Get model with Helicone fallback
     * Tries to use Helicone if configured, falls back to native provider on failure
     */
    private getModel(metadata?: ObservabilityMetadata) {
        const heliconeApiKey = process.env.HELICONE_API_KEY;

        // If Helicone is configured and we have metadata, try to use it as a proxy
        if (heliconeApiKey && metadata) {
            try {
                const helicone = createHelicone({ apiKey: heliconeApiKey });

                // Log when Helicone is successfully initialized
                if (this.logger) {
                    this.logger.info('📊 Helicone observability enabled');
                } else if (this.debug) {
                    console.log('[VercelAIProvider] ✓ Using Helicone proxy for observability');
                }

                return helicone(this.modelConfig.modelId, {
                    extraBody: {
                        helicone: this.buildHeliconeConfig(metadata),
                    },
                });
            } catch (error) {
                // Log warning and fall back to native provider
                if (this.logger) {
                    this.logger.warn(
                        `[VercelAIProvider] Helicone initialization failed, falling back to native provider: ${error}`,
                    );
                } else {
                    console.warn(
                        `[VercelAIProvider] Helicone initialization failed, falling back to native provider:`,
                        error,
                    );
                }
                // Fall through to native provider
            }
        }

        // Use the standard native provider (fallback or when Helicone not configured)
        return this.getNativeModel();
    }

    /**
     * Get native model without Helicone proxy
     */
    private getNativeModel() {
        switch (this.provider) {
            case 'openai': {
                const provider = createOpenAI({
                    apiKey: this.modelConfig.apiKey,
                    baseURL: this.modelConfig.endpoint,
                });
                return provider(this.modelConfig.modelId);
            }
            case 'gemini': {
                const provider = createGoogleGenerativeAI({
                    apiKey: this.modelConfig.apiKey,
                });
                return provider(this.modelConfig.modelId);
            }
            case 'anthropic': {
                const provider = createAnthropic({
                    apiKey: this.modelConfig.apiKey,
                });
                return provider(this.modelConfig.modelId);
            }
            case 'mistral': {
                const provider = createMistral({
                    apiKey: this.modelConfig.apiKey,
                });
                return provider(this.modelConfig.modelId);
            }
            default:
                throw new Error(`Unsupported provider: ${this.provider}`);
        }
    }

    /**
     * Build Helicone configuration from observability metadata
     */
    private buildHeliconeConfig(metadata?: ObservabilityMetadata): any {
        if (!metadata) return {};

        const heliconeConfig: any = {};

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

    async generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse> {
        const model = this.getModel();

        // Use structured prompt from request
        const prompt = request.prompt;
        const systemPrompt = request.systemPrompt;

        try {
            const options: any = {
                model,
                prompt,
                system: systemPrompt,
                schema: z.object({
                    documentation: DocumentationStructureSchema,
                }),
            };

            if (this.modelConfig.maxTokens) {
                options.maxTokens = this.modelConfig.maxTokens;
            }

            if (this.modelConfig.temperature !== undefined) {
                options.temperature = this.modelConfig.temperature;
            }

            const result: any = await generateObject(options);
            const doc: DocumentationStructure = result.object.documentation;
            const usageAny = result.usage as any;

            // Build Markdown from structure (Zod schema already validated the data)
            const markdown = buildMarkdownFromStructure(doc);

            return {
                content: markdown,
                provider: this.provider,
                modelId: this.modelConfig.modelId,
                timestamp: Date.now(),
                usage: result.usage
                    ? {
                          promptTokens: usageAny.promptTokens || 0,
                          completionTokens: usageAny.completionTokens || 0,
                          totalTokens: usageAny.totalTokens || 0,
                      }
                    : undefined,
            };
        } catch (error) {
            const err = error as any;
            let code = 'GENERATION_FAILED';
            const message = err.message || 'Unknown error during generation';

            // Map common error codes if possible
            if (err.name === 'APICallError' && err.statusCode === 429) {
                code = 'RATE_LIMIT';
            }

            throw new AIProviderError(code, message, this.provider, error);
        }
    }

    async generateBatchDocumentation(
        items: Array<{ symbolName: string; signatureText: string }>,
        prompt: string,
        systemPrompt: string,
    ): Promise<BatchDocumentationResult> {
        const model = this.getModel();

        try {
            const options: any = {
                model,
                prompt,
                system: systemPrompt,
                schema: BatchDocumentationStructureSchema,
            };

            // Increase token limit for batches
            if (this.modelConfig.maxTokens) {
                options.maxTokens = this.modelConfig.maxTokens * items.length;
            } else {
                // Default generous limit for batches if not specified
                options.maxTokens = 4096;
            }

            if (this.modelConfig.temperature !== undefined) {
                options.temperature = this.modelConfig.temperature;
            }

            const result: any = await generateObject(options);

            // Build Markdown from each structured documentation entry
            // (Zod schema already validated all data during parsing)
            const success: Array<{ symbolName: string; content: string }> =
                result.object.documentations.map((doc: DocumentationStructure) => {
                    const markdown = buildMarkdownFromStructure(doc);

                    if (this.debug) {
                        if (this.logger) {
                            this.logger.debug(
                                `[VercelAIProvider] Generated markdown for ${doc.symbolName}`,
                            );
                        } else {
                            console.log(
                                `[VercelAIProvider] Generated markdown for ${doc.symbolName}`,
                            );
                        }
                    }

                    return {
                        symbolName: doc.symbolName,
                        content: markdown,
                    };
                });

            return {
                success,
                failures: [],
                stats: {
                    total: items.length,
                    succeeded: success.length,
                    failed: 0,
                },
            };
        } catch (error) {
            const err = error as any;
            // Complete batch failure (network, API error, etc.)
            if (this.logger) {
                this.logger.warn(
                    `[VercelAIProvider] Batch generation failed completely: ${err.message}`,
                );
            } else {
                console.warn(
                    `[VercelAIProvider] Batch generation failed completely: ${err.message}`,
                );
            }

            // Return empty result with all items marked as failures
            return {
                success: [],
                failures: items.map((item) => ({
                    symbolName: item.symbolName,
                    errors: [`Batch generation error: ${err.message}`],
                })),
                stats: {
                    total: items.length,
                    succeeded: 0,
                    failed: items.length,
                },
            };
        }
    }

    async validateConnection(): Promise<boolean> {
        const model = this.getModel();
        // Check for reasoning models (o1-*, o3-*) which have special parameter restrictions
        const isReasoningModel = /^o[13]-/.test(this.modelConfig.modelId);

        try {
            // Simple ping to validate key
            const options: any = {
                model,
                prompt: 'Hello',
            };

            // Reasoning models (o1, o3) do not support maxTokens in the same way
            if (!isReasoningModel) {
                options.maxTokens = 5;
            }

            await generateText(options);
            return true;
        } catch (error) {
            if (this.debug) {
                if (this.logger) {
                    this.logger.error('Connection validation failed:', error);
                } else {
                    console.error('Connection validation failed:', error);
                }
            }
            return false;
        }
    }

    /**
     * Generate plain text from a prompt (useful for non-documentation tasks)
     */
    async generateText(
        prompt: string,
        options: {
            temperature?: number;
            maxTokens?: number;
        } = {},
        metadata?: ObservabilityMetadata,
    ): Promise<string> {
        const model = this.getModel(metadata);
        // Check for reasoning models (o1-*, o3-*) which have special parameter restrictions
        const isReasoningModel = /^o[13]-/.test(this.modelConfig.modelId);

        try {
            const genOptions: any = {
                model,
                prompt,
            };

            // Reasoning models (o1, o3) have restrictions on temperature and other params
            if (!isReasoningModel) {
                genOptions.temperature = options.temperature ?? this.modelConfig.temperature;
                genOptions.maxTokens = options.maxTokens ?? this.modelConfig.maxTokens ?? 1000;
            } else {
                // For reasoning models (o1/o3), we omit temperature/maxTokens
                // They use maxCompletionTokens instead, handled by the AI SDK
            }

            const result = await generateText(genOptions);
            return result.text;
        } catch (error) {
            const err = error as any;

            // If Helicone was used and it failed, retry with native provider
            const heliconeApiKey = process.env.HELICONE_API_KEY;
            if (heliconeApiKey && metadata) {
                if (this.logger) {
                    this.logger.warn(
                        `[VercelAIProvider] Helicone API call failed, retrying with native provider: ${err.message}`,
                    );
                } else {
                    console.warn(
                        `[VercelAIProvider] Helicone API call failed, retrying with native provider:`,
                        err.message,
                    );
                }

                try {
                    // Retry with native provider
                    const nativeModel = this.getNativeModel();
                    const genOptions: any = {
                        model: nativeModel,
                        prompt,
                    };

                    // Redeclare for fallback scope
                    const isReasoningModel = /^o[13]-/.test(this.modelConfig.modelId);

                    // Reasoning models don't support maxTokens parameter
                    if (!isReasoningModel) {
                        genOptions.temperature =
                            options.temperature ?? this.modelConfig.temperature;
                        genOptions.maxTokens =
                            options.maxTokens ?? this.modelConfig.maxTokens ?? 1000;
                    }

                    const result = await generateText(genOptions);
                    return result.text;
                } catch (fallbackError) {
                    // Both Helicone and native failed, throw the native error
                    const fallbackErr = fallbackError as any;
                    throw new AIProviderError(
                        'GENERATION_FAILED',
                        fallbackErr.message || 'Text generation failed',
                        this.provider,
                        fallbackError,
                    );
                }
            }

            // Either Helicone wasn't used, or it was the only attempt
            throw new AIProviderError(
                'GENERATION_FAILED',
                err.message || 'Text generation failed',
                this.provider,
                error,
            );
        }
    }
}
