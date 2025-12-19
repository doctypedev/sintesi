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
import { filterGitDiff } from '../utils/diff-utils';
import { SYSTEM_EXCLUSION_PATTERNS } from '../config/constants';

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
    excludePatterns?: string[];
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
    /**
     * Analyze changes in the repository
     */
    async analyze(options: AnalysisOptions = {}): Promise<ChangeContext> {
        const {
            baseBranch = 'main',
            stagedOnly = false,
            projectRoot = process.cwd(),
            forceFetch = false,
            includeSymbols = true,
            excludePatterns = [],
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
                const headSha = execSync('git rev-parse HEAD', {
                    encoding: 'utf-8',
                    cwd: projectRoot,
                }).trim();
                // Ensure effectiveBase is resolved to a SHA or valid ref for comparison
                const baseSha = execSync(`git rev-parse ${effectiveBase}`, {
                    encoding: 'utf-8',
                    cwd: projectRoot,
                }).trim();

                if (headSha === baseSha) {
                    this.logger.info(
                        `ℹ HEAD is identical to ${effectiveBase}. Switching to ${effectiveBase}~1 to detect recent changes.`,
                    );
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
        const gitBinding = new GitBinding(projectRoot);

        try {
            // If stagedOnly is true, we haven't implemented that explicitly in the simple binding yet
            // assuming the binding handles it or we pass a flag.
            summary = gitBinding.analyzeChanges(effectiveBase, stagedOnly);
            gitDiff = summary.gitDiff;
            changedFiles = summary.changedFiles;
        } catch (e: any) {
            // Handle specific Git errors gracefully
            if (e.toString().includes('revspec') && e.toString().includes('not found')) {
                this.logger.warn(
                    `⚠ Base revision '${effectiveBase}' not found. Falling back to 'HEAD~1'.`,
                );
                try {
                    summary = gitBinding.analyzeChanges('HEAD~1', stagedOnly);
                    gitDiff = summary.gitDiff;
                    changedFiles = summary.changedFiles;
                } catch (fallbackError) {
                    this.logger.error(
                        `Fallback analysis failed: ${fallbackError}. Both requested base and HEAD~1 failed.`,
                    );
                    // Critical Failure: We cannot determine what changed.
                    // Throwing allows SmartChecker to "Fail Open" (assume drift)
                    // and DocumentationCommand to abort instead of generating garbage using empty context.
                    throw new Error(`Git Analysis Critical Failure: ${fallbackError}`);
                }
            } else {
                this.logger.error(`Rust Git analysis failed: ${e}.`);
                // Propagate error for the same reasons above
                throw e;
            }
        }

        if (!gitDiff && changedFiles.length === 0) {
            return {
                gitDiff: '',
                changedFiles: [],
                symbolChanges: [],
                totalChanges: 0,
            };
        }

        // 3. Filter Changes (Centralized Filtering)
        // Combine system defaults with run-specific exclusions
        const allExclusions = [...SYSTEM_EXCLUSION_PATTERNS, ...excludePatterns];

        // Filter file list
        // We filter out anything matching exclusions OR internal noise (node_modules, etc handled by isRelevantFile + custom)
        changedFiles = changedFiles
            .filter((f) => {
                // Check if it matches any exclusion pattern
                const isExcluded = allExclusions.some((p) => f.includes(p));
                return !isExcluded;
            })
            // Keep existing relevance check (TS/RS files, etc) - wait, maybe we want to report ALL changed files but filtered?
            // The method signature returns ChangeContext.
            // Documentation usually cares about Source Code changes.
            // SmartChecker might care about other things?
            // Let's keep isRelevantFile for now but make sure it doesn't conflict.
            // Actually, isRelevantFile excludes node_modules and tests.
            .filter((f) => this.isRelevantFile(f))
            .map((f) => path.resolve(projectRoot, f));

        // Filter git diff
        // We pass the exclusions to filterGitDiff
        if (gitDiff) {
            gitDiff = filterGitDiff(gitDiff, excludePatterns); // filterGitDiff uses SYSTEM_EXCLUSION_PATTERNS internal default if we don't pass them?
            // Wait, filterGitDiff implementation:
            // export function filterGitDiff(fullDiff: string, excludePatterns: string[] = []): string { ... }
            // It uses defaults inside. So passing excludePatterns adds to them.
            // PERFECT.
        }

        // Recalculate meaningful changes based on filtered diff
        const hasMeaningfulChanges = gitDiff.trim().length > 0;

        // 4. Symbol Analysis (if requested)
        let symbolChanges: SymbolChange[] = [];
        if (includeSymbols && changedFiles.length > 0) {
            symbolChanges = await this.analyzeSymbolChanges(
                changedFiles,
                effectiveBase,
                projectRoot,
            );
        }

        return {
            gitDiff,
            changedFiles,
            symbolChanges,
            totalChanges: symbolChanges.length > 0 ? symbolChanges.length : changedFiles.length,
            hasMeaningfulChanges,
        };
    }

    private isRelevantFile(file: string): boolean {
        return (
            (file.endsWith('.ts') ||
                file.endsWith('.tsx') ||
                file.endsWith('.rs') ||
                file.endsWith('.js')) &&
            !file.includes('.test.') &&
            !file.includes('.spec.') &&
            !file.includes('node_modules')
        );
    }

    private async analyzeSymbolChanges(
        files: string[],
        baseBranch: string,
        projectRoot: string,
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

    private getFileContentFromBranch(
        filePath: string,
        branch: string,
        root: string,
    ): string | null {
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

    private compareSymbols(
        oldS: CodeSignature[],
        newS: CodeSignature[],
        filePath: string,
    ): SymbolChange[] {
        const changes: SymbolChange[] = [];
        const oldMap = new Map(oldS.map((s) => [s.symbolName, s]));
        const newMap = new Map(newS.map((s) => [s.symbolName, s]));

        for (const [name, newSig] of newMap) {
            const oldSig = oldMap.get(name);
            if (!oldSig) {
                changes.push({
                    symbolName: name,
                    filePath,
                    changeType: 'added',
                    newSignature: newSig,
                });
            } else if (oldSig.hash !== newSig.hash) {
                changes.push({
                    symbolName: name,
                    filePath,
                    changeType: 'modified',
                    oldSignature: oldSig,
                    newSignature: newSig,
                });
            }
        }

        for (const [name, oldSig] of oldMap) {
            if (!newMap.has(name)) {
                changes.push({
                    symbolName: name,
                    filePath,
                    changeType: 'deleted',
                    oldSignature: oldSig,
                });
            }
        }

        return changes;
    }
}
