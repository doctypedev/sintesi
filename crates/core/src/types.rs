use napi_derive::napi;
use serde::Serialize;

/**
 * Core type definitions for Sintesi
 */



/**
 * Signature information extracted from code
 */
#[napi(object)]
#[derive(Debug, Serialize, Clone)]
pub struct CodeSignature {
    /// Name of the symbol
    pub symbol_name: String,
    /// Type of the symbol (function, class, interface, type, etc.)
    pub symbol_type: SymbolType,
    /// The actual signature text (normalized)
    pub signature_text: String,
    /// Whether the symbol is exported
    pub is_exported: bool,
    /// SHA256 hash of the signature (computed by Rust analyzer)
    pub hash: Option<String>,
}

/**
 * Types of symbols we track
 */
#[napi(string_enum)]
#[derive(Debug, PartialEq, Serialize)]
pub enum SymbolType {
    Function,
    Class,
    Interface,
    TypeAlias,
    Enum,
    Variable,
    Const,
}


