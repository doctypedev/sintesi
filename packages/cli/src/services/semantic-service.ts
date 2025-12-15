import { Logger } from '../utils/logger';
import { SemanticSearch, JsDocumentVector } from '@sintesi/core';
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface Embedder {
    embed(text: string): Promise<number[]>;
}

export class SemanticService {
  private engine: SemanticSearch;
  private projectRoot: string;

  constructor(projectRoot: string, private logger: Logger, private embedder: Embedder) {
    this.projectRoot = projectRoot;
    const indexPath = join(projectRoot, '.sintesi', 'semantic-index.json');
    this.engine = new SemanticSearch(indexPath);
  }

  async indexProject(files: string[]): Promise<void> {
    this.logger.info(`Checking semantic index for ${files.length} files...`);
    let updatedCount = 0;

    if (!this.embedder.embed) {
        this.logger.warn("Current AI Provider does not support embeddings. Skipping semantic indexing.");
        return;
    }

    for (const file of files) {
      const fullPath = join(this.projectRoot, file);
      if (!existsSync(fullPath)) continue;

      try {
        const content = readFileSync(fullPath, 'utf-8');
        const hash = this.computeHash(content);
        
        const existingHash = this.engine.getHash(file);
        
        if (existingHash !== hash) {
            // Simple chunking: take the first 8000 chars as a summary of the file.
            // This captures imports, class definitions, and main logic usually.
            const summary = content.slice(0, 8000); 
            
            // Generate embedding
            const embedding = await this.embedder.embed(summary);
            
            // Save to Rust engine
            this.engine.upsert(file, hash, embedding);
            updatedCount++;
            
            if (updatedCount % 5 === 0) {
                process.stdout.write('.');
            }
        }
      } catch (e: any) {
          this.logger.debug(`Failed to process ${file} for indexing: ${e.message}`);
      }
    }
    
    if (updatedCount > 0) process.stdout.write('\n');

    if (updatedCount > 0) {
      this.engine.save();
      this.logger.success(`Updated semantic index with ${updatedCount} new/changed files.`);
    } else {
        this.logger.info("Semantic index is up to date.");
    }
  }

  async search(query: string, limit: number = 5): Promise<JsDocumentVector[]> {
    if (!this.embedder.embed) {
        return [];
    }
    try {
        const queryVector = await this.embedder.embed(query);
        return this.engine.search(queryVector, limit);
    } catch (e) {
        this.logger.error("Semantic search failed: " + e);
        return [];
    }
  }

  private computeHash(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }
}
