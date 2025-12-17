import { z } from 'zod';
import { tool } from 'ai';
import { searchProject, GraphAnalyzer } from '@sintesi/core';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, isAbsolute } from 'path';

export const createTools = (rootPath: string, contextFiles: string[] = [], debug: boolean = false) => {
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[AI-TOOL] ${message}`, ...args);
    }
  };

  const analyzer = new GraphAnalyzer(rootPath);

  return {
    search: tool({
      description: 'Search the codebase for a text pattern (regex supported).',
      inputSchema: z.object({
        query: z.string().describe('The text or regex to search for'),
      }),
      execute: async ({ query }) => {
        log(`Executing search with query: "${query}"`);
        try {
          const results = searchProject(rootPath, query);
          const formattedResults = results.slice(0, 20).map(r =>
            `${r.filePath}:${r.lineNumber}: ${r.lineText.trim()}`
          ).join('\n');

          if (results.length === 0) {
            return "No results found.";
          }

          log(`Search returned ${results.length} results.`);
          return formattedResults;
        } catch (e: any) {
          log(`Error in search: ${e.message}`);
          return `Error searching: ${e.message}`;
        }
      },
    }),

    readFile: tool({
      description: 'Read the content of a file.',
      inputSchema: z.object({
        filePath: z.string().describe('The relative path of the file to read'),
      }),
      execute: async ({ filePath }) => {
        log(`Executing readFile on path: "${filePath}"`);
        try {
          const fullPath = isAbsolute(filePath) ? filePath : join(rootPath, filePath);
          const content = readFileSync(fullPath, 'utf-8');

          if (content.length > 20000) {
            log(`readFile: Content truncated for ${filePath}`);
            return content.substring(0, 20000) + '\n... (truncated)';
          }
          log(`readFile: Read ${content.length} characters from ${filePath}`);
          return content;
        } catch (e: any) {
          log(`Error in readFile: ${e.message}`);
          return `Error reading file ${filePath}: ${e.message}`;
        }
      },
    }),

    listFiles: tool({
      description: 'List files in a directory.',
      inputSchema: z.object({
        dirPath: z.string().describe('The relative path of the directory to list.'),
      }),
      execute: async ({ dirPath }) => {
        log(`Executing listFiles on directory: "${dirPath}"`);
        try {
          const fullPath = isAbsolute(dirPath) ? dirPath : join(rootPath, dirPath);
          const files = readdirSync(fullPath);
          log(`listFiles: Found ${files.length} items in ${dirPath}`);
          return files.map(f => {
            try {
              const s = statSync(join(fullPath, f));
              return s.isDirectory() ? `${f}/` : f;
            } catch { return f; }
          }).join('\n');
        } catch (e: any) {
          log(`Error in listFiles: ${e.message}`);
          return `Error listing directory ${dirPath}: ${e.message}`;
        }
      },
    }),

    getDependencies: tool({
      description: 'Find files that this file depends on (imports).',
      inputSchema: z.object({
        filePath: z.string().describe('The path of the file to analyze'),
      }),
      execute: async ({ filePath }) => {
        log(`Executing getDependencies for file: "${filePath}"`);
        try {
          const deps = analyzer.getDependencies(filePath, contextFiles);
          log(`getDependencies: Found ${deps.length} dependencies`);
          return deps.join('\n');
        } catch (e: any) {
          log(`Error in getDependencies: ${e.message}`);
          return `Error getting dependencies: ${e.message}`;
        }
      }
    }),

    getDependents: tool({
      description: 'Find files that depend on this file (who imports me?).',
      inputSchema: z.object({
        filePath: z.string().describe('The path of the file to analyze'),
      }),
      execute: async ({ filePath }) => {
        log(`Executing getDependents for file: "${filePath}"`);
        try {
          const deps = analyzer.getDependents(filePath, contextFiles);
          log(`getDependents: Found ${deps.length} dependents`);
          return deps.join('\n');
        } catch (e: any) {
          log(`Error in getDependents: ${e.message}`);
          return `Error getting dependents: ${e.message}`;
        }
      }
    })
  };
};
