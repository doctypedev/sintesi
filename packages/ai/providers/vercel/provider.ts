import {
    IAIProvider,
    AIProvider,
    DocumentationRequest,
    DocumentationResponse,
    AIModel,
    BatchDocumentationResult,
    ILogger,
    ObservabilityMetadata,
    GenerateTextOptions,
    DocumentationStructure,
} from '../../core/types';
import { generateObject, generateText } from 'ai';
import {
    BatchDocumentationStructureSchema,
    DocumentationStructureSchema,
} from '../../documentation/structured-schema';
import { buildMarkdownFromStructure } from '../../documentation/markdown-builder';
import { z } from 'zod';
import { ModelFactory } from './model-factory';
import { OptionsBuilder } from './options-builder';
import { isReasoningModel, mapToProviderError, log } from './utils';

export class VercelAIProvider implements IAIProvider {
    readonly provider: AIProvider;
    readonly #modelConfig: AIModel;
    readonly #debug: boolean;
    readonly #logger?: ILogger;
    readonly #modelFactory: ModelFactory;
    readonly #optionsBuilder: OptionsBuilder;

    constructor(config: AIModel, debug: boolean = false, logger?: ILogger) {
        this.provider = config.provider;
        this.#modelConfig = config;
        this.#debug = debug;
        this.#logger = logger;

        this.#modelFactory = new ModelFactory({
            modelConfig: config,
            debug,
            logger,
        });

        this.#optionsBuilder = new OptionsBuilder(config);
    }

    /**
     * Executes a task with Helicone observability, falling back to native model on failure
     */
    private async withHeliconeFallback<T>(
        metadata: ObservabilityMetadata | undefined,
        task: (model: any) => Promise<T>,
    ): Promise<T> {
        try {
            return await task(this.#modelFactory.getModel(metadata));
        } catch (error) {
            if (metadata && this.#modelConfig.observability?.heliconeApiKey) {
                log(
                    this.#logger,
                    this.#debug,
                    'warn',
                    'Helicone failed, retrying with native model',
                    error,
                );
                return task(this.#modelFactory.getNativeModel());
            }
            throw error;
        }
    }

    /**
     * Maps AI SDK result to DocumentationResponse
     */
    private toDocumentationResponse(
        result: any,
        doc: DocumentationStructure,
    ): DocumentationResponse {
        const usage = result.usage ?? {};
        return {
            content: buildMarkdownFromStructure(doc),
            provider: this.provider,
            modelId: this.#modelConfig.modelId,
            timestamp: Date.now(),
            usage: {
                promptTokens: usage.promptTokens ?? 0,
                completionTokens: usage.completionTokens ?? 0,
                totalTokens: usage.totalTokens ?? 0,
            },
        };
    }

    async generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse> {
        try {
            return await this.withHeliconeFallback(undefined, async (model) => {
                const options = this.#optionsBuilder.buildBaseOptions(model, request.prompt, {
                    system: request.systemPrompt,
                    schema: z.object({
                        documentation: DocumentationStructureSchema,
                    }),
                });

                const result: any = await generateObject(options as any);
                return this.toDocumentationResponse(result, result.object.documentation);
            });
        } catch (error) {
            throw mapToProviderError(error, this.provider);
        }
    }

    async generateBatchDocumentation(
        items: Array<{ symbolName: string; signatureText: string }>,
        prompt: string,
        systemPrompt: string,
    ): Promise<BatchDocumentationResult> {
        const model = this.#modelFactory.getNativeModel(); // Batch usually doesn't need Helicone retry logic here

        try {
            const options = this.#optionsBuilder.buildBaseOptions(model, prompt, {
                system: systemPrompt,
                schema: BatchDocumentationStructureSchema,
                maxTokens: this.#modelConfig.maxTokens
                    ? this.#modelConfig.maxTokens * items.length
                    : 4096,
            });

            const result: any = await generateObject(options as any);

            const success = result.object.documentations.map((doc: DocumentationStructure) => ({
                symbolName: doc.symbolName,
                content: buildMarkdownFromStructure(doc),
            }));

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
            log(this.#logger, this.#debug, 'warn', `Batch generation failed: ${err.message}`);

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
        const model = this.#modelFactory.getNativeModel();
        const reasoning = isReasoningModel(this.#modelConfig.modelId);

        try {
            const options: Record<string, any> = { model, prompt: 'Hello' };
            if (!reasoning) options.maxTokens = 5;

            await generateText(options as any);
            return true;
        } catch (error) {
            if (this.#debug) {
                log(this.#logger, this.#debug, 'error', 'Connection validation failed:', error);
            }
            return false;
        }
    }

    async generateText(
        prompt: string,
        options: GenerateTextOptions = {},
        metadata?: ObservabilityMetadata,
    ): Promise<string> {
        try {
            return await this.withHeliconeFallback(metadata, async (model) => {
                const textOptions = this.#optionsBuilder.buildTextOptions(model, prompt, options);
                const result = await generateText(textOptions as any);
                return result.text;
            });
        } catch (error) {
            throw mapToProviderError(error, this.provider);
        }
    }
}
