//! Content NAPI bindings
//!
//! Node.js bindings for file discovery and markdown extraction.

use napi_derive::napi;

use crate::content::discovery::{
    discover_files as discover_files_internal, DiscoveryConfig,
};
use crate::content::extractor::MarkdownExtractor as MarkdownExtractorInternal;

/// NAPI-compatible result structure for file discovery
#[napi(object)]
pub struct FileDiscoveryResult {
    /// List of markdown file paths found
    pub markdown_files: Vec<String>,
    /// List of source file paths found
    pub source_files: Vec<String>,
    /// Total number of files found
    pub total_files: u32,
    /// Number of errors encountered
    pub errors: u32,
}

/// NAPI-compatible options for file discovery
#[napi(object)]
pub struct FileDiscoveryOptions {
    /// Respect .gitignore rules (default: true)
    pub respect_gitignore: Option<bool>,
    /// Include hidden files (default: false)
    pub include_hidden: Option<bool>,
    /// Maximum depth to traverse (default: unlimited)
    pub max_depth: Option<u32>,
}

/// Discover files in a directory (NAPI binding for Node.js)
///
/// Scans the given directory and returns all markdown and source files found.
/// Respects .gitignore by default.
///
/// # Arguments
/// * `root_path` - The root directory to scan
/// * `options` - Optional configuration for the discovery process
///
/// # Example (Node.js)
/// ```javascript
/// const { discoverFiles } = require('@sintesi/core');
///
/// const result = discoverFiles('./src', {
///   respectGitignore: true,
///   includeHidden: false,
///   maxDepth: 5
/// });
///
/// console.log('Found', result.markdownFiles.length, 'markdown files');
/// console.log('Found', result.sourceFiles.length, 'source files');
/// console.log('Total:', result.totalFiles);
/// ```
#[napi]
pub fn discover_files(
    root_path: String,
    options: Option<FileDiscoveryOptions>,
) -> FileDiscoveryResult {
    // Build Rust configuration from NAPI options
    let mut config = DiscoveryConfig::new();

    if let Some(opts) = options {
        if let Some(respect_gitignore) = opts.respect_gitignore {
            config = config.respect_gitignore(respect_gitignore);
        }
        if let Some(include_hidden) = opts.include_hidden {
            config = config.include_hidden(include_hidden);
        }
        if let Some(max_depth) = opts.max_depth {
            config = config.max_depth(max_depth as usize);
        }
    }

    // Call the pure Rust function
    let result = discover_files_internal(root_path, config);

    // Convert PathBuf to String for NAPI
    let markdown_files: Vec<String> = result
        .markdown_files
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect();

    let source_files: Vec<String> = result
        .source_files
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect();

    let total_files = (markdown_files.len() + source_files.len()) as u32;

    // Return NAPI-compatible result
    FileDiscoveryResult {
        markdown_files,
        source_files,
        total_files,
        errors: result.stats.errors as u32,
    }
}

// ============================================================================
// Markdown Extraction NAPI Bindings
// ============================================================================

/// NAPI-compatible Sintesi anchor structure
#[napi(object)]
#[derive(Debug, Clone)]
pub struct SintesiAnchor {
    /// Unique anchor ID
    pub id: String,
    /// Code reference (e.g., "src/auth.ts#login")
    pub code_ref: Option<String>,
    /// File path where anchor was found
    pub file_path: String,
    /// Start line number (0-indexed)
    pub start_line: u32,
    /// End line number (0-indexed)
    pub end_line: u32,
    /// Content between anchor tags
    pub content: String,
}

/// NAPI-compatible extraction result
#[napi(object)]
pub struct ExtractionResult {
    /// Map of anchor ID to anchor data (as a flat array for NAPI compatibility)
    pub anchors: Vec<SintesiAnchor>,
    /// Number of anchors found
    pub anchor_count: u32,
    /// Errors encountered during extraction
    pub errors: Vec<String>,
}

/// Extract Sintesi anchors from markdown content
///
/// # Arguments
/// * `file_path` - Path to the markdown file (for reference)
/// * `content` - Markdown content to parse
///
/// # Returns
/// ExtractionResult with all found anchors and any errors
///
/// # Example (Node.js)
/// ```javascript
/// const { extractAnchors } = require('@sintesi/core');
///
/// const content = fs.readFileSync('docs/api.md', 'utf-8');
/// const result = extractAnchors('docs/api.md', content);
///
/// console.log('Found', result.anchorCount, 'anchors');
///
/// for (const anchor of result.anchors) {
///   console.log('Anchor:', anchor.id);
///   console.log('  Code ref:', anchor.codeRef);
///   console.log('  Lines:', anchor.startLine, '-', anchor.endLine);
/// }
///
/// if (result.errors.length > 0) {
///   console.error('Errors:', result.errors);
/// }
/// ```
#[napi]
pub fn extract_anchors(file_path: String, content: String) -> ExtractionResult {
    let extractor = MarkdownExtractorInternal::new();
    let result = extractor.extract_from_file(&file_path, &content);

    // Convert HashMap to Vec for NAPI
    let anchors: Vec<SintesiAnchor> = result
        .anchors
        .into_iter()
        .map(|(_, anchor)| SintesiAnchor {
            id: anchor.id,
            code_ref: anchor.code_ref,
            file_path: anchor.file_path.to_string_lossy().to_string(),
            start_line: anchor.start_line as u32,
            end_line: anchor.end_line as u32,
            content: anchor.content,
        })
        .collect();

    ExtractionResult {
        anchor_count: result.anchor_count as u32,
        anchors,
        errors: result.errors,
    }
}

/// Validate markdown content for Sintesi anchors
///
/// This performs validation without extracting content, making it faster
/// for checking if markdown is valid.
///
/// # Arguments
/// * `content` - Markdown content to validate
///
/// # Returns
/// Array of validation error messages, empty if valid
///
/// # Example (Node.js)
/// ```javascript
/// const { validateMarkdownAnchors } = require('@sintesi/core');
///
/// const content = fs.readFileSync('docs/api.md', 'utf-8');
/// const errors = validateMarkdownAnchors(content);
///
/// if (errors.length === 0) {
///   console.log('✓ All anchors are valid');
/// } else {
///   console.error('⚠ Validation errors:');
///   errors.forEach(err => console.error('  -', err));
/// }
/// ```
#[napi]
pub fn validate_markdown_anchors(content: String) -> Vec<String> {
    let extractor = MarkdownExtractorInternal::new();
    extractor.validate(&content)
}

/// Parse a code_ref string into file path and symbol name
///
/// # Arguments
/// * `code_ref` - Code reference string (format: "file_path#symbol_name")
///
/// # Returns
/// Object with filePath and symbolName properties
///
/// # Throws
/// Error if the code_ref format is invalid
///
/// # Example (Node.js)
/// ```javascript
/// const { parseCodeRef } = require('@sintesi/core');
///
/// const { filePath, symbolName } = parseCodeRef('src/auth.ts#login');
/// console.log('File:', filePath);    // "src/auth.ts"
/// console.log('Symbol:', symbolName); // "login"
/// ```
#[napi(object)]
pub struct CodeRefParts {
    pub file_path: String,
    pub symbol_name: String,
}

#[napi]
pub fn parse_code_ref(code_ref: String) -> napi::Result<CodeRefParts> {
    let extractor = MarkdownExtractorInternal::new();

    match extractor.parse_code_ref(&code_ref) {
        Ok((file_path, symbol_name)) => Ok(CodeRefParts {
            file_path,
            symbol_name,
        }),
        Err(err) => Err(napi::Error::from_reason(err)),
    }
}