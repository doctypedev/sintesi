use napi_derive::napi;
use napi::bindgen_prelude::*;
use std::path::{Path, PathBuf};
use crate::graph::build_graph;

#[napi]
pub struct GraphAnalyzer {
    root_path: String,
}

#[napi]
impl GraphAnalyzer {
    #[napi(constructor)]
    pub fn new(root_path: String) -> Self {
        Self { root_path }
    }

    /// Build the dependency graph and return dependents of a given file
    #[napi]
    pub fn get_dependents(&self, file_path: String, all_files: Vec<String>) -> Result<Vec<String>> {
        let root = Path::new(&self.root_path);
        let files: Vec<PathBuf> = all_files.iter().map(PathBuf::from).collect();
        
        let graph = build_graph(&files, root);
        
        let target_path = PathBuf::from(&file_path);
        let mut dependents = Vec::new();

        if let Some(idx) = graph.node_map.get(&target_path) {
             // let neighbors = graph.graph.neighbors(*idx);

             // Wait, we want dependents (who depends on me).
             // Since we added edges as from -> to, dependents are "incoming" neighbors.
             // petgraph DiGraph neighbors() is outgoing.
             // We need incoming.
             
             let walker = graph.graph.neighbors_directed(*idx, petgraph::Direction::Incoming);
             for neighbor_idx in walker {
                 if let Some(node) = graph.graph.node_weight(neighbor_idx) {
                     if let Some(s) = node.path.to_str() {
                         dependents.push(s.to_string());
                     }
                 }
             }
        }

        Ok(dependents)
    }

    #[napi]
    pub fn get_dependencies(&self, file_path: String, all_files: Vec<String>) -> Result<Vec<String>> {
         let root = Path::new(&self.root_path);
         let files: Vec<PathBuf> = all_files.iter().map(PathBuf::from).collect();
         
         let graph = build_graph(&files, root);
         
         let target_path = PathBuf::from(&file_path);
         let mut dependencies = Vec::new();
 
         if let Some(idx) = graph.node_map.get(&target_path) {
              // Outgoing edges
              let neighbors = graph.graph.neighbors(*idx);
              for neighbor_idx in neighbors {
                  if let Some(node) = graph.graph.node_weight(neighbor_idx) {
                      if let Some(s) = node.path.to_str() {
                        dependencies.push(s.to_string());
                      }
                  }
              }
         }
 
         Ok(dependencies)
    }
}
