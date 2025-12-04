/**
 * Core module exports
 *
 * This module exports both TypeScript implementations and Rust native bindings.
 */

// TypeScript implementations
export { ASTAnalyzer } from './ast-analyzer';
export { SignatureHasher } from './signature-hasher';

// Rust native bindings (loaded via platform-specific package)
export {
  SymbolType,
  discoverFiles,
  helloWorld,
  getVersion,
  // Markdown extraction (Rust-powered)
  extractAnchors,
  validateMarkdownAnchors,
  parseCodeRef,
} from './native-loader';

export type {
  CodeRef,
  CodeSignature,
  SignatureHash,
  DocRef,
  DoctypeMapEntry,
  DoctypeMap,
  FileDiscoveryResult,
  FileDiscoveryOptions,
  SymbolTypeValue,
  // Markdown extraction types
  DoctypeAnchor,
  ExtractionResult,
  CodeRefParts,
} from './native-loader';
