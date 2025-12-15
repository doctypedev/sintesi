use napi::bindgen_prelude::*;
use napi_derive::napi;
use crate::semantic::{SemanticIndex, DocumentVector};

#[napi(object)]
pub struct JsDocumentVector {
    pub path: String,
    pub content_hash: String,
    pub embedding: Vec<f64>,
}

impl From<DocumentVector> for JsDocumentVector {
    fn from(v: DocumentVector) -> Self {
        JsDocumentVector {
            path: v.path,
            content_hash: v.content_hash,
            embedding: v.embedding,
        }
    }
}

#[napi]
pub struct SemanticSearch {
    inner: SemanticIndex,
    path: String,
}

#[napi]
impl SemanticSearch {
    #[napi(constructor)]
    pub fn new(storage_path: String) -> Result<Self> {
        let index = SemanticIndex::load(&storage_path)
            .map_err(|e| Error::from_reason(format!("Failed to load index: {}", e)))?;
        
        Ok(SemanticSearch {
            inner: index,
            path: storage_path,
        })
    }

    #[napi]
    pub fn upsert(&mut self, path: String, hash: String, embedding: Vec<f64>) -> Result<()> {
        self.inner.upsert(path, hash, embedding);
        Ok(())
    }

    #[napi]
    pub fn save(&self) -> Result<()> {
        self.inner.save(&self.path)
            .map_err(|e| Error::from_reason(format!("Failed to save index: {}", e)))
    }

    #[napi]
    pub fn get_hash(&self, path: String) -> Option<String> {
        self.inner.get_hash(&path)
    }

    #[napi]
    pub fn search(&self, query: Vec<f64>, limit: u32) -> Vec<JsDocumentVector> {
        self.inner.search(&query, limit as usize)
            .into_iter()
            .map(JsDocumentVector::from)
            .collect()
    }
}
