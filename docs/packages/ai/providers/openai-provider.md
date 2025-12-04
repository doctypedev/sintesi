# Openai-provider

Auto-generated documentation via Doctype.


## API Reference

### data

<!-- doctype:start id="c7dc55fc-fe3c-489e-841c-e5eafbaf0f75" code_ref="packages/ai/providers/openai-provider.ts#data" -->
**Purpose:** Extracts and transforms the JSON response to match the `OpenAIResponse` structure, enabling streamlined data handling in the application.

**Type:** Promise<OpenAIResponse>  
**Return Type:** OpenAIResponse - An object representing the response structure returned by the OpenAI API. Its exact shape is defined within the `OpenAIResponse` type.

**Usage Example:**  
```typescript
const data = await response.json() as OpenAIResponse;
console.log(data);
```

**Notes:** Ensure that the `OpenAIResponse` type is defined elsewhere in your codebase to reflect the expected structure of the API response.
<!-- doctype:end id="c7dc55fc-fe3c-489e-841c-e5eafbaf0f75" -->


### response

<!-- doctype:start id="6e7b3a2d-a0bb-4f57-b48a-76fa4bb58da3" code_ref="packages/ai/providers/openai-provider.ts#response" -->
**Purpose:** Captures the response generated from invoking the request to the OpenAI API. The request now uses the POST method, sending a JSON body that includes the model ID, messages, maximum tokens, and temperature settings.

**Type:** Promise<string>  
**Return Type:** string - Represents the generated response from the OpenAI API.

**Parameters:**  
- **endpoint: string** - The API endpoint to which the request is sent.
- **systemPrompt: string** - The content to be used for the system role in the messages array.
- **userPrompt: string** - The content to be used for the user role in the messages array.

**Request Options:**
- **method: 'POST'** - Indicates that the request method is POST.
- **headers:**
  - **'Content-Type': 'application/json'** - Specifies that the request body is JSON.
  - **'Authorization': string** - Bearer token for API authentication, derived from `this.model.apiKey`.
- **body: string** - A JSON-encoded object containing:
  - **model:** (string) The model ID to be used, defaults to `OpenAIProvider.DEFAULT_MODEL` if not specified.
  - **messages:** (Array<{role: string, content: string}>) An array consisting of objects with `role` and `content` fields.
    - **role:** (string) Indicates the role of the message sender (e.g., 'system', 'user').
    - **content:** (string) The actual message content.
  - **max_tokens:** (number) Limits the number of tokens in the generated response, defaults to `OpenAIProvider.DEFAULT_MAX_TOKENS` if not specified.
  - **temperature:** (number) Controls the randomness of the response, defaults to `OpenAIProvider.DEFAULT_TEMPERATURE` if not specified.

**Usage Example:**  
```typescript
const endpoint = 'https://api.openai.com/v1/chat/completions';
const systemPrompt = 'You are a helpful assistant.';
const userPrompt = 'Can you explain TypeScript?';

const response = await this.makeRequest(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.model.apiKey}`,
    },
    body: JSON.stringify({
        model: this.model.modelId || OpenAIProvider.DEFAULT_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: this.model.maxTokens || OpenAIProvider.DEFAULT_MAX_TOKENS,
        temperature: this.model.temperature ?? OpenAIProvider.DEFAULT_TEMPERATURE,
    }),
});
console.log('Generated Response:', response);
```
<!-- doctype:end id="6e7b3a2d-a0bb-4f57-b48a-76fa4bb58da3" -->


### endpoint

<!-- doctype:start id="d8ebb4be-cdbd-4b96-9ed3-e97db842dfa4" code_ref="packages/ai/providers/openai-provider.ts#endpoint" -->
**Purpose:** Holds the API endpoint URL for making requests. The endpoint is determined by the instance's model configuration or falls back to a default value provided by the `OpenAIProvider`.

**Type:** string  
**Return Type:** string - Represents the URL that will be used to interact with the API. 

**Changes:**
- Previously, `endpoint` was a hardcoded string.
- Now, `endpoint` retrieves its value from `this.model.endpoint` or defaults to `OpenAIProvider.DEFAULT_ENDPOINT` if no custom endpoint is provided.

**Parameters:**
- **model** (object): The current configuration model.
  - **endpoint** (string | undefined): The custom API endpoint URL. If undefined, defaults to the predefined URL.

**Return Type:**
- **string**: The effective API endpoint URL that will be utilized for making API requests.

**Usage Example:**  
```typescript
const endpoint = this.model.endpoint || OpenAIProvider.DEFAULT_ENDPOINT;
console.log(`Making request to: ${endpoint}`);
```
<!-- doctype:end id="d8ebb4be-cdbd-4b96-9ed3-e97db842dfa4" -->


### isValid

<!-- doctype:start id="0138ce2c-65df-4e60-9719-ddd33c4b73e2" code_ref="packages/ai/providers/openai-provider.ts#isValid" -->
**Purpose:** Determines if the response from an API call is valid based on the `ok` status of the response.

**Type:** boolean

**Return Type:** boolean  
**Usage Example:**  
```typescript
const isValid = response.ok;
if (isValid) {
    console.log('The response is valid.');
}
```
<!-- doctype:end id="0138ce2c-65df-4e60-9719-ddd33c4b73e2" -->


### response

<!-- doctype:start id="75dfceba-52b5-4354-a069-edac7fa39687" code_ref="packages/ai/providers/openai-provider.ts#response" -->
**Purpose:** Captures the response generated from invoking the documentation generation process using the request object. The updated request object now supports a `POST` method and specifies content types and a request body.

**Type:** Promise<string>  
**Return Type:** string - A JSON string response from the server containing the generated documentation.

**Parameters:**
- `endpoint: string` - The URL endpoint for the API request.
- `options: Object` - An object containing the request configuration.
  - `method: 'POST'` - The HTTP method used for the request.
  - `headers: Object` - The headers for the request.
    - `Content-Type: 'application/json'` - The content type of the request body.
    - `Authorization: string` - A Bearer token for API authorization.
  - `body: string` - A JSON stringified object containing:
    - `model: string` - The model identifier (defaulting to `OpenAIProvider.DEFAULT_MODEL` if undefined).
    - `messages: Array<Object>` - An array of message objects, each containing:
      - `role: 'system' | 'user'` - The role of the sender.
      - `content: string` - The textual content of the message.
    - `max_tokens: number` - The maximum number of tokens to generate (defaulting to `OpenAIProvider.DEFAULT_MAX_TOKENS` if undefined).
    - `temperature: number` - Controls the randomness of the output (defaulting to `OpenAIProvider.DEFAULT_TEMPERATURE` if undefined).

**Usage Example:**  
```typescript
const endpoint = 'https://api.example.com/generate';
const systemPrompt = 'You are a helpful assistant.';
const userPrompt = 'Can you generate documentation?';

const response = await this.makeRequest(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.model.apiKey}`,
  },
  body: JSON.stringify({
    model: this.model.modelId || OpenAIProvider.DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: this.model.maxTokens || OpenAIProvider.DEFAULT_MAX_TOKENS,
    temperature: this.model.temperature ?? OpenAIProvider.DEFAULT_TEMPERATURE,
  }),
});
console.log('Generated Documentation:', response);
```
<!-- doctype:end id="75dfceba-52b5-4354-a069-edac7fa39687" -->


### endpoint

<!-- doctype:start id="6107b1de-30f5-489c-a8c0-58b5bcf98d93" code_ref="packages/ai/providers/openai-provider.ts#endpoint" -->
**Purpose:** Holds the API endpoint URL for making requests, defaulting to a predefined value if not set by the model.

**Type:** `string`  
**Return Type:** `string`  
- Represents the URL used for making API calls to the OpenAI service.

**Parameters:**  
- `this.model.endpoint` (optional): A string representing a user-defined API endpoint URL.
- `OpenAIProvider.DEFAULT_ENDPOINT`: A string constant representing the default API endpoint URL used if `this.model.endpoint` is undefined.

**Behavior:**  
If `this.model.endpoint` is defined, it will be used as the API endpoint; otherwise, the `OpenAIProvider.DEFAULT_ENDPOINT` will be utilized.

**Usage Example:**  
```typescript
const endpoint = this.model.endpoint || OpenAIProvider.DEFAULT_ENDPOINT;
console.log(`Making request to: ${endpoint}`);
```  

**File Location:**  
`packages/ai/providers/openai-provider.ts`
<!-- doctype:end id="6107b1de-30f5-489c-a8c0-58b5bcf98d93" -->


### content

<!-- doctype:start id="78fadf99-a649-4227-9adf-60c9eb11acf1" code_ref="packages/ai/providers/openai-provider.ts#content" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="78fadf99-a649-4227-9adf-60c9eb11acf1" -->


### data

<!-- doctype:start id="71c1156a-cf5e-4ba4-b5d6-c32853fe3e2d" code_ref="packages/ai/providers/openai-provider.ts#data" -->
**Purpose:** Extracts and transforms the JSON response to a specific format containing an array of data objects with IDs.  

**Type:** Promise<{data: Array<{id: string}>}>  
**Return Type:** {data: Array<{id: string}>}  
**Usage Example:**  
```typescript
const data = await response.json() as {data: Array<{id: string}>};
console.log(data);
```
<!-- doctype:end id="71c1156a-cf5e-4ba4-b5d6-c32853fe3e2d" -->


### errorData

<!-- doctype:start id="d6d3119b-a229-44a9-bed3-ad23bd12042a" code_ref="packages/ai/providers/openai-provider.ts#errorData" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="d6d3119b-a229-44a9-bed3-ad23bd12042a" -->


### response

<!-- doctype:start id="6cf03fec-b5dd-4365-a728-388f5e9cfd68" code_ref="packages/ai/providers/openai-provider.ts#response" -->
**Purpose:** Captures the response generated from invoking the documentation generation process using the request object.  

**Type:** Promise<string>  
**Return Type:** string  
**Usage Example:**  
```typescript
const response = await this.generateDocumentation(request);
console.log('Generated Documentation:', response);
```
<!-- doctype:end id="6cf03fec-b5dd-4365-a728-388f5e9cfd68" -->


### endpoint

<!-- doctype:start id="732166fc-8958-4db7-b1ab-7cf4db1ca0d0" code_ref="packages/ai/providers/openai-provider.ts#endpoint" -->
**Purpose:** Holds the API endpoint URL for making requests. 

**Type:** string  
**Return Type:** string  
**Usage Example:**  
```typescript
const endpoint = 'https://api.example.com';
console.log(`Making request to: ${endpoint}`);
```
<!-- doctype:end id="732166fc-8958-4db7-b1ab-7cf4db1ca0d0" -->


### userPrompt

<!-- doctype:start id="2fa5d0d2-00a7-4566-ab25-d10dc5109c2a" code_ref="packages/ai/providers/openai-provider.ts#userPrompt" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="2fa5d0d2-00a7-4566-ab25-d10dc5109c2a" -->


### systemPrompt

<!-- doctype:start id="1c3ac145-bfed-4ff1-9aa6-c1a387b16c67" code_ref="packages/ai/providers/openai-provider.ts#systemPrompt" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="1c3ac145-bfed-4ff1-9aa6-c1a387b16c67" -->



### OpenAIProvider

<!-- doctype:start id="f4b079cb-7f53-42c7-932d-0ef343b09f58" code_ref="packages/ai/providers/openai-provider.ts#OpenAIProvider" -->
**Purpose:** The `OpenAIProvider` class serves to interface with OpenAI's API, providing methods for model interaction and documentation generation.

**Constructor Parameters:**  
- `model`: `AIModel` - The AI model to be used for requests.  
- `timeout`: `number` (optional) - Maximum time in milliseconds before a request times out.  
- `debug`: `boolean` (optional) - Enables debug information if set to true.

**Static Properties:**  
- `DEFAULT_ENDPOINT`: `any` - Default endpoint URL for the API.  
- `DEFAULT_MODEL`: `any` - Default model used in requests.  
- `DEFAULT_MAX_TOKENS`: `any` - Default maximum tokens for response.  
- `DEFAULT_TEMPERATURE`: `any` - Default temperature for randomness in responses.

**Methods:**  
- `provider`: `AIProvider` - Retrieves the current provider instance.  
- `generateDocumentation(request: DocumentationRequest): Promise<DocumentationResponse>` - Generates documentation based on the provided request.  
- `validateConnection(): Promise<boolean>` - Validates whether the connection to OpenAI's API is successful.  
- `getModels(): Promise<string[]>` - Fetches available models from the API.

**Return Type:** `Promise<DocumentationResponse>` from `generateDocumentation` method, `Promise<boolean>` from `validateConnection`, and `Promise<string[]>` from `getModels` method.

**Usage Example:**  
```typescript
const openAI = new OpenAIProvider(selectedModel);
const isValid = await openAI.validateConnection();
const models = await openAI.getModels();
```
<!-- doctype:end id="f4b079cb-7f53-42c7-932d-0ef343b09f58" -->
