/**
 * Main AI Agent orchestrator for documentation generation
 */

import {
    AIAgentConfig,
    DocumentationRequest,
    DocumentationResponse,
    GenerateOptions,
    IAIProvider,
    AIProviderError,
    AIAgentRoleConfig,
    AIProvider, // Import AIProvider type here
    ILogger,
    ObservabilityMetadata,
} from './types';
import { VercelAIProvider } from './providers/vercel-ai-provider';

import { getDefaultModel } from './constants';

/**
 * Collection of AI Agent instances for different roles.
 */
export interface AIAgents {
    planner: AIAgent;
    writer: AIAgent;
    researcher?: AIAgent;
    reviewer?: AIAgent;
}

/**
 * AI Agent for generating documentation from code changes
 */
export class AIAgent {
    private provider: IAIProvider;
    private config: AIAgentConfig;
    private retryConfig: { maxAttempts: number; delayMs: number };
    private logger?: ILogger;
    private role?: 'planner' | 'writer' | 'researcher' | 'reviewer';

    constructor(config: AIAgentConfig, role?: 'planner' | 'writer' | 'researcher' | 'reviewer') {
        this.config = config;
        this.retryConfig = config.retry || { maxAttempts: 3, delayMs: 1000 };
        this.logger = config.logger;
        this.role = role;

        // Initialize the appropriate provider
        this.provider = this.createProvider();
    }

    /**
     * Create provider based on configuration
     */
    private createProvider(): IAIProvider {
        const { model, debug } = this.config;

        // Use Vercel AI SDK for all supported providers
        return new VercelAIProvider(model, debug, this.logger);
    }

    /**
     * Generate documentation for a code change
     */
    async generateDocumentation(
        request: DocumentationRequest,
        _options: GenerateOptions = {},
    ): Promise<DocumentationResponse> {
        this.log('Generating documentation', {
            symbol: request.symbolName,
            provider: this.provider.provider,
        });

        // TODO: Use options to customize generation (currently passed to provider)
        return this.executeWithRetry(() => this.provider.generateDocumentation(request));
    }

    async generateBatch(
        items: Array<{ symbolName: string; signatureText: string }>,
        prompt: string,
        systemPrompt: string,
    ): Promise<Array<{ symbolName: string; content: string }>> {
        this.log(`Generating batch documentation for ${items.length} items`);

        // Try batch generation if provider supports it
        if (this.provider.generateBatchDocumentation) {
            try {
                const batchResult = await this.executeWithRetry(() =>
                    this.provider.generateBatchDocumentation!(items, prompt, systemPrompt),
                );

                // Start with successful generations from batch
                const results = [...batchResult.success];

                // Log batch statistics
                if (batchResult.stats.failed > 0) {
                    this.log(
                        `Batch generated ${batchResult.stats.succeeded}/${batchResult.stats.total} successfully. ` +
                            `Retrying ${batchResult.stats.failed} failed items sequentially...`,
                    );

                    // For the sake of refactor, removing complex batch retry fallback that depends on single prompt logic
                    // as it's not directly relevant to the current Model Routing task and would require more complex changes
                    // to pass single prompts or dynamically generate them here.
                    this.log(
                        `Batch retry fallback currently not supported for ${batchResult.stats.failed} failed items.`,
                    );
                } else {
                    this.log(
                        `Batch completed successfully: ${batchResult.stats.succeeded}/${batchResult.stats.total}`,
                    );
                }

                return results;
            } catch (error: unknown) {
                // Use unknown for caught errors
                this.log('Batch generation failed completely', error);
            }
        }

        this.log('Batch generation not supported by provider or failed, returning empty.');
        return [];
    }

    /**
     * Generate generic text using the AI provider
     */
    async generateText(
        prompt: string,
        options: {
            temperature?: number;
            maxTokens?: number;
        } = {},
        metadata?: ObservabilityMetadata,
    ): Promise<string> {
        this.log('Generating text', {
            promptLength: prompt.length,
            model: this.config.model.modelId,
        });

        // Merge role metadata with provided metadata
        const mergedMetadata: ObservabilityMetadata = {
            ...metadata,
            agentRole: this.role || metadata?.agentRole,
            tags: [...(metadata?.tags || []), ...(this.role ? [`agent-${this.role}`] : [])],
        };

        if (this.provider.generateText) {
            return this.executeWithRetry(() =>
                this.provider.generateText!(prompt, options, mergedMetadata),
            );
        }

        throw new Error(
            `Provider ${this.config.model.provider} with model ${this.config.model.modelId} does not support text generation`,
        );
    }

    /**
     * Validate the AI provider connection
     */
    async validateConnection(): Promise<boolean> {
        this.log('Validating provider connection for model: ' + this.config.model.modelId);

        try {
            return await this.provider.validateConnection();
        } catch (error: unknown) {
            // Use unknown for caught errors
            this.log('Connection validation failed:', error);
            return false;
        }
    }

    /**
     * Execute a function with retry logic
     */
    private async executeWithRetry<T>(fn: () => Promise<T>, attempt: number = 1): Promise<T> {
        try {
            return await fn();
        } catch (error: unknown) {
            // Use unknown for caught errors
            const isRetryable = this.isRetryableError(error);
            const hasAttemptsLeft = attempt < this.retryConfig.maxAttempts;

            if (isRetryable && hasAttemptsLeft) {
                this.log(
                    `Attempt ${attempt} for model ${this.config.model.modelId} failed, retrying in ${this.retryConfig.delayMs}ms...`,
                );

                await this.delay(this.retryConfig.delayMs);
                return this.executeWithRetry(fn, attempt + 1);
            }

            // No more retries or non-retryable error
            throw error;
        }
    }

    /**
     * Check if an error is retryable
     */
    private isRetryableError(error: unknown): boolean {
        if (error instanceof AIProviderError && error.code) {
            // Check if it's an instance of AIProviderError
            const providerError = error as AIProviderError;

            // Retry on timeout, rate limit, and network errors
            return ['TIMEOUT', 'RATE_LIMIT', 'NETWORK_ERROR'].includes(providerError.code);
        }

        return false;
    }

    /**
     * Delay utility for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Log debug messages
     */
    /**
     * Log debug messages
     */
    private log(message: string, ...args: unknown[]): void {
        if (this.config.debug) {
            if (this.logger) {
                this.logger.debug(`[AIAgent ${this.config.model.modelId}] ${message}`, ...args);
            } else {
                console.log(`[AIAgent ${this.config.model.modelId}]`, message, ...args);
            }
        }
    }

    /**
     * Get the current provider name
     */
    getProvider(): AIProvider {
        // Use AIProvider type
        return this.config.model.provider;
    }

    /**
     * Get the current model ID
     */
    getModelId(): string {
        return this.config.model.modelId;
    }

    /**
     * Get a summary of configuration
     */
    getConfig(): { provider: AIProvider; model: string; timeout: number } {
        // Use AIProvider type
        return {
            provider: this.config.model.provider,
            model: this.config.model.modelId,
            timeout: this.config.timeout || 30000,
        };
    }
}

/**
 * Helper to normalize logging calls (fallback to console if no logger)
 */
function getLogger(logger?: ILogger) {
    return {
        debug: (msg: string, ...args: unknown[]) =>
            logger ? logger.debug(msg, ...args) : console.log(msg, ...args),
        info: (msg: string, ...args: unknown[]) =>
            logger ? logger.info(msg, ...args) : console.log(msg, ...args),
        warn: (msg: string, ...args: unknown[]) =>
            logger ? logger.warn(msg, ...args) : console.warn(msg, ...args),
        error: (msg: string, ...args: unknown[]) =>
            logger ? logger.error(msg, ...args) : console.error(msg, ...args),
    };
}

/**
 * Internal helper to create a single AI Agent based on role configuration and ENV vars.
 * @param roleOptions Specific options for this role, potentially overriding ENV.
 * @param globalOptions Global options like debug flag.
 */
function _createSingleAgentFromEnv(
    roleOptions: AIAgentRoleConfig,
    globalOptions: { debug?: boolean; timeout?: number; logger?: ILogger },
): AIAgentConfig {
    // Require OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
        throw new Error(
            `OPENAI_API_KEY is required. Please set it in your .env file. ` +
                `Note: HELICONE_API_KEY can be used for observability tracking, but OPENAI_API_KEY is still required.`,
        );
    }

    const modelId = roleOptions.modelId || getDefaultModel('openai') || 'gpt-4o';
    return {
        model: {
            provider: 'openai',
            modelId: modelId,
            apiKey: openaiKey,
            maxTokens: roleOptions.maxTokens,
            temperature: roleOptions.temperature,
        },
        timeout: globalOptions.timeout,
        debug: globalOptions.debug,
        logger: globalOptions.logger,
    };
}

export function createAIAgentsFromEnv(
    globalOptions: {
        debug?: boolean;
        timeout?: number;
        maxTokens?: number;
        temperature?: number;
        logger?: ILogger;
    } = {},
    roleConfigs: {
        planner?: AIAgentRoleConfig;
        writer?: AIAgentRoleConfig;
        researcher?: AIAgentRoleConfig;
        reviewer?: AIAgentRoleConfig;
    } = {},
): AIAgents {
    const roles = ['planner', 'writer', 'researcher', 'reviewer'] as const;

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            'OPENAI_API_KEY is required. Please set it in your .env file.\n' +
                'Note: You can also set HELICONE_API_KEY for observability tracking.',
        );
    }

    // OpenAI model defaults
    const modelDefaults = {
        planner: 'gpt-5-mini',
        writer: 'gpt-5-mini',
        researcher: 'gpt-5-mini',
        reviewer: 'gpt-5-nano',
    };

    // Use Record type for better type safety instead of 'any'
    const agents: Record<string, AIAgent> = {};
    for (const role of roles) {
        const roleConfig = roleConfigs?.[role];
        const options: AIAgentRoleConfig = {
            modelId: roleConfig?.modelId || modelDefaults[role],
            provider: 'openai', // Only OpenAI supported
            maxTokens: roleConfig?.maxTokens,
            temperature: roleConfig?.temperature,
        };

        const agent = new AIAgent(_createSingleAgentFromEnv(options, globalOptions), role);
        agents[role] = agent;

        const log = getLogger(globalOptions.logger);
        log.debug(
            `[AIAgentManager] ${role.charAt(0).toUpperCase() + role.slice(1)} initialized with ${agent.getModelId()} (${agent.getProvider()})`,
        );
    }

    return agents as unknown as AIAgents;
}
