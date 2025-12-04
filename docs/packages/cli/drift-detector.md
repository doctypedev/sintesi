# Drift-detector

Auto-generated documentation via Doctype.


## API Reference

### oldSignature

<!-- doctype:start id="1fa47f8b-acef-489a-a688-782c3d84846a" code_ref="packages/cli/drift-detector.ts#oldSignature" -->
**Purpose:** Holds the old signature from the previous analysis to compare with the current one.

**Type:** CodeSignature | undefined - The previous signature which may be undefined if it doesn’t exist.

**Usage Example:**
```typescript
let oldSignature: CodeSignature | undefined;
```
<!-- doctype:end id="1fa47f8b-acef-489a-a688-782c3d84846a" -->


### currentHash

<!-- doctype:start id="ec076e9e-6571-4b42-82b9-1544767dd0c8" code_ref="packages/cli/drift-detector.ts#currentHash" -->
**Purpose:** Retrieves the hash of the current signature to check for potential changes.

**Type:** string - The hash value of the current signature.

**Usage Example:**
```typescript
const currentHash = currentSignature.hash!;
```
<!-- doctype:end id="ec076e9e-6571-4b42-82b9-1544767dd0c8" -->


### currentSignature

<!-- doctype:start id="8a12337d-8035-443a-a4e1-0d3c2d02dcdb" code_ref="packages/cli/drift-detector.ts#currentSignature" -->
**Purpose:** Finds the current signature corresponding to the symbol defined in the entry.

**Type:** CodeSignature | undefined - Either the found signature or undefined if no match exists.

**Usage Example:**
```typescript
const currentSignature = signatures.find((sig: CodeSignature) => sig.symbolName === entry.codeRef.symbolName);
```
<!-- doctype:end id="8a12337d-8035-443a-a4e1-0d3c2d02dcdb" -->


### signatures

<!-- doctype:start id="9941049c-6c38-483b-903a-ae45d8a65acf" code_ref="packages/cli/drift-detector.ts#signatures" -->
**Purpose:** Analyzes the code file and extracts signatures from it.

**Type:** CodeSignature[] - An array of code signatures obtained from the analysis.

**Usage Example:**
```typescript
const signatures = analyzer.analyzeFile(codeFilePath);
```
<!-- doctype:end id="9941049c-6c38-483b-903a-ae45d8a65acf" -->


### codeFilePath

<!-- doctype:start id="3a6e5f75-adf4-41ba-8acd-c913aca62691" code_ref="packages/cli/drift-detector.ts#codeFilePath" -->
**Purpose:** Resolves the path of the code file referenced in the current entry.

**Type:** string - The resolved file path, constructed using basePath and entry information.

**Usage Example:**
```typescript
const codeFilePath = resolve(basePath, entry.codeRef.filePath);
```
<!-- doctype:end id="3a6e5f75-adf4-41ba-8acd-c913aca62691" -->


### entry

<!-- doctype:start id="2938478c-e74e-4002-972f-caedf5f52617" code_ref="packages/cli/drift-detector.ts#entry" -->
**Purpose:** Represents a single entry within the context of drift detection.

**Type:** Any - The specific type is context-dependent and varies based on how entries are structured.

**Usage Example:**
```typescript
const entry = someEntryRetrievalMethod();
```
<!-- doctype:end id="2938478c-e74e-4002-972f-caedf5f52617" -->


### drifts

<!-- doctype:start id="38d4436a-db0b-4820-8b40-b08d3d50a24d" code_ref="packages/cli/drift-detector.ts#drifts" -->
**Purpose:** Holds an array of drift information detected in the analysis process.

**Type:** DriftInfo[] - An array initialized as empty. It will store drift details as they are detected.

**Usage Example:**
```typescript
let drifts: DriftInfo[] = [];
```
<!-- doctype:end id="38d4436a-db0b-4820-8b40-b08d3d50a24d" -->


### entries

<!-- doctype:start id="a552cb8b-7a8b-4226-bd02-75488d91be66" code_ref="packages/cli/drift-detector.ts#entries" -->
**Purpose:** Retrieves the current entries managed by the map manager.

**Returns:** Any - The entries returned from the map manager's getEntries method.

**Usage Example:**
```typescript
const currentEntries = mapManager.getEntries();
```
<!-- doctype:end id="a552cb8b-7a8b-4226-bd02-75488d91be66" -->


### detectDrift

<!-- doctype:start id="f1c5f25c-31e8-423e-b4b9-2d685e898f4b" code_ref="packages/cli/drift-detector.ts#detectDrift" -->
**Purpose:** Detects changes (drift) in a document structure based on the provided map manager and analysis of syntax trees.

**Parameters:**
- `mapManager` (DoctypeMapManager): Manages the mapping of document types.
- `analyzer` (InstanceType<typeof AstAnalyzer>): An instance of the AST Analyzer used for analyzing document structures.
- `options` (DriftDetectionOptions, optional): Configuration options for drift detection. Defaults to an empty object.

**Returns:** DriftInfo[] - An array of drift information objects detailing any detected drift.

**Usage Example:**
```typescript
const drifts = detectDrift(mapManager, analyzer);
```
<!-- doctype:end id="f1c5f25c-31e8-423e-b4b9-2d685e898f4b" -->


### DriftDetectionOptions

<!-- doctype:start id="783424ab-bfab-4210-bd02-18386fbacb82" code_ref="packages/cli/drift-detector.ts#DriftDetectionOptions" -->
Interface defining options for drift detection, providing flexibility in configuration.

**Properties:**  
- `basePath` (string | undefined): Optional base path to restrict drift detection scope.  
- `logger` (Logger | undefined): Optional logger for output during the drift detection process.

**Usage example:**  
```typescript
const driftOptions: DriftDetectionOptions = {  
    basePath: '/src',  
    logger: customLogger  
};
```
<!-- doctype:end id="783424ab-bfab-4210-bd02-18386fbacb82" -->



### DriftInfo

<!-- doctype:start id="938d53ac-4d9c-4132-8a97-71ef58a14e9e" code_ref="packages/cli/drift-detector.ts#DriftInfo" -->
Interface representing information about a drift in system signatures, including comparative details across versions.

**Properties:**  
- `entry` (DoctypeMapEntry): The entry related to the drift detection.  
- `oldSignature` (CodeSignature | undefined): The signature before the change, if applicable.  
- `currentSignature` (CodeSignature): The signature after the change.  
- `currentHash` (string): The hash of the current version.  
- `oldHash` (string): The hash of the previous version.

**Usage example:**  
```typescript
const driftInfo: DriftInfo = {  
    entry: doctypeMapEntry,  
    oldSignature: previousSignature,  
    currentSignature: currentSignature,  
    currentHash: 'abc123',  
    oldHash: 'xyz789'  
};
```
<!-- doctype:end id="938d53ac-4d9c-4132-8a97-71ef58a14e9e" -->
