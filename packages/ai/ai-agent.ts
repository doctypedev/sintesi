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
} from './types';
import { VercelAIProvider } from './providers/vercel-ai-provider';
import { CodeSignature } from '../core/native-loader';
import { getDefaultModel } from './constants';

/**
 * AI Agent for generating documentation from code changes
 */
export class AIAgent {
  private provider: IAIProvider;
  private config: AIAgentConfig;
  private retryConfig: { maxAttempts: number; delayMs: number };

  constructor(config: AIAgentConfig) {
    this.config = config;
    this.retryConfig = config.retry || { maxAttempts: 3, delayMs: 1000 };

    // Initialize the appropriate provider
    this.provider = this.createProvider();
  }

  /**
   * Create provider based on configuration
   */
  private createProvider(): IAIProvider {
    const { model, debug } = this.config;

    // Use Vercel AI SDK for all supported providers
    return new VercelAIProvider(model, debug);
  }

  /**
   * Generate documentation for a code change
   */
  async generateDocumentation(
    request: DocumentationRequest,
    _options: GenerateOptions = {}
  ): Promise<DocumentationResponse> {
    this.log('Generating documentation', {
      symbol: request.symbolName,
      provider: this.provider.provider,
    });

    // TODO: Use options to customize generation (currently passed to provider)
    return this.executeWithRetry(() =>
      this.provider.generateDocumentation(request)
    );
  }

  /**
   * Generate documentation from a map entry and current signature
   */
  async generateFromDrift(
    symbolName: string,
    oldSignature: CodeSignature,
    newSignature: CodeSignature,
    oldDocumentation: string,
    filePath?: string
  ): Promise<string> {
    const request: DocumentationRequest = {
      symbolName,
      oldSignature,
      newSignature,
      oldDocumentation,
      context: filePath ? { filePath } : undefined,
    };

    const response = await this.generateDocumentation(request);
    return response.content;
  }

  /**
   * Generate documentation for a batch of symbols
   */
  async generateBatch(
    items: Array<{ symbolName: string; signatureText: string }>
  ): Promise<Array<{ symbolName: string; content: string }>> {
    this.log(`Generating batch documentation for ${items.length} items`);

    // Try batch generation if provider supports it
    if (this.provider.generateBatchDocumentation) {
        try {
            return await this.executeWithRetry(() =>
                this.provider.generateBatchDocumentation!(items)
            );
        } catch (error) {
            // Batch failed, fallback to sequential
            this.log('Batch generation failed, falling back to sequential generation', error);
        }
    }

    // Fallback: sequential generation if provider doesn't support batching or batch failed
    this.log('Using sequential generation');
    const results = [];
    for (const item of items) {
        try {
            const content = await this.generateInitial(
                item.symbolName,
                { signatureText: item.signatureText } as CodeSignature
            );
            results.push({ symbolName: item.symbolName, content });
        } catch (error) {
            // Log and continue, omitting this item
            this.log(`Failed to generate for ${item.symbolName}`, error);
        }
    }
    return results;
  }

  /**
   * Generate initial documentation for a symbol (no previous docs)
   */
  async generateInitial(
    symbolName: string,
    signature: CodeSignature,
    options: GenerateOptions = {}
  ): Promise<string> {
    // Create a simple request with just the new signature
    const request: DocumentationRequest = {
      symbolName,
      oldSignature: signature, // Use same as old for initial docs
      newSignature: signature,
      oldDocumentation: '', // No previous documentation
    };

    const response = await this.generateDocumentation(request, options);
    return response.content;
  }

  /**
   * Validate the AI provider connection
   */
  async validateConnection(): Promise<boolean> {
    this.log('Validating provider connection');

    try {
      return await this.provider.validateConnection();
    } catch (error) {
      this.log('Connection validation failed:', error);
      return false;
    }
  }

  /**
   * Execute a function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const hasAttemptsLeft = attempt < this.retryConfig.maxAttempts;

      if (isRetryable && hasAttemptsLeft) {
        this.log(`Attempt ${attempt} failed, retrying in ${this.retryConfig.delayMs}ms...`);

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
    if ((error as AIProviderError).code) {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log debug messages
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[AIAgent]', message, ...args);
    }
  }

  /**
   * Get the current provider name
   */
  getProvider(): string {
    return this.provider.provider;
  }

  /**
   * Get a summary of configuration
   */
  getConfig(): { provider: string; model: string; timeout: number } {
    return {
      provider: this.config.model.provider,
      model: this.config.model.modelId,
      timeout: this.config.timeout || 30000,
    };
  }
}

/**
 * Factory function to create an AI Agent with OpenAI
 */
export function createOpenAIAgent(
  apiKey: string,
  modelId: string = 'gpt-4',
  options: {
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    debug?: boolean;
  } = {}
): AIAgent {
  return new AIAgent({
    model: {
      provider: 'openai',
      modelId,
      apiKey,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
    },
    timeout: options.timeout,
    debug: options.debug,
  });
}

/**
 * Factory function to create an AI Agent from environment variables
 */
export function createAgentFromEnv(
  options: {
    modelId?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    debug?: boolean;
  } = {}
): AIAgent {
  // Check for supported API keys
  if (process.env.OPENAI_API_KEY) {
    return new AIAgent({
      model: {
        provider: 'openai',
        modelId: options.modelId || getDefaultModel('openai'),
        apiKey: process.env.OPENAI_API_KEY,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      },
      timeout: options.timeout,
      debug: options.debug,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    return new AIAgent({
      model: {
        provider: 'gemini',
        modelId: options.modelId || getDefaultModel('gemini'),
        apiKey: process.env.GEMINI_API_KEY,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      },
      timeout: options.timeout,
      debug: options.debug,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return new AIAgent({
      model: {
        provider: 'anthropic',
        modelId: options.modelId || 'claude-3-5-haiku-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      },
      timeout: options.timeout,
      debug: options.debug,
    });
  }

  if (process.env.MISTRAL_API_KEY) {
    return new AIAgent({
      model: {
        provider: 'mistral',
        modelId: options.modelId || 'ministral-8b-latest',
        apiKey: process.env.MISTRAL_API_KEY,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
      },
      timeout: options.timeout,
      debug: options.debug,
    });
  }

  throw new Error(
    'No API key found. Please set OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, or MISTRAL_API_KEY environment variable.'
  );
}
