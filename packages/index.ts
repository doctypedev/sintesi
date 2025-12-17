/**
 * Sintesi - The Self-Maintaining Documentation System
 *
 * Main entry point for the Sintesi library
 */

// Core AST & Drift Detection
export { ASTAnalyzer, SymbolType, discoverFiles, helloWorld, getVersion } from './core';

export type {
    CodeRef,
    CodeSignature,
    SignatureHash,
    DocRef,
    SintesiMapEntry,
    SintesiMap,
    FileDiscoveryResult,
    FileDiscoveryOptions,
} from './core';

// Content & Mapping (Markdown extraction powered by Rust)
export {
    extractAnchors,
    validateMarkdownAnchors,
    parseCodeRef,
    SintesiMapManager,
    ContentInjector,
} from './content';
export type { SintesiAnchor, ExtractionResult, CodeRefParts, InjectionResult } from './content';

// Gen AI Agent
export { AIAgent, createOpenAIAgent, createAgentFromEnv, PromptBuilder } from './ai';
export type {
    AIProvider,
    AIModel,
    AIAgentConfig,
    DocumentationRequest,
    DocumentationResponse,
    GenerateOptions,
    IAIProvider,
    AIProviderError,
} from './ai';
