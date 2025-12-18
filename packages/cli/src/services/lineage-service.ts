import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative } from 'path';
import { Logger } from '../utils/logger';

export interface LineageData {
    // Map of docFilePath -> list of sourceFilePaths
    [docPath: string]: string[];
}

export class LineageService {
    private lineagePath: string;
    private lineage: LineageData = {};
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
     */
    private load(): void {
        try {
            if (existsSync(this.lineagePath)) {
                this.lineage = JSON.parse(readFileSync(this.lineagePath, 'utf-8'));
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
            writeFileSync(this.lineagePath, JSON.stringify(this.lineage, null, 2));
            this.logger.debug(`Saved lineage data to ${this.lineagePath}`);
        } catch (e) {
            this.logger.warn('Failed to save lineage data: ' + e);
        }
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
