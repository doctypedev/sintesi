//! Markdown anchor extraction module
//! 
//! This module processes Markdown files to extract Sintesi anchor tags using
//! pulldown-cmark, a proper Markdown parser that understands the document structure.
//! 
//! ## Anchor Format
//! 
//! Sintesi anchors are defined using HTML comments in markdown:
//! 
//! ```markdown
//! <!-- sintesi:start id="uuid" code_ref="src/file.ts#SymbolName" -->
//! Documentation content goes here...
//! <!-- sintesi:end id="uuid" -->
//! ```
//! 
//! ## Implementation Notes
//! 
//! This implementation uses pulldown-cmark's event-based parser:
//! - Understands Markdown structure (avoids false positives in code blocks)
//! - Line numbers are 0-indexed for TypeScript compatibility
//! - Content extraction excludes anchor lines
//! - Comprehensive validation (duplicate IDs, nested anchors, code_ref format)

use pulldown_cmark::{Event, Parser};
use regex::Regex;
use std::collections::{HashMap, HashSet};
use std::path::Path;

// Import types from the content/types module
use super::types::{SintesiAnchor, ExtractionResult};

/// Markdown extractor that finds Sintesi anchors using pulldown-cmark
pub struct MarkdownExtractor {
    // No regex needed - we parse proper Markdown AST
}

impl MarkdownExtractor {
    /// Create a new markdown extractor
    pub fn new() -> Self {
        Self {}
    }

    /// Extract anchors from a markdown file
    ///
    /// # Arguments
    /// * `file_path` - Path to the markdown file
    /// * `content` - Content of the markdown file
    ///
    /// # Returns
    /// ExtractionResult containing all found anchors and any errors
    pub fn extract_from_file(&self, file_path: impl AsRef<Path>, content: &str) -> ExtractionResult {
        let file_path = file_path.as_ref();

        // Build line map for byte offset -> line number conversion
        let line_map = build_line_map(content);

        let mut anchors = HashMap::new();
        let mut errors = Vec::new();
        let mut anchor_stack: HashMap<String, AnchorInProgress> = HashMap::new();
        let mut seen_ids = HashSet::new();

        // Parse markdown into events with byte offsets
        let parser = Parser::new(content).into_offset_iter();

        for (event, range) in parser {
            // We only care about HTML events (comments)
            if let Event::Html(html) = event {
                let html_str = html.as_ref();

                // Check if this is a sintesi:start comment
                if let Some((id, code_ref)) = parse_sintesi_start(html_str) {
                    let line_num = byte_offset_to_line(&line_map, range.start);

                    // Validation: Check for duplicate IDs
                    if seen_ids.contains(&id) {
                        errors.push(format!(
                            "Duplicate anchor id=\"{}\" at line {}",
                            id,
                            line_num + 1
                        ));
                    }
                    seen_ids.insert(id.clone());

                    // Validation: Check for nested anchors with same ID
                    if anchor_stack.contains_key(&id) {
                        errors.push(format!(
                            "Nested anchor with same id=\"{}\" at line {}",
                            id,
                            line_num + 1
                        ));
                    }

                    // Validation: Check code_ref format
                    if !code_ref.contains('#') {
                        errors.push(format!(
                            "Invalid code_ref format at line {}: expected \"file_path#symbol_name\", got \"{}\"",
                            line_num + 1,
                            code_ref
                        ));
                    }

                    anchor_stack.insert(
                        id,
                        AnchorInProgress {
                            start_line: line_num,
                            start_offset: range.end, // Content starts after this comment
                            code_ref,
                        },
                    );
                }
                // Check if this is a sintesi:end comment
                else if let Some(id) = parse_sintesi_end(html_str) {
                    let line_num = byte_offset_to_line(&line_map, range.start);

                    match anchor_stack.remove(&id) {
                        Some(start_info) => {
                            // Extract content between anchors (by byte offset)
                            let content_str = content[start_info.start_offset..range.start].trim();

                            let anchor = SintesiAnchor {
                                id: id.clone(),
                                code_ref: Some(start_info.code_ref),
                                file_path: file_path.to_path_buf(),
                                start_line: start_info.start_line,
                                end_line: line_num,
                                // Normalize line endings for cross-platform compatibility
                                // This ensures hash consistency between Windows (\r\n) and Unix (\n)
                                content: content_str.replace("\r\n", "\n"),
                            };

                            anchors.insert(id, anchor);
                        }
                        None => {
                            errors.push(format!(
                                "Found sintesi:end without matching sintesi:start for id=\"{}\" at line {}",
                                id,
                                line_num + 1
                            ));
                        }
                    }
                }
            }
        }

        // Check for unclosed anchors
        if !anchor_stack.is_empty() {
            for (id, start_info) in anchor_stack {
                errors.push(format!(
                    "Unclosed anchor id=\"{}\" started at line {}",
                    id,
                    start_info.start_line + 1
                ));
            }
        }

        ExtractionResult {
            anchor_count: anchors.len(),
            anchors,
            errors,
        }
    }

    /// Validate markdown content without building anchors
    ///
    /// This method performs all validation checks without extracting content,
    /// making it useful for quick validation passes.
    pub fn validate(&self, content: &str) -> Vec<String> {
        let line_map = build_line_map(content);
        let mut errors = Vec::new();
        let mut seen_ids = HashSet::new();
        let mut anchor_stack: HashMap<String, usize> = HashMap::new();

        let parser = Parser::new(content).into_offset_iter();

        for (event, range) in parser {
            if let Event::Html(html) = event {
                let html_str = html.as_ref();
                let line_num = byte_offset_to_line(&line_map, range.start);

                // Check for sintesi:start
                if let Some((id, code_ref)) = parse_sintesi_start(html_str) {
                    // Check for duplicate IDs
                    if seen_ids.contains(&id) {
                        errors.push(format!(
                            "Duplicate anchor id=\"{}\" at line {}",
                            id,
                            line_num + 1
                        ));
                    }
                    seen_ids.insert(id.clone());

                    // Check if already open
                    if anchor_stack.contains_key(&id) {
                        errors.push(format!(
                            "Nested anchor with same id=\"{}\" at line {}",
                            id,
                            line_num + 1
                        ));
                    }
                    anchor_stack.insert(id.clone(), line_num);

                    // Validate code_ref format
                    if !code_ref.contains('#') {
                        errors.push(format!(
                            "Invalid code_ref format at line {}: expected \"file_path#symbol_name\", got \"{}\"",
                            line_num + 1,
                            code_ref
                        ));
                    }
                }
                // Check for sintesi:end
                else if let Some(id) = parse_sintesi_end(html_str) {
                    if !anchor_stack.contains_key(&id) {
                        errors.push(format!(
                            "Found sintesi:end without matching sintesi:start for id=\"{}\" at line {}",
                            id,
                            line_num + 1
                        ));
                    } else {
                        anchor_stack.remove(&id);
                    }
                }
            }
        }

        // Check for unclosed anchors
        for (id, line_num) in anchor_stack {
            errors.push(format!(
                "Unclosed anchor id=\"{}\" started at line {}",
                id,
                line_num + 1
            ));
        }

        errors
    }

    /// Parse the code_ref field into file path and symbol name
    pub fn parse_code_ref(&self, code_ref: &str) -> Result<(String, String), String> {
        let parts: Vec<&str> = code_ref.split('#').collect();

        if parts.len() != 2 || parts[0].is_empty() || parts[1].is_empty() {
            return Err(format!(
                "Invalid code_ref format: \"{}\". Expected format: \"file_path#symbol_name\"",
                code_ref
            ));
        }

        Ok((parts[0].to_string(), parts[1].to_string()))
    }
}

impl Default for MarkdownExtractor {
    fn default() -> Self {
        Self::new()
    }
}

/// Internal structure to track an anchor being parsed
#[derive(Debug)]
struct AnchorInProgress {
    start_line: usize,
    start_offset: usize, // Byte offset where content starts
    code_ref: String,
}

/// Build a map of byte offsets to line numbers (0-indexed)
fn build_line_map(content: &str) -> Vec<usize> {
    let mut line_starts = vec![0];

    for (idx, ch) in content.char_indices() {
        if ch == '\n' {
            line_starts.push(idx + 1);
        }
    }

    line_starts
}

/// Convert a byte offset to a line number (0-indexed)
fn byte_offset_to_line(line_map: &[usize], offset: usize) -> usize {
    // Binary search for the line containing this offset
    match line_map.binary_search(&offset) {
        Ok(line) => line,
        Err(line) => line.saturating_sub(1),
    }
}

/// Parse a sintesi:start HTML comment
/// Returns (id, code_ref) if valid
fn parse_sintesi_start(html: &str) -> Option<(String, String)> {
    // Look for: <!-- sintesi:start id="..." code_ref="..." -->
    let html = html.trim();

    if !html.starts_with("<!--") || !html.ends_with("-->") {
        return None;
    }

    let inner = html.trim_start_matches("<!--").trim_end_matches("-->").trim();

    if !inner.starts_with("sintesi:start") {
        return None;
    }

    // Extract id="..." and code_ref="..."
    let id = extract_attribute(inner, "id")?;
    let code_ref = extract_attribute(inner, "code_ref")?;

    Some((id, code_ref))
}

/// Parse a sintesi:end HTML comment
/// Returns id if valid
fn parse_sintesi_end(html: &str) -> Option<String> {
    // Look for: <!-- sintesi:end id="..." -->
    let html = html.trim();

    if !html.starts_with("<!--") || !html.ends_with("-->") {
        return None;
    }

    let inner = html.trim_start_matches("<!--").trim_end_matches("-->").trim();

    if !inner.starts_with("sintesi:end") {
        return None;
    }

    extract_attribute(inner, "id")
}

/// Extract an attribute value from an HTML comment
/// e.g., extract_attribute('sintesi:start id="foo" code_ref="bar"', "id") -> Some("foo")
///
/// This parser is tolerant of:
/// - Spaces around the equals sign: id = "foo"
/// - Single quotes: id='foo'
/// - Double quotes: id="foo"
fn extract_attribute(text: &str, attr_name: &str) -> Option<String> {
    // Regex pattern that matches:
    // - attr_name followed by optional whitespace
    // - equals sign with optional whitespace
    // - either single or double quotes
    // - capture group for the value
    // - matching closing quote
    let pattern = format!(r#"{}\s*=\s*["']([^"']+)["']"#, regex::escape(attr_name));
    let re = Regex::new(&pattern).ok()?;

    re.captures(text)
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string())
}

/// Convenience function to extract anchors from a markdown file
pub fn extract_anchors(file_path: impl AsRef<Path>, content: &str) -> ExtractionResult {
    let extractor = MarkdownExtractor::new();
    extractor.extract_from_file(file_path, content)
}
