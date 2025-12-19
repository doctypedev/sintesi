/**
 * System-wide constants for file exclusions.
 * These are used to filter out noise from drift detection and impact analysis.
 */

export const SYSTEM_EXCLUSION_PATTERNS = [
    // Lockfiles & Package Manager
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'npm-shrinkwrap.json',
    'bun.lockb',

    // System / IDE
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '.git/',
    '.editorconfig',
    '.gitignore',
    '.npmrc',

    // Output & Cache
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.turbo/',
    '.cache/',

    // Application Specific - Output/Generated
    '.sintesi/', // Sintesi state & lineage
    '.changeset/', // Changesets (version bumps)
    'docs/', // Default documentation output
    'documentation/', // Alternative doc folder
    'CHANGELOG.md', // Automated changelogs

    // Test Snapshots & Maps
    '.map',
    '.snap',
];
