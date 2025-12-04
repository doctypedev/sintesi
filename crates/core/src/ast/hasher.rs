//! Signature hashing module
//!
//! This module handles the deterministic hashing of code signatures
//! using SHA256. This is the core of drift detection - when a signature
//! changes, its hash will change, triggering documentation updates.

use sha2::{Sha256, Digest};
use crate::types::CodeSignature;

/// Signature hasher for generating deterministic hashes
pub struct SignatureHasher;

impl SignatureHasher {
    /// Create a new signature hasher
    pub fn new() -> Self {
        Self
    }

    /// Generate a SHA256 hash of a code signature
    ///
    /// # Arguments
    /// * `signature` - The code signature to hash
    ///
    /// # Returns
    /// A hexadecimal string representation of the SHA256 hash
    ///
    /// # Example
    /// ```rust,ignore
    /// use doctype_core::ast::hasher::SignatureHasher;
    /// use doctype_core::types::{CodeSignature, SymbolType};
    ///
    /// let sig = CodeSignature {
    ///     symbol_name: "myFunction".to_string(),
    ///     symbol_type: SymbolType::Function,
    ///     signature_text: "function myFunction(x: number): string".to_string(),
    ///     is_exported: true,
    /// };
    ///
    /// let hasher = SignatureHasher::new();
    /// let hash = hasher.hash_signature(&sig);
    /// println!("Hash: {}", hash);
    /// ```
    pub fn hash_signature(&self, signature: &CodeSignature) -> String {
        // Create a deterministic string representation of the signature
        let signature_string = self.normalize_signature(signature);

        // Generate SHA256 hash
        let mut hasher = Sha256::new();
        hasher.update(signature_string.as_bytes());
        let result = hasher.finalize();

        // Convert to hex string
        format!("{:x}", result)
    }

    /// Normalize a signature to ensure deterministic hashing
    ///
    /// This removes irrelevant whitespace and formats the signature
    /// consistently so that semantically identical signatures always
    /// produce the same hash.
    fn normalize_signature(&self, signature: &CodeSignature) -> String {
        // TODO: Implement proper normalization
        // For now, just use the signature text as-is
        // In the future, this should:
        // 1. Remove unnecessary whitespace
        // 2. Normalize type references
        // 3. Sort properties consistently
        // 4. Handle comments appropriately

        format!(
            "{}:{}:{}",
            signature.symbol_name,
            format!("{:?}", signature.symbol_type),
            signature.signature_text.trim()
        )
    }
}

impl Default for SignatureHasher {
    fn default() -> Self {
        Self::new()
    }
}

/// Convenience function to hash a signature
///
/// # Arguments
/// * `signature` - The code signature to hash
///
/// # Returns
/// A hexadecimal string representation of the SHA256 hash
pub fn hash_signature(signature: &CodeSignature) -> String {
    let hasher = SignatureHasher::new();
    hasher.hash_signature(signature)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::SymbolType;

    #[test]
    fn test_hash_signature() {
        let sig1 = CodeSignature {
            symbol_name: "test".to_string(),
            symbol_type: SymbolType::Function,
            signature_text: "function test(): void".to_string(),
            is_exported: true,
        };

        let sig2 = CodeSignature {
            symbol_name: "test".to_string(),
            symbol_type: SymbolType::Function,
            signature_text: "function test(): void".to_string(),
            is_exported: true,
        };

        let hash1 = hash_signature(&sig1);
        let hash2 = hash_signature(&sig2);

        // Same signature should produce same hash
        assert_eq!(hash1, hash2);

        // Hash should be 64 hex characters (256 bits)
        assert_eq!(hash1.len(), 64);
    }

    #[test]
    fn test_different_signatures_different_hashes() {
        let sig1 = CodeSignature {
            symbol_name: "test".to_string(),
            symbol_type: SymbolType::Function,
            signature_text: "function test(): void".to_string(),
            is_exported: true,
        };

        let sig2 = CodeSignature {
            symbol_name: "test".to_string(),
            symbol_type: SymbolType::Function,
            signature_text: "function test(): string".to_string(), // Different return type
            is_exported: true,
        };

        let hash1 = hash_signature(&sig1);
        let hash2 = hash_signature(&sig2);

        // Different signatures should produce different hashes
        assert_ne!(hash1, hash2);
    }
}
