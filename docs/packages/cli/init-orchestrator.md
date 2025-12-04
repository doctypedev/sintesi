# Init-orchestrator

Auto-generated documentation via Doctype.


## API Reference

### mapEntry

<!-- doctype:start id="b4602446-600f-40f8-abac-5d24a3d8ac91" code_ref="packages/cli/init-orchestrator.ts#mapEntry" -->
**Purpose:** Maps the insertion result and related properties into a structured entry for documentation purposes.

**Type:** `DoctypeMapEntry`

**Parameters:**  
- `insertResult: InsertionResult`  
  The result of the content insertion operation.  
- `symbol: SymbolMetadata`  
  The metadata of the symbol being documented.  
- `docPath: string`  
  The file path of the document being updated.

**Return Type:** `DoctypeMapEntry`  
  An object representing a mapping entry for documentation with relevant details.

**Usage Example:**  
```typescript
const mapEntry: DoctypeMapEntry = { 
  id: insertResult.anchorId,  
  codeRef: { filePath: symbol.filePath, symbolName: symbol.symbolName },  
  codeSignatureHash: symbol.hash,  
  codeSignatureText: symbol.signatureText,  
  docRef: { 
    filePath: path.relative(process.cwd(), docPath),  
    startLine: insertResult.location.startLine,  
    endLine: insertResult.location.endLine,  
  },  
  originalMarkdownContent: `<!-- ${normalizedContent.substring(0, 50).replace(/\n/g, ' ')}... -->`,  
  lastUpdated: Date.now(), 
};
```
<!-- doctype:end id="b4602446-600f-40f8-abac-5d24a3d8ac91" -->


### insertResult

<!-- doctype:start id="65c770f1-ab5b-4212-ac49-130e1588abb0" code_ref="packages/cli/init-orchestrator.ts#insertResult" -->
**Purpose:** Executes the insertion of a code reference into the document content, creating a new section if necessary.

**Type:** `InsertionResult`

**Parameters:**  
- `docContent: string`  
  The original document content to insert into.  
- `codeRef: string`  
  The formatted code reference string.  
- `options: { createSection: boolean; placeholder: string; }`  
  Options to specify whether to create a new section and the placeholder content to insert.

**Return Type:** `InsertionResult`  
  An object that includes details about the insertion, such as `anchorId` and location.

**Usage Example:**  
```typescript
const insertResult = anchorInserter.insertIntoContent(docContent, codeRef, { createSection: true, placeholder: normalizedContent });
```
<!-- doctype:end id="65c770f1-ab5b-4212-ac49-130e1588abb0" -->


### normalizedContent

<!-- doctype:start id="a2508005-879a-47f6-8d39-b7f47f6e3675" code_ref="packages/cli/init-orchestrator.ts#normalizedContent" -->
**Purpose:** Trims the content string to remove leading and trailing whitespace.

**Type:** `string`

**Parameters:**  
- `content: string`  
  The original content string to be normalized.

**Return Type:** `string`  
  The trimmed version of the content string.

**Usage Example:**  
```typescript
const normalizedContent = content.trim();
```
<!-- doctype:end id="a2508005-879a-47f6-8d39-b7f47f6e3675" -->


### content

<!-- doctype:start id="4526f8de-a273-41cc-96fe-0bd1a2a6bbb6" code_ref="packages/cli/init-orchestrator.ts#content" -->
**Purpose:** Placeholder content that is to be replaced with actual documentation text for a symbol.

**Type:** `string`

**Parameters:** None

**Return Type:** `string`  
  Default content string for a symbol.

**Usage Example:**  
```typescript
let content = 'TODO: Add documentation for this symbol';
```
<!-- doctype:end id="4526f8de-a273-41cc-96fe-0bd1a2a6bbb6" -->


### codeRef

<!-- doctype:start id="f71d28b1-aeb4-495c-bedc-ff83d0fa25a1" code_ref="packages/cli/init-orchestrator.ts#codeRef" -->
**Purpose:** Formats a reference string for a code symbol using its file path and symbol name.

**Type:** `string`

**Parameters:**  
- `symbol: SymbolMetadata`  
  The symbol object containing properties `filePath` and `symbolName`.

**Return Type:** `string`  
  A formatted string representing the code reference.

**Usage Example:**  
```typescript
const codeRef = `${symbol.filePath}#${symbol.symbolName}`;
```
<!-- doctype:end id="f71d28b1-aeb4-495c-bedc-ff83d0fa25a1" -->


### symbol

<!-- doctype:start id="e94c88dc-b87b-4778-bda6-eb5a0dd2f1e8" code_ref="packages/cli/init-orchestrator.ts#symbol" -->
**Purpose:** Represents a code symbol that includes metadata such as file path and symbol name.

**Type:** `SymbolMetadata`

**Parameters:** None

**Return Type:** `SymbolMetadata`  
  An object containing details about a specific code symbol, including its file path, name, and other related properties.

**Usage Example:**  
```typescript
const symbol = {/* symbol details */};
```
<!-- doctype:end id="e94c88dc-b87b-4778-bda6-eb5a0dd2f1e8" -->


### hasChanges

<!-- doctype:start id="359e29bc-0c18-4636-97cc-f508321cc2b1" code_ref="packages/cli/init-orchestrator.ts#hasChanges" -->
**Purpose:** A boolean flag indicating whether there have been changes detected in the document processing logic.

**Type:** `boolean`

**Parameters:** None

**Return Type:** `boolean`  
  Returns `false` by default, indicating no changes have been implemented.

**Usage Example:**  
```typescript
let hasChanges = false;
```
<!-- doctype:end id="359e29bc-0c18-4636-97cc-f508321cc2b1" -->


### existingSet

<!-- doctype:start id="a2e308ed-b860-4257-bfcf-4ac1d95a18f9" code_ref="packages/cli/init-orchestrator.ts#existingSet" -->
**Purpose:** Creates a Set from an array of existing code references to ensure unique entries.

**Type:** `Set<string>`

**Parameters:**  
- `existingCodeRefs: string[]`  
  An array of code references to be converted into a Set.

**Return Type:** `Set<string>`  
  A Set containing unique code references.

**Usage Example:**  
```typescript
const existingSet = new Set(existingCodeRefs);
```
<!-- doctype:end id="a2e308ed-b860-4257-bfcf-4ac1d95a18f9" -->


### existingCodeRefs

<!-- doctype:start id="85104658-a8ab-411b-bf3e-6ecd771259ac" code_ref="packages/cli/init-orchestrator.ts#existingCodeRefs" -->
**Purpose:** Retrieves a unique set of existing code references from the provided document content.

**Type:** `Set<string>`

**Parameters:**  
- `docContent: string`  
  The markdown content of the document to extract code references from.

**Return Type:** `Set<string>`  
  A Set containing unique existing code reference strings, ensuring that each reference is returned only once.

**Usage Example:**  
```typescript
const existingCodeRefs = new Set(anchorInserter.getExistingCodeRefs(docContent));
```
<!-- doctype:end id="85104658-a8ab-411b-bf3e-6ecd771259ac" -->


### title

<!-- doctype:start id="0b475b81-62fd-43bb-a9b8-ffff560e64ec" code_ref="packages/cli/init-orchestrator.ts#title" -->
**Purpose:** `title` generates the Markdown title for the documentation based on the provided `docPath`.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
function generateMarkdownTitle(docPath: string): string {
    return `# Documentation for ${path.basename(docPath)}`;
}
let docPath = '/path/to/doc/file.md';
const title = generateMarkdownTitle(docPath);
console.log(title);
// Output: '# Documentation for file.md'
```
<!-- doctype:end id="0b475b81-62fd-43bb-a9b8-ffff560e64ec" -->


### docDir

<!-- doctype:start id="1fc15ed4-2022-474f-8c7f-4c15cd208ead" code_ref="packages/cli/init-orchestrator.ts#docDir" -->
**Purpose:** `docDir` stores the directory path of the documentation file based on the provided `docPath`.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
const path = require('path');
let docPath = '/path/to/doc/file.md';
const docDir = path.dirname(docPath);
console.log(docDir);
// Output: '/path/to/doc'
```
<!-- doctype:end id="1fc15ed4-2022-474f-8c7f-4c15cd208ead" -->


### isNewFile

<!-- doctype:start id="2a9c1dba-ec8e-49ba-a3fb-19e7bc2faa69" code_ref="packages/cli/init-orchestrator.ts#isNewFile" -->
**Purpose:** `isNewFile` indicates whether the documentation is being generated for a new file.

**Type:** `boolean`

**Return Type:** `boolean`

**Usage Example:**
```typescript
let isNewFile = false;
isNewFile = true; // Assume creating a new documentation file.
console.log(isNewFile);
// Output: true
```
<!-- doctype:end id="2a9c1dba-ec8e-49ba-a3fb-19e7bc2faa69" -->


### docContent

<!-- doctype:start id="ae5e4fa8-7cdf-494b-b1d7-16e12d9e675d" code_ref="packages/cli/init-orchestrator.ts#docContent" -->
**Purpose:** `docContent` is a string initialized to hold the documentation content that will be generated later.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
let docContent = '';
docContent += '### New Documentation';
console.log(docContent);
// Output: '### New Documentation'
```
<!-- doctype:end id="ae5e4fa8-7cdf-494b-b1d7-16e12d9e675d" -->


### codeRef

<!-- doctype:start id="fc237265-ec17-4fcc-9f18-33f4e290e1ba" code_ref="packages/cli/init-orchestrator.ts#codeRef" -->
**Purpose:** Formats a reference string for a code symbol using its file path and symbol name.

**Type:** `string`

**Parameters:**  
- `symbol: SymbolMetadata`  
  The symbol object containing properties:  
  - `filePath: string` - The path to the file containing the symbol.  
  - `symbolName: string` - The name of the symbol.

**Return Type:** `string`  
A formatted string representing the code reference in the form of `<filePath>#<symbolName>`.

**Usage Example:**  
```typescript
const codeRef = `${symbol.filePath}#${symbol.symbolName}`;
```
<!-- doctype:end id="fc237265-ec17-4fcc-9f18-33f4e290e1ba" -->


### originalSymbol

<!-- doctype:start id="81af5f70-2fb9-4226-b873-63d00de3e7d8" code_ref="packages/cli/init-orchestrator.ts#originalSymbol" -->
**Purpose:** `originalSymbol` retrieves the original symbol from the `chunk` that matches a specified `symbolName` from the results.

**Type:** `{ symbolName: string, signatureText: string } | undefined`

**Return Type:** `{ symbolName: string, signatureText: string } | undefined`

**Usage Example:**
```typescript
let chunk = [{ symbolName: 'symbol1', signatureText: 'signature1' }, { symbolName: 'symbol2', signatureText: 'signature2' }];
const res = { symbolName: 'symbol1' };
const originalSymbol = chunk.find(s => s.symbolName === res.symbolName);
console.log(originalSymbol);
// Output: { symbolName: 'symbol1', signatureText: 'signature1' }
```
<!-- doctype:end id="81af5f70-2fb9-4226-b873-63d00de3e7d8" -->


### results

<!-- doctype:start id="9bec0795-6c41-4ada-bb2a-4fb28f8fa0c1" code_ref="packages/cli/init-orchestrator.ts#results" -->
**Purpose:** `results` stores the outcomes generated by an AI agent using the provided `batchItems`.

**Type:** `Promise<any>`

**Return Type:** `Promise<any>`

**Usage Example:**
```typescript
const results = await config.aiAgent!.generateBatch(batchItems);
console.log(results);
// Output: Results from the AI agent for the provided batch items.
```
<!-- doctype:end id="9bec0795-6c41-4ada-bb2a-4fb28f8fa0c1" -->


### batchItems

<!-- doctype:start id="94307719-f1bf-4e0c-85a2-6dec9f603400" code_ref="packages/cli/init-orchestrator.ts#batchItems" -->
**Purpose:** `batchItems` holds an array of objects created from a `chunk`, mapping each entry to its `symbolName` and `signatureText`.

**Type:** `Array<{ symbolName: string, signatureText: string }>`

**Return Type:** `Array<{ symbolName: string, signatureText: string }>`

**Usage Example:**
```typescript
let chunk = [{ symbolName: 'symbol1', signatureText: 'signature1' }, { symbolName: 'symbol2', signatureText: 'signature2' }];
let batchItems = chunk.map(s => ({ symbolName: s.symbolName, signatureText: s.signatureText }));
console.log(batchItems);
// Output: [{ symbolName: 'symbol1', signatureText: 'signature1' }, { symbolName: 'symbol2', signatureText: 'signature2' }]
```
<!-- doctype:end id="94307719-f1bf-4e0c-85a2-6dec9f603400" -->


### completedBatches

<!-- doctype:start id="e67598a9-b293-4a59-9abb-8d9c394dc077" code_ref="packages/cli/init-orchestrator.ts#completedBatches" -->
**Purpose:** `completedBatches` stores the count of successfully processed batches in a batch processing system.

**Type:** `number`

**Return Type:** `number`

**Usage Example:**
```typescript
let completedBatches = 0;
completedBatches += 1; // Increment after successfully processing a batch.
console.log(completedBatches);  // Output: 1
```
<!-- doctype:end id="e67598a9-b293-4a59-9abb-8d9c394dc077" -->


### i

<!-- doctype:start id="556835bd-d650-4442-aabd-a3f1bb84dcff" code_ref="packages/cli/init-orchestrator.ts#i" -->
**Purpose:** `i` is a numerical variable used to track an index or counter within a loop or batch processing.

**Type:** `number`

**Return Type:** `number`

**Usage Example:**
```typescript
let i = 0;
for (i = 0; i < 5; i++) {
    console.log(i);
}
// Output: 0, 1, 2, 3, 4
```
<!-- doctype:end id="556835bd-d650-4442-aabd-a3f1bb84dcff" -->


### chunks

<!-- doctype:start id="d12c6ef9-1d63-40e4-9c20-c44189e3852f" code_ref="packages/cli/init-orchestrator.ts#chunks" -->
**Purpose:** An array that holds the divided batches of items to be processed.  
**Type:** Array initialized as an empty array.  
**Return Type:** Array of chunks.  
**Usage Example:**  
```typescript  
const chunks = [];  
```
<!-- doctype:end id="d12c6ef9-1d63-40e4-9c20-c44189e3852f" -->


### BATCH_CONCURRENCY

<!-- doctype:start id="68a80bd3-a51a-416a-8f7e-2e100f8f65b1" code_ref="packages/cli/init-orchestrator.ts#BATCH_CONCURRENCY" -->
**Purpose:** Specifies the number of concurrent batches that can be processed simultaneously.  
**Type:** Integer constant initialized to 5.  
**Return Type:** Number  
**Usage Example:**  
```typescript  
console.log(BATCH_CONCURRENCY);  // Outputs: 5  
```
<!-- doctype:end id="68a80bd3-a51a-416a-8f7e-2e100f8f65b1" -->


### BATCH_SIZE

<!-- doctype:start id="fc426ccf-edb6-47d8-935e-5c1cbae818d4" code_ref="packages/cli/init-orchestrator.ts#BATCH_SIZE" -->
**Purpose:** Defines the maximum number of items to be processed in a single batch.  
**Type:** Integer constant initialized to 10.  
**Return Type:** Number  
**Usage Example:**  
```typescript  
console.log(BATCH_SIZE);  // Outputs: 10  
```
<!-- doctype:end id="fc426ccf-edb6-47d8-935e-5c1cbae818d4" -->


### generatedContentMap

<!-- doctype:start id="d169cf3c-ad3e-4600-a269-bb68863282c3" code_ref="packages/cli/init-orchestrator.ts#generatedContentMap" -->
**Purpose:** A map that associates generated documentation content with their respective identifiers.  
**Parameters:**  
- `new Map<string, string>()`: Initializes a new map with string keys and string values.  
**Return Type:** Map of generated content.  
**Usage Example:**  
```typescript  
const generatedContentMap = new Map<string, string>();  
```
<!-- doctype:end id="d169cf3c-ad3e-4600-a269-bb68863282c3" -->


### codeRef

<!-- doctype:start id="168accce-2c54-4730-bbaa-d3a0db636a80" code_ref="packages/cli/init-orchestrator.ts#codeRef" -->
**Purpose:** Formats a reference string for a code symbol using its file path and symbol name.

**Type:** `string`

**Parameters:**  
- `symbol: SymbolMetadata`  
  The symbol object containing properties `filePath` and `symbolName`.

**Return Type:** `string`  
  A formatted string representing the code reference.

**Usage Example:**  
```typescript
const codeRef = `${symbol.filePath}#${symbol.symbolName}`;
```
<!-- doctype:end id="168accce-2c54-4730-bbaa-d3a0db636a80" -->


### symbol

<!-- doctype:start id="78a4f74e-0969-494d-a840-26c493d3c93a" code_ref="packages/cli/init-orchestrator.ts#symbol" -->
**Purpose:** Represents a code symbol that includes metadata such as file path and symbol name.

**Type:** `SymbolMetadata`

**Parameters:** None

**Return Type:** `SymbolMetadata`  
  An object containing details about a specific code symbol, including its file path, name, and other related properties.

**Usage Example:**  
```typescript
const symbol = {/* symbol details */};
```
<!-- doctype:end id="78a4f74e-0969-494d-a840-26c493d3c93a" -->


### existingCodeRefs

<!-- doctype:start id="fd26246c-2f61-43fc-9a53-facb920b56b2" code_ref="packages/cli/init-orchestrator.ts#existingCodeRefs" -->
**Purpose:** Retrieves a list of existing code references from the provided document content.

**Type:** `string[]`

**Parameters:**  
- `docContent: string`  
  The markdown content of the document to extract code references from.

**Return Type:** `string[]`  
  An array of existing code reference strings.

**Usage Example:**  
```typescript
const existingCodeRefs = anchorInserter.getExistingCodeRefs(docContent);
```
<!-- doctype:end id="fd26246c-2f61-43fc-9a53-facb920b56b2" -->


### docContent

<!-- doctype:start id="e4ee780b-c4e7-4e71-b9a4-d027ce466ca5" code_ref="packages/cli/init-orchestrator.ts#docContent" -->
**Purpose:** `docContent` is a string initialized to hold the documentation content that will be generated later.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
let docContent = '';
docContent += '### New Documentation';
console.log(docContent);
// Output: '### New Documentation'
```
<!-- doctype:end id="e4ee780b-c4e7-4e71-b9a4-d027ce466ca5" -->


### missingSymbols

<!-- doctype:start id="4832faa1-5936-40d1-b0b6-b2116f7fcab7" code_ref="packages/cli/init-orchestrator.ts#missingSymbols" -->
**Purpose:** Stores missing symbols that need to be documented.  
**Parameters:**  
- `typeof symbolsToDocument`: An array of symbols that are expected to be documented, initialized as an empty array.  
**Return Type:** Array of missing symbols.  
**Usage Example:**  
```typescript  
const missingSymbols: typeof symbolsToDocument = [];  
```
<!-- doctype:end id="4832faa1-5936-40d1-b0b6-b2116f7fcab7" -->


### sym

<!-- doctype:start id="6be8c013-4451-43a4-884c-7c9e5f0e8038" code_ref="packages/cli/init-orchestrator.ts#sym" -->
**Purpose:** Represents a symbol within the document preparation system.  
**Type:** Symbol type requires no specific parameters.  
**Return Type:** N/A  
**Usage Example:**  
```typescript  
const mySymbol = sym;  
```
<!-- doctype:end id="6be8c013-4451-43a4-884c-7c9e5f0e8038" -->


### symbolsByDoc

<!-- doctype:start id="4167243d-4fc5-4418-befd-3575e9980308" code_ref="packages/cli/init-orchestrator.ts#symbolsByDoc" -->
**Purpose:** A map storing symbols grouped by their documentation file paths.

**Type:** `Map<string, typeof symbolsToDocument>`  

**Return Type:** `Map<string, Array<{...}>>`  

**Usage Example:**  
```typescript
let symbolsByDoc = new Map<string, typeof symbolsToDocument>();
```
<!-- doctype:end id="4167243d-4fc5-4418-befd-3575e9980308" -->


### errorMsg

<!-- doctype:start id="c83b9406-78fb-430e-9682-a3eef2e90420" code_ref="packages/cli/init-orchestrator.ts#errorMsg" -->
**Purpose:** Stores an error message when a hash cannot be computed for a given symbol within a specified TypeScript file.

**Type:** `string`  

**Return Type:** `string`  

**Parameters:**
- `signature.symbolName` (type: `string`): The name of the symbol for which the hash is not computed.
- `tsFile` (type: `string`): The path to the TypeScript file being analyzed.

**Usage Example:**  
```typescript
let errorMsg = `No hash computed for ${signature.symbolName} in ${tsFile}`;
```  

**Behavior:** The new error message provides a clearer indication that the issue is specifically related to the absence of a computed hash for the symbol, replacing the previous more general error message regarding file analysis failure.
<!-- doctype:end id="c83b9406-78fb-430e-9682-a3eef2e90420" -->


### targetDocFile

<!-- doctype:start id="0279a73f-6a44-4b2e-ae55-45d9fab771c1" code_ref="packages/cli/init-orchestrator.ts#targetDocFile" -->
**Purpose:** Determines the target output file for documentation based on output strategy, folder, relative path, and symbol type.

**Type:** `string`  

**Return Type:** `string`  

**Usage Example:**  
```typescript
let targetDocFile = determineOutputFile(config.outputStrategy || 'mirror', docsFolder, relativePath, signature.symbolType);
```
<!-- doctype:end id="0279a73f-6a44-4b2e-ae55-45d9fab771c1" -->


### errorMsg

<!-- doctype:start id="8af17ca9-9287-4436-8a10-d00d4d7c11a8" code_ref="packages/cli/init-orchestrator.ts#errorMsg" -->
**Purpose:** Stores an error message when file analysis fails.

**Type:** `string`  

**Return Type:** `string`  

**Usage Example:**  
```typescript
let errorMsg = `Could not analyze ${tsFile}: ${error instanceof Error ? error.message : String(error)}`;
```
<!-- doctype:end id="8af17ca9-9287-4436-8a10-d00d4d7c11a8" -->


### hash

<!-- doctype:start id="40cf0c13-f344-432c-9a05-78cf82c5086a" code_ref="packages/cli/init-orchestrator.ts#hash" -->
**Purpose:** Computes the hash for the specified signature.

**Type:** `string`  

**Return Type:** `string`  

**Usage Example:**  
```typescript
let hash = signature.hash;
```
<!-- doctype:end id="40cf0c13-f344-432c-9a05-78cf82c5086a" -->


### signature

<!-- doctype:start id="11a6d2b1-1732-4438-8916-e648cdb631e5" code_ref="packages/cli/init-orchestrator.ts#signature" -->
**Purpose:** Represents a single symbol's signature details.

**Type:** `Signature`  

**Return Type:** `Signature`  

**Usage Example:**  
```typescript
let signature: Signature;
```
<!-- doctype:end id="11a6d2b1-1732-4438-8916-e648cdb631e5" -->


### relativePath

<!-- doctype:start id="d957907b-7bd4-417e-8861-b17cbe7fc8aa" code_ref="packages/cli/init-orchestrator.ts#relativePath" -->
**Purpose:** Provides the relative file path from the project root to the TypeScript file.

**Type:** `string`  

**Return Type:** `string`  

**Usage Example:**  
```typescript
let relativePath = path.relative(projectRoot, tsFile).split(path.sep).join('/');
```
<!-- doctype:end id="d957907b-7bd4-417e-8861-b17cbe7fc8aa" -->


### signatures

<!-- doctype:start id="566838e9-077c-4337-b35b-82a0eb4ed8d2" code_ref="packages/cli/init-orchestrator.ts#signatures" -->
**Purpose:** Stores the analysis results of the TypeScript file, including its signatures.

**Type:** `ReturnType<typeof analyzer.analyzeFile>`  

**Return Type:** `Array<Signature>`  

**Usage Example:**  
```typescript
let signatures = analyzer.analyzeFile(tsFile);
```
<!-- doctype:end id="566838e9-077c-4337-b35b-82a0eb4ed8d2" -->


### tsFile

<!-- doctype:start id="35264429-1d6e-40cc-9885-805530e663c3" code_ref="packages/cli/init-orchestrator.ts#tsFile" -->
**Purpose:** Represents the TypeScript file being analyzed.

**Type:** `string`  

**Return Type:** `string`  

**Usage Example:**  
```typescript
let tsFile: string = 'src/index.ts';
```
<!-- doctype:end id="35264429-1d6e-40cc-9885-805530e663c3" -->


### symbolsToDocument

<!-- doctype:start id="c2d4ea9e-a112-4fe7-9e98-40b60e1b29d9" code_ref="packages/cli/init-orchestrator.ts#symbolsToDocument" -->
**Purpose:** An array to store metadata for symbols being documented.

**Type:** `Array<{filePath: string; symbolName: string; symbolType: SymbolTypeValue; signatureText: string; hash: string; targetDocFile: string; originalSignature: CodeSignature;}>`  
**Properties:**  
- `filePath`: The path of the file containing the symbol (string).  
- `symbolName`: The name of the symbol (string).  
- `symbolType`: The type of the symbol, typically represented by a `SymbolTypeValue`.  
- `signatureText`: The signature representation of the symbol (string).  
- `hash`: The unique hash for the symbol (string).  
- `targetDocFile`: The output documentation file for this symbol (string).  
- `originalSignature`: The original signature details encapsulated in a `CodeSignature`.  

**Return Type:** `void`  

**Usage Example:**  
```typescript
let symbolsToDocument: Array<{filePath: string; symbolName: string; symbolType: SymbolTypeValue; signatureText: string; hash: string; targetDocFile: string; originalSignature: CodeSignature;}> = [];
```
<!-- doctype:end id="c2d4ea9e-a112-4fe7-9e98-40b60e1b29d9" -->


### relativeDocs

<!-- doctype:start id="ee4e4e51-d890-4b4b-b2b7-357132b36e7d" code_ref="packages/cli/init-orchestrator.ts#relativeDocs" -->
The `relativeDocs` variable holds the relative path of the documentation folder in relation to the project root directory.

- **Type**: `string`
- **Returns**: Returns the relative path from the project root to the documentation folder.

**Usage Example**:
```typescript
console.log(relativeDocs); // Outputs the relative path of the docs folder to the project root
```
<!-- doctype:end id="ee4e4e51-d890-4b4b-b2b7-357132b36e7d" -->


### relativeToRoot

<!-- doctype:start id="dc419f03-fc54-4459-9afd-ffb926e58329" code_ref="packages/cli/init-orchestrator.ts#relativeToRoot" -->
The `relativeToRoot` variable holds the relative path of a specified file in relation to the project root directory.

- **Type**: `string`
- **Returns**: Returns the relative path from the project root to the specified file.

**Usage Example**:
```typescript
console.log(relativeToRoot); // Outputs the relative path of the file to the project root
```
<!-- doctype:end id="dc419f03-fc54-4459-9afd-ffb926e58329" -->


### tsFiles

<!-- doctype:start id="f1135094-2b8f-4555-8c27-cfadf4c602f7" code_ref="packages/cli/init-orchestrator.ts#tsFiles" -->
The `tsFiles` variable filters the discovered files to obtain only TypeScript files that do not fall under the documentation folder.

- **Type**: `string[]`
- **Returns**: An array of TypeScript file paths.

**Usage Example**:
```typescript
tsFiles.forEach(file => console.log(file)); // Outputs paths of TypeScript files that are not in docsFolder
```
<!-- doctype:end id="f1135094-2b8f-4555-8c27-cfadf4c602f7" -->


### discoveryResult

<!-- doctype:start id="6d06b845-3144-466f-8684-9b4e04a22bc6" code_ref="packages/cli/init-orchestrator.ts#discoveryResult" -->
The `discoveryResult` variable contains the result of discovering files within a given project root. The discovery respects `.gitignore` settings and ignores hidden files based on the options provided.

- **Type**: `{ sourceFiles: string[] }`
- **Returns**: An object containing a list of discovered source files.

**Usage Example**:
```typescript
console.log(discoveryResult.sourceFiles); // Outputs an array of discovered source files
```
<!-- doctype:end id="6d06b845-3144-466f-8684-9b4e04a22bc6" -->


### anchorInserter

<!-- doctype:start id="dbb348e6-0dc9-4013-ad4c-478f6f62bef4" code_ref="packages/cli/init-orchestrator.ts#anchorInserter" -->
The `anchorInserter` variable is an instance of `MarkdownAnchorInserter`, which manages the insertion of anchors into Markdown documents.

- **Type**: `MarkdownAnchorInserter`
- **Returns**: An instance of `MarkdownAnchorInserter` for adding anchors to Markdown.

**Usage Example**:
```typescript
anchorInserter.insertAnchor('my-anchor', 'My Anchor Title'); // Insert an anchor into a Markdown document
```
<!-- doctype:end id="dbb348e6-0dc9-4013-ad4c-478f6f62bef4" -->


### mapManager

<!-- doctype:start id="ddf37817-0b37-41f6-bf30-4ff48af435c4" code_ref="packages/cli/init-orchestrator.ts#mapManager" -->
The `mapManager` variable is an instance of `DoctypeMapManager`, initialized with the path to the mapping file. It manages the mapping of document types.

- **Type**: `DoctypeMapManager`
- **Returns**: An instance of `DoctypeMapManager` for mapping document types.

**Usage Example**:
```typescript
mapManager.loadMappings(); // Load document type mappings from the file
```
<!-- doctype:end id="ddf37817-0b37-41f6-bf30-4ff48af435c4" -->


### analyzer

<!-- doctype:start id="8ce297bb-9ab0-456a-a5c5-027cba5af298" code_ref="packages/cli/init-orchestrator.ts#analyzer" -->
The `analyzer` variable is an instance of the `AstAnalyzer`, responsible for analyzing the Abstract Syntax Tree (AST) of the source files.

- **Type**: `AstAnalyzer`
- **Returns**: An instance of `AstAnalyzer` for performing AST analysis.

**Usage Example**:
```typescript
analyzer.analyze(someSourceCode); // Analyze provided source code
```
<!-- doctype:end id="8ce297bb-9ab0-456a-a5c5-027cba5af298" -->


### result

<!-- doctype:start id="013ddd4d-5b47-436f-8d34-1cc95fa949df" code_ref="packages/cli/init-orchestrator.ts#result" -->
The `result` variable is an object that stores the outcome of the scanning process, including counts of files, symbols, and errors encountered during processing.

- **Type**: `ScanResult`
- **Returns**: An object of type `ScanResult` with properties `totalFiles`, `totalSymbols`, `anchorsCreated`, `filesCreated`, and `errors`.

**Usage Example**:
```typescript
console.log(result.totalFiles); // Outputs the total number of files processed
```
<!-- doctype:end id="013ddd4d-5b47-436f-8d34-1cc95fa949df" -->


### mapFilePath

<!-- doctype:start id="62f0142a-8628-41d3-a32d-627c15fd5226" code_ref="packages/cli/init-orchestrator.ts#mapFilePath" -->
The `mapFilePath` variable holds the resolved path to the mapping file specified in the configuration. It uses the current working directory as the base path.

- **Type**: `string`
- **Returns**: Returns the absolute path to the mapping file.

**Usage Example**:
```typescript
console.log(mapFilePath); // Outputs the resolved path to the map file
```
<!-- doctype:end id="62f0142a-8628-41d3-a32d-627c15fd5226" -->


### docsFolder

<!-- doctype:start id="f0157908-91b6-4445-8aa3-28f69cfa9e18" code_ref="packages/cli/init-orchestrator.ts#docsFolder" -->
The `docsFolder` variable holds the resolved path to the documentation folder specified in the configuration. It uses the current working directory as the base path.

- **Type**: `string`
- **Returns**: Returns the absolute path to the documentation folder.

**Usage Example**:
```typescript
console.log(docsFolder); // Outputs the resolved path to the docs folder
```
<!-- doctype:end id="f0157908-91b6-4445-8aa3-28f69cfa9e18" -->


### projectRoot

<!-- doctype:start id="964090d3-2362-47c8-931b-f5358d89d598" code_ref="packages/cli/init-orchestrator.ts#projectRoot" -->
**Purpose:** Resolves the absolute path to the project root directory.

**Parameters:** N/A

**Return Type:** string (absolute path to project root)

**Usage Example:**  
```typescript
const projectRoot = path.resolve(process.cwd(), config.projectRoot);
```
<!-- doctype:end id="964090d3-2362-47c8-931b-f5358d89d598" -->


### scanAndCreateAnchors

<!-- doctype:start id="c106a4d2-86f1-4118-b7a9-81e2c2324950" code_ref="packages/cli/init-orchestrator.ts#scanAndCreateAnchors" -->
**Purpose:** Asynchronously scans files based on the provided configuration and creates documentation anchors.

**Parameters:**  
- `config` (InitConfig): The initialization settings for the scan operation.  
- `onProgress` (ProgressCallback, optional): A callback function to report progress.

**Return Type:** Promise<ScanResult> (resolves with scan results)

**Usage Example:**  
```typescript
const result = await scanAndCreateAnchors(config, onProgress);
console.log(result);
```
<!-- doctype:end id="c106a4d2-86f1-4118-b7a9-81e2c2324950" -->


### dir

<!-- doctype:start id="9749c985-64ab-4e90-8a17-53a43c6c401a" code_ref="packages/cli/init-orchestrator.ts#dir" -->
**Purpose:** Retrieves the directory name from a specified file path.

**Parameters:** N/A

**Return Type:** string (the directory name)

**Usage Example:**  
```typescript
const dir = path.dirname('/src/myFile.ts');
```
<!-- doctype:end id="9749c985-64ab-4e90-8a17-53a43c6c401a" -->


### dirPath

<!-- doctype:start id="67bf04e6-5c94-4b85-bc55-b7c730ca1efb" code_ref="packages/cli/init-orchestrator.ts#dirPath" -->
**Purpose:** Constructs the full path to a directory where documentation files will be stored.

**Parameters:** N/A

**Return Type:** string (the full directory path)

**Usage Example:**  
```typescript
const dirPath = path.join(docsFolder, parsed.dir);
```
<!-- doctype:end id="67bf04e6-5c94-4b85-bc55-b7c730ca1efb" -->


### parsed

<!-- doctype:start id="b9781cfc-abb6-4c8a-8cd4-5b559983f02b" code_ref="packages/cli/init-orchestrator.ts#parsed" -->
**Purpose:** Parses the given file path to extract components like the directory name and base file name.

**Parameters:** N/A

**Return Type:** ParsedPath (from 'path' module)

**Usage Example:**  
```typescript
const parsed = path.parse('/src/myFile.ts');
console.log(parsed.dir);  // Output: '/src'
```
<!-- doctype:end id="b9781cfc-abb6-4c8a-8cd4-5b559983f02b" -->


### effectiveStrategy

<!-- doctype:start id="0fa1b06f-889d-4633-af20-08f468b6bd66" code_ref="packages/cli/init-orchestrator.ts#effectiveStrategy" -->
**Purpose:** Provides a default output strategy if none is specified.

**Parameters:** N/A

**Return Type:** OutputStrategy

**Usage Example:**  
```typescript
const effectiveStrategy = strategy || 'mirror';
```
<!-- doctype:end id="0fa1b06f-889d-4633-af20-08f468b6bd66" -->


### determineOutputFile

<!-- doctype:start id="e0069ae8-9d8b-41f5-b50a-5a7a0fa8e3a9" code_ref="packages/cli/init-orchestrator.ts#determineOutputFile" -->
**Purpose:** Determines the output file path based on the provided strategy and file information.

**Parameters:**  
- `strategy` (OutputStrategy): The output strategy dictating the naming convention.  
- `docsFolder` (string): The documentation folder path.  
- `filePath` (string): The original path of the file being processed.  
- `symbolType` (SymbolTypeValue): The type of symbol for which the output file is being determined.

**Return Type:** string (the determined output file path)

**Usage Example:**  
```typescript
const outputFile = determineOutputFile('mirror', '/docs', '/src/myFile.ts', 'function');
```
<!-- doctype:end id="e0069ae8-9d8b-41f5-b50a-5a7a0fa8e3a9" -->


### ProgressCallback

<!-- doctype:start id="6d954982-837b-4983-aecb-06469d7b16c5" code_ref="packages/cli/init-orchestrator.ts#ProgressCallback" -->
**Purpose:** A function type used to report progress messages during operations.

**Parameters:**  
- `message` (string): A message indicating the current progress state.

**Return Type:** void

**Usage Example:**  
```typescript
const onProgress: ProgressCallback = (message) => {
    console.log(`Progress: ${message}`);
};
```
<!-- doctype:end id="6d954982-837b-4983-aecb-06469d7b16c5" -->


### ScanResult

<!-- doctype:start id="2932a71f-510e-4c4f-bd04-6376884b0a17" code_ref="packages/cli/init-orchestrator.ts#ScanResult" -->
**Purpose:** Represents the outcome of a scan operation, including statistical data.

**Parameters:**  
- `totalFiles` (number): The total number of files processed.  
- `totalSymbols` (number): The total number of symbols identified.  
- `anchorsCreated` (number): The number of anchors that were successfully created.  
- `filesCreated` (number): The number of files generated.  
- `errors` (string[]): An array of error messages encountered during the scan.

**Return Type:** N/A (interface)

**Usage Example:**  
```typescript
const result: ScanResult = {
    totalFiles: 100,
    totalSymbols: 250,
    anchorsCreated: 50,
    filesCreated: 5,
    errors: []
};
```
<!-- doctype:end id="2932a71f-510e-4c4f-bd04-6376884b0a17" -->


### InitConfig

<!-- doctype:start id="4b6ac812-9170-4f99-89c6-27cf99d7d8a1" code_ref="packages/cli/init-orchestrator.ts#InitConfig" -->
**Purpose:** Represents the configuration settings needed to initialize a project.

**Parameters:**  
- `projectRoot` (string): The root directory of the project.  
- `docsFolder` (string): The folder where documentation will be generated.  
- `mapFile` (string): The path to a file used for mapping symbols.  
- `outputStrategy` (OutputStrategy, optional): The strategy for outputting documentation (e.g., 'mirror', 'flat').  
- `aiAgent` (AIAgent, optional): An agent used for AI-related functionality.

**Return Type:** N/A (interface)

**Usage Example:**  
```typescript
const config: InitConfig = {
    projectRoot: '/path/to/project',
    docsFolder: '/path/to/docs',
    mapFile: '/path/to/map.file',
    outputStrategy: 'mirror'
};
```
<!-- doctype:end id="4b6ac812-9170-4f99-89c6-27cf99d7d8a1" -->



### OutputStrategy

<!-- doctype:start id="7ad1b638-3a06-40b6-9c37-2540c590ee06" code_ref="packages/cli/init-orchestrator.ts#OutputStrategy" -->
**Purpose:** Defines the strategy for output formatting when generating results.

**Type:** 'mirror' | 'module' | 'type' - A union type indicating the possible output strategies.

**Usage Example:**
```typescript
const strategy: OutputStrategy = 'module';
```
<!-- doctype:end id="7ad1b638-3a06-40b6-9c37-2540c590ee06" -->
