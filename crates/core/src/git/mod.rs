use git2::{Repository, DiffOptions, Diff};
use std::path::Path;

pub mod analyzer;

pub struct GitService {
    repo: Repository,
}

impl GitService {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self, git2::Error> {
        let repo = Repository::discover(path)?;
        Ok(Self { repo })
    }

    // Helper to get Diff object to avoid duplication
    fn get_diff_obj(&self, base_ref: Option<&str>, staged: bool, opts: &mut DiffOptions) -> Result<Diff<'_>, git2::Error> {
        if staged {
             // Cached/Staged diff (index vs HEAD)
             let tree = self.repo.head()?.peel_to_tree()?;
             self.repo.diff_tree_to_index(Some(&tree), Some(&self.repo.index()?), Some(opts))
        } else {
             // Working diff (workdir vs index/HEAD or base)
             if let Some(base) = base_ref {
                 // Diff against a specific base (e.g., origin/main)
                 let obj = self.repo.revparse_single(base)?;
                 let tree = obj.peel_to_tree()?;
                 self.repo.diff_tree_to_workdir_with_index(Some(&tree), Some(opts))
             } else {
                 // Diff against HEAD
                 let tree = self.repo.head()?.peel_to_tree()?;
                 self.repo.diff_tree_to_workdir_with_index(Some(&tree), Some(opts))
             }
        }
    }

    pub fn get_diff(&self, base_ref: Option<&str>, staged: bool) -> Result<String, git2::Error> {
        let mut diff_opts = DiffOptions::new();
        diff_opts.include_untracked(true);
        diff_opts.recurse_untracked_dirs(true);

        let diff = self.get_diff_obj(base_ref, staged, &mut diff_opts)?;

        let mut diff_string = String::new();
        diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
            let prefix = match line.origin() {
                '+' | '-' | ' ' => line.origin(),
                _ => ' ',
            };
            if let Ok(content) = std::str::from_utf8(line.content()) {
                diff_string.push(prefix);
                diff_string.push_str(content);
            }
            true
        })?;

        Ok(diff_string)
    }

    pub fn get_changed_files(&self, base_ref: Option<&str>, staged: bool) -> Result<Vec<String>, git2::Error> {
        let mut diff_opts = DiffOptions::new();
        diff_opts.include_untracked(true);
        
        // Reuse the helper!
        let diff = self.get_diff_obj(base_ref, staged, &mut diff_opts)?;

        let mut files = Vec::new();
        diff.foreach(
            &mut |delta, _progress| {
                if let Some(path) = delta.new_file().path() {
                    if let Some(s) = path.to_str() {
                        files.push(s.to_string());
                    }
                }
                true
            },
            None,
            None,
            None,
        )?;

        Ok(files)
    }
}
