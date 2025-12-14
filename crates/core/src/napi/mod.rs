//! NAPI bindings module
//!
//! This module provides Node.js bindings for the Rust core functionality.
//! It exposes the core Rust logic to JavaScript/TypeScript through NAPI-RS.

pub mod ast;
pub mod content;
pub mod context;
pub mod crawler;
pub mod git;
pub mod graph; // [NEW]
pub mod utils;
