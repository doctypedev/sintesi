//! Utility NAPI functions
//!
//! Simple utility functions exposed to Node.js for testing and version info.

use napi_derive::napi;

/// Simple hello world function to test the napi binding
#[napi]
pub fn hello_world() -> String {
    "Hello from Doctype Rust Core! 🦀".to_string()
}

/// Get version information
#[napi]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
