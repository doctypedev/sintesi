# Config-loader

Auto-generated documentation via Doctype.


## API Reference

### base

<!-- doctype:start id="afda68f6-a8d9-4f8c-a926-c9b7fe829539" code_ref="packages/cli/config-loader.ts#base" -->
**Purpose:** Establishes the base directory for project files, defaulting to the current working directory if not specified in configuration.

**Parameters:**  
- `config` (DoctypeConfig): The configuration object that may contain the base directory setting.

**Return Type:**  
- (string): Returns the base directory path.

**Usage Example:**  
```typescript
const baseDirectory = base;
console.log(baseDirectory); // Outputs base directory or process.cwd()
```
<!-- doctype:end id="afda68f6-a8d9-4f8c-a926-c9b7fe829539" -->


### getDocsPath

<!-- doctype:start id="fc852033-d415-460f-b850-5e93963d3d37" code_ref="packages/cli/config-loader.ts#getDocsPath" -->
**Purpose:** Retrieves the documentation path from the specified configuration object.

**Parameters:**  
- `config` (DoctypeConfig): The configuration object which includes documentation settings.

**Return Type:**  
- (string): Returns the documentation path as defined in the configuration.

**Usage Example:**  
```typescript
const docsPath = getDocsPath(config);
console.log(docsPath); // Outputs the documentation path from config
```
<!-- doctype:end id="fc852033-d415-460f-b850-5e93963d3d37" -->


### base

<!-- doctype:start id="363d7dd5-91f8-40c9-bff2-0f5370e9be4f" code_ref="packages/cli/config-loader.ts#base" -->
**Purpose:** Establishes the base directory for project files, defaulting to the current working directory if not specified in configuration.

**Parameters:**  
- `config` (DoctypeConfig): The configuration object that may contain the base directory setting.

**Return Type:**  
- (string): Returns the base directory path.

**Usage Example:**  
```typescript
const baseDirectory = base;
console.log(baseDirectory); // Outputs base directory or process.cwd()
```
<!-- doctype:end id="363d7dd5-91f8-40c9-bff2-0f5370e9be4f" -->


### getMapPath

<!-- doctype:start id="a2ba4723-1f37-46a0-9776-198e99b90219" code_ref="packages/cli/config-loader.ts#getMapPath" -->
**Purpose:** Retrieves the mapping path from the provided configuration object.

**Parameters:**  
- `config` (DoctypeConfig): The configuration object containing mapping settings.

**Return Type:**  
- (string): Returns the mapping path as defined in the configuration.

**Usage Example:**  
```typescript
const mapPath = getMapPath(config);
console.log(mapPath); // Outputs the mapping path defined in the config
```
<!-- doctype:end id="a2ba4723-1f37-46a0-9776-198e99b90219" -->


### resolvedPath

<!-- doctype:start id="2f4b53cd-047b-4fce-9ad7-9fd63fca1488" code_ref="packages/cli/config-loader.ts#resolvedPath" -->
**resolvedPath**

**Purpose:** Represents the absolute path of the configuration file resolved from the current working directory.

**Type:** `string`

**Behavior:**  
The `resolvedPath` is a computed property that holds the absolute path to the configuration file determined at runtime. 

**Usage Example:**  
```typescript
const configPath = './doctype.config.json';
const resolvedPath: string = path.resolve(process.cwd(), configPath);
console.log(resolvedPath); // Outputs the absolute path to doctype.config.json
```

**Return Type:**  
- `string`: This property holds the absolute path of the configuration file, providing a reliable reference for file operations.
<!-- doctype:end id="2f4b53cd-047b-4fce-9ad7-9fd63fca1488" -->


### configExists

<!-- doctype:start id="cea9dfec-8f71-4a87-aba9-1286f85adf18" code_ref="packages/cli/config-loader.ts#configExists" -->
**Purpose:** Checks if the configuration file exists at the specified path.

**Parameters:**  
- `configPath` (string, optional): The path to the configuration file. Defaults to './doctype.config.json'.

**Return Type:**  
- (boolean): Returns true if the configuration file exists, otherwise returns false.

**Usage Example:**  
```typescript
const exists = configExists('./custom.config.json');
console.log(exists); // true or false based on file presence
```
<!-- doctype:end id="cea9dfec-8f71-4a87-aba9-1286f85adf18" -->


### field

<!-- doctype:start id="2d95762d-cfc6-4da7-bb1b-2f7f7ab3ebc0" code_ref="packages/cli/config-loader.ts#field" -->
**Purpose:** Represents an unspecified field in the configuration, indicating the need for further specification in usage.

**Return Type:** The type is unspecified; details depend on usage context.

**Usage Example:**  
```typescript
let field = 'projectName';
```
<!-- doctype:end id="2d95762d-cfc6-4da7-bb1b-2f7f7ab3ebc0" -->


### requiredFields

<!-- doctype:start id="2e5c7351-deb3-40d3-81c8-c949b5fc02ce" code_ref="packages/cli/config-loader.ts#requiredFields" -->
**Purpose:** An array specifying mandatory fields required in the configuration.

**Return Type:** `(keyof DoctypeConfig)[]` - An array of keys that are required in the DoctypeConfig type.

**Usage Example:**  
```typescript
const requiredFields: (keyof DoctypeConfig)[] = ['projectName', 'projectRoot', 'docsFolder', 'mapFile'];
```
<!-- doctype:end id="2e5c7351-deb3-40d3-81c8-c949b5fc02ce" -->


### fileContent

<!-- doctype:start id="1226da35-a203-4e81-9aff-185e208e6cb9" code_ref="packages/cli/config-loader.ts#fileContent" -->
**Purpose:** Stores the contents of the configuration file read as a string.

**Return Type:** `string` - The string content of the file.

**Usage Example:**  
```typescript
const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
```
<!-- doctype:end id="1226da35-a203-4e81-9aff-185e208e6cb9" -->


### rawConfig

<!-- doctype:start id="dd457c4b-2ea4-4d4e-bbfe-f39a6c922cc8" code_ref="packages/cli/config-loader.ts#rawConfig" -->
**Purpose:** Holds the raw contents of the configuration file, typically prior to processing or validation.

**Return Type:** `any` - Can include any data type, depending on the raw configuration content.

**Usage Example:**  
```typescript
let rawConfig: any = fs.readFileSync(resolvedPath, 'utf-8');
```
<!-- doctype:end id="dd457c4b-2ea4-4d4e-bbfe-f39a6c922cc8" -->


### found

<!-- doctype:start id="a3cb840e-1905-4896-8907-8fba869e02ae" code_ref="packages/cli/config-loader.ts#found" -->
**Purpose:** Indicates whether the configuration file was found based on a search in the current directory.

**Return Type:** `boolean` - True if the configuration path was found, otherwise false.

**Usage Example:**  
```typescript
const found = findConfigPath(process.cwd(), 'doctype.config.json');
```
<!-- doctype:end id="a3cb840e-1905-4896-8907-8fba869e02ae" -->


### resolvedPath

<!-- doctype:start id="8888b933-b953-4869-9f54-816c5051d95d" code_ref="packages/cli/config-loader.ts#resolvedPath" -->
**Purpose:** Resolves the full path of the configuration file relative to the current working directory.

**Parameters:**  
- `configPath` (string): The path to the configuration file.

**Return Type:**  
- (string): Returns the resolved absolute path of the configuration file.

**Usage Example:**  
```typescript
const configPath = './doctype.config.json';
const path = resolvedPath;
console.log(path); // Outputs the absolute path to doctype.config.json
```
<!-- doctype:end id="8888b933-b953-4869-9f54-816c5051d95d" -->


### loadConfig

<!-- doctype:start id="f3dbe27e-6c23-46f9-9ea3-16a0c9615903" code_ref="packages/cli/config-loader.ts#loadConfig" -->
**Purpose:** Function for loading configuration settings from a specified file path.

**Parameters:**  
- `configPath: string` (optional) - The path to the configuration file. Defaults to './doctype.config.json'.

**Return Type:** `DoctypeConfig` - Returns an instance of the loaded configuration.

**Usage Example:**  
```typescript
const config = loadConfig(); // loads the default config
const customConfig = loadConfig('/custom/path/config.json'); // loads a custom config
```
<!-- doctype:end id="f3dbe27e-6c23-46f9-9ea3-16a0c9615903" -->


### InvalidConfigError

<!-- doctype:start id="c26d9a26-88b0-4126-ab0a-8c4ede49d971" code_ref="packages/cli/config-loader.ts#InvalidConfigError" -->
**Purpose:** Custom error class designed to signal invalid configurations when loading a config file.

**Parameters:**  
- `reason: string` - A description of why the configuration is considered invalid.

**Return Type:** This class does not have a return type but creates an instance of an error.

**Usage Example:**  
```typescript
throw new InvalidConfigError('Missing required field: projectName');
```
<!-- doctype:end id="c26d9a26-88b0-4126-ab0a-8c4ede49d971" -->



### ConfigNotFoundError

<!-- doctype:start id="aff5bc19-912c-4aca-9161-2d379f63d537" code_ref="packages/cli/config-loader.ts#ConfigNotFoundError" -->
**Purpose:** Custom error class to represent the situation when configuration files cannot be found.

**Parameters:**  
- `configPath: string` - The path where the configuration was expected to be found.

**Return Type:** This class does not have a return type but creates an instance of an error.

**Usage Example:**  
```typescript
throw new ConfigNotFoundError('/path/to/config.json');
```
<!-- doctype:end id="aff5bc19-912c-4aca-9161-2d379f63d537" -->
