# Types

Auto-generated documentation via Doctype.


## API Reference

### GenerateOptions

<!-- doctype:start id="bc5eca9a-dd12-4bf5-9802-fe5775cb8e16" code_ref="packages/ai/types.ts#GenerateOptions" -->
**Purpose:** Options for generating documentation, allowing customization of the output.

**Parameters:**  
- `includeContext`: `boolean` (optional) - Indicates whether to include contextual information in the documentation. Defaults to `false`.  
- `includeExamples`: `boolean` (optional) - Indicates whether to include examples in the documentation. Defaults to `false`.  
- `maxLength`: `number` (optional) - Maximum length of the generated content.  
- `style`: `'concise' | 'detailed' | 'tutorial'` (optional) - The style of documentation to generate.

**Return Type:** `GenerateOptions`

**Usage Example:**  
```typescript
const options: GenerateOptions = {
    includeContext: true,
    includeExamples: true,
    maxLength: 1000,
    style: 'detailed'
};
```
<!-- doctype:end id="bc5eca9a-dd12-4bf5-9802-fe5775cb8e16" -->


### IAIProvider

<!-- doctype:start id="f423c618-8ff9-4883-a0dc-4cce754cd8db" code_ref="packages/ai/types.ts#IAIProvider" -->
**Purpose:** Interface defining methods for AI provider operations, including documentation generation and connection validation.

**Parameters:**  
- `provider`: `AIProvider` - The provider used for AI operations.  
- `generateDocumentation`: `(request: DocumentationRequest) => Promise<DocumentationResponse>` - Method that takes a documentation request and returns a promise that resolves to a `DocumentationResponse`.  
- `validateConnection`: `() => Promise<boolean>` - Method that checks if a connection to the provider is valid.

**Return Type:** `IAIProvider`

**Usage Example:**  
```typescript
const aiProvider: IAIProvider = {  
    provider: someAIProvider,  
    generateDocumentation: async (request) => { ... },  
    validateConnection: async () => { return true; }  
};
```
<!-- doctype:end id="f423c618-8ff9-4883-a0dc-4cce754cd8db" -->


### AIAgentConfig

<!-- doctype:start id="f2138833-1af1-4ae3-a04e-eed432eef517" code_ref="packages/ai/types.ts#AIAgentConfig" -->
**Purpose:** Configuration options for an AI agent, including model selection and execution settings.

**Parameters:**  
- `model`: `AIModel` - The model to be used by the AI agent.  
- `debug`: `boolean` (optional) - Enables or disables debug mode. Defaults to `false`.  
- `timeout`: `number` (optional) - Maximum time in milliseconds before the request times out.  
- `retry`: `object` (optional) - Settings for retrying failed requests, containing:  
  - `maxAttempts`: `number` - Maximum number of retry attempts.  
  - `delayMs`: `number` - Delay in milliseconds between attempts.

**Return Type:** `AIAgentConfig`

**Usage Example:**  
```typescript
const config: AIAgentConfig = {
    model: someAIModel,
    debug: true,
    timeout: 5000,
    retry: {
        maxAttempts: 3,
        delayMs: 1000
    }
};
```
<!-- doctype:end id="f2138833-1af1-4ae3-a04e-eed432eef517" -->


### AIProviderError

<!-- doctype:start id="16a69039-8c1a-436d-ab43-c271cc9c33df" code_ref="packages/ai/types.ts#AIProviderError" -->
**Purpose:** Represents an error that occurred during interaction with an AI provider, including error details.

**Parameters:**  
- `code`: `string` - A string representing the error code.  
- `message`: `string` - A description of the error.  
- `provider`: `AIProvider` - The provider where the error originated.  
- `originalError`: `unknown` (optional) - Contains the original error object, if available.

**Return Type:** `AIProviderError`

**Usage Example:**  
```typescript
const error: AIProviderError = {
    code: "AUTH_FAILED",
    message: "Authentication with AI provider failed.",
    provider: someAIProvider,
    originalError: new Error("Invalid credentials")
};
```
<!-- doctype:end id="16a69039-8c1a-436d-ab43-c271cc9c33df" -->


### DocumentationResponse

<!-- doctype:start id="364a8736-1b0b-4023-962f-1fc77eef69a7" code_ref="packages/ai/types.ts#DocumentationResponse" -->
**Purpose:** Represents the response from an AI documentation provider, containing the generated content and metadata.

**Parameters:**  
- `content`: `string` - The generated documentation content.  
- `provider`: `AIProvider` - The provider of the AI service.  
- `modelId`: `string` - Identifier for the model used for documentation generation.  
- `usage`: `object` (optional) - A record of token usage, containing:  
  - `promptTokens`: `number` - Number of tokens used in the prompt.  
  - `completionTokens`: `number` - Number of tokens in the generated completion.  
  - `totalTokens`: `number` - Total tokens used.  
- `timestamp`: `number` - The time at which the document was generated in milliseconds since the epoch.

**Return Type:** `DocumentationResponse`

**Usage Example:**  
```typescript
const response: DocumentationResponse = {
    content: "This is the generated documentation.",
    provider: someAIProvider,
    modelId: "model-12345",
    usage: {
        promptTokens: 10,
        completionTokens: 200,
        totalTokens: 210
    },
    timestamp: Date.now()
};
```
<!-- doctype:end id="364a8736-1b0b-4023-962f-1fc77eef69a7" -->


### DocumentationRequest

<!-- doctype:start id="4b28fbda-2bdb-401d-bd63-95c1a5b59dcd" code_ref="packages/ai/types.ts#DocumentationRequest" -->
**Purpose:** Represents a request structure for generating documentation, capturing details about symbol modifications.

**Parameters:**  
- `symbolName` (string): The name of the symbol being documented.  
- `oldSignature` (CodeSignature): The previous signature of the symbol.  
- `newSignature` (CodeSignature): The current signature of the symbol.  
- `oldDocumentation` (string): Previous documentation text.  
- `context` (optional, object): Additional contextual data.  
    - `filePath` (optional, string): The file path related to the symbol.  
    - `surroundingCode` (optional, string): Code surrounding the symbol.  
    - `relatedSymbols` (optional, string[]): Array of related symbols.

**Return Type:** DocumentationRequest

**Usage Example:**  
```typescript
const docRequest: DocumentationRequest = {
    symbolName: 'myMethod',
    oldSignature: 'function myMethod(param: string): boolean;',
    newSignature: 'function myMethod(param: string, options: object): boolean;',
    oldDocumentation: 'This is a method that does something.',
};
```
<!-- doctype:end id="4b28fbda-2bdb-401d-bd63-95c1a5b59dcd" -->


### AIModel

<!-- doctype:start id="7d911d49-47e6-4154-86e6-792f0083a91c" code_ref="packages/ai/types.ts#AIModel" -->
**Purpose:** Defines the structure of an AI model's configuration.

**Parameters:**  
- `provider` (AIProvider): The provider of the AI model.  
- `modelId` (string): Unique identifier for the model.  
- `apiKey` (string): API key for accessing the model.  
- `maxTokens` (optional, number): Maximum tokens for model responses.  
- `temperature` (optional, number): Indicates the creativity of responses.  
- `endpoint` (optional, string): The endpoint for model access.

**Return Type:** AIModel

**Usage Example:**  
```typescript
const model: AIModel = {
    provider: 'openai',
    modelId: 'gpt-4',
    apiKey: 'your_api_key',
};
```
<!-- doctype:end id="7d911d49-47e6-4154-86e6-792f0083a91c" -->



### AIProvider

<!-- doctype:start id="6fb4a970-ebf7-47b9-b980-7e34923bc3ae" code_ref="packages/ai/types.ts#AIProvider" -->
**Purpose:** Represents supported AI provider options available in the system.

**Type:** Union type that can be one of the following:
- 'openai'
- 'gemini'
- 'anthropic'
- 'mistral'

**Return Type:** AIProvider

**Usage Example:**  
```typescript
const provider: AIProvider = 'openai';
```
<!-- doctype:end id="6fb4a970-ebf7-47b9-b980-7e34923bc3ae" -->
