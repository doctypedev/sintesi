//! AST NAPI bindings
//!
//! Node.js bindings for AST analysis functionality using Oxc parser.

use crate::ast::AstAnalyzerInternal;
use crate::types::CodeSignature;
use napi_derive::napi;
use std::fs;

/// AST Analyzer for TypeScript/JavaScript code
#[napi]
pub struct AstAnalyzer {
    internal: AstAnalyzerInternal,
}

#[napi]
impl AstAnalyzer {
    /// Create a new AST analyzer instance
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            internal: AstAnalyzerInternal::new(),
        }
    }

    /// Analyze a TypeScript/JavaScript file and return code signatures
    ///
    /// This method reads the file, parses it using Oxc, and extracts all
    /// exported symbols with their signatures.
    ///
    /// @param filePath - Absolute path to the TypeScript/JavaScript file
    /// @returns Array of code signatures found in the file
    #[napi]
    pub fn analyze_file(&self, file_path: String) -> napi::Result<Vec<CodeSignature>> {
        // Read file contents
        let content = fs::read_to_string(&file_path)
            .map_err(|e| napi::Error::from_reason(format!("Failed to read file: {}", e)))?;

        // Analyze the file
        let result = self.internal.analyze_file(&file_path, &content);

        // Convert symbols to CodeSignatures
        let signatures = result
            .symbols
            .into_iter()
            .filter(|s| s.is_exported) // Only return exported symbols
            .map(|s| CodeSignature {
                symbol_name: s.name,
                symbol_type: s.symbol_type,
                signature_text: s.signature,
                is_exported: s.is_exported,
            })
            .collect();

        Ok(signatures)
    }

    /// Analyze TypeScript/JavaScript source code directly (without file)
    ///
    /// This method parses the provided code string using Oxc and extracts all
    /// exported symbols with their signatures.
    ///
    /// @param code - TypeScript/JavaScript source code
    /// @returns Array of code signatures found in the code
    #[napi]
    pub fn analyze_code(&self, code: String) -> napi::Result<Vec<CodeSignature>> {
        let result = self.internal.analyze_code(&code);

        // Convert symbols to CodeSignatures
        let signatures = result
            .symbols
            .into_iter()
            .filter(|s| s.is_exported) // Only return exported symbols
            .map(|s| CodeSignature {
                symbol_name: s.name,
                symbol_type: s.symbol_type,
                signature_text: s.signature,
                is_exported: s.is_exported,
            })
            .collect();

        Ok(signatures)
    }

    /// Get detailed analysis result including errors
    ///
    /// @param code - TypeScript/JavaScript source code
    /// @returns Detailed analysis result with symbols and errors
    #[napi]
    pub fn analyze_with_errors(&self, code: String) -> napi::Result<AnalysisResultJs> {
        let result = self.internal.analyze_code(&code);

        let signatures = result
            .symbols
            .into_iter()
            .map(|s| CodeSignature {
                symbol_name: s.name,
                symbol_type: s.symbol_type,
                signature_text: s.signature,
                is_exported: s.is_exported,
            })
            .collect();

        Ok(AnalysisResultJs {
            signatures,
            errors: result.errors,
        })
    }
}

/// Analysis result including errors (for NAPI)
#[napi(object)]
pub struct AnalysisResultJs {
    /// All code signatures found
    pub signatures: Vec<CodeSignature>,
    /// Errors encountered during parsing
    pub errors: Vec<String>,
}
