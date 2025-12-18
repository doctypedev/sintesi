import { ObservabilityMetadata } from '../../../ai';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Safely get Git user email for user tracking
 * Falls back gracefully in CI/CD or non-git environments
 */
function getGitUserEmail(): string | undefined {
    try {
        // Check if .git directory exists (avoids errors in Docker/CI)
        const gitDir = join(process.cwd(), '.git');
        if (!existsSync(gitDir)) {
            return undefined;
        }

        const email = execSync('git config user.email', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
        }).trim();

        return email || undefined;
    } catch {
        // Git not configured or command failed
        return undefined;
    }
}

export function createObservabilityMetadata(options: {
    feature?: string;
    projectName?: string;
    sessionId?: string;
    additionalProperties?: Record<string, string | number | boolean>;
    additionalTags?: string[];
}): ObservabilityMetadata {
    const { feature, projectName, sessionId, additionalProperties, additionalTags } = options;

    // Try to get git user email for user tracking
    const gitEmail = getGitUserEmail();
    const userId = gitEmail || projectName || 'anonymous';

    // Generate session ID if not provided (timestamp-based)
    const finalSessionId = sessionId || `sintesi-${Date.now()}`;

    // Create session name from project and timestamp
    const sessionName = projectName
        ? `${projectName} - ${new Date().toISOString()}`
        : `Documentation Generation - ${new Date().toISOString()}`;

    // Build properties
    const properties: Record<string, string | number | boolean> = {
        tool: 'sintesi',
        version: process.env.npm_package_version || 'unknown',
        ...(projectName && { projectName }),
        ...(feature && { feature }),
        ...additionalProperties,
    };

    // Build tags
    const tags = ['sintesi-cli', ...(additionalTags || [])];

    return {
        sessionId: finalSessionId,
        sessionName,
        userId,
        properties,
        tags,
    };
}

/**
 * Helper to extend observability metadata with additional properties and tags
 * Returns a new object without mutating the original
 * Automatically deduplicates tags to prevent duplicates when called multiple times
 */
export function extendMetadata(
    base: ObservabilityMetadata,
    extensions: {
        feature?: string;
        properties?: Record<string, string | number | boolean>;
        tags?: string[];
    },
): ObservabilityMetadata {
    // Deduplicate tags using Set to prevent duplicates
    const allTags = [...(base.tags || []), ...(extensions.tags || [])];
    const uniqueTags = Array.from(new Set(allTags));

    return {
        ...base,
        properties: {
            ...base.properties,
            ...(extensions.feature && { feature: extensions.feature }),
            ...extensions.properties,
        },
        tags: uniqueTags,
    };
}
