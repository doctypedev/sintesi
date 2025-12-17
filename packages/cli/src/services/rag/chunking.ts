import { Project, SyntaxKind, ScriptTarget } from 'ts-morph';
import { Logger } from '../../utils/logger';

export interface Chunk {
    content: string;
    startLine: number;
    endLine: number;
    functionName?: string;
}

export class CodeChunkingService {
    private project: Project;

    constructor(private logger: Logger) {
        // Initialize ts-morph project purely for AST analysis (no file system loading by default)
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ES2022,
                allowJs: true,
            },
            useInMemoryFileSystem: true,
        });
    }

    /**
     * Splits a file content into chunks based on AST (for TS/JS) or simple logic.
     */
    chunkFile(filePath: string, content: string): Chunk[] {
        if (
            filePath.endsWith('.ts') ||
            filePath.endsWith('.tsx') ||
            filePath.endsWith('.js') ||
            filePath.endsWith('.jsx')
        ) {
            return this.chunkTypeScript(filePath, content);
        }

        // Fallback for other files (simple whole file or naive split)
        // For now, let's just return the whole file if it's not too huge,
        // or split by paragraphs if Markdown.
        // Keeping it simple: One chunk per file for non-code.
        return [
            {
                content: content,
                startLine: 1,
                endLine: content.split('\n').length,
                functionName: 'FILE_CONTENT',
            },
        ];
    }

    private chunkTypeScript(filePath: string, content: string): Chunk[] {
        try {
            const sourceFile = this.project.createSourceFile(filePath, content, {
                overwrite: true,
            });
            const chunks: Chunk[] = [];

            // 1. Functions
            const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
            for (const func of functions) {
                // Get full text including JSDoc
                const text = func.getFullText();
                const startLine = func.getStartLineNumber();
                const endLine = func.getEndLineNumber();
                const name = func.getName() || 'anonymous';

                chunks.push({
                    content: `Function ${name}: ${text}`, // Add descriptor to help embedding
                    startLine,
                    endLine,
                    functionName: name,
                });
            }

            // 2. Classes (and their methods?)
            // If class is small, take whole class. If huge, maybe split methods.
            // Let's start with Class Declaration top level.
            const classes = sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration);
            for (const cls of classes) {
                const text = cls.getFullText();
                const startLine = cls.getStartLineNumber();
                const endLine = cls.getEndLineNumber();
                const name = cls.getName() || 'anonymous';

                // If class is massive (> 300 lines), maybe we should chunk methods instead
                if (endLine - startLine > 300) {
                    const methods = cls.getMethods();
                    for (const method of methods) {
                        const mText = method.getFullText();
                        const mName = `${name}.${method.getName()}`;
                        chunks.push({
                            content: `Method ${mName}: ${mText}`,
                            startLine: method.getStartLineNumber(),
                            endLine: method.getEndLineNumber(),
                            functionName: mName,
                        });
                    }
                } else {
                    chunks.push({
                        content: `Class ${name}: ${text}`,
                        startLine,
                        endLine,
                        functionName: name,
                    });
                }
            }

            // 3. Arrow Functions (Variable Declarations initialized with arrow func)
            // This is harder to catch perfectly, but let's try top-level variables.
            const vars = sourceFile.getVariableStatements();
            for (const v of vars) {
                const decls = v.getDeclarations();
                for (const decl of decls) {
                    const init = decl.getInitializer();
                    if (
                        init &&
                        (init.getKind() === SyntaxKind.ArrowFunction ||
                            init.getKind() === SyntaxKind.FunctionExpression)
                    ) {
                        const name = decl.getName();
                        const text = v.getFullText();
                        chunks.push({
                            content: `Function (Arrow) ${name}: ${text}`,
                            startLine: v.getStartLineNumber(),
                            endLine: v.getEndLineNumber(),
                            functionName: name,
                        });
                    }
                }
            }

            // If no chunks found (e.g. file with just exports or simple script), return whole file
            if (chunks.length === 0) {
                return [
                    {
                        content: content,
                        startLine: 1,
                        endLine: sourceFile.getEndLineNumber(),
                        functionName: 'MODULE_ROOT',
                    },
                ];
            }

            return chunks;
        } catch (e: any) {
            this.logger.warn(`Failed to chunk ${filePath}: ${e.message}. Using whole file.`);
            return [
                {
                    content: content,
                    startLine: 1,
                    endLine: content.split('\n').length,
                    functionName: 'FILE_FALLBACK',
                },
            ];
        }
    }
}
