# Doctype

> The Self-Maintaining Documentation System

Doctype is the ultimate guardrail for conceptual documentation. By leveraging Abstract Syntax Tree (AST) analysis and Generative AI (GenAI), it guarantees the veracity of your Markdown guides in real-time. If the code changes, the documentation updates automatically.

## 🚀 Project Status: Phase 1 Complete

**✅ Core AST & Drift Detection Module**
- TypeScript code analysis using ts-morph
- Deterministic signature hashing (SHA256)
- Comprehensive test coverage (98.37%)
- 44/44 tests passing

## Features (Current Phase)

### AST Analyzer
- Extracts signatures from TypeScript code
- Supports: functions, classes, interfaces, types, enums, variables
- Normalizes signatures for consistent comparison
- Filters exported vs. private symbols

### Signature Hasher
- Generates SHA256 hashes from code signatures
- Deterministic: same signature always produces same hash
- Batch processing support
- Hash comparison utilities

## Installation

```bash
npm install
npm run build
```

## Usage

### Analyzing TypeScript Code

```typescript
import { ASTAnalyzer } from './core/ast-analyzer';

const analyzer = new ASTAnalyzer();

const code = `
  export function greet(name: string): string {
    return \`Hello, \${name}!\`;
  }
`;

const signatures = analyzer.analyzeCode(code);
console.log(signatures);
// [{ symbolName: 'greet', symbolType: 'function', ... }]
```

### Detecting Code Changes

```typescript
import { ASTAnalyzer } from './core/ast-analyzer';
import { SignatureHasher } from './core/signature-hasher';

const analyzer = new ASTAnalyzer();
const hasher = new SignatureHasher();

// Analyze code
const signatures = analyzer.analyzeCode(code);
const hashes = hasher.hashMany(signatures);

// Later, compare with new version
const newSignatures = analyzer.analyzeCode(updatedCode);
const newHashes = hasher.hashMany(newSignatures);

// Detect drift
if (!hasher.compare(hashes[0].hash, newHashes[0].hash)) {
  console.log('⚠️  Documentation drift detected!');
}
```

## Development

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:ui         # Visual UI
```

### Test Coverage

Current coverage: **98.37%**

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| ast-analyzer.ts | 96.98% | 89.18% | 100% | 96.98% |
| signature-hasher.ts | 100% | 100% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |

### Building

```bash
npm run build    # Compile TypeScript
npm run dev      # Watch mode
npm run clean    # Clean dist/
```

## Roadmap

- [x] **Phase 1**: Core AST & Drift Detection
  - [x] AST Analyzer with ts-morph
  - [x] Signature Hasher (SHA256)
  - [x] Comprehensive tests (>80% coverage)

- [ ] **Phase 2**: Data Model & Mapping
  - [ ] `doctype-map.json` management
  - [ ] Markdown anchor parsing
  - [ ] File system operations

- [ ] **Phase 3**: CLI Commands
  - [ ] `npx doctype check` - Verify documentation sync
  - [ ] `npx doctype fix` - Interactive fixes

- [ ] **Phase 4**: Gen AI Integration
  - [ ] OpenAI/Gemini integration
  - [ ] Prompt engineering for documentation updates
  - [ ] `--auto-commit` workflow

## Architecture

### Core/AST Module (Phase 1)

The Core/AST module provides the deterministic foundation for drift detection through three interconnected components:

#### 1. **Type System** (`types.ts`)

Defines the core data structures used throughout Doctype:

```typescript
// Code signature extracted from TypeScript
interface CodeSignature {
  symbolName: string;        // e.g., "calculateTotal"
  symbolType: SymbolType;    // function | class | interface | type | enum | variable
  signatureText: string;     // Normalized signature
  isExported: boolean;       // true for public APIs
}

// SHA256 hash with metadata
interface SignatureHash {
  hash: string;              // Deterministic SHA256 hash
  signature: CodeSignature;  // Original signature
  timestamp: number;         // When hash was generated
}

// Future: doctype-map.json entries (Phase 2)
interface DoctypeMapEntry {
  id: string;                      // Unique anchor UUID
  codeRef: CodeRef;                // Source file + symbol name
  codeSignatureHash: string;       // SHA256 hash for drift detection
  docRef: DocRef;                  // Markdown file location
  originalMarkdownContent: string; // Content between anchors
  lastUpdated: number;             // Timestamp
}
```

#### 2. **AST Analyzer** (`ast-analyzer.ts`)

Extracts and normalizes TypeScript code signatures using [ts-morph](https://ts-morph.com):

**Key Features:**
- **Symbol Extraction**: Functions, classes, interfaces, type aliases, enums, variables
- **Export Filtering**: Distinguishes public API (exported) from internal symbols
- **Signature Normalization**: Removes whitespace/comments for deterministic comparison
- **Dual Input**: Analyzes both files (`analyzeFile()`) and code strings (`analyzeCode()`)

**Example Flow:**
```typescript
const analyzer = new ASTAnalyzer();

// Input code
const code = `
  export class UserService {
    public getUser(id: string): Promise<User> { /* ... */ }
    private _validate(): boolean { /* ... */ }
  }
`;

// Output
const signatures = analyzer.analyzeCode(code);
// [{
//   symbolName: "UserService",
//   symbolType: "class",
//   signatureText: "class UserService { getUser(id: string): Promise<User> }",
//   isExported: true
// }]
// Note: _validate() is excluded (private method)
```

**Normalization Process:**
1. Remove multi-line comments (`/* ... */`)
2. Remove single-line comments (`// ...`)
3. Normalize whitespace to single spaces
4. Remove whitespace around punctuation
5. Standardize spacing after colons and commas

#### 3. **Signature Hasher** (`signature-hasher.ts`)

Generates deterministic SHA256 hashes for drift detection:

**Key Features:**
- **Deterministic Hashing**: Same signature → same hash (always)
- **Serialization**: Converts `CodeSignature` to canonical string format
- **Batch Processing**: `hashMany()` for multiple signatures
- **Comparison Utilities**: `compare()` for hash equality checks

**Hash Generation:**
```typescript
const hasher = new SignatureHasher();

// Serialize signature to canonical format
// "name:UserService|type:class|exported:true|signature:class UserService {...}"
const serialized = serializeSignature(signature);

// Generate SHA256 hash
const hash = createHash('sha256').update(serialized).digest('hex');
// "a3f5c8e..."
```

**Drift Detection Workflow:**
```typescript
// 1. Analyze original code
const originalSig = analyzer.analyzeCode(originalCode)[0];
const originalHash = hasher.hash(originalSig);

// 2. Save hash to doctype-map.json (Phase 2)
// ...

// 3. Later, analyze modified code
const modifiedSig = analyzer.analyzeCode(modifiedCode)[0];
const modifiedHash = hasher.hash(modifiedSig);

// 4. Detect drift
if (!hasher.compare(originalHash.hash, modifiedHash.hash)) {
  console.log('⚠️  DRIFT DETECTED!');
  // Trigger fix workflow (Phase 4)
}
```

### Data Flow Diagram

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

### Design Principles

1. **Determinism**: Same input → same output (no randomness)
2. **Separation of Concerns**: AST analysis ≠ hashing ≠ documentation updates
3. **Type Safety**: Full TypeScript typing for all interfaces
4. **Testability**: 98.37% coverage with isolated unit tests
5. **Modularity**: Each component is independently usable

---

For complete project architecture and roadmap, see [CLAUDE.md](./CLAUDE.md).

## License

MIT
