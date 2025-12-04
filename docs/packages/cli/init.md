# Init

Auto-generated documentation via Doctype.


## API Reference

### errorMessage

<!-- doctype:start id="d41b675c-df9d-4869-9fed-5c4bdedc6496" code_ref="packages/cli/init.ts#errorMessage" -->
**Purpose:** Captures a formatted error message. If the error is an instance of `Error`, it retrieves the error message; otherwise, it defaults to 'Unknown error'.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
if (error) {
    console.error(errorMessage);
}
```
<!-- doctype:end id="d41b675c-df9d-4869-9fed-5c4bdedc6496" -->


### result

<!-- doctype:start id="6df84561-bfe2-4dd2-bb4c-dff9d22ff22e" code_ref="packages/cli/init.ts#result" -->
**Purpose:** Stores the result of executing the `scanAndCreateAnchors` function, which includes various configuration parameters.

**Parameters:**
- `projectRoot: string` - The root directory for the project.
- `docsFolder: string` - The folder containing documentation.
- `mapFile: string` - The file for mapping related information.
- `outputStrategy: OutputStrategy` - The strategy for generating output.
- `aiAgent: AIAgent | undefined` - Optional AI agent for processing.
- `message: (msg: string) => void` - Callback function for message handling.

**Return Type:** `Promise<ScanResult>`

**Usage Example:**
```typescript
result = await scanAndCreateAnchors({
    projectRoot: config.projectRoot,
    docsFolder: config.docsFolder,
    mapFile: config.mapFile,
    outputStrategy: config.outputStrategy,
    aiAgent: aiAgent,
}, (message) => s2.message(message));
```
<!-- doctype:end id="6df84561-bfe2-4dd2-bb4c-dff9d22ff22e" -->


### aiAgent

<!-- doctype:start id="f639e1c8-49a3-4fc4-b7bc-6e237fcde5b1" code_ref="packages/cli/init.ts#aiAgent" -->
**Purpose:** Represents the AI agent that may be undefined.

**Type:** `AIAgent | undefined`

**Return Type:** `AIAgent | undefined`

**Usage Example:**
```typescript
if (aiAgent) {
    aiAgent.performTask();
}
```
<!-- doctype:end id="f639e1c8-49a3-4fc4-b7bc-6e237fcde5b1" -->


### s2

<!-- doctype:start id="d5c3702b-6417-4968-9658-0540b0f3e08f" code_ref="packages/cli/init.ts#s2" -->
**Purpose:** Initializes a spinner for displaying loading states or progress indicators.

**Type:** Returns a spinner instance from `p.spinner()`.

**Return Type:** `Spinner`

**Usage Example:**
```typescript
s2.start();  // Start the spinner
```
<!-- doctype:end id="d5c3702b-6417-4968-9658-0540b0f3e08f" -->


### envContent

<!-- doctype:start id="6944f5d8-bb41-4352-8b1c-077b4a0f4a2e" code_ref="packages/cli/init.ts#envContent" -->
**Purpose:** Holds the content of environment-related settings read from a specified file.

**Type:** `string`

**Parameters:**
- `envPath` (type: `string`): The path to the environment file that is read synchronously. This should be a valid file path pointing to a location containing environment configuration.

**Return Type:** `string`  
Represents the content of the environment file read as a UTF-8 encoded string.

**Usage Example:**
```typescript
import * as fs from 'fs';

const envPath: string = './path/to/envfile'; // specify the correct path to the environment file
const envContent: string = fs.readFileSync(envPath, 'utf-8');
console.log(envContent); // Output the content of the environment file
```
<!-- doctype:end id="6944f5d8-bb41-4352-8b1c-077b4a0f4a2e" -->


### fullProjectRoot

<!-- doctype:start id="8bfff2be-5928-41fc-a70c-8366490103f3" code_ref="packages/cli/init.ts#fullProjectRoot" -->
**Purpose:** Computes the absolute path to the project root based on the current working directory and configuration.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
const fullProjectRoot = path.resolve(process.cwd(), config.projectRoot);
console.log(`Full project root path: ${fullProjectRoot}`);
```
<!-- doctype:end id="8bfff2be-5928-41fc-a70c-8366490103f3" -->


### s

<!-- doctype:start id="9089ab54-0ad3-4ac9-bc98-e31d2cfceb5f" code_ref="packages/cli/init.ts#s" -->
**Purpose:** Initializes a spinner for visual feedback during asynchronous operations.

**Type:** `Spinner`

**Return Type:** `Spinner`

**Usage Example:**
```typescript
const s = p.spinner();
s.start();
// some async operation
s.stop();
```
<!-- doctype:end id="9089ab54-0ad3-4ac9-bc98-e31d2cfceb5f" -->


### config

<!-- doctype:start id="d99114a0-ea10-4190-a46e-698a630c3a3e" code_ref="packages/cli/init.ts#config" -->
**Purpose:** Holds configuration settings for the current project including project details and API provider.

**Type:** `DoctypeConfig`

**Return Type:** `DoctypeConfig`

**Usage Example:**
```typescript
const config: DoctypeConfig = {
    projectName: projectName as string,
    projectRoot: projectRoot as string,
    docsFolder: docsFolder as string,
    mapFile: mapFile as string,
    outputStrategy: outputStrategy as OutputStrategy,
    aiProvider: aiProvider as AIProvider,
};
console.log(config);
```
<!-- doctype:end id="d99114a0-ea10-4190-a46e-698a630c3a3e" -->


### newApiKey

<!-- doctype:start id="6030e160-450a-4780-8570-cdd75d961a66" code_ref="packages/cli/init.ts#newApiKey" -->
**newApiKey**

**Description:**  
Prompts the user to input their new API key for a specified AI provider. The input is collected securely without echoing the typed characters.

**Parameters:**
- `message` (string): The message displayed to the user, prompting for input. The message will include the name of the AI provider and the environment variable intended to store the API key.

**Return Type:**  
`Promise<string>` - A promise that resolves to the new API key entered by the user, represented as a string.

**Usage Example:**
```typescript
const apiKey = await p.password({ message: `Enter your new OpenAI API key (for OPENAI_API_KEY):` });
// apiKey now contains the user-input string representing the new API key.
```
<!-- doctype:end id="6030e160-450a-4780-8570-cdd75d961a66" -->


### newApiKey

<!-- doctype:start id="cfef0c4d-127a-499b-ae8c-22660ca6283b" code_ref="packages/cli/init.ts#newApiKey" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="cfef0c4d-127a-499b-ae8c-22660ca6283b" -->


### replaceKey

<!-- doctype:start id="02d376c2-5754-4907-9d26-d39f11a9a1e8" code_ref="packages/cli/init.ts#replaceKey" -->
**Purpose:** Prompts user to confirm replacing the existing API key in the .env file.

**Type:** `Promise<boolean>`

**Return Type:** `Promise<boolean>`

**Usage Example:**
```typescript
const replaceKey = await p.confirm({message: `Do you want to replace the existing ${apiKeyEnvVarName} in your .env file?`, initialValue: false});
if (replaceKey) {
    console.log('User confirmed replacement.');
}
```
<!-- doctype:end id="02d376c2-5754-4907-9d26-d39f11a9a1e8" -->


### match

<!-- doctype:start id="1a9eb725-a88e-4aa9-8d2e-c58e5984b109" code_ref="packages/cli/init.ts#match" -->
**Purpose:** Matches the content of the .env file to find the specific API key variable.

**Type:** `RegExpMatchArray | null`

**Return Type:** `RegExpMatchArray | null`

**Usage Example:**
```typescript
const match = envContent.match(new RegExp(`${apiKeyEnvVarName}=(.+)`));
if (match) {
    console.log(`Found API Key: ${match[1]}`);
} else {
    console.log('API Key not found.');
}
```
<!-- doctype:end id="1a9eb725-a88e-4aa9-8d2e-c58e5984b109" -->


### envContent

<!-- doctype:start id="bc40cf51-216e-4b92-8f18-05c32dcc02d4" code_ref="packages/cli/init.ts#envContent" -->
**Purpose:** Holds an empty string that can be used to store environment-related content.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
let message: string = envContent;
```
<!-- doctype:end id="bc40cf51-216e-4b92-8f18-05c32dcc02d4" -->


### apiKey

<!-- doctype:start id="7359d794-312d-4305-bf6d-1eb59c0c601d" code_ref="packages/cli/init.ts#apiKey" -->
**Purpose:** Represents the API key needed for authentication.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
apiKey = 'your_generated_api_key';
console.log(`API Key set to: ${apiKey}`);
```
<!-- doctype:end id="7359d794-312d-4305-bf6d-1eb59c0c601d" -->


### existingApiKey

<!-- doctype:start id="e51327d8-275c-4692-ba9f-732733f9ff98" code_ref="packages/cli/init.ts#existingApiKey" -->
**Purpose:** Stores the existing API key if available, or null if not set.

**Type:** `string | null`

**Return Type:** `string | null`

**Usage Example:**
```typescript
if (existingApiKey) {
    console.log(`Using existing API key: ${existingApiKey}`);
} else {
    console.log('No existing API key found.');
}
```
<!-- doctype:end id="e51327d8-275c-4692-ba9f-732733f9ff98" -->


### apiKeyEnvVarName

<!-- doctype:start id="a160df4c-6d72-48da-8f35-88ddd72b2151" code_ref="packages/cli/init.ts#apiKeyEnvVarName" -->
**Purpose:** Retrieves the environment variable name for the API key based on the selected AI provider.

**Parameters:**  
- This symbol does not accept parameters but depends on `aiProvider` to fetch the corresponding name.

**Return Type:** **string** - The environment variable name associated with the API key.

**Usage Example:**  
```typescript  
const apiKeyEnvVarName = getApiKeyEnvVarName(aiProvider);  
```
<!-- doctype:end id="a160df4c-6d72-48da-8f35-88ddd72b2151" -->


### envPath

<!-- doctype:start id="7d0eafd1-1016-4117-9463-1f326f73f6c8" code_ref="packages/cli/init.ts#envPath" -->
**Purpose:** Constructs the path to the environment configuration file ('.env') within the current working directory.

**Parameters:**  
- This symbol does not accept parameters.

**Return Type:** **string** - The constructed path to the '.env' file.

**Usage Example:**  
```typescript  
const envPath = path.join(process.cwd(), '.env');  
```
<!-- doctype:end id="7d0eafd1-1016-4117-9463-1f326f73f6c8" -->


### aiProvider

<!-- doctype:start id="d81d4dd4-acdf-4043-94f7-4d3cecfa6510" code_ref="packages/cli/init.ts#aiProvider" -->
**Purpose:** Casts the selected AI provider to the appropriate type, ensuring type safety for further use.

**Parameters:**  
- This symbol does not accept parameters but relies on `aiProviderSelection`.

**Return Type:** **AIProvider** - The selected AI provider, cast to the type `AIProvider`.

**Usage Example:**  
```typescript  
const aiProvider: AIProvider = aiProviderSelection as AIProvider;  
```
<!-- doctype:end id="d81d4dd4-acdf-4043-94f7-4d3cecfa6510" -->


### aiProviderSelection

<!-- doctype:start id="025cf8bc-29ed-48ff-bf7c-ec6c65a2f1df" code_ref="packages/cli/init.ts#aiProviderSelection" -->
**Purpose:** Prompts the user to select which AI provider to use for documentation generation.

**Parameters:**  
- `message`: **string** - The prompt message asking for AI provider selection.  
- `options`: **Array<string>** - An array of AI providers to choose from.  
- `initialValue`: **string** - The default selected provider, preset to 'openai'.

**Return Type:** **Promise<string>** - Resolves to the value of the selected AI provider.

**Usage Example:**  
```typescript  
const aiProviderSelection = await p.select({  
    message: 'Which AI provider would you like to use?',  
    options: AI_PROVIDERS,  
    initialValue: 'openai',  
});  
```
<!-- doctype:end id="025cf8bc-29ed-48ff-bf7c-ec6c65a2f1df" -->


### outputStrategy

<!-- doctype:start id="1f311b92-3136-4979-9ed5-edf6e4dd3bf6" code_ref="packages/cli/init.ts#outputStrategy" -->
**Purpose:** Prompts the user to select how documentation files will be structured.

**Parameters:**  
- `message`: **string** - The prompt message explaining the selection.  
- `options`: **Array<{ value: string, label: string }>** - An array of options available for the user to choose from. Each option consists of a value and a label.  
- `initialValue`: **string** - The pre-selected option value, defaulting to 'mirror'.

**Return Type:** **Promise<string>** - Resolves to the value of the selected output strategy.

**Usage Example:**  
```typescript  
const outputStrategy = await p.select({  
    message: 'How should documentation files be structured?',  
    options:[  
        {value: 'mirror', label: 'Mirror Source Structure(e.g. src/auth/login.ts → docs/src/auth/login.md)'},  
        {value: 'module', label: 'Module/Folder Based(e.g. src/auth/* → docs/src/auth.md)'},  
        {value: 'type', label: 'Symbol Type Based(e.g. All Functions → docs/functions.md)'},  
    ],  
    initialValue: 'mirror',  
});  
```
<!-- doctype:end id="1f311b92-3136-4979-9ed5-edf6e4dd3bf6" -->


### mapFile

<!-- doctype:start id="6b09c3d0-dd3c-4196-8663-290e619fad6f" code_ref="packages/cli/init.ts#mapFile" -->
**Purpose:** Prompts the user for the desired name of the map file.

**Parameters:**  
- `message`: **string** - The prompt message asking for the map file name.  
- `placeholder`: **string** - The name suggested within the input field.  
- `defaultValue`: **string** - The default name for the map file, set to 'doctype-map.json'.

**Return Type:** **Promise<string>** - Resolves to the filename input by the user for the map file.

**Usage Example:**  
```typescript  
const mapFile = await p.text({  
    message: 'What should the map file be called?',  
    placeholder: 'doctype-map.json',  
    defaultValue: 'doctype-map.json',  
});  
```
<!-- doctype:end id="6b09c3d0-dd3c-4196-8663-290e619fad6f" -->


### docsFolder

<!-- doctype:start id="4a72c894-caa8-4aeb-b7a5-7ff730c85588" code_ref="packages/cli/init.ts#docsFolder" -->
**Purpose:** Prompts the user to specify where documentation files should be stored.

**Parameters:**  
- `message`: **string** - The message in the prompt asking for documentation storage location.  
- `placeholder`: **string** - Suggested default directory for documentation files.  
- `defaultValue`: **string** - Pre-filled value for the input, defaulting to './docs'.

**Return Type:** **Promise<string>** - Resolves to the directory path chosen for storing documentation files.

**Usage Example:**  
```typescript  
const docsFolder = await p.text({  
    message: 'Where do you want to store documentation?',  
    placeholder: './docs',  
    defaultValue: './docs',  
});  
```
<!-- doctype:end id="4a72c894-caa8-4aeb-b7a5-7ff730c85588" -->


### projectRoot

<!-- doctype:start id="39d8bfb9-3f74-4914-af7a-901d0db7b6bd" code_ref="packages/cli/init.ts#projectRoot" -->
**Purpose:** Prompts the user to specify the root directory for the project.

**Parameters:**  
- `message`: **string** - The prompt message shown to the user.  
- `placeholder`: **string** - Provides a hint of the expected input.  
- `defaultValue`: **string** - The initial directory value, defaulting to the current directory.

**Return Type:** **Promise<string>** - Resolves to the path of the project root directory specified by the user.

**Usage Example:**  
```typescript  
const projectRoot = await p.text({  
    message: 'Where is your project root directory?',  
    placeholder: '.',  
    defaultValue: '.',  
});  
```
<!-- doctype:end id="39d8bfb9-3f74-4914-af7a-901d0db7b6bd" -->


### projectName

<!-- doctype:start id="fe278752-d436-41ca-8ddc-503e65701639" code_ref="packages/cli/init.ts#projectName" -->
**Purpose:** Prompts the user for their project name, suggesting the current working directory name as the default.

**Parameters:**  
- `message`: **string** - The message shown in the prompt.  
- `placeholder`: **string** - Placeholder text for input.  
- `defaultValue`: **string** - The default value displayed in the input, set to the name of the current working directory.

**Return Type:** **Promise<string>** - Resolves to the project name entered by the user.

**Usage Example:**  
```typescript  
const projectName = await p.text({  
    message: 'What is your project name?',  
    placeholder: path.basename(process.cwd()),  
    defaultValue: path.basename(process.cwd()),  
});  
```
<!-- doctype:end id="fe278752-d436-41ca-8ddc-503e65701639" -->


### overwrite

<!-- doctype:start id="33f68540-afc1-4536-8304-5c652fcb858b" code_ref="packages/cli/init.ts#overwrite" -->
**Purpose:** Prompts the user for confirmation to overwrite an existing configuration file named 'doctype.config.json'.

**Parameters:**  
- `message`: **string** - The prompt message displayed to the user.  
- `initialValue`: **boolean** - The initial value for the confirmation, indicating whether the user wants to overwrite or not.

**Return Type:** **Promise<boolean>** - Resolves to `true` if the user confirms overwriting, `false` otherwise.

**Usage Example:**  
```typescript  
const overwrite = await p.confirm({  
    message: '⚠️ doctype.config.json already exists. Do you want to overwrite it?',  
    initialValue: false,  
});  
```
<!-- doctype:end id="33f68540-afc1-4536-8304-5c652fcb858b" -->


### configPath

<!-- doctype:start id="6aeff2ea-6ebf-4032-a7a0-d19b80a2ea36" code_ref="packages/cli/init.ts#configPath" -->
**Purpose:** Represents the file path to the configuration file.

**Behavior:** Constructs the path to `doctype.config.json` located in the current working directory.

**Parameters:**
- None

**Return Type:** `string` - The file path as a string.

**Usage Example:**
```typescript
console.log(configPath); // Outputs the full path to the doctype.config.json file
```
<!-- doctype:end id="6aeff2ea-6ebf-4032-a7a0-d19b80a2ea36" -->



### initCommand

<!-- doctype:start id="9011f1d6-aaea-43f5-a55f-d5cbb0bc5bc1" code_ref="packages/cli/init.ts#initCommand" -->
**Purpose:** Initializes the command with the given options.

**Behavior:** Asynchronous function that processes initialization logic based on options provided.

**Parameters:**
- `_options: InitOptions` (optional) - Configuration options for initialization, defaults to an empty object.

**Return Type:** `Promise<InitResult>` - Returns a promise that resolves to the initialization result.

**Usage Example:**
```typescript
await initCommand(); // Initializes with default options
```
<!-- doctype:end id="9011f1d6-aaea-43f5-a55f-d5cbb0bc5bc1" -->
