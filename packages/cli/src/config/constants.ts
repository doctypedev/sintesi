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

/**
 * Source code file extensions to include in analysis.
 * Only files with these extensions are considered for drift detection.
 */
export const SOURCE_CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.rs'];

/**
 * Test file patterns to exclude from analysis.
 * These files are excluded from drift detection as they don't affect documentation.
 */
export const TEST_FILE_PATTERNS = ['.test.', '.spec.'];
