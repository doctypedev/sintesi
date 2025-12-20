import { AIProvider, AIProviderError, ILogger, AIErrorCode } from '../../types';

/**
 * Check if the model is a reasoning model (like OpenAI o1/o3)
 */
export function isReasoningModel(modelId: string): boolean {
    return /^o[13]-/.test(modelId);
}

/**
 * Maps common AI SDK errors to internal AIProviderError
 */
export function mapToProviderError(
    error: any,
    provider: AIProvider,
    fallbackCode: AIErrorCode = 'GENERATION_FAILED',
) {
    if (error?.name === 'APICallError' && error.statusCode === 429) {
        return new AIProviderError('RATE_LIMIT', error.message, provider, error);
    }

    return new AIProviderError(fallbackCode, error?.message ?? 'Unknown error', provider, error);
}

/**
 * Helper to log messages using the provided logger or falling back to console
 */
export function log(
    logger: ILogger | undefined,
    debug: boolean,
    level: 'info' | 'warn' | 'debug' | 'error',
    message: string,
    error?: unknown,
) {
    const loggerFn = logger?.[level];

    if (loggerFn) {
        error ? loggerFn.call(logger, message, error) : loggerFn.call(logger, message);
        return;
    }

    // Fallback if no logger provided or method missing
    if (debug || level !== 'debug') {
        const consoleFn = console[level === 'debug' ? 'log' : level] || console.log;
        error ? consoleFn(message, error) : consoleFn(message);
    }
}
