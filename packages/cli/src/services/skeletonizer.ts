import { Project, ScriptTarget, Node } from 'ts-morph';
import { Logger } from '../utils/logger';

export class SkeletonizerService {
    private project: Project;

    constructor(private logger: Logger) {
        this.project = new Project({
            compilerOptions: {
                target: ScriptTarget.ES2022,
                allowJs: true,
            },
            useInMemoryFileSystem: true,
        });
    }

    /**
     * Generates a "Smart Skeleton" of the provided TypeScript code.
     * Removes implementation details but preserves signatures, JSDoc, and validation logic.
     */
    generateSkeleton(filePath: string, content: string): string {
        try {
            const sourceFile = this.project.createSourceFile(filePath, content, {
                overwrite: true,
            });

            // Process Functions
            sourceFile.forEachDescendant((node) => {
                if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
                    this.processFunctionLike(node);
                } else if (Node.isVariableDeclaration(node)) {
                    const initializer = node.getInitializer();
                    if (
                        initializer &&
                        (Node.isArrowFunction(initializer) ||
                            Node.isFunctionExpression(initializer))
                    ) {
                        this.processFunctionLike(initializer);
                    }
                } else if (Node.isClassDeclaration(node)) {
                    // Start of class - keep as is, methods are handled by recursion above
                }
            });

            return sourceFile.getFullText();
        } catch (e: any) {
            this.logger.warn(
                `Failed to skeletonize ${filePath}: ${e.message}. Using original content.`,
            );
            return content;
        }
    }

    private processFunctionLike(node: any) {
        // We want to keep the signature and JSDoc, but replace the body.
        // However, we want to KEEP:
        // 1. Throw statements (error contracts)
        // 2. Initial validation checks (guards)

        const body = node.getBody();
        if (!body || !Node.isBlock(body)) return;

        // Extract "Contract" statements (throws and simple validations)
        const contractStatements: string[] = [];
        const statements = body.getStatements();

        // Strategy: Look at the first few statements.
        // If they are guards (if (x) throw/return), keep them.
        // If they are strictly 'throw', keep them anywhere?
        // For simplicity/safety: Scan ALL top-level statements in the function.
        // If they are `throw ...` -> Keep.
        // If they are `if (...) { throw ... }` -> Keep.

        for (const stmt of statements) {
            if (Node.isThrowStatement(stmt)) {
                contractStatements.push(stmt.getText());
            } else if (Node.isReturnStatement(stmt)) {
                // Keep early returns (simple heuristic: validation guards usually return early)
                contractStatements.push(stmt.getText());
            } else if (Node.isIfStatement(stmt)) {
                // Check if the "then" block contains a throw or return
                const thenStatement = stmt.getThenStatement();
                let hasGuard = false;

                if (Node.isBlock(thenStatement)) {
                    if (
                        thenStatement
                            .getStatements()
                            .some((s) => Node.isThrowStatement(s) || Node.isReturnStatement(s))
                    ) {
                        hasGuard = true;
                    }
                } else if (
                    Node.isThrowStatement(thenStatement) ||
                    Node.isReturnStatement(thenStatement)
                ) {
                    hasGuard = true;
                }

                if (hasGuard) {
                    contractStatements.push(stmt.getText());
                }
            }
        }

        // If it's a constructor, we might want to keep parameter properties assignment?
        // Actually, TS parameter properties (public private in ctor) are part of signature, so they are kept.
        // Manual assignments `this.x = x` are implementation, but helpful context.
        // For now, treat constructors same as functions: keep guards, drop logic.

        // Replace Body
        // Replace Body

        // Start replacing
        // ts-morph allows easy body replacement?
        // node.setBodyText(...) replaces the *inner* text.

        // Remove the outer braces from our newBodyText because setBodyText adds them?
        // No, setBodyText replaces CONTENT of component.
        // Validating docs: "Sets the body text." -> "The text to set the body to."

        const innerBody =
            contractStatements.length > 0
                ? '\n' +
                  contractStatements.map((s) => `    // [VALIDATION]\n    ${s}`).join('\n\n') +
                  '\n    // ... [Implementation Hidden] ...\n'
                : '// [Implementation Hidden]';

        node.setBodyText(innerBody);
    }
}
