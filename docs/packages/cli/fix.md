# Fix

Auto-generated documentation via Doctype.


## API Reference

### commitResult

<!-- doctype:start id="6f3e2491-c20f-4167-994f-e29816f70788" code_ref="packages/cli/fix.ts#commitResult" -->
**Purpose:** Automatically commits modified files using the GitHelper instance.

**Parameters:**
- `modifiedFiles`: `string[]` - Array of file paths that were modified.
- `symbolNames`: `string[]` - Array of symbol names to include in the commit message.
- `false`: `boolean` - A flag indicating whether to skip the commit if not necessary.

**Return Type:** `CommitResult` - The result of the commit operation.

**Usage Example:**
```typescript
const commitResult = gitHelper.autoCommit(Array.from(modifiedFiles), symbolNames, false);
```
<!-- doctype:end id="6f3e2491-c20f-4167-994f-e29816f70788" -->


### symbolNames

<!-- doctype:start id="e78a1366-4413-415f-84bf-5c0720cec41a" code_ref="packages/cli/fix.ts#symbolNames" -->
**Purpose:** Creates an array of successful symbol names from a collection of fixes.

**Parameters:**
- `fixes`: `Fix[]` - An array of fix objects, each containing success status and symbol name.

**Return Type:** `string[]` - An array of symbol names from successful fixes.

**Usage Example:**
```typescript
const symbolNames = fixes.filter(f => f.success).map(f => f.symbolName);
```
<!-- doctype:end id="e78a1366-4413-415f-84bf-5c0720cec41a" -->


### fix

<!-- doctype:start id="4c58e5b1-9d5e-404e-8319-dda3e554ec91" code_ref="packages/cli/fix.ts#fix" -->
**Purpose:** Represents the structure or method for applying a fix in the context of this code.

**Parameters:** None

**Return Type:** `any` - The type of the fix can vary based on its implementation.

**Usage Example:**
```typescript
const fix = /* implementation or reference of a fix */;
```
<!-- doctype:end id="4c58e5b1-9d5e-404e-8319-dda3e554ec91" -->


### modifiedFiles

<!-- doctype:start id="fdbbff6e-f262-4ee4-aa87-9e30a0f3bc81" code_ref="packages/cli/fix.ts#modifiedFiles" -->
**Purpose:** Maintains a collection of modified file paths.

**Parameters:** None

**Return Type:** `Set<string>` - A set containing the paths of modified files.

**Usage Example:**
```typescript
const modifiedFiles = new Set<string>();
```
<!-- doctype:end id="fdbbff6e-f262-4ee4-aa87-9e30a0f3bc81" -->


### gitHelper

<!-- doctype:start id="919644fa-b442-4027-b12b-df575bcc7b94" code_ref="packages/cli/fix.ts#gitHelper" -->
**Purpose:** Initializes a new instance of the GitHelper class, providing a logger for operations.

**Parameters:**
- `logger`: `Logger` - An instance of a logger used to record operations.

**Return Type:** `GitHelper` - A new instance of the GitHelper class.

**Usage Example:**
```typescript
const gitHelper = new GitHelper(logger);
```
<!-- doctype:end id="919644fa-b442-4027-b12b-df575bcc7b94" -->


### errorMsg

<!-- doctype:start id="3135a31d-cd83-4cd4-adc1-7d8d069f8e98" code_ref="packages/cli/fix.ts#errorMsg" -->
**Purpose:** Generates a user-friendly error message from an error object.

**Parameters:**
- `error`: `unknown` - The error to extract the message from, which can either be an instance of `Error` or any other type.

**Return Type:** `string` - The extracted error message as a string.

**Usage Example:**
```typescript
const errorMsg = error instanceof Error ? error.message : String(error);
```
<!-- doctype:end id="3135a31d-cd83-4cd4-adc1-7d8d069f8e98" -->


### newHash

<!-- doctype:start id="3563ebb1-fa5d-4fbb-b01d-b0bdb7f303fb" code_ref="packages/cli/fix.ts#newHash" -->
**Purpose:** Retrieves the current hash signature from the signature object.

**Parameters:**
- `currentSignature`: `Signature` - An object containing the current file signature information.

**Return Type:** `string` - The current hash value.

**Usage Example:**
```typescript
const newHash = currentSignature.hash!;
```
<!-- doctype:end id="3563ebb1-fa5d-4fbb-b01d-b0bdb7f303fb" -->


### result

<!-- doctype:start id="af7e5780-a531-4c5b-803b-4d35aab7582a" code_ref="packages/cli/fix.ts#result" -->
**Purpose:** Injects new content into a specified file, using the injector service.

**Parameters:**
- `docFilePath`: `string` - The path to the file where content will be injected.
- `entry.id`: `string` - The identifier of the entry being processed.
- `newContent`: `string` - The new content to be injected into the file.
- `writeToFile`: `boolean` - Indicates whether to actually write the changes to the file.

**Return Type:** `any` - The result of the injection operation, dependent on the injector's implementation.

**Usage Example:**
```typescript
const result = injector.injectIntoFile(docFilePath, entry.id, newContent, writeToFile);
```
<!-- doctype:end id="af7e5780-a531-4c5b-803b-4d35aab7582a" -->


### writeToFile

<!-- doctype:start id="0965cf88-8eac-4cd5-89dd-11951ccfabd6" code_ref="packages/cli/fix.ts#writeToFile" -->
**Purpose:** Determines whether to write changes to the file based on the dry run option.

**Parameters:**
- `options.dryRun`: `boolean` - Indicates if the process should only simulate changes without applying them.

**Return Type:** `boolean` - Returns `true` if changes should be written; otherwise, `false`.

**Usage Example:**
```typescript
const writeToFile = !options.dryRun;
```
<!-- doctype:end id="0965cf88-8eac-4cd5-89dd-11951ccfabd6" -->


### docFilePath

<!-- doctype:start id="9278126d-6d6e-4888-89eb-09ed20d229c0" code_ref="packages/cli/fix.ts#docFilePath" -->
**Purpose:** Resolves the file path for the documentation file based on the project base and entry reference.

**Parameters:**
- `projectBase`: `string` - The base directory of the project.
- `entry.docRef.filePath`: `string` - The relative path of the documentation file referenced in the entry.

**Return Type:** `string` - The resolved file path to the documentation file.

**Usage Example:**
```typescript
const resolvedPath = resolve(projectBase, entry.docRef.filePath);
```
<!-- doctype:end id="9278126d-6d6e-4888-89eb-09ed20d229c0" -->


### projectBase

<!-- doctype:start id="24c10cbf-6c97-4a29-bea5-ed328c19cb05" code_ref="packages/cli/fix.ts#projectBase" -->
**Purpose:** Determines the base directory for the project based on configuration settings or defaults to the current working directory.

**Parameters:**  
- `config: { baseDir?: string } | null` - Configuration object that may contain the `baseDir` property.

**Return Type:** `string` - The base directory path for the project.

**Usage Example:**
```typescript
const projectBase = config ? (config.baseDir || process.cwd()) : dirname(mapPath);
console.log('Project Base:', projectBase);
```
<!-- doctype:end id="24c10cbf-6c97-4a29-bea5-ed328c19cb05" -->


### errorMsg

<!-- doctype:start id="3d42b50e-114c-4d06-a9a1-781b93a08fe1" code_ref="packages/cli/fix.ts#errorMsg" -->
**Purpose:** Generates a user-friendly error message from an error object.

**Parameters:**
- `error`: `unknown` - The error to extract the message from, which can either be an instance of `Error` or any other type.

**Return Type:** `string` - The extracted error message as a string.

**Behavior:** 
- If `error` is an instance of `Error`, it returns the `message` property.
- If `error` is of another type, it converts `error` to a string using `String(error)`.

**Usage Example:**
```typescript
const errorMsg = error instanceof Error ? error.message : String(error);
```
<!-- doctype:end id="3d42b50e-114c-4d06-a9a1-781b93a08fe1" -->


### newContent

<!-- doctype:start id="2b979d41-c962-4731-849d-b4ab68c20581" code_ref="packages/cli/fix.ts#newContent" -->
**Purpose:** Holds the new content as a string, ready for processing or display.

**Parameters:** None.

**Return Type:** `string` - A string containing the new content.

**Usage Example:**
```typescript
const newContent: string = 'This is the updated content.';
console.log('New Content:', newContent);
```
<!-- doctype:end id="2b979d41-c962-4731-849d-b4ab68c20581" -->


### drift

<!-- doctype:start id="d613c0df-1bb5-4fb2-9620-3ebaa55fb638" code_ref="packages/cli/fix.ts#drift" -->
**Purpose:** Represents the amount or level of drift in the current data or system state.

**Parameters:** None.

**Return Type:** `undefined` - No explicit initialization; its type will depend on its definition elsewhere in the code.

**Usage Example:**
```typescript
if (drift) {
    console.log('Drift detected:', drift);
}
```
<!-- doctype:end id="d613c0df-1bb5-4fb2-9620-3ebaa55fb638" -->


### failCount

<!-- doctype:start id="de283f6f-a1bd-40f4-84de-5958b5a5f4b4" code_ref="packages/cli/fix.ts#failCount" -->
**Purpose:** Tracks the number of failed operations.

**Parameters:** None.

**Return Type:** `number` - Initialized to 0 indicating no failed operations initially.

**Usage Example:**
```typescript
let failCount = 0;
failCount++;
console.log('Fail count:', failCount);
```
<!-- doctype:end id="de283f6f-a1bd-40f4-84de-5958b5a5f4b4" -->


### successCount

<!-- doctype:start id="08b5f2f1-97ec-4847-9af6-c7ad9c6a860c" code_ref="packages/cli/fix.ts#successCount" -->
**Purpose:** Tracks the number of successful operations performed.

**Parameters:** None.

**Return Type:** `number` - Initialized to 0 indicating no successful operations initially.

**Usage Example:**
```typescript
let successCount = 0;
successCount++;
console.log('Success count:', successCount);
```
<!-- doctype:end id="08b5f2f1-97ec-4847-9af6-c7ad9c6a860c" -->


### fixes

<!-- doctype:start id="21c960ac-c9ef-4a39-9f2d-30136751a6e8" code_ref="packages/cli/fix.ts#fixes" -->
**Purpose:** Holds an array of fix details that may be applied to content or code.

**Parameters:** None.

**Return Type:** `FixDetail[]` - An array of `FixDetail` objects, initialized to an empty array.

**Usage Example:**
```typescript
let fixes: FixDetail[] = [];
fixes.push({ id: 1, description: 'Fix missing semicolon' });
console.log(fixes);
```
<!-- doctype:end id="21c960ac-c9ef-4a39-9f2d-30136751a6e8" -->


### injector

<!-- doctype:start id="6f0cb0cf-e6b5-41b9-b59f-baa899a78bdd" code_ref="packages/cli/fix.ts#injector" -->
**Purpose:** Instantiates a new instance of `ContentInjector` for handling content injections.

**Parameters:** None.

**Return Type:** `ContentInjector` - A new instance of the `ContentInjector` class.

**Usage Example:**
```typescript
const injector = new ContentInjector();
console.log('Injector created:', injector);
```
<!-- doctype:end id="6f0cb0cf-e6b5-41b9-b59f-baa899a78bdd" -->


### errorMsg

<!-- doctype:start id="23124c03-30a2-4a09-9c26-8bf5fa72f379" code_ref="packages/cli/fix.ts#errorMsg" -->
**Purpose:** Generates a user-friendly error message from an error object.

**Parameters:**
- `error`: `unknown` - The error to extract the message from, which can either be an instance of `Error` or any other type.

**Return Type:** `string` - The extracted error message as a string.

**Usage Example:**
```typescript
const errorMsg = error instanceof Error ? error.message : String(error);
```
<!-- doctype:end id="23124c03-30a2-4a09-9c26-8bf5fa72f379" -->


### isConnected

<!-- doctype:start id="c1fcc204-8c2f-4364-b92d-c0ce01aafb3b" code_ref="packages/cli/fix.ts#isConnected" -->
**Purpose:** Checks if the AI agent is currently connected.

**Parameters:** None.

**Return Type:** `Promise<boolean>` - Resolves to `true` if connected, otherwise `false`.

**Usage Example:**
```typescript
const connected = await aiAgent.validateConnection();
if (connected) {
    console.log('Connected to the AI agent.');
} else {
    console.log('Not connected.');
}
```
<!-- doctype:end id="c1fcc204-8c2f-4364-b92d-c0ce01aafb3b" -->


### useAI

<!-- doctype:start id="47e11c71-cac3-41e2-ba54-b2930d64aa66" code_ref="packages/cli/fix.ts#useAI" -->
**Purpose**: A boolean flag indicating whether to enable AI functionalities.

**Parameters**: None.

**Return Type**: `boolean`: Indicates if AI features should be used (true) or not (false).

**Usage Example**:
```typescript
const enableAI = useAI;
```
<!-- doctype:end id="47e11c71-cac3-41e2-ba54-b2930d64aa66" -->


### aiAgent

<!-- doctype:start id="2163dfef-31f2-4a97-bbd4-1d1806f5c9fe" code_ref="packages/cli/fix.ts#aiAgent" -->
**Purpose**: Holds an instance of the AI Agent or null if not set.

**Parameters**: None.

**Return Type**: `AIAgent | null`: Either an instance of AIAgent or null.

**Usage Example**:
```typescript
let agent: AIAgent | null = null;
```
<!-- doctype:end id="2163dfef-31f2-4a97-bbd4-1d1806f5c9fe" -->


### detectedDrifts

<!-- doctype:start id="ac0357e1-e69e-43c4-a457-e85c01fec005" code_ref="packages/cli/fix.ts#detectedDrifts" -->
**Purpose**: Detects any discrepancies in the map managed by the manager using the analysis from the analyzer.

**Parameters**:
- `mapManager` (DoctypeMapManager): The map manager containing the entries to analyze.
- `analyzer` (AstAnalyzer): The analyzer used to analyze the entries.
- `options` (Object): Additional options for detecting drifts.
  - `logger` (Logger): Logger instance for logging information.
  - `basePath` (string): The base path to use during detection.

**Return Type**: `Drift[]`: An array of detected drift objects.

**Usage Example**:
```typescript
const drifts = detectDrift(mapManager, analyzer, { logger, basePath: codeRoot });
```
<!-- doctype:end id="ac0357e1-e69e-43c4-a457-e85c01fec005" -->


### analyzer

<!-- doctype:start id="4d20277b-5a93-4836-8eb6-ddd3d1306844" code_ref="packages/cli/fix.ts#analyzer" -->
**Purpose**: Initializes an AST analyzer for analyzing abstract syntax trees.

**Parameters**: None.

**Return Type**: `AstAnalyzer`: An instance of the AstAnalyzer class.

**Usage Example**:
```typescript
const syntaxAnalyzer = new AstAnalyzer();
```
<!-- doctype:end id="4d20277b-5a93-4836-8eb6-ddd3d1306844" -->


### codeRoot

<!-- doctype:start id="f6bc2bd3-bdf9-465f-be62-95197874e5bf" code_ref="packages/cli/fix.ts#codeRoot" -->
**Purpose**: Determines the root directory of the code based on existing config or resolved paths.

**Parameters**:
- `config` (Object): The current configuration object.

**Return Type**: `string`: The root directory path for the code.

**Usage Example**:
```typescript
const rootPath = config ? resolve(config.baseDir || process.cwd(), config.projectRoot) : dirname(mapPath);
```
<!-- doctype:end id="f6bc2bd3-bdf9-465f-be62-95197874e5bf" -->


### entries

<!-- doctype:start id="e9ce7959-6bf4-4c21-af3f-64d09fa27408" code_ref="packages/cli/fix.ts#entries" -->
**Purpose**: Retrieves all entries managed by the map manager.

**Parameters**: None.

**Return Type**: `Entry[]`: An array of entry objects retrieved from the map manager.

**Usage Example**:
```typescript
const allEntries = mapManager.getEntries();
```
<!-- doctype:end id="e9ce7959-6bf4-4c21-af3f-64d09fa27408" -->


### mapManager

<!-- doctype:start id="228d5efb-44f5-4f56-b7e4-aa3436e48edc" code_ref="packages/cli/fix.ts#mapManager" -->
**Purpose**: Initializes the DoctypeMapManager with a specified map path.

**Parameters**:
- `mapPath` (string): The path to the map that the manager will handle.

**Return Type**: `DoctypeMapManager`: An instance of DoctypeMapManager.

**Usage Example**:
```typescript
const manager = new DoctypeMapManager(mapPath);
```
<!-- doctype:end id="228d5efb-44f5-4f56-b7e4-aa3436e48edc" -->


### mapPath

<!-- doctype:start id="236f3f46-77a7-4b26-85fb-8874436f23b8" code_ref="packages/cli/fix.ts#mapPath" -->
**Purpose**: Determines the path to the map file based on options or configuration.

**Parameters**:
- `options` (Object): The options provided at runtime.
  - `map` (string | undefined): The path to the custom map file.
- `config` (Object): The current configuration object.

**Return Type**: `string`: The resolved path to the map file.

**Usage Example**:
```typescript
const resolvedMapPath = options.map ? resolve(options.map) : getMapPath(config);
```
<!-- doctype:end id="236f3f46-77a7-4b26-85fb-8874436f23b8" -->


### config

<!-- doctype:start id="92c871f5-936d-4c5a-8c06-eb2171defe1e" code_ref="packages/cli/fix.ts#config" -->
**Purpose**: Represents the configuration settings for the application.

**Return Type**: `Config | undefined`: The configuration object or undefined if not set.

**Usage Example**:
```typescript
const appConfig = config;
```
<!-- doctype:end id="92c871f5-936d-4c5a-8c06-eb2171defe1e" -->


### logger

<!-- doctype:start id="49e8480d-0b75-48c0-9067-1b83f0557e60" code_ref="packages/cli/fix.ts#logger" -->
**Purpose**: Creates a logger instance with specified verbosity.

**Parameters**:
- `options` (Object): The options for logger configuration.
  - `verbose` (boolean): When true, enables detailed logging.

**Return Type**: `Logger`: An instance of the Logger class.

**Usage Example**:
```typescript
const logger = new Logger({ verbose: true });
```
<!-- doctype:end id="49e8480d-0b75-48c0-9067-1b83f0557e60" -->



### fixCommand

<!-- doctype:start id="0e2351df-a600-4ef6-b359-c4013699af77" code_ref="packages/cli/fix.ts#fixCommand" -->
**Purpose:** An asynchronous function designed to fix specific issues based on the provided options.

**Type:** `Promise<FixResult>`

**Parameters:**  
- `options: FixOptions`  
  An object containing settings for how the fix should be applied. 

**Return Type:** `Promise<FixResult>`  
  A promise that resolves to the result of the fix operation.

**Usage Example:**  
```typescript
async function runFix() {
  const options: FixOptions = {/* options */};
  const result: FixResult = await fixCommand(options);
}
```
<!-- doctype:end id="0e2351df-a600-4ef6-b359-c4013699af77" -->
