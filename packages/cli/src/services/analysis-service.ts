/**
 * Change Analysis Service
 * 
 * Central service for analyzing code changes, providing a unified way to get
 * git diffs, changed files, and AST symbol changes across all commands.
 */

import { GitHelper } from '../utils/git-helper';
import { Logger } from '../utils/logger';
import { ASTAnalyzer, CodeSignature, GitBinding } from '@sintesi/core';
import { unlink, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

export interface SymbolChange {
    symbolName: string;
    filePath: string;
    changeType: 'added' | 'modified' | 'deleted';
    oldSignature?: CodeSignature;
    newSignature?: CodeSignature;
}

export interface ChangeContext {
    gitDiff: string;
    changedFiles: string[];
    symbolChanges: SymbolChange[];
    totalChanges: number;
    hasMeaningfulChanges?: boolean;
}

export interface AnalysisOptions {
    baseBranch?: string;
    stagedOnly?: boolean;
    projectRoot?: string;
    forceFetch?: boolean;
    includeSymbols?: boolean;
    fallbackToLastCommit?: boolean;
}

export class ChangeAnalysisService {
    private logger: Logger;
    private gitHelper: GitHelper;
    private astAnalyzer: ASTAnalyzer;

    constructor(logger: Logger) {
        this.logger = logger;
        this.gitHelper = new GitHelper(logger);
        this.astAnalyzer = new ASTAnalyzer();
    }

    /**
     * Analyze changes in the repository
     */
    async analyze(options: AnalysisOptions = {}): Promise<ChangeContext> {
        const {
            baseBranch = 'main',
            stagedOnly = false,
            projectRoot = process.cwd(),
            forceFetch = false,
            includeSymbols = true
        } = options;

        let effectiveBase = baseBranch;

        // 1. Fetch if needed
        if (forceFetch && !stagedOnly) {
            const fetchResult = this.gitHelper.fetch('origin', baseBranch);
            if (fetchResult.success) {
                effectiveBase = `origin/${baseBranch}`;
            } else {
                this.logger.warn(`Failed to fetch origin/${baseBranch}, falling back to local.`);
            }
        }

        // 2. Auto-detect Post-Push/Merge scenario
        // If HEAD is identical to the base branch (e.g. running in CI after a push to main),
        // we must compare against the PREVIOUS commit to see what changed.
        try {
            if (!stagedOnly) {
                const headSha = execSync('git rev-parse HEAD', { encoding: 'utf-8', cwd: projectRoot }).trim();
                // Ensure effectiveBase is resolved to a SHA or valid ref for comparison
                const baseSha = execSync(`git rev-parse ${effectiveBase}`, { encoding: 'utf-8', cwd: projectRoot }).trim();

                if (headSha === baseSha) {
                    this.logger.info(`ℹ HEAD is identical to ${effectiveBase}. Switching to ${effectiveBase}~1 to detect recent changes.`);
                    effectiveBase = `${effectiveBase}~1`;
                }
            }
        } catch (e) {
            // Ignore errors (e.g. shallow clone, no commits yet) and proceed with original base
            this.logger.debug(`Could not verify HEAD vs Base alignment: ${e}`);
        }

        // 3. Analyze Changes using Rust Binding
        // This replaces the old slow execSync/regex approach
        let gitDiff = '';
        let changedFiles: string[] = [];


        let summary; // Capture Rust summary
        try {
            const gitBinding = new GitBinding(projectRoot);

            // If stagedOnly is true, we haven't implemented that explicitly in the simple binding yet
            // assuming the binding handles it or we pass a flag.
            summary = gitBinding.analyzeChanges(effectiveBase, stagedOnly);
            gitDiff = summary.gitDiff;
            changedFiles = summary.changedFiles;
        } catch (e) {
            this.logger.error(`Rust Git analysis failed: ${e}.`);
            // We rely on Rust now. If it fails, we return empty structure.
            return {
                gitDiff: '',
                changedFiles: [],
                symbolChanges: [],
                totalChanges: 0,
                hasMeaningfulChanges: false
            };
        }

        if (!gitDiff && changedFiles.length === 0) {
            return {
                gitDiff: '',
                changedFiles: [],
                symbolChanges: [],
                totalChanges: 0
            };
        }

        // 3. Get Changed Files
        // Filter to relevant files (TS/RS/etc) and make absolute
        changedFiles = changedFiles
            .filter(f => this.isRelevantFile(f))
            .map(f => path.resolve(projectRoot, f));

        // 4. Symbol Analysis (if requested)
        let symbolChanges: SymbolChange[] = [];
        if (includeSymbols && changedFiles.length > 0) {
            symbolChanges = await this.analyzeSymbolChanges(changedFiles, effectiveBase, projectRoot);
        }

        return {
            gitDiff,
            changedFiles,
            symbolChanges,
            totalChanges: symbolChanges.length > 0 ? symbolChanges.length : changedFiles.length,
            hasMeaningfulChanges: (typeof summary !== 'undefined' && summary) ? summary.hasMeaningfulChanges : undefined
        };
    }

    private isRelevantFile(file: string): boolean {
        return (
            (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.rs') || file.endsWith('.js')) &&
            !file.includes('.test.') &&
            !file.includes('.spec.') &&
            !file.includes('node_modules')
        );
    }

    private async analyzeSymbolChanges(
        files: string[],
        baseBranch: string,
        projectRoot: string
    ): Promise<SymbolChange[]> {
        const changes: SymbolChange[] = [];

        for (const filePath of files) {
            try {
                // Current symbols
                const currentSymbols = await this.astAnalyzer.analyzeFile(filePath);

                // Old symbols (from git)
                const oldContent = this.getFileContentFromBranch(filePath, baseBranch, projectRoot);
                let oldSymbols: CodeSignature[] = [];

                if (oldContent) {
                    // Use a unique temp file in the system temp directory to avoid collisions and pollution
                    const ext = path.extname(filePath);
                    const tempFile = path.join(tmpdir(), `doctype-analysis-${randomUUID()}${ext}`);

                    try {
                        await writeFile(tempFile, oldContent);
                        oldSymbols = await this.astAnalyzer.analyzeFile(tempFile);
                    } finally {
                        // Ensure cleanup happens even if analysis fails or is interrupted
                        await unlink(tempFile).catch(() => {
                            // Ignore cleanup errors (file might not exist if write failed)
                        });
                    }
                }

                changes.push(...this.compareSymbols(oldSymbols, currentSymbols, filePath));

            } catch (e) {
                this.logger.debug(`Failed to analyze symbols for ${filePath}: ${e}`);
            }
        }

        return changes;
    }

    private getFileContentFromBranch(filePath: string, branch: string, root: string): string | null {
        // TODO: Move this to Rust binding as well "get_file_content(path, revision)"
        // For now, keep as is or use GitBinding if exposed?
        // I haven't exposed "get_file_content" in GitBinding.
        // It's still using execSync in `getFileContentFromBranch`.
        try {
            const relPath = path.relative(root, filePath);
            return execSync(`git show ${branch}:${relPath}`, { encoding: 'utf-8', stdio: 'pipe' });
        } catch {
            return null;
        }
    }

    private compareSymbols(oldS: CodeSignature[], newS: CodeSignature[], filePath: string): SymbolChange[] {
        const changes: SymbolChange[] = [];
        const oldMap = new Map(oldS.map(s => [s.symbolName, s]));
        const newMap = new Map(newS.map(s => [s.symbolName, s]));

        for (const [name, newSig] of newMap) {
            const oldSig = oldMap.get(name);
            if (!oldSig) {
                changes.push({ symbolName: name, filePath, changeType: 'added', newSignature: newSig });
            } else if (oldSig.hash !== newSig.hash) {
                changes.push({ symbolName: name, filePath, changeType: 'modified', oldSignature: oldSig, newSignature: newSig });
            }
        }

        for (const [name, oldSig] of oldMap) {
            if (!newMap.has(name)) {
                changes.push({ symbolName: name, filePath, changeType: 'deleted', oldSignature: oldSig });
            }
        }

        return changes;
    }
}
