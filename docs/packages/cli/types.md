# Types

Auto-generated documentation via Doctype.


## API Reference

### DoctypeConfig

<!-- doctype:start id="8465008e-e031-4f23-9cd6-a757139c5a67" code_ref="packages/cli/types.ts#DoctypeConfig" -->
**Purpose:** This interface defines the configuration settings required to set up a document generation project.

**Properties:**
- **projectName**: `string` - The name of the project.
- **projectRoot**: `string` - The root directory of the project.
- **docsFolder**: `string` - The folder where documentation files are stored.
- **mapFile**: `string` - The file path to the source map.
- **outputStrategy**: `OutputStrategy` (optional) - The strategy for output formatting.
- **baseDir**: `string` (optional) - The base directory for file paths.
- **aiProvider**: `AIProvider` (optional) - The configuration for AI integration.

**Return type:** `DoctypeConfig`

**Usage example:**
```typescript
const config: DoctypeConfig = {
    projectName: 'My Project',
    projectRoot: '/path/to/project',
    docsFolder: '/path/to/docs',
    mapFile: 'mapfile.json'
};
```
<!-- doctype:end id="8465008e-e031-4f23-9cd6-a757139c5a67" -->


### AIProvider

<!-- doctype:start id="6ecb6f8e-8eb5-4a2c-8ed8-6a6cd622a59f" code_ref="packages/cli/types.ts#AIProvider" -->
**Purpose:** Type representing the available AI providers that the system can use for various AI-related functionalities.

**Parameters:** No parameters, as it is a type definition.

**Return Type:** This type does not have a return type as it is used to define a union type of string literals.

**Usage Example:**
```typescript
const selectedProvider: AIProvider = 'openai'; // using OpenAI as the AI provider
```
<!-- doctype:end id="6ecb6f8e-8eb5-4a2c-8ed8-6a6cd622a59f" -->


### InitResult

<!-- doctype:start id="53f4d0be-0163-44dd-9c11-697128f6e0fe" code_ref="packages/cli/types.ts#InitResult" -->
**Purpose:** Represents the result of an initialization operation, including success status and any error information.

**Parameters:**
- `success` (boolean): Indicates whether the initialization was successful.
- `configPath` (string, optional): Path to the configuration file used, if any.
- `error` (string, optional): Error message if initialization failed.

**Return Type:** This interface does not have a return type as it is used to structure result data.

**Usage Example:**
```typescript
const initResult: InitResult = {
    success: true,
    configPath: './config.json'
};
```
<!-- doctype:end id="53f4d0be-0163-44dd-9c11-697128f6e0fe" -->


### InitOptions

<!-- doctype:start id="21cab5a2-83dd-47fd-9051-67295fc46118" code_ref="packages/cli/types.ts#InitOptions" -->
**Purpose:** Represents optional parameters for the initialization process of the application or library.

**Parameters:**
- `verbose` (boolean, optional): If true, enables verbose output during the initialization process.

**Return Type:** This interface does not have a return type as it is used to structure option data.

**Usage Example:**
```typescript
const initOptions: InitOptions = {
    verbose: true
};
```
<!-- doctype:end id="21cab5a2-83dd-47fd-9051-67295fc46118" -->


### FixOptions

<!-- doctype:start id="098c3e8b-e2ef-4abc-beab-e634b0e0a8fe" code_ref="packages/cli/types.ts#FixOptions" -->
**Purpose:** Represents optional parameters for a fix operation affecting how fixes are executed and logged.

**Parameters:**
- `map` (string, optional): Path to a custom mapping file to use for fixes.
- `verbose` (boolean, optional): Enables detailed logging of the fix operation.
- `dryRun` (boolean, optional): If true, runs the fix operation as a simulation without applying changes.
- `autoCommit` (boolean, optional): If true, automatically commits changes after fixes are applied.
- `interactive` (boolean, optional): If true, engages the user for confirmation before applying each fix.
- `noAI` (boolean, optional): If true, disables any AI-generated suggestions during the fix process.

**Return Type:** This interface does not have a return type as it is used to structure option data.

**Usage Example:**
```typescript
const fixOptions: FixOptions = {
    map: './customFixMap.json',
    verbose: true,
    dryRun: true,
    autoCommit: false,
    interactive: true,
    noAI: false
};
```
<!-- doctype:end id="098c3e8b-e2ef-4abc-beab-e634b0e0a8fe" -->


### CheckOptions

<!-- doctype:start id="47719ffe-64f1-49c0-8a95-ba4378799636" code_ref="packages/cli/types.ts#CheckOptions" -->
**Purpose:** Represents optional parameters for a check operation that can modify its behavior.

**Parameters:**
- `map` (string, optional): Path to a custom mapping file, if different from the default.
- `verbose` (boolean, optional): Enables or disables verbose output logging.
- `strict` (boolean, optional): If true, strict mode is enabled, which may enforce stricter checks.

**Return Type:** This interface does not have a return type as it is used to structure option data.

**Usage Example:**
```typescript
const checkOptions: CheckOptions = {
    map: './customMap.json',
    verbose: true,
    strict: true
};
```
<!-- doctype:end id="47719ffe-64f1-49c0-8a95-ba4378799636" -->


### CLIConfig

<!-- doctype:start id="9494c870-aa37-4457-b95e-b96a0b1eb6a4" code_ref="packages/cli/types.ts#CLIConfig" -->
**Purpose:** Configures command line interface (CLI) operation parameters.

**Parameters:**
- `mapPath` (string): Path to the mapping file utilized by the CLI.
- `projectRoot` (string): Root directory of the project being processed.
- `verbose` (boolean): Indicates whether detailed logging output should be shown.
- `dryRun` (boolean): If true, the CLI will simulate operations without making actual changes.

**Return Type:** This interface does not have a return type as it is used to structure configuration data.

**Usage Example:**
```typescript
const cliConfig: CLIConfig = {
    mapPath: './map.json',
    projectRoot: './myProject',
    verbose: true,
    dryRun: false
};
```
<!-- doctype:end id="9494c870-aa37-4457-b95e-b96a0b1eb6a4" -->


### FixDetail

<!-- doctype:start id="007d26cf-3a2d-4a55-8ec0-91f7e0ea56ca" code_ref="packages/cli/types.ts#FixDetail" -->
**Purpose:** Provides detailed information about the outcome of a specific fix operation applied to a symbol.

**Parameters:**
- `id` (string): Unique identifier for the fix.
- `symbolName` (string): Name of the symbol for which the fix was attempted.
- `codeFilePath` (string): Path to the code file where the fix was applied.
- `docFilePath` (string): Path to the documentation file updated as a result of the fix.
- `success` (boolean): Indicates whether the fix was successfully applied.
- `error` (string, optional): Error message if the fix failed.
- `newContent` (string, optional): New content resulting from a successful fix, if applicable.

**Return Type:** This interface does not have a return type as it is used to structure response data.

**Usage Example:**
```typescript
const fixDetail: FixDetail = {
    id: 'fix1',
    symbolName: 'myFunction',
    codeFilePath: './src/myFunction.js',
    docFilePath: './docs/myFunction.md',
    success: true,
    newContent: 'Updated function to include parameter typing.'
};
```
<!-- doctype:end id="007d26cf-3a2d-4a55-8ec0-91f7e0ea56ca" -->


### FixResult

<!-- doctype:start id="b2cdb2b1-4a37-4bc5-b1b3-23da28c8b10b" code_ref="packages/cli/types.ts#FixResult" -->
**Purpose:** Represents the result of a fix operation, summarizing the number of fixes applied, their outcomes, and any configuration issues faced.

**Parameters:**
- `totalFixes` (number): Total number of fixes attempted during the operation.
- `successfulFixes` (number): Count of fixes that were successfully applied.
- `failedFixes` (number): Count of fixes that failed to apply.
- `fixes` (FixDetail[]): Array containing details about each fix applied.
- `success` (boolean): Indicates if the overall fix operation succeeded.
- `configError` (string, optional): Error message if configuration issues prevented successful fixes.

**Return Type:** This interface does not have a return type as it is used to structure response data.

**Usage Example:**
```typescript
const fixResult: FixResult = {
    totalFixes: 20,
    successfulFixes: 18,
    failedFixes: 2,
    fixes: [], // Array of FixDetail objects
    success: true
};
```
<!-- doctype:end id="b2cdb2b1-4a37-4bc5-b1b3-23da28c8b10b" -->


### DriftDetail

<!-- doctype:start id="8f41840b-bc31-4663-82b5-dfe050e2a8ea" code_ref="packages/cli/types.ts#DriftDetail" -->
**Purpose:** Represents detailed information regarding a specific drift identified during a check operation.

**Parameters:**
- `id` (string): Unique identifier for the drift.
- `symbolName` (string): Name of the symbol that has drifted.
- `codeFilePath` (string): Path to the code file where the drift is found.
- `docFilePath` (string): Path to the documentation file that is supposed to correspond.
- `docLine` (number): The line number in the documentation where the discrepancy is identified.
- `oldHash` (string): Hash of the previous state of the symbol.
- `newHash` (string): Hash of the current state of the symbol.
- `oldSignature` (string, optional): Previous method signature, if applicable.
- `newSignature` (string, optional): Current method signature, if applicable.

**Return Type:** This interface does not have a return type as it is used to structure response data.

**Usage Example:**
```typescript
const drift: DriftDetail = {
    id: 'drift1',
    symbolName: 'myFunction',
    codeFilePath: './src/myFunction.js',
    docFilePath: './docs/myFunction.md',
    docLine: 3,
    oldHash: 'abc123',
    newHash: 'xyz789',
    oldSignature: 'function myFunction() {}',
    newSignature: 'function myFunction(param: number) {}'
};
```
<!-- doctype:end id="8f41840b-bc31-4663-82b5-dfe050e2a8ea" -->



### CheckResult

<!-- doctype:start id="93dc192a-ad2a-453a-8cec-18a50b86ff8b" code_ref="packages/cli/types.ts#CheckResult" -->
**Purpose:** Represents the result of a check operation, indicating total entries processed, entries that veered off track, details of the drifts, and overall success state.

**Parameters:**
- `totalEntries` (number): Total number of entries processed during the check.
- `driftedEntries` (number): Number of entries that have drifted from the expected state.
- `drifts` (DriftDetail[]): Array containing details about each drift.
- `success` (boolean): Indicates whether the check operation was successful.
- `configError` (string, optional): Error message related to configuration issues, if any exist.

**Return Type:** This interface does not have a return type as it is used to structure response data.

**Usage Example:**
```typescript
const result: CheckResult = {
    totalEntries: 100,
    driftedEntries: 5,
    drifts: [], // Array of DriftDetail objects
    success: true
};
```
<!-- doctype:end id="93dc192a-ad2a-453a-8cec-18a50b86ff8b" -->
