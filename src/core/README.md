# Core/AST Module

> **Phase 1**: Deterministic foundation for documentation drift detection

The Core/AST module provides the infrastructure for analyzing TypeScript code signatures and detecting changes through three interconnected components.

## Architecture Overview

```
┌─────────────────┐
│ TypeScript Code │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AST Analyzer   │ ← ts-morph extracts symbols
│  (Deterministic)│   normalizes signatures
└────────┬────────┘
         │ CodeSignature[]
         ▼
┌─────────────────┐
│Signature Hasher │ ← SHA256 hash generation
│  (Deterministic)│   serialization
└────────┬────────┘
         │ SignatureHash[]
         ▼
┌─────────────────┐
│doctype-map.json │ ← Saved for drift detection
│   (Phase 2)     │   (CI compares hashes)
└─────────────────┘
```

## Components

### 1. Type System (`types.ts`)

Defines the core data structures used throughout Doctype.

#### CodeSignature

Represents a single code symbol extracted from TypeScript:

```typescript
interface CodeSignature {
  symbolName: string;        // e.g., "calculateTotal"
  symbolType: SymbolType;    // function | class | interface | type | enum | variable
  signatureText: string;     // Normalized signature (whitespace-normalized, no comments)
  isExported: boolean;       // true for public APIs, false for private symbols
}
```

**Example:**
```typescript
// Input: export function greet(name: string): string { return `Hello, ${name}!`; }

{
  symbolName: "greet",
  symbolType: "function",
  signatureText: "export function greet(name: string): string",
  isExported: true
}
```

#### SignatureHash

SHA256 hash with metadata for drift detection:

```typescript
interface SignatureHash {
  hash: string;              // Deterministic SHA256 hash (hex string)
  signature: CodeSignature;  // Original signature that was hashed
  timestamp: number;         // Unix timestamp when hash was generated
}
```

**Example:**
```typescript
{
  hash: "a3f5c8e9d1b2...",
  signature: { /* CodeSignature */ },
  timestamp: 1732659600000
}
```

#### DoctypeMapEntry (Future - Phase 2)

Complete mapping entry for doctype-map.json:

```typescript
interface DoctypeMapEntry {
  id: string;                      // Unique UUID for the anchor
  codeRef: CodeRef;                // { filePath, symbolName }
  codeSignatureHash: string;       // SHA256 hash for drift detection
  docRef: DocRef;                  // { filePath, startLine, endLine }
  originalMarkdownContent: string; // Content between anchor tags
  lastUpdated: number;             // Unix timestamp
}
```

### 2. AST Analyzer (`ast-analyzer.ts`)

Extracts and normalizes TypeScript code signatures using [ts-morph](https://ts-morph.com).

#### Key Features

- **Symbol Extraction**: Functions, classes, interfaces, type aliases, enums, variables
- **Export Filtering**: Distinguishes public API (exported) from internal symbols
- **Signature Normalization**: Deterministic formatting for consistent hashing
- **Dual Input Modes**:
  - `analyzeFile(filePath)`: Analyze a TypeScript file on disk
  - `analyzeCode(code)`: Analyze code string (for testing/inline analysis)

#### Public API

```typescript
class ASTAnalyzer {
  constructor(tsConfigFilePath?: string)

  // Analyze a TypeScript file
  analyzeFile(filePath: string): CodeSignature[]

  // Analyze inline code (for testing)
  analyzeCode(code: string, fileName?: string): CodeSignature[]
}
```

#### Example: Analyzing a Class

```typescript
const analyzer = new ASTAnalyzer();

const code = `
  export class UserService {
    public getUser(id: string): Promise<User> {
      return fetch(\`/users/\${id}\`);
    }

    private _validate(): boolean {
      return true;
    }
  }
`;

const signatures = analyzer.analyzeCode(code);

// Output:
[
  {
    symbolName: "UserService",
    symbolType: "class",
    signatureText: "class UserService { getUser(id: string): Promise<User> }",
    isExported: true
  }
]

// Note: _validate() is excluded (private method)
```

#### Signature Normalization Process

The analyzer normalizes signatures to ensure deterministic comparison:

1. **Remove Comments**: Strip `/* ... */` and `// ...`
2. **Normalize Whitespace**: Convert multiple spaces/tabs/newlines to single space
3. **Remove Punctuation Spacing**: Remove spaces around `():[]{}`,;`
4. **Standardize Colons**: Ensure `: ` (space after colon)
5. **Standardize Commas**: Ensure `, ` (space after comma)
6. **Trim**: Remove leading/trailing whitespace

**Example:**
```typescript
// Before normalization
`export   function   add ( a : number ,  b: number ) :  number`

// After normalization
`export function add(a: number, b: number): number`
```

#### Supported TypeScript Constructs

| Construct | Symbol Type | Example |
|-----------|-------------|---------|
| Function | `function` | `export function foo() {}` |
| Arrow Function | `function` | `export const bar = () => {}` |
| Class | `class` | `export class User {}` |
| Interface | `interface` | `export interface Config {}` |
| Type Alias | `type` | `export type ID = string` |
| Enum | `enum` | `export enum Status {}` |
| Variable | `variable` | `export let count = 0` |
| Constant | `const` | `export const API_URL = '...'` |

### 3. Signature Hasher (`signature-hasher.ts`)

Generates deterministic SHA256 hashes for drift detection.

#### Key Features

- **Deterministic Hashing**: Same signature → same hash (always)
- **Canonical Serialization**: Converts `CodeSignature` to fixed-format string
- **Batch Processing**: `hashMany()` for processing multiple signatures
- **Comparison Utilities**: `compare()` for hash equality checks
- **Text Hashing**: `hashText()` for quick one-off hashes

#### Public API

```typescript
class SignatureHasher {
  // Hash a single signature
  hash(signature: CodeSignature): SignatureHash

  // Hash multiple signatures (batch)
  hashMany(signatures: CodeSignature[]): SignatureHash[]

  // Compare two hashes
  compare(hash1: string, hash2: string): boolean

  // Hash raw text directly
  hashText(signatureText: string): string
}
```

#### Serialization Format

Signatures are serialized to a canonical string format before hashing:

```typescript
// Format: "name:{name}|type:{type}|exported:{bool}|signature:{text}"
const serialized = [
  `name:${signature.symbolName}`,
  `type:${signature.symbolType}`,
  `exported:${signature.isExported}`,
  `signature:${signature.signatureText}`
].join('|');

// Example:
"name:UserService|type:class|exported:true|signature:class UserService { getUser(id: string): Promise<User> }"
```

#### Hash Generation Algorithm

```typescript
const hasher = new SignatureHasher();

// 1. Serialize signature to canonical format
const serialized = serializeSignature(signature);

// 2. Generate SHA256 hash
const hash = createHash('sha256')
  .update(serialized)
  .digest('hex');

// Result: "a3f5c8e9d1b2c4f7..." (64 hex characters)
```

#### Drift Detection Workflow

```typescript
import { ASTAnalyzer } from './ast-analyzer';
import { SignatureHasher } from './signature-hasher';

const analyzer = new ASTAnalyzer();
const hasher = new SignatureHasher();

// === Step 1: Analyze original code ===
const originalCode = `
  export function calculateTotal(items: number[]): number {
    return items.reduce((sum, item) => sum + item, 0);
  }
`;

const originalSig = analyzer.analyzeCode(originalCode)[0];
const originalHash = hasher.hash(originalSig);

console.log('Original hash:', originalHash.hash);
// "f8e3a1c9b5d7..."

// Save hash to doctype-map.json (Phase 2)
// ...

// === Step 2: Later, code changes ===
const modifiedCode = `
  export function calculateTotal(items: string[]): number {
    return items.reduce((sum, item) => sum + parseFloat(item), 0);
  }
`;

const modifiedSig = analyzer.analyzeCode(modifiedCode)[0];
const modifiedHash = hasher.hash(modifiedSig);

console.log('Modified hash:', modifiedHash.hash);
// "b2c4d6e8f1a3..." (different!)

// === Step 3: Detect drift ===
if (!hasher.compare(originalHash.hash, modifiedHash.hash)) {
  console.log('⚠️  DRIFT DETECTED!');
  console.log('Before:', originalSig.signatureText);
  console.log('After:', modifiedSig.signatureText);

  // Phase 4: Trigger GenAI fix workflow
  // ...
}
```

## Design Principles

### 1. Determinism

**Goal**: Same input must always produce the same output.

- No randomness in hash generation
- Fixed serialization order
- Normalized signatures (whitespace-agnostic)
- No timestamps in hash input (only in metadata)

**Why**: Drift detection requires exact hash comparison across different runs/environments.

### 2. Separation of Concerns

Each component has a single, well-defined responsibility:

- **AST Analyzer**: Extracts code signatures (knows TypeScript, not hashing)
- **Signature Hasher**: Generates hashes (knows hashing, not AST)
- **Types**: Defines data contracts (no business logic)

**Why**: Modularity enables independent testing, future refactoring, and reusability.

### 3. Type Safety

- Full TypeScript strict mode
- No `any` types (except necessary casts with comments)
- Explicit return types on all public methods
- Comprehensive interfaces for all data structures

**Why**: Catch errors at compile-time, improve IDE support, self-documenting code.

### 4. Testability

- 98.37% code coverage (exceeds 80% threshold)
- Isolated unit tests (no file I/O in most tests)
- Test fixtures for various TypeScript patterns
- Deterministic outputs enable precise assertions

**Why**: High confidence in correctness, safe refactoring, regression prevention.

### 5. Modularity

Each component can be used independently:

```typescript
// Use analyzer alone
const analyzer = new ASTAnalyzer();
const sigs = analyzer.analyzeFile('src/index.ts');

// Use hasher alone
const hasher = new SignatureHasher();
const hash = hasher.hashText('export function foo(): void');

// Or combine them
const signatures = analyzer.analyzeCode(code);
const hashes = hasher.hashMany(signatures);
```

**Why**: Flexibility for different use cases, easier testing, clearer dependencies.

## Testing

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:ui         # Visual UI (Vitest)
```

### Coverage Report

Current coverage: **98.37%**

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| ast-analyzer.ts | 96.98% | 89.18% | 100% | 96.98% |
| signature-hasher.ts | 100% | 100% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |

### Test Fixtures

Located in `__tests__/fixtures/`:

- **`simple-functions.ts`**: Exported functions, async functions, private helpers
- **`classes.ts`**: Classes with public/private methods, constructors
- **`types-and-interfaces.ts`**: Interfaces, type aliases, enums, constants

## Usage Examples

See [`examples/basic-usage.ts`](../examples/basic-usage.ts) for complete working examples:

1. **Analyzing TypeScript Code**: Extract signatures from inline code
2. **Hash Generation**: Generate and compare hashes
3. **Drift Detection**: Detect changes between code versions

Run examples:
```bash
npm run build
node dist/examples/basic-usage.js
```

## Future Phases

### Phase 2: Data Model & Mapping
- Implement `doctype-map.json` manager
- Markdown anchor parser
- File system operations for reading/writing map

### Phase 3: CLI Commands
- `npx doctype check` - Verify documentation sync (CI)
- `npx doctype fix` - Interactive drift fixing

### Phase 4: Gen AI Integration
- OpenAI/Gemini API integration
- Prompt engineering for documentation updates
- `--auto-commit` automated PR workflow

---

**Status**: ✅ Phase 1 Complete (44/44 tests passing)
