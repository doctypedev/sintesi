# Ai-agent

Auto-generated documentation via Doctype.


## API Reference

### createAgentFromEnv

<!-- doctype:start id="60795969-93ac-480d-a525-3326807fb3ae" code_ref="packages/ai/ai-agent.ts#createAgentFromEnv" -->
**Purpose:** Creates an AI agent instance based on environment settings, which may include model specifications.

**Parameters:**  
- `options` (optional, object): Configuration options for agent instantiation.  
    - `modelId` (optional, string): Model identifier.  
    - `maxTokens` (optional, number): Max tokens for response.  
    - `temperature` (optional, number): Temperature for output variation.  
    - `timeout` (optional, number): Request timeout duration.  
    - `debug` (optional, boolean): Enable debugging output.

**Return Type:** AIAgent

**Usage Example:**  
```typescript
const agent = createAgentFromEnv({ maxTokens: 150 });
```
<!-- doctype:end id="60795969-93ac-480d-a525-3326807fb3ae" -->


### createOpenAIAgent

<!-- doctype:start id="899915ec-1b05-4e62-a254-702400c8bc4f" code_ref="packages/ai/ai-agent.ts#createOpenAIAgent" -->
**Purpose:** Creates an instance of an AI agent configured for OpenAI, using an API key and other parameters.

**Parameters:**  
- `apiKey` (string): The API key required to access the OpenAI services.  
- `modelId` (optional, string): Identifier for the specific model to be used (defaults to 'gpt-4').  
- `options` (optional, object): Configuration options for the agent.  
    - `maxTokens` (optional, number): The maximum number of tokens for responses.  
    - `temperature` (optional, number): Controls the randomness of the output (default is usually 1).  
    - `timeout` (optional, number): Time limit for requests to complete.  
    - `debug` (optional, boolean): Enable debugging output.

**Return Type:** AIAgent

**Usage Example:**  
```typescript
const agent = createOpenAIAgent('your_api_key');
```
<!-- doctype:end id="899915ec-1b05-4e62-a254-702400c8bc4f" -->


### providerError

<!-- doctype:start id="7f500ef5-ba77-4574-8c72-0aca9be2432d" code_ref="packages/ai/ai-agent.ts#providerError" -->
**Purpose:** Casts a generic error to a specific AIProviderError type, enabling type-specific handling.

**Parameters:**  
- `error` (any): The error object to be cast.

**Return Type:** AIProviderError

**Usage Example:**  
```typescript
const providerError = error as AIProviderError;
```
<!-- doctype:end id="7f500ef5-ba77-4574-8c72-0aca9be2432d" -->


### hasAttemptsLeft

<!-- doctype:start id="7fd7bfde-d374-4f84-beb8-e1d85a8e6418" code_ref="packages/ai/ai-agent.ts#hasAttemptsLeft" -->
**Purpose:** Checks if the current attempt count is below the maximum allowed retry attempts.

**Parameters:**  
- `attempt` (number): The current attempt number, starting from 0.

**Return Type:** boolean

**Usage Example:**  
```typescript
const attemptsLeft = hasAttemptsLeft(currentAttempt);
```
<!-- doctype:end id="7fd7bfde-d374-4f84-beb8-e1d85a8e6418" -->


### isRetryable

<!-- doctype:start id="4ae84a13-7b56-48ea-95e1-15841b29ef16" code_ref="packages/ai/ai-agent.ts#isRetryable" -->
**Purpose:** Determines whether an error is retryable within the context of an operation.

**Parameters:**  
- `error` (any): The error instance that needs to be evaluated for retryability.

**Return Type:** boolean

**Usage Example:**  
```typescript
const shouldRetry = this.isRetryableError(someError);
```
<!-- doctype:end id="4ae84a13-7b56-48ea-95e1-15841b29ef16" -->


### response

<!-- doctype:start id="06eb3680-f234-45ea-9475-3ea915decc0b" code_ref="packages/ai/ai-agent.ts#response" -->
**Purpose:** Handles the result of the documentation generation process based on the request submitted.

**Parameters:**  
- `request` (DocumentationRequest): Information about the documentation request.

**Return Type:** Promise<any> - A promise that resolves to the result of the documentation generation process.

**Usage Example:**  
```typescript
const response = await this.generateDocumentation(request);
```
<!-- doctype:end id="06eb3680-f234-45ea-9475-3ea915decc0b" -->


### request

<!-- doctype:start id="55245d2f-36bb-4a51-91ac-a794717fcfe1" code_ref="packages/ai/ai-agent.ts#request" -->
**Purpose:** Represents a request for documentation generation, containing details about the symbol undergoing changes, now with additional context information.

**Parameters:**  
- `symbolName` (string): The name of the symbol to document.  
- `oldSignature` (CodeSignature): The previous signature of the symbol.  
- `newSignature` (CodeSignature): The new signature of the symbol.  
- `oldDocumentation` (string): Existing documentation for the symbol (currently empty).  
- `context` (optional, object): Additional metadata regarding the symbol's context.  
    - `filePath` (optional, string): Path of the file containing the symbol.  

**Return Type:** `DocumentationRequest` - Represents the details of the documentation request that includes information on the symbol, its signatures, old documentation, and contextual information.

**Usage Example:**  
```typescript
const request: DocumentationRequest = {
    symbolName: 'myFunction',
    oldSignature: 'function myFunction(param1: string): void;',
    newSignature: 'function myFunction(param1: string, param2: number): void;',
    oldDocumentation: '',
    context: { filePath: '/path/to/file.ts' },
};
```
<!-- doctype:end id="55245d2f-36bb-4a51-91ac-a794717fcfe1" -->


### content

<!-- doctype:start id="97db0f70-5512-486d-891c-265a2441ff54" code_ref="packages/ai/ai-agent.ts#content" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="97db0f70-5512-486d-891c-265a2441ff54" -->


### item

<!-- doctype:start id="e2b9d52c-bed6-4ffd-b637-e50e508bcb4c" code_ref="packages/ai/ai-agent.ts#item" -->
**Purpose:** Represents an individual element in a collection, typically used in batch operations.  

**Type:** any  
**Return Type:** any  
**Usage Example:**  
```typescript
for (const item of items) {
    console.log(item);
}
```},{
<!-- doctype:end id="e2b9d52c-bed6-4ffd-b637-e50e508bcb4c" -->


### results

<!-- doctype:start id="b04c07ae-1f95-47b1-a2c8-5631325fbdd8" code_ref="packages/ai/ai-agent.ts#results" -->
**Purpose:** An array to store generated results from a batch operation.  

**Type:** Array<any>  
**Return Type:** Array<any>  
**Usage Example:**  
```typescript
const results = [];
for (const item of items) {
    results.push(await this.processItem(item));
}
```
<!-- doctype:end id="b04c07ae-1f95-47b1-a2c8-5631325fbdd8" -->


### response

<!-- doctype:start id="2b99a7dd-56c9-441f-af53-04ff765d932d" code_ref="packages/ai/ai-agent.ts#response" -->
**Purpose:** Handles the result of the documentation generation process based on the request submitted.

**Parameters:**  
- `request` (DocumentationRequest): Information about the documentation request.  
- `options` (optional, object): Additional settings for processing the request.

**Return Type:** Promise<any>

**Usage Example:**  
```typescript
const response = await this.generateDocumentation(request, options);
```
<!-- doctype:end id="2b99a7dd-56c9-441f-af53-04ff765d932d" -->


### request

<!-- doctype:start id="8cce2b98-475e-44a1-b053-15c536785018" code_ref="packages/ai/ai-agent.ts#request" -->
**Purpose:** Represents a request for documentation generation, containing details about the symbol undergoing changes.

**Parameters:**  
- `symbolName` (string): The name of the symbol to document.  
- `oldSignature` (CodeSignature): The previous signature of the symbol.  
- `newSignature` (CodeSignature): The new signature of the symbol.  
- `oldDocumentation` (string): Existing documentation for the symbol (currently empty).  
- `context` (optional, object): Additional metadata regarding the symbol's context.  
    - `filePath` (optional, string): Path of the file containing the symbol.  
    - `surroundingCode` (optional, string): Code surrounding the symbol for better understanding.  
    - `relatedSymbols` (optional, string[]): Array of related symbols.

**Return Type:** DocumentationRequest

**Usage Example:**  
```typescript
const request: DocumentationRequest = {
    symbolName: 'myFunction',
    oldSignature: 'function myFunction(param1: string): void;',
    newSignature: 'function myFunction(param1: string, param2: number): void;',
    oldDocumentation: '',
};
```
<!-- doctype:end id="8cce2b98-475e-44a1-b053-15c536785018" -->



### AIAgent

<!-- doctype:start id="3a60bfa9-a798-48d6-9469-f55b7fd5026f" code_ref="packages/ai/ai-agent.ts#AIAgent" -->
**Purpose:** A class that encapsulates the behavior of an AI agent, managing configurations and request generation for documentation.  

**Type:** class  
**Return Type:** AIAgent  
**Usage Example:**  
```typescript
const agent = new AIAgent(config);
console.log(agent.getConfig());
```
<!-- doctype:end id="3a60bfa9-a798-48d6-9469-f55b7fd5026f" -->
