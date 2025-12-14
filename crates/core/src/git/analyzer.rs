use regex::Regex;
use lazy_static::lazy_static;

lazy_static! {
    static ref MEANINGFUL_CHANGE_RE: Regex = {
        let meaningful_keywords = [
            // TypeScript / JavaScript
            r"export\s+(default\s+|async\s+|abstract\s+)*(class|interface|type|enum|const|function|let|var)",
            r"command\(", // Yargs or CLI commands
            r"route\(",   // API routes matches
            r#""bin":"#,    // package.json bin
            r#""scripts":"#, // package.json scripts
            r#""dependencies":"#, // package.json dependencies
            r#""peerDependencies":"#, // package.json peerDependencies

            // Rust
            r"pub\s+(struct|enum|fn|mod|trait|impl|const|static|type)", // Public Rust items
            r"#\[derive\(.*Args.*\)\]", // Clap Args
            r"#\[derive\(.*Parser.*\)\]", // Clap Parser
            r"#\[derive\(.*Subcommand.*\)\]", // Clap Subcommand
            r"#\[command", // Clap command attribute
            r"\[dependencies\]", // Cargo.toml dependencies
        ];

        let combined = meaningful_keywords.join("|");
        Regex::new(&combined).expect("Invalid regex")
    };
}

pub struct GitAnalyzer;

impl GitAnalyzer {
    pub fn has_meaningful_changes(diff: &str) -> bool {
        // We assume diff is already filtered for relevant files if needed.
        // But if strict logic checks per file, here we check the whole diff string provided.
        // We look for (+) or (-) lines.
        
        let changed_content: String = diff.lines()
            .filter(|line| (line.starts_with('+') && !line.starts_with("+++")) || 
                           (line.starts_with('-') && !line.starts_with("---")))
            .collect::<Vec<&str>>()
            .join("\n");

        if changed_content.is_empty() {
             return false;
        }

        MEANINGFUL_CHANGE_RE.is_match(&changed_content)
    }
}
