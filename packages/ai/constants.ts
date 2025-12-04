/**
 * AI Provider Constants
 */

import { AIProvider } from './types';

/**
 * Default model IDs for each provider
 * These are cost-effective models suitable for documentation generation
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash-8b',
  anthropic: 'claude-3-5-haiku-20241022',
  mistral: 'mistral-small-latest',
} as const;

/**
 * Get the default model ID for a given provider
 */
export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider];
}
