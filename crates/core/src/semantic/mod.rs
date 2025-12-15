use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DocumentVector {
    pub path: String,
    pub content_hash: String,
    pub embedding: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct SemanticIndex {
    pub vectors: Vec<DocumentVector>,
}

impl SemanticIndex {
    pub fn new() -> Self {
        Self { vectors: Vec::new() }
    }

    pub fn load<P: AsRef<Path>>(path: P) -> Result<Self, String> {
        if !path.as_ref().exists() {
            return Ok(Self::new());
        }
        let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let index = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(index)
    }

    pub fn save<P: AsRef<Path>>(&self, path: P) -> Result<(), String> {
        if let Some(parent) = path.as_ref().parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let content = serde_json::to_string(self).map_err(|e| e.to_string())?;
        fs::write(path, content).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn upsert(&mut self, path: String, hash: String, embedding: Vec<f64>) {
        if let Some(existing) = self.vectors.iter_mut().find(|v| v.path == path) {
            existing.content_hash = hash;
            existing.embedding = embedding;
        } else {
            self.vectors.push(DocumentVector {
                path,
                content_hash: hash,
                embedding,
            });
        }
    }

    pub fn remove(&mut self, path: &str) {
        self.vectors.retain(|v| v.path != path);
    }
    
    pub fn get_hash(&self, path: &str) -> Option<String> {
        self.vectors.iter().find(|v| v.path == path).map(|v| v.content_hash.clone())
    }

    pub fn search(&self, query: &[f64], limit: usize) -> Vec<DocumentVector> {
        let mut scores: Vec<(f64, &DocumentVector)> = self.vectors
            .iter()
            .map(|doc| (cosine_similarity(query, &doc.embedding), doc))
            .collect();

        // Sort desc
        scores.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        scores.into_iter()
            .take(limit)
            .map(|(_score, doc)| doc.clone())
            .collect()
    }
}

fn cosine_similarity(a: &[f64], b: &[f64]) -> f64 {
    let dot_product: f64 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f64 = a.iter().map(|x| x * x).sum::<f64>().sqrt();
    let norm_b: f64 = b.iter().map(|x| x * x).sum::<f64>().sqrt();
    
    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }
    
    dot_product / (norm_a * norm_b)
}
