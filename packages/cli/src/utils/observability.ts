import { ObservabilityMetadata } from '../../../ai';
import { execSync } from 'child_process';

/**
 * Creates observability metadata for tracking AI requests
 * @param options Options for creating metadata
 */
export function createObservabilityMetadata(options: {
    feature?: string;
    projectName?: string;
    sessionId?: string;
    additionalProperties?: Record<string, string | number | boolean>;
    additionalTags?: string[];
}): ObservabilityMetadata {
    const { feature, projectName, sessionId, additionalProperties, additionalTags } = options;

    // Try to get git user email for user tracking
    let userId: string | undefined;
    try {
        userId = execSync('git config user.email', { encoding: 'utf-8' }).trim();
    } catch {
        // Fallback to project name if git not available
        userId = projectName || 'anonymous';
    }

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
