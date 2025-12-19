/**
 * Git Diff Utilities
 * Centralized logic for filtering, cleaning, and processing git diffs.
 */

import { SYSTEM_EXCLUSION_PATTERNS } from '../config/constants';
import * as path from 'path';

/**
 * Filters out noisy files from the git diff to save tokens and improve focus.
 * Logic: EXCLUDE if filename matches any pattern.
 *
 * @param fullDiff The raw git diff string
 * @param excludePatterns Optional list of patterns (strings or regex) to exclude if matched in the filename
 */
export function filterGitDiff(fullDiff: string, excludePatterns: string[] = []): string {
    if (!fullDiff) return '';

    // Combine system defaults with custom exclusions
    const noisePatterns = [...SYSTEM_EXCLUSION_PATTERNS, ...excludePatterns];

    const chunks = fullDiff.split('diff --git ');
    const keptChunks: string[] = [];

    for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        // Check the first line for filename
        // diff --git a/src/foo.ts b/src/foo.ts
        const firstLine = chunk.split('\n')[0];

        // 1. Filter standard noise
        if (noisePatterns.some((pattern) => firstLine.includes(pattern))) {
            continue;
        }

        // 2. Filter custom patterns (e.g. self-trigger prevention)
        if (
            excludePatterns.some((pattern) =>
                firstLine.toLowerCase().includes(pattern.toLowerCase()),
            )
        ) {
            continue;
        }

        keptChunks.push('diff --git ' + chunk);
    }

    return keptChunks.join('\n');
}

/**
 * Filters a unified git diff string to only include changes to specified files.
 * Logic: INCLUDE ONLY if filename matches allow list.
 *
 * @param fullDiff The raw git diff string
 * @param allowedFilePaths List of absolute or relative file paths to include
 * @param projectRoot Root directory to resolve relative paths against
 */
export function filterDiffByInclusion(
    fullDiff: string,
    allowedFilePaths: string[],
    projectRoot: string,
): string {
    if (!fullDiff || allowedFilePaths.length === 0) return '';

    // Normalize allowed paths to relative for matching against git diff output (which uses relative paths)
    const allowedRelative = new Set(
        allowedFilePaths.map((p) => {
            if (path.isAbsolute(p)) return path.relative(projectRoot, p);
            return p;
        }),
    );

    const lines = fullDiff.split('\n');
    let output = '';
    let currentBlock = '';
    let insideAllowedBlock = false;

    for (const line of lines) {
        // New file block detection
        if (line.startsWith('diff --git')) {
            // If we were accumulating a valid block, append it to output
            if (insideAllowedBlock) {
                output += currentBlock;
            }

            // Reset for next block
            currentBlock = line + '\n';
            insideAllowedBlock = false;

            // Check if this new block is relevant
            // Line format: diff --git a/src/foo.ts b/src/foo.ts
            // Robust Regex to handle spaces in filenames:
            const match = line.match(/^diff --git a\/(.*) b\/(.*)$/);
            if (match) {
                const aPath = match[1];
                const bPath = match[2];

                // Check if either path is in our allowed list
                // Logic: imported file changed? Yes, we want to see it.
                // Target file changed? Yes.
                if (allowedRelative.has(aPath) || allowedRelative.has(bPath)) {
                    insideAllowedBlock = true;
                }
            }
        } else {
            // Accumulate lines for the current block
            currentBlock += line + '\n';
        }
    }

    // Handle the last block
    if (insideAllowedBlock) {
        output += currentBlock;
    }

    return output.trim();
}
