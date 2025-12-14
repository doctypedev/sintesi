use napi_derive::napi;
use crate::git::{GitService, analyzer::GitAnalyzer};
use napi::bindgen_prelude::*;

#[napi(object)]
pub struct ChangeSummary {
  pub git_diff: String,
  pub changed_files: Vec<String>,
  pub has_meaningful_changes: bool,
}

#[napi]
pub struct GitBinding {
  service: Option<GitService>,
}

#[napi]
impl GitBinding {
    #[napi(constructor)]
    pub fn new(root_path: String) -> Self {
        match GitService::open(&root_path) {
            Ok(service) => Self { service: Some(service) },
            Err(_) => Self { service: None }
        }
    }

    #[napi]
    pub fn analyze_changes(&self, base_branch: Option<String>, staged: Option<bool>) -> Result<ChangeSummary> {
        if let Some(service) = &self.service {
            // Default staged to false if not provided
            let is_staged = staged.unwrap_or(false);

            let changed_files = service.get_changed_files(base_branch.as_deref(), is_staged)
                .map_err(|e| Error::from_reason(&format!("Git error: {}", e)))?;
            
            let git_diff = service.get_diff(base_branch.as_deref(), is_staged)
                .map_err(|e| Error::from_reason(&format!("Git error: {}", e)))?;

            let has_meaningful_changes = GitAnalyzer::has_meaningful_changes(&git_diff);

            Ok(ChangeSummary {
                git_diff,
                changed_files,
                has_meaningful_changes,
            })
        } else {
            Err(Error::from_reason("Git service not initialized"))
        }
    }

    #[napi]
    pub fn check_meaningful_changes(diff: String) -> bool {
        GitAnalyzer::has_meaningful_changes(&diff)
    }
}
