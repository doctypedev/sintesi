use petgraph::graph::{DiGraph, NodeIndex};
use regex::Regex;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct FileNode {
    pub path: PathBuf,
    pub name: String,
}

pub struct ProjectGraph {
    pub graph: DiGraph<FileNode, ()>,
    pub node_map: HashMap<PathBuf, NodeIndex>,
}

impl ProjectGraph {
    pub fn new() -> Self {
        Self {
            graph: DiGraph::new(),
            node_map: HashMap::new(),
        }
    }

    pub fn add_file(&mut self, path: PathBuf) -> NodeIndex {
        if let Some(&idx) = self.node_map.get(&path) {
            return idx;
        }

        let name = path
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();

        let node = self.graph.add_node(FileNode {
            path: path.clone(),
            name,
        });
        self.node_map.insert(path, node);
        node
    }

    pub fn add_dependency(&mut self, from: PathBuf, to: PathBuf) {
        let from_idx = self.add_file(from);
        let to_idx = self.add_file(to);
        self.graph.update_edge(from_idx, to_idx, ());
    }
}

pub fn build_graph(files: &[PathBuf], root: &Path) -> ProjectGraph {
    let mut project_graph = ProjectGraph::new();
    
    // Pre-populate nodes
    for file in files {
        project_graph.add_file(file.clone());
    }

    let import_regex = Regex::new(r#"(?:import\s+(?:[\w\s{},*]+from\s+)?|require\()['"]([^'"]+)['"]"#).unwrap();

// Helper to normalize paths (remove . and ..) without checking filesystem
    fn normalize_path(path: &Path) -> PathBuf {
        let mut components = path.components().peekable();
        let mut ret = if let Some(c) = components.peek() {
            match c {
                std::path::Component::Prefix(..) => {
                    let mut p = PathBuf::new();
                    p.push(components.next().unwrap());
                    p
                }
                std::path::Component::RootDir => {
                    components.next();
                    PathBuf::from("/")
                }
                _ => PathBuf::new(),
            }
        } else {
            PathBuf::new()
        };
    
        for component in components {
            match component {
                std::path::Component::Prefix(..) => unreachable!(),
                std::path::Component::RootDir => unreachable!(),
                std::path::Component::CurDir => {}
                std::path::Component::ParentDir => { ret.pop(); }
                std::path::Component::Normal(c) => { ret.push(c); }
            }
        }
        ret
    }

    for file_path in files {
        // Only process JS/TS/RS files for now
        let ext = file_path.extension().and_then(|s| s.to_str()).unwrap_or("");
        if !["ts", "tsx", "js", "jsx", "rs"].contains(&ext) {
            continue;
        }

        let full_path = root.join(file_path);
        if let Ok(content) = fs::read_to_string(&full_path) {
            for cap in import_regex.captures_iter(&content) {
                if let Some(import_path) = cap.get(1) {
                    let import_str = import_path.as_str();
                    
                    if import_str.starts_with('.') {
                        // Resolve relative to the current file
                        let current_dir = file_path.parent().unwrap_or(Path::new(""));
                        let resolved_raw = current_dir.join(import_str);
                        let resolved = normalize_path(&resolved_raw);
                        
                        // Try various extensions
                         let candidates = vec![
                            resolved.clone(),
                            resolved.with_extension("ts"),
                            resolved.with_extension("tsx"),
                            resolved.with_extension("js"),
                            resolved.with_extension("jsx"),
                            resolved.join("index.ts"),
                            resolved.join("index.js"),
                        ];

                        for candidate in candidates {
                             if project_graph.node_map.contains_key(&candidate) {
                                 project_graph.add_dependency(file_path.clone(), candidate);
                                 break;
                             }
                        }
                    }
                }
            }
        }
    }

    project_graph
}
