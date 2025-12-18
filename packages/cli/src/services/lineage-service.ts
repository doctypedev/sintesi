import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative } from 'path';
import { Logger } from '../utils/logger';

export interface LineageData {
    // Map of docFilePath -> list of sourceFilePaths
    [docPath: string]: string[];
}

interface LineageFile {
    version: string;
    lastGeneratedSha?: string;
    dependencies: LineageData;
}

export class LineageService {
    private lineagePath: string;
    private lineage: LineageData = {};
    private lastGeneratedSha?: string;
    private projectRoot: string;

    constructor(
        private logger: Logger,
        projectRoot: string = process.cwd(),
    ) {
        this.projectRoot = projectRoot;
        this.lineagePath = join(projectRoot, '.sintesi', 'lineage.json');
        this.load();
    }

    /**
     * Loads the lineage data from disk.
     * Supports migration from legacy (raw map) to structured format.
     */
    private load(): void {
        try {
            if (existsSync(this.lineagePath)) {
                const raw = JSON.parse(readFileSync(this.lineagePath, 'utf-8'));
                // Detection: New format has "dependencies" key
                if (raw.dependencies && typeof raw.dependencies === 'object') {
                    this.lineage = raw.dependencies;
                    this.lastGeneratedSha = raw.lastGeneratedSha;
                } else {
                    // Legacy format: the whole object is the map
                    this.lineage = raw;
                }
            }
        } catch (e) {
            this.logger.debug('Failed to load lineage data, starting fresh: ' + e);
            this.lineage = {};
        }
    }

    /**
     * Saves the current lineage data to disk.
     */
    save(): void {
        try {
            const sintesiDir = join(this.projectRoot, '.sintesi');
            if (!existsSync(sintesiDir)) {
                mkdirSync(sintesiDir, { recursive: true });
            }

            const fileContent: LineageFile = {
                version: '1.0.0',
                lastGeneratedSha: this.lastGeneratedSha,
                dependencies: this.lineage,
            };

            writeFileSync(this.lineagePath, JSON.stringify(fileContent, null, 2));
            this.logger.debug(`Saved lineage data to ${this.lineagePath}`);
        } catch (e) {
            this.logger.warn('Failed to save lineage data: ' + e);
        }
    }

    setLastGeneratedSha(sha: string): void {
        this.lastGeneratedSha = sha;
    }

    getLastGeneratedSha(): string | undefined {
        return this.lastGeneratedSha;
    }

    /**
     * Updates the lineage for a specific documentation file.
     * @param docPath Relative path to the documentation file (e.g. "docs/auth.md")
     * @param sourceFiles List of absolute or relative source file paths used to generate this doc
     */
    track(docPath: string, sourceFiles: string[]): void {
        // Normalize to relative paths for portability
        const relativeSources = sourceFiles.map((p) => {
            return relative(this.projectRoot, p);
        });

        // Deduplicate and sort
        this.lineage[docPath] = [...new Set(relativeSources)].sort();
    }

    /**
     * Returns the list of source files used to generate a specific doc.
     */
    getSources(docPath: string): string[] {
        return this.lineage[docPath] || [];
    }

    /**
     * Returns all documentation files that depend on a given source file.
     * Used for reverse-lookup during check.
     */
    getImpactedDocs(changedSourceFile: string): string[] {
        // Normalize changed file to relative path if needed
        let relativeChanged = changedSourceFile;
        // If it's absolute, make it relative
        if (changedSourceFile.startsWith(this.projectRoot)) {
            relativeChanged = relative(this.projectRoot, changedSourceFile);
        }

        const impactedDocs: string[] = [];

        for (const [docPath, sources] of Object.entries(this.lineage)) {
            if (sources.includes(relativeChanged)) {
                impactedDocs.push(docPath);
            }
        }

        return impactedDocs;
    }

    /**
     * Clears lineage for a doc (e.g. if deleted)
     */
    remove(docPath: string): void {
        delete this.lineage[docPath];
    }
}
