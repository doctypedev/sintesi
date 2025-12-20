/**
 * AI Provider Constants
 */

import { AIProvider } from './types';

/**
 * Default model IDs for each provider
 * These are cost-effective models suitable for documentation generation
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
    openai: 'gpt-5-mini',
    gemini: 'gemini-1.5-flash-8b',
    anthropic: 'claude-3-5-haiku-20241022',
    mistral: 'mistral-small-latest',
} as const;

/**
 * Default temperatures for different agent roles
 */
export const DEFAULT_TEMPERATURES = {
    planner: 0.2,
    researcher: 0.3,
    writer: 0.7,
    reviewer: 0.1,
} as const;

/**
 * Get the default model ID for a given provider
 */
export function getDefaultModel(provider: AIProvider): string {
    return DEFAULT_MODELS[provider];
}
