/**
 * Deterministic Markdown builder from structured documentation
 */

import type { DocumentationStructure, Parameter, ReturnTypeInfo } from '../core/types';

/**
 * Build Markdown documentation from structured data
 */
export function buildMarkdownFromStructure(doc: DocumentationStructure): string {
    const parts: string[] = [];

    // 1. Purpose
    parts.push('**Purpose:** ' + doc.purpose);

    // 2. Parameters
    if (doc.parameters && doc.parameters.length > 0) {
        parts.push('');
        parts.push('**Parameters:**');
        for (const param of doc.parameters) {
            parts.push(formatParameter(param));
        }
    }

    // 3. Return Type
    if (doc.returnType) {
        parts.push('');
        parts.push(formatReturnType(doc.returnType));
    }

    // 4. Usage Example
    if (doc.usageExample) {
        parts.push('');
        parts.push('**Usage Example:**');
        parts.push('```typescript');
        parts.push(doc.usageExample.trim());
        parts.push('```');
    }

    // 5. Notes
    if (doc.notes && doc.notes.length > 0) {
        parts.push('');
        parts.push('**Notes:**');
        for (const note of doc.notes) {
            parts.push('- ' + note);
        }
    }

    return parts.join('\n');
}

/**
 * Format a single parameter
 */
function formatParameter(param: Parameter): string {
    let line = '- `' + param.name + '`';

    if (param.optional) {
        line += ' (optional)';
    }

    line += ' (`' + param.type + '`): ' + param.description;

    if (param.defaultValue) {
        line += ' Default: `' + param.defaultValue + '`';
    }

    return line;
}

/**
 * Format return type information
 */
function formatReturnType(returnType: ReturnTypeInfo): string {
    return '**Returns:** `' + returnType.type + '` - ' + returnType.description;
}

/**
 * Build markdown for multiple symbols
 */
export function buildBatchMarkdown(
    docs: DocumentationStructure[],
): Array<{ symbolName: string; content: string }> {
    return docs.map((doc) => ({
        symbolName: doc.symbolName,
        content: buildMarkdownFromStructure(doc),
    }));
}
