/**
 * Type definitions for AI Agent module
 */

import { CodeSignature } from '@sintesi/core';
import { ILogger } from '@sintesi/shared';
export { ILogger };

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'mistral';

/**
 * AI model configuration
 */
export interface AIModel {
    /** Provider name (openai, gemini) */
    provider: AIProvider;

    /** Model identifier (e.g., 'gpt-4', 'gemini-1.5-pro') */
    modelId: string;

    /** API key for authentication */
    apiKey: string;

    /** Maximum tokens to generate */
    maxTokens?: number;

    /** Temperature for response randomness (0-1) */
    temperature?: number;

    /** API endpoint (optional, for custom endpoints) */
    endpoint?: string;
}

/**
 * Configuration for a specific AI Agent role (e.g., planner, writer)
 */
export interface AIAgentRoleConfig {
    /** Model ID (e.g., 'gpt-4o', 'gemini-1.5-flash', 'o3-mini') */
    modelId: string;
    /** Provider name (e.g., 'openai', 'gemini') */
    provider?: AIProvider; // Optional, can be inferred from env if not set
    /** Override default maxTokens for this role */
    maxTokens?: number;
    /** Override default temperature for this role */
    temperature?: number;
}

/**
 * Request to generate documentation
 */
export interface DocumentationRequest {
    /** Symbol name being documented */
    symbolName: string;

    /** Previous code signature (before change) */
    oldSignature: CodeSignature;

    /** Current code signature (after change) */
    newSignature: CodeSignature;

    /** Previous documentation content */
    oldDocumentation: string;

    /** Additional context (optional) */
    context?: {
        /** File path of the code */
        filePath?: string;

        /** Surrounding code context */
        surroundingCode?: string;

        /** Related symbols */
        relatedSymbols?: string[];
    };

    /** The prompt to use for generation */
    prompt: string;

    /** The system prompt to use */
    systemPrompt: string;
}

/**
 * Response from AI provider
 */
export interface DocumentationResponse {
    /** Generated documentation content */
    content: string;

    /** Provider that generated the response */
    provider: AIProvider;

    /** Model used */
    modelId: string;

    /** Usage statistics */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };

    /** Generation timestamp */
    timestamp: number;
}

/**
 * Error from AI provider
 */
export class AIProviderError extends Error {
    /** Error code */
    code: string;

    /** Provider name */
    provider: AIProvider;

    /** Original error (if available) */
    originalError?: unknown;

    constructor(code: string, message: string, provider: AIProvider, originalError?: unknown) {
        super(message);
        this.name = 'AIProviderError';
        this.code = code;
        this.provider = provider;
        this.originalError = originalError;
    }
}

/**
 * Configuration for AI Agent
 */
export interface AIAgentConfig {
    /** AI model configuration */
    model: AIModel;

    /** Enable debug logging */
    debug?: boolean;

    /** Timeout in milliseconds */
    timeout?: number;

    /** Retry configuration */
    retry?: {
        maxAttempts: number;
        delayMs: number;
    };

    /** Logger instance */
    logger?: ILogger;
}

/**
 * Abstract base class for AI providers
 */
export interface IAIProvider {
    /** Provider name */
    readonly provider: AIProvider;

    /**
     * Generate documentation for a code change
     */
    generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse>;

    /**
     * Generate documentation for multiple symbols in batch (optional)
     * If not implemented, falls back to sequential generation
     *
     * Returns partial results: successfully generated docs + failures with errors
     * This prevents wasting tokens when only a few items fail validation
     */
    generateBatchDocumentation?(
        items: Array<{ symbolName: string; signatureText: string }>,
        prompt: string,
        systemPrompt: string,
    ): Promise<BatchDocumentationResult>;

    /**
     * Validate API key and connection
     */
    validateConnection(): Promise<boolean>;

    /**
     * Generate generic text from a prompt
     * @param prompt The user prompt
     * @param options Optional configuration
     * @param metadata Optional observability metadata for tracking
     */
    generateText?(
        prompt: string,
        options?: GenerateTextOptions,
        metadata?: ObservabilityMetadata,
    ): Promise<string>;
}

/**
 * Options for text generation
 */
export interface GenerateTextOptions {
    temperature?: number;
    maxTokens?: number;
    /** Vercel AI SDK Tools (Record<string, CoreTool>) */
    tools?: Record<string, unknown>;
    /** Maximum number of tool roundtrips */
    maxSteps?: number;
}

/**
 * Result of batch documentation generation with partial success support
 */
export interface BatchDocumentationResult {
    /** Successfully generated and validated documentations */
    success: Array<{
        symbolName: string;
        content: string;
    }>;

    /** Failed items with validation errors */
    failures: Array<{
        symbolName: string;
        errors: string[];
        /** The original AI-generated content before sanitization (for debugging) */
        originalContent?: string;
    }>;

    /** Overall statistics */
    stats: {
        total: number;
        succeeded: number;
        failed: number;
    };
}

/**
 * Observability metadata for tracking AI requests
 * Used by Helicone to group requests, track costs, and analyze usage patterns
 */
export interface ObservabilityMetadata {
    /** Session ID to group related requests */
    sessionId?: string;

    /** Human-readable session name */
    sessionName?: string;

    /** User identifier (e.g., git email, project name) */
    userId?: string;

    /** Agent role performing the request */
    agentRole?: 'planner' | 'writer' | 'researcher' | 'reviewer';

    /** Custom properties for filtering and analysis */
    properties?: Record<string, string | number | boolean>;

    /** Tags for categorization */
    tags?: string[];
}

/**
 * Options for generating documentation
 */
export interface GenerateOptions {
    /** Include code context */
    includeContext?: boolean;

    /** Include usage examples */
    includeExamples?: boolean;

    /** Maximum length of documentation */
    maxLength?: number;

    /** Documentation style (concise, detailed, tutorial) */
    style?: 'concise' | 'detailed' | 'tutorial';

    /** Observability metadata for tracking */
    metadata?: ObservabilityMetadata;
}
