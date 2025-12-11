//! Content & Mapping module
//!
//! This module handles:
//! - File discovery (TypeScript/JavaScript and Markdown files)
//! - Markdown parsing and anchor extraction
//! - Content injection into documentation
//!
//! ## Module Structure
//!
//! - `types`: Data structures for anchors and extraction results
//! - `discovery`: File discovery functionality (source and markdown files)
//! - `extractor`: Markdown anchor extraction using pulldown-cmark

pub mod types;
pub mod discovery;
pub mod extractor;

// Re-export types
pub use types::{AnchorMap, SintesiAnchor, ExtractionResult};

// Re-export discovery
pub use discovery::{
    discover_files, DiscoveredFile, DiscoveryConfig, DiscoveryResult, DiscoveryStats,
    FileCollector,
};

// Re-export extractor
pub use extractor::{extract_anchors, MarkdownExtractor};
