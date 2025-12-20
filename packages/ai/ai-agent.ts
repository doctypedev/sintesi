/**
 * Main AI Agent orchestrator for documentation generation
 */

import {
    AIAgentConfig,
    DocumentationRequest,
    DocumentationResponse,
    GenerateOptions,
    GenerateTextOptions,
    IAIProvider,
    AIProviderError,
    AIProvider,
    ILogger,
    ObservabilityMetadata,
} from './types';
import { VercelAIProvider } from './providers/vercel';
import { ConfigLoader } from './config-loader';

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
    private role?: string;

    constructor(config: AIAgentConfig, role?: string) {
        this.config = config;
        this.retryConfig = config.retry || { maxAttempts: 3, delayMs: 1000 };
        this.logger = config.logger;
        this.role = role;

        // Initialize the appropriate provider
        this.provider = new VercelAIProvider(config.model, config.debug, this.logger);
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

        return this.executeWithRetry(() => this.provider.generateDocumentation(request));
    }

    /**
     * Generate generic text using the AI provider
     */
    async generateText(
        prompt: string,
        options: GenerateTextOptions = {},
        metadata?: ObservabilityMetadata,
    ): Promise<string> {
        this.log('Generating text', {
            promptLength: prompt.length,
            model: this.config.model.modelId,
        });

        const mergedMetadata: ObservabilityMetadata = {
            ...metadata,
            agentRole: (this.role as any) || metadata?.agentRole,
            tags: [...(metadata?.tags || []), ...(this.role ? [`agent-${this.role}`] : [])],
        };

        if (this.provider.generateText) {
            return this.executeWithRetry(() =>
                this.provider.generateText!(prompt, options, mergedMetadata),
            );
        }

        throw new Error(`Provider ${this.config.model.provider} does not support text generation`);
    }

    /**
     * Validate the AI provider connection
     */
    async validateConnection(): Promise<boolean> {
        this.log('Validating provider connection for model: ' + this.config.model.modelId);

        try {
            return await this.provider.validateConnection();
        } catch (error: unknown) {
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
            const isRetryable = this.isRetryableError(error);
            const hasAttemptsLeft = attempt < this.retryConfig.maxAttempts;

            if (isRetryable && hasAttemptsLeft) {
                this.log(`Attempt ${attempt} failed, retrying in ${this.retryConfig.delayMs}ms...`);

                await new Promise((resolve) => setTimeout(resolve, this.retryConfig.delayMs));
                return this.executeWithRetry(fn, attempt + 1);
            }

            throw error;
        }
    }

    private isRetryableError(error: unknown): boolean {
        if (error instanceof AIProviderError) {
            return ['TIMEOUT', 'RATE_LIMIT', 'NETWORK_ERROR'].includes(error.code);
        }
        return false;
    }

    private log(message: string, ...args: unknown[]): void {
        if (this.config.debug) {
            const prefix = `[AIAgent${this.role ? `:${this.role}` : ''}]`;
            if (this.logger) {
                this.logger.debug(`${prefix} ${message}`, ...args);
            } else {
                console.log(prefix, message, ...args);
            }
        }
    }

    getProvider(): AIProvider {
        return this.config.model.provider;
    }

    getModelId(): string {
        return this.config.model.modelId;
    }
}

/**
 * Orchestrator factory to create agents from environment
 */
export function createAIAgentsFromEnv(
    options: {
        debug?: boolean;
        timeout?: number;
        logger?: ILogger;
    } = {},
): AIAgents {
    const config = ConfigLoader.loadFromEnv();
    const agents: Partial<AIAgents> = {};

    for (const [role, modelConfig] of Object.entries(config.roles)) {
        const agentConfig: AIAgentConfig = {
            model: modelConfig,
            debug: options.debug,
            timeout: options.timeout,
            logger: options.logger,
        };

        (agents as any)[role] = new AIAgent(agentConfig, role);

        if (options.logger) {
            options.logger.debug(
                `[AIAgentManager] ${role} initialized with ${modelConfig.modelId} (${modelConfig.provider})`,
            );
        }
    }

    return agents as AIAgents;
}
