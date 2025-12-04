# Check

Auto-generated documentation via Doctype.


## API Reference

### result

<!-- doctype:start id="747242e8-6112-4839-9408-52e3bbbdf5b7" code_ref="packages/cli/check.ts#result" -->
**Purpose:** Compiles the results of the drift check, summarizing findings and overall success status. 
**Parameters:**  
- `entries: Entry[]`: The entries retrieved from `mapManager`.  
- `drifts: DriftDetail[]`: The processed drift details.  
**Return Type:** `CheckResult` - The summarized result of drift verification. 
**Usage Example:**  
```typescript  
result = {  
totalEntries: entries.length,  
driftedEntries: drifts.length,  
drifts,  
success: drifts.length === 0,  
};  
```
<!-- doctype:end id="747242e8-6112-4839-9408-52e3bbbdf5b7" -->


### drift

<!-- doctype:start id="d95dbd8b-e696-4583-9fb3-70d5f67d8112" code_ref="packages/cli/check.ts#drift" -->
**Purpose:** Represents a single drift detected during the analysis between document types and code. 
**Parameters:** None 
**Return Type:** `Drift` - A representation of the drift issue. 
**Usage Example:**  
```typescript  
// drift will be part of the drifts array  
drifts.forEach((drift) => {  
  console.log(drift);  
});  
```
<!-- doctype:end id="d95dbd8b-e696-4583-9fb3-70d5f67d8112" -->


### drifts

<!-- doctype:start id="3e19eadd-5b64-4d20-a512-0403e481ff28" code_ref="packages/cli/check.ts#drifts" -->
**Purpose:** Transforms detected drifts into structured details for easier readability and processing. 
**Parameters:**  
- `detectedDrifts: Drift[]`: The array of detected drift issues.  
**Return Type:** `DriftDetail[]` - An array of structured drift details. 
**Usage Example:**  
```typescript  
drifts = detectedDrifts.map((drift) => ({  
id: drift.entry.id,  
symbolName: drift.entry.codeRef.symbolName,  
codeFilePath: drift.entry.codeRef.filePath,  
docFilePath: drift.entry.docRef.filePath,  
docLine: drift.entry.docRef.startLine,  
oldHash: drift.oldHash,  
newHash: drift.currentHash,  
oldSignature: undefined,  
newSignature: drift.currentSignature.signatureText,  
}));  
```
<!-- doctype:end id="3e19eadd-5b64-4d20-a512-0403e481ff28" -->


### detectedDrifts

<!-- doctype:start id="39a2f730-dca5-412f-b28e-f4898bfe1e0b" code_ref="packages/cli/check.ts#detectedDrifts" -->
**Purpose:** Identifies drift issues between the document types and the current code using the `mapManager` and `analyzer`. 
**Parameters:**  
- `mapManager: DoctypeMapManager`: The manager handling document types.  
- `analyzer: AstAnalyzer`: The analyzer to check against the code.  
- `options: { logger: Logger; basePath: string; }`: Configuration options to assist in the analysis.  
**Return Type:** `Drift[]` - An array of detected drifts. 
**Usage Example:**  
```typescript  
detectedDrifts = detectDrift(mapManager, analyzer, { logger, basePath: codeRoot });  
```
<!-- doctype:end id="39a2f730-dca5-412f-b28e-f4898bfe1e0b" -->


### analyzer

<!-- doctype:start id="4fce8908-5616-473a-817a-a5f5ca0efeb0" code_ref="packages/cli/check.ts#analyzer" -->
**Purpose:** Instantiates an `AstAnalyzer` for Abstract Syntax Tree analysis. 
**Parameters:** None 
**Return Type:** `AstAnalyzer` - An instance for analyzing ASTs. 
**Usage Example:**  
```typescript  
analyzer = new AstAnalyzer();  
```
<!-- doctype:end id="4fce8908-5616-473a-817a-a5f5ca0efeb0" -->


### codeRoot

<!-- doctype:start id="821912dc-806f-4ef7-90fb-0df515180e97" code_ref="packages/cli/check.ts#codeRoot" -->
**Purpose:** Determines the root directory for the codebase, either from the configuration or defaults to the map directory. 
**Parameters:**  
- `config: Configuration | undefined`: Optional configuration object that may contain paths. 
**Return Type:** `string` - The resolved root directory path. 
**Usage Example:**  
```typescript  
const codeRoot = config ? resolve(config.baseDir || process.cwd(), config.projectRoot) : dirname(mapPath);  
```
<!-- doctype:end id="821912dc-806f-4ef7-90fb-0df515180e97" -->


### entries

<!-- doctype:start id="d0959913-66c7-4e97-8e31-2ce9731125e6" code_ref="packages/cli/check.ts#entries" -->
**Purpose:** Retrieves a list of entries managed by the `mapManager`. 
**Parameters:** None 
**Return Type:** `Entry[]` - An array of entries from the document type map. 
**Usage Example:**  
```typescript  
const entries = mapManager.getEntries();  
```
<!-- doctype:end id="d0959913-66c7-4e97-8e31-2ce9731125e6" -->


### mapManager

<!-- doctype:start id="afd3485f-bd76-4752-8d30-3c0963d75c95" code_ref="packages/cli/check.ts#mapManager" -->
**Purpose:** Creates an instance of `DoctypeMapManager` to manage document type maps. 
**Parameters:**  
- `mapPath: string`: The file path to the map configuration. 
**Return Type:** `DoctypeMapManager` - An instance of the `DoctypeMapManager`. 
**Usage Example:**  
```typescript  
const mapManager = new DoctypeMapManager('/path/to/map');  
```
<!-- doctype:end id="afd3485f-bd76-4752-8d30-3c0963d75c95" -->


### mapPath

<!-- doctype:start id="52c5c4e0-31ab-487c-9207-84f07831c047" code_ref="packages/cli/check.ts#mapPath" -->
**Purpose:** Resolves the mapping path based on provided options or retrieves it from the configuration.

**Parameters:**  
- `options` (object): An object containing potential mapping options, specifically the `map` property.
  - `map` (string, optional): A custom map path to resolve.
- `config` (DoctypeConfig): The configuration object used when `options.map` is not provided.

**Return Type:**  
- (string): Returns the resolved mapping path.

**Usage Example:**  
```typescript
const resolved = mapPath = options.map ? resolve(options.map) : getMapPath(config);
console.log(resolved); // Outputs the resolved mapping path based on options or config
```
<!-- doctype:end id="52c5c4e0-31ab-487c-9207-84f07831c047" -->


### config

<!-- doctype:start id="d67e73d7-c63e-4902-b35c-e6b880b67909" code_ref="packages/cli/check.ts#config" -->
**Purpose:** Represents the configuration object used throughout the application.

**Parameters:**  
- None. The configuration is typically set during initialization.

**Return Type:**  
- (DoctypeConfig): Returns the current configuration object used in the application.

**Usage Example:**  
```typescript
console.log(config); // Outputs the entire configuration object
```
<!-- doctype:end id="d67e73d7-c63e-4902-b35c-e6b880b67909" -->


### logger

<!-- doctype:start id="8c6725f8-cf35-4025-b0d1-2dc19ef72a85" code_ref="packages/cli/check.ts#logger" -->
**Purpose:** Initializes a logger instance with optional verbosity settings.

**Parameters:**  
- `options` (object): An object containing configuration for the logger, specifically the `verbose` property.
  - `verbose` (boolean): If true, enables verbose logging.

**Return Type:**  
- (Logger): Returns an instance of the Logger class.

**Usage Example:**  
```typescript
const logger = new Logger({ verbose: true });
logger.log('This is a log message.');
```
<!-- doctype:end id="8c6725f8-cf35-4025-b0d1-2dc19ef72a85" -->



### checkCommand

<!-- doctype:start id="67b1416c-d4a6-4500-827f-20936facb1af" code_ref="packages/cli/check.ts#checkCommand" -->
**Purpose:** Asynchronously checks the validity of a command based on provided options.

**Parameters:**  
- `options` (CheckOptions): An object containing relevant options for the command check.

**Return Type:**  
- (Promise<CheckResult>): Resolves to the result of the command check.

**Usage Example:**  
```typescript
const result = await checkCommand({ verbose: true });
console.log(result); // Outputs the result of the command check
```
<!-- doctype:end id="67b1416c-d4a6-4500-827f-20936facb1af" -->
