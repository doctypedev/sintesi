import { IAIProvider, AIProvider, DocumentationRequest, DocumentationResponse, AIModel, AIProviderError } from '../types';
import { generateText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { PromptBuilder } from '../prompt-builder';
import { z } from 'zod';

export class VercelAIProvider implements IAIProvider {
  readonly provider: AIProvider;
  private modelConfig: AIModel;
  private debug: boolean;

  constructor(config: AIModel, debug: boolean = false) {
    this.provider = config.provider;
    this.modelConfig = config;
    this.debug = debug;
  }

  private getModel() {
    switch (this.provider) {
      case 'openai': {
        // Use createOpenAI for explicit configuration without env vars
        const provider = createOpenAI({
          apiKey: this.modelConfig.apiKey,
          baseURL: this.modelConfig.endpoint, // Custom endpoint if provided
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

  async generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse> {
    const model = this.getModel();
    
    // Use PromptBuilder to construct the prompt
    let prompt: string;
    
    // Check if this is an update or initial generation
    // We consider it initial if there's no old documentation provided
    // (This logic aligns with how PromptBuilder distinguishes use cases)
    if (!request.oldDocumentation) {
        prompt = PromptBuilder.buildInitialPrompt(
            request.symbolName,
            request.newSignature.signatureText,
            { includeExamples: true } // Default options, could be passed in
        );
    } else {
        prompt = PromptBuilder.buildUserPrompt(request, { includeExamples: true });
    }

    const systemPrompt = PromptBuilder.buildSystemPrompt();

    try {
      const options: any = {
        model,
        prompt,
        system: systemPrompt,
      };
      
      if (this.modelConfig.maxTokens) {
        options.maxTokens = this.modelConfig.maxTokens;
      }
      
      if (this.modelConfig.temperature !== undefined) {
        options.temperature = this.modelConfig.temperature;
      }

      const { text, usage } = await generateText(options);
      const usageAny = usage as any;

      // Sanitize output: convert any accidental headers to bold text to preserve document structure
      // e.g. "## Usage" -> "**Usage**"
      const sanitizedText = text.replace(/^#+\s+(.*)$/gm, '**$1**');

      return {
        content: sanitizedText,
        provider: this.provider,
        modelId: this.modelConfig.modelId,
        timestamp: Date.now(),
        usage: usage ? {
          promptTokens: usageAny.promptTokens || 0,
          completionTokens: usageAny.completionTokens || 0,
          totalTokens: usageAny.totalTokens || 0,
        } : undefined,
      };
    } catch (error) {
      const err = error as any;
      const providerError: AIProviderError = {
        code: 'GENERATION_FAILED',
        message: err.message || 'Unknown error during generation',
        provider: this.provider,
        originalError: error,
      };
      
      // Map common error codes if possible
      if (err.name === 'APICallError' && err.statusCode === 429) {
          providerError.code = 'RATE_LIMIT';
      }

      throw providerError;
    }
  }

  async generateBatchDocumentation(
    items: Array<{ symbolName: string; signatureText: string }>
  ): Promise<Array<{ symbolName: string; content: string }>> {
    const model = this.getModel();
    const prompt = PromptBuilder.buildBatchPrompt(items);
    const systemPrompt = PromptBuilder.buildSystemPrompt();

    try {
      const options: any = {
        model,
        prompt,
        system: systemPrompt,
        schema: z.object({
          documentations: z.array(
            z.object({
              symbolName: z.string(),
              content: z.string(),
            })
          ),
        }),
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

      return result.object.documentations.map((doc: any) => ({
        symbolName: doc.symbolName,
        // Sanitize output: convert any accidental headers to bold text
        content: doc.content.replace(/^#+\s+(.*)$/gm, '**$1**'),
      }));
    } catch (error) {
        const err = error as any;
        // Just log and rethrow, let the caller handle fallback
        // If batch fails, caller might fallback to individual or just fail
        console.warn('Batch generation failed:', err.message);
        throw error; 
    }
  }

  async validateConnection(): Promise<boolean> {
    const model = this.getModel();
    try {
      // Simple ping to validate key
      const options: any = {
        model,
        prompt: 'Hello',
        maxTokens: 5,
      };
      await generateText(options);
      return true;
    } catch (error) {
      if (this.debug) {
        console.error('Connection validation failed:', error);
      }
      return false;
    }
  }
}
