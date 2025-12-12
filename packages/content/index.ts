/**
 * Content Module
 *
 * This module handles:
 * - Markdown parsing and anchor extraction (powered by Rust core)
 */

// Re-export Rust-powered markdown extraction
export {
  extractAnchors,
  validateMarkdownAnchors,
  parseCodeRef,
  type SintesiAnchor,
  type ExtractionResult,
  type CodeRefParts,
} from '../core';
