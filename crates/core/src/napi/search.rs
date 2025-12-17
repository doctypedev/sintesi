use napi_derive::napi;

#[napi(object)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: u32,
    pub line_text: String,
}

#[napi]
pub fn search_project(root_path: String, pattern: String) -> Vec<SearchResult> {
    let results = crate::search::search_project(root_path, pattern);
    
    results.into_iter().map(|r| SearchResult {
        file_path: r.file_path,
        line_number: r.line_number,
        line_text: r.line_text,
    }).collect()
}
