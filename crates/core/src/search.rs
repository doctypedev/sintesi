use ignore::WalkBuilder;
use regex::Regex;

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: u32,
    pub line_text: String,
}

/// Searches the project for a given pattern.
/// The search respects .gitignore files.
pub fn search_project(root_path: String, pattern: String) -> Vec<SearchResult> {
    let mut results: Vec<SearchResult> = Vec::new();
    let regex = match Regex::new(&pattern) {
        Ok(r) => r,
        Err(e) => {
            return vec![SearchResult {
                file_path: "SYSTEM_ERROR".to_string(),
                line_number: 0,
                line_text: format!("Invalid Regex pattern: {}. Please use valid Regex or escape special characters.", e),
            }];
        }
    };

    // Use standard filters: respects .gitignore, ignores .git, etc.
    let walker = WalkBuilder::new(&root_path)
        .hidden(true) // Skip hidden files like .git, .env (maybe we want .env? usually not for code search)
        .git_ignore(true)
        .build();

    for entry in walker {
        if let Ok(entry) = entry {
            if entry.file_type().map_or(false, |ft| ft.is_file()) {
                let file_path = entry.path();
                
                // Read file content
                // Note: This reads the whole file into memory. For huge files, line-by-line reading is better.
                // But for simplicity and consistent context, read_to_string is ok for now.
                if let Ok(content) = std::fs::read_to_string(file_path) {
                    for (i, line) in content.lines().enumerate() {
                        if regex.is_match(line) {
                             // Make path relative to root if possible
                            let display_path = match file_path.strip_prefix(&root_path) {
                                Ok(p) => p.to_string_lossy().to_string(),
                                Err(_) => file_path.to_string_lossy().to_string(),
                            };

                            results.push(SearchResult {
                                file_path: display_path,
                                line_number: (i + 1) as u32,
                                line_text: line.trim().to_string(), // Trim whitespace for cleaner output
                            });

                            // Limit results per file? Or global limit? 
                            // For now, let's keep it unbounded but maybe safeguard in the future.
                            if results.len() > 1000 {
                                return results;
                            }
                        }
                    }
                }
            }
        }
    }
    results
}