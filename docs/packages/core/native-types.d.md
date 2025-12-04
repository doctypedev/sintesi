# Native-types.d

Auto-generated documentation via Doctype.


## API Reference

### parseCodeRef

<!-- doctype:start id="a81e8c02-6584-406a-90fb-4dac2d17e517" code_ref="packages/core/native-types.d.ts#parseCodeRef" -->
**Purpose:** This function parses a code reference string into its components (filePath and symbolName).

**Parameters:**  
- **codeRef** (string): The code reference string to parse.  

**Return Type:** CodeRefParts - An object containing the extracted file path and symbol name.

**Usage Example:**  
```typescript
const parts = parseCodeRef('/path/to/file.js#myFunction'); 
```
<!-- doctype:end id="a81e8c02-6584-406a-90fb-4dac2d17e517" -->


### CodeRefParts

<!-- doctype:start id="e9aa0d2c-15df-4d2b-b27f-6f724d7ee0b9" code_ref="packages/core/native-types.d.ts#CodeRefParts" -->
**Purpose:** This interface represents the parts extracted from a code reference string.

**Parameters:**  
- **filePath** (string): The file path referenced in the code reference.  
- **symbolName** (string): The name of the symbol referenced in the code.

**Return Type:** None (used for typed object).

**Usage Example:**  
```typescript
const codeRef: CodeRefParts = { filePath: '/path/to/file.js', symbolName: 'myFunction' }; 
```
<!-- doctype:end id="e9aa0d2c-15df-4d2b-b27f-6f724d7ee0b9" -->


### validateMarkdownAnchors

<!-- doctype:start id="7f9bf3c8-89e0-4fc4-8486-720e86997c2a" code_ref="packages/core/native-types.d.ts#validateMarkdownAnchors" -->
**Purpose:** This function validates the anchors present in a markdown content.

**Parameters:**  
- **content** (string): The markdown content containing anchors to validate.  

**Return Type:** Array<string> - An array of error messages for invalid anchors, if any.

**Usage Example:**  
```typescript
const errors = validateMarkdownAnchors('# Sample header

[link](#invalid-anchor)'); 
```
<!-- doctype:end id="7f9bf3c8-89e0-4fc4-8486-720e86997c2a" -->


### extractAnchors

<!-- doctype:start id="2b2cd065-d209-4dfa-a785-6c115ee2e570" code_ref="packages/core/native-types.d.ts#extractAnchors" -->
**Purpose:** This function extracts anchors from a given file based on its content.

**Parameters:**  
- **filePath** (string): The path to the file containing the content.  
- **content** (string): The content of the file as a string from which to extract anchors.  

**Return Type:** ExtractionResult - The result of the extraction process including anchors, count, and errors.

**Usage Example:**  
```typescript
const result = extractAnchors('/path/to/file.md', 'Sample content with anchors.'); 
```
<!-- doctype:end id="2b2cd065-d209-4dfa-a785-6c115ee2e570" -->


### ExtractionResult

<!-- doctype:start id="54c13c68-b9d4-4963-ba7d-e2fdbe6b9001" code_ref="packages/core/native-types.d.ts#ExtractionResult" -->
**Purpose:** This interface holds the results of extracting anchors from a content source.

**Parameters:**  
- **anchors** (Array<DoctypeAnchor>): An array of DoctypeAnchor objects found in the content.  
- **anchorCount** (number): The total number of anchors extracted.  
- **errors** (Array<string>): An array of error messages encountered during extraction.

**Return Type:** None (used for typed object).

**Usage Example:**  
```typescript
const result: ExtractionResult = { anchors: [anchor], anchorCount: 1, errors: [] }; 
```
<!-- doctype:end id="54c13c68-b9d4-4963-ba7d-e2fdbe6b9001" -->


### DoctypeAnchor

<!-- doctype:start id="04756fd8-d0cd-4a88-a7ea-a7522c1428a0" code_ref="packages/core/native-types.d.ts#DoctypeAnchor" -->
**Purpose:** This interface represents an anchor in a document that refers to a specific document type.

**Parameters:**  
- **id** (string): Unique identifier for the anchor.  
- **codeRef** (optional, string): Reference to related code, if applicable.  
- **filePath** (string): The file path where the anchor is located.  
- **startLine** (number): The starting line number of the anchor in the document.  
- **endLine** (number): The ending line number of the anchor in the document.  
- **content** (string): The content of the anchor.

**Return Type:** None (used for typed object).

**Usage Example:**  
```typescript
const anchor: DoctypeAnchor = { id: 'anchor1', filePath: '/path/to/file.md', startLine: 1, endLine: 2, content: 'This is an anchor.' }; 
```
<!-- doctype:end id="04756fd8-d0cd-4a88-a7ea-a7522c1428a0" -->


### AstAnalyzer

<!-- doctype:start id="55a194dd-24f0-401f-9c1f-1e362c5be489" code_ref="packages/core/native-types.d.ts#AstAnalyzer" -->
**Purpose:** The AstAnalyzer class analyzes files and extracts symbols from their abstract syntax tree (AST).

**Methods:**  
- **constructor()**: Initializes a new instance of the AstAnalyzer.  
- **analyzeFile(filePath: string)**: Analyzes the specified file and returns a string representation of the analysis.  
- **getSymbols(filePath: string)**: Extracts an array of symbols from the specified file.

**Parameters:**  
- **filePath** (string): The path to the file to be analyzed.  

**Return Types:**  
- **analyzeFile():** Returns a string containing analysis results.  
- **getSymbols():** Returns an array of strings representing the symbols found in the file.

**Usage Example:**  
```typescript
const analyzer = new AstAnalyzer();  
const analysis = analyzer.analyzeFile('/path/to/file.js');  
const symbols = analyzer.getSymbols('/path/to/file.js'); 
```
<!-- doctype:end id="55a194dd-24f0-401f-9c1f-1e362c5be489" -->


### discoverFiles

<!-- doctype:start id="a280e5a5-5548-4466-ad9f-d79f049f3098" code_ref="packages/core/native-types.d.ts#discoverFiles" -->
**Purpose:** This function discovers files in a specified directory, applying any additional options provided.

**Parameters:**  
- **rootPath** (string): The directory path from which to start file discovery.  
- **options** (optional, FileDiscoveryOptions | undefined | null): Options to customize the file discovery.  

**Return Type:** FileDiscoveryResult - Represents the result of the file discovery operation.

**Usage Example:**  
```typescript
const result = discoverFiles('/path/to/directory', { respectGitignore: true }); 
```
<!-- doctype:end id="a280e5a5-5548-4466-ad9f-d79f049f3098" -->


### FileDiscoveryOptions

<!-- doctype:start id="4810e77d-cc66-4df6-b177-f2f43960578d" code_ref="packages/core/native-types.d.ts#FileDiscoveryOptions" -->
**Purpose:** This interface defines options for file discovery operations, allowing customization of the discovery process.

**Parameters:**  
- **respectGitignore** (optional, boolean): If true, the file discovery should respect the .gitignore rules.  
- **includeHidden** (optional, boolean): If true, hidden files are included in the discovery process.  
- **maxDepth** (optional, number): Defines the maximum depth for file exploration within directories.  

**Return Type:** None (used for typed object).

**Usage Example:**  
```typescript
const options: FileDiscoveryOptions = { respectGitignore: true, includeHidden: false, maxDepth: 3 }; 
```
<!-- doctype:end id="4810e77d-cc66-4df6-b177-f2f43960578d" -->


### FileDiscoveryResult

<!-- doctype:start id="a7c688e0-e8e0-4317-8afd-a049a3e8b138" code_ref="packages/core/native-types.d.ts#FileDiscoveryResult" -->
**Purpose:** Represents the result of a file discovery operation, including files found and errors encountered.

**Properties:**
- **markdownFiles**: `Array<string>` - List of Markdown file paths discovered.
- **sourceFiles**: `Array<string>` - List of source file paths discovered.
- **totalFiles**: `number` - Total number of files discovered.
- **errors**: `number` - Number of errors occurred during discovery.

**Usage Example:**
```typescript
const discoveryResult: FileDiscoveryResult = { 
  markdownFiles: ['doc1.md', 'doc2.md'], 
  sourceFiles: ['src/index.ts'], 
  totalFiles: 3, 
  errors: 0 
};
```
<!-- doctype:end id="a7c688e0-e8e0-4317-8afd-a049a3e8b138" -->


### getVersion

<!-- doctype:start id="d887a9e6-df87-437a-806c-119a50f5b7db" code_ref="packages/core/native-types.d.ts#getVersion" -->
**Purpose:** A function that retrieves the current version of the application or library.

**Return Type:** `string` - The version string.

**Usage Example:**
```typescript
const currentVersion: string = getVersion();
console.log(currentVersion); // Outputs the version, e.g., '1.0.0'
```
<!-- doctype:end id="d887a9e6-df87-437a-806c-119a50f5b7db" -->


### helloWorld

<!-- doctype:start id="5046f0e1-9709-4b6d-975c-8f8aa0ca4dba" code_ref="packages/core/native-types.d.ts#helloWorld" -->
**Purpose:** A function that returns a greeting message.

**Return Type:** `string` - The greeting message.

**Usage Example:**
```typescript
const greeting: string = helloWorld();
console.log(greeting); // Outputs: 'Hello, World!'
```
<!-- doctype:end id="5046f0e1-9709-4b6d-975c-8f8aa0ca4dba" -->


### DoctypeMap

<!-- doctype:start id="81f73a57-6041-43b9-9031-5bb8be8ba115" code_ref="packages/core/native-types.d.ts#DoctypeMap" -->
**Purpose:** Represents a collection of document type map entries along with metadata about the versioning of the map.

**Properties:**
- **version**: `string` - The current version of the document type map.
- **entries**: `Array<DoctypeMapEntry>` - A list of entries in the document type map.

**Usage Example:**
```typescript
const myDoctypeMap: DoctypeMap = { 
  version: '1.0.0', 
  entries: [myMapEntry] 
};
```
<!-- doctype:end id="81f73a57-6041-43b9-9031-5bb8be8ba115" -->


### DoctypeMapEntry

<!-- doctype:start id="026acfd6-55ac-485c-a596-d3063663a061" code_ref="packages/core/native-types.d.ts#DoctypeMapEntry" -->
**Purpose:** Represents an entry in the document type map, linking code references with documentation details.

**Properties:**
- **id**: `string` - Unique identifier for the entry.
- **codeRef**: `CodeRef` - Reference to the code entity.
- **codeSignatureHash**: `string` - Hash of the code signature.
- **codeSignatureText**: `string` (optional) - Text description of the code signature.
- **docRef**: `DocRef` - Reference to the documentation section.
- **originalMarkdownContent**: `string` - The original markdown content related to the entry.
- **lastUpdated**: `number` - Timestamp of the last update.

**Usage Example:**
```typescript
const myMapEntry: DoctypeMapEntry = { 
  id: 'entry123', 
  codeRef: myCodeRef, 
  codeSignatureHash: 'hash123', 
  docRef: myDocRef, 
  originalMarkdownContent: '# My Documentation', 
  lastUpdated: Date.now() 
};
```
<!-- doctype:end id="026acfd6-55ac-485c-a596-d3063663a061" -->


### DocRef

<!-- doctype:start id="9c93c3f2-2cc4-4062-b65d-20fc0d373078" code_ref="packages/core/native-types.d.ts#DocRef" -->
**Purpose:** Denotes a reference to sections of a document, specifying file path and line numbers.

**Properties:**
- **filePath**: `string` - The path to the document file.
- **startLine**: `number` - The starting line number of the referenced section.
- **endLine**: `number` - The ending line number of the referenced section.

**Usage Example:**
```typescript
const myDocRef: DocRef = { 
  filePath: 'Documentation.md', 
  startLine: 10, 
  endLine: 20 
};
```
<!-- doctype:end id="9c93c3f2-2cc4-4062-b65d-20fc0d373078" -->


### SignatureHash

<!-- doctype:start id="c190a75b-61df-4629-bd2f-8a4c65c9565e" code_ref="packages/core/native-types.d.ts#SignatureHash" -->
**Purpose:** Represents a unique hash of a code signature along with its timestamp for version control or tracking.

**Properties:**
- **hash**: `string` - A unique identifier for the signature.
- **signature**: `CodeSignature` - The signature of the code symbol.
- **timestamp**: `number` - A timestamp indicating when the signature was created or updated.

**Usage Example:**
```typescript
const mySignatureHash: SignatureHash = { 
  hash: 'abc123', 
  signature: myFunctionSignature, 
  timestamp: Date.now() 
};
```
<!-- doctype:end id="c190a75b-61df-4629-bd2f-8a4c65c9565e" -->


### SymbolType

<!-- doctype:start id="002826ef-7d0b-4802-a844-4908e0f53ba8" code_ref="packages/core/native-types.d.ts#SymbolType" -->
**Purpose:** Enumerates the different types of symbols that can be represented in the codebase.

**Values:**
- **Function**: Represents a function type.
- **Class**: Represents a class type.
- **Interface**: Represents an interface type.
- **TypeAlias**: Represents a type alias.
- **Enum**: Represents an enumeration.
- **Variable**: Represents a variable.
- **Const**: Represents a constant.

**Usage Example:**
```typescript
const newSymbolType: SymbolType = SymbolType.Class;
```
<!-- doctype:end id="002826ef-7d0b-4802-a844-4908e0f53ba8" -->


### CodeSignature

<!-- doctype:start id="bb1a3f4d-cb85-438b-8c98-442b85a3778f" code_ref="packages/core/native-types.d.ts#CodeSignature" -->
**Purpose:** Contains metadata about a code symbol, including its type, text, and export status.

**Properties:**
- **symbolName**: `string` - The name of the symbol.
- **symbolType**: `SymbolType` - The type of symbol (e.g., Function, Class).
- **signatureText**: `string` - The textual representation of the symbol's signature.
- **isExported**: `boolean` - Indicates if the symbol is exported.

**Usage Example:**
```typescript
const myFunctionSignature: CodeSignature = { 
  symbolName: 'myFunction', 
  symbolType: SymbolType.Function, 
  signatureText: '(arg1: number, arg2: string): void', 
  isExported: true 
};
```
<!-- doctype:end id="bb1a3f4d-cb85-438b-8c98-442b85a3778f" -->



### CodeRef

<!-- doctype:start id="f0a845e6-fe8a-4aff-aa82-96e2203a153b" code_ref="packages/core/native-types.d.ts#CodeRef" -->
**Purpose:** Represents a reference to a specific code entity, denoted by its file path and symbol name.

**Properties:**
- **filePath**: `string` - The location of the file containing the code entity.
- **symbolName**: `string` - The name of the symbol (e.g., function, class).

**Usage Example:**
```typescript
const myCodeRef: CodeRef = { filePath: 'src/utils.ts', symbolName: 'myUtilityFunction' };
```
<!-- doctype:end id="f0a845e6-fe8a-4aff-aa82-96e2203a153b" -->
