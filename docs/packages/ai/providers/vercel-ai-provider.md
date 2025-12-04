# Vercel-ai-provider

Auto-generated documentation via Doctype.


## API Reference

### options

<!-- doctype:start id="0bc8afe2-1e48-4f0d-8bb0-e94ce68bb56b" code_ref="packages/ai/providers/vercel-ai-provider.ts#options" -->
**Purpose**: The `options` object consolidates configurations to be passed for further operations, including model selection and prompts.

**Type**: `any`

**Attributes**:
- `model`: `ModelType` - The model to be utilized for processing.
- `prompt`: `string` - The main prompt message to be sent.
- `system`: `string` - The system prompt to guide the model's response.

**Return Type**: `any` - Represents the options configuration for subsequent operations.

**Usage Example**:
```typescript
const options: any = {
    model,
    prompt: 'Hello',
    system: systemPrompt,
};
```
<!-- doctype:end id="0bc8afe2-1e48-4f0d-8bb0-e94ce68bb56b" -->


### model

<!-- doctype:start id="47a1b521-92ef-48c6-891e-5b3729ed738d" code_ref="packages/ai/providers/vercel-ai-provider.ts#model" -->
**Purpose**: The `model` variable retrieves the current model through a dedicated method, allowing the application to leverage the specified model for operations.

**Type**: `ModelType`

**Return Type**: `ModelType`

**Usage Example**:
```typescript
const model = this.getModel();
console.log(model);
```
<!-- doctype:end id="47a1b521-92ef-48c6-891e-5b3729ed738d" -->


### err

<!-- doctype:start id="d780fbef-138f-46be-808f-5630a3c6d549" code_ref="packages/ai/providers/vercel-ai-provider.ts#err" -->
**Purpose**: The `err` variable captures the error instance as any type, providing a flexible way to handle errors in the code.

**Type**: `any`

**Return Type**: `any`

**Usage Example**:
```typescript
try {
    // Some operation that might throw an error
} catch (error) {
    const err = error as any;
    console.error(err);
}
```
<!-- doctype:end id="d780fbef-138f-46be-808f-5630a3c6d549" -->


### result

<!-- doctype:start id="ee7ee083-fc62-4942-a8f1-d2f8eee7d0b6" code_ref="packages/ai/providers/vercel-ai-provider.ts#result" -->
**Purpose**: The `result` variable stores the output from the generation process, based on the provided options.

**Type**: `any`

**Return Type**: `Promise<any>` - A promise that resolves to the generated object.

**Usage Example**:
```typescript
const result: any = await generateObject(options);
console.log(result);
```
<!-- doctype:end id="ee7ee083-fc62-4942-a8f1-d2f8eee7d0b6" -->


### options

<!-- doctype:start id="798f1ae4-5112-4d24-a258-fffe05f4d70e" code_ref="packages/ai/providers/vercel-ai-provider.ts#options" -->
**Purpose**: The `options` object consolidates configurations to be passed for further operations, including model selection and prompts.

**Type**: `any`

**Attributes**:
- `model`: `ModelType` - The model to be used.
- `prompt`: `string` - The constructed prompt.
- `system`: `string` - The system prompt.

**Return Type**: `any` - The object containing the specified configurations for processing.

**Usage Example**:
```typescript
const options: any = {
    model,
    prompt,
    system: systemPrompt,
};
``` 

**File Location**: `packages/ai/providers/vercel-ai-provider.ts`
<!-- doctype:end id="798f1ae4-5112-4d24-a258-fffe05f4d70e" -->


### systemPrompt

<!-- doctype:start id="895558e4-bb1f-4496-b9cc-33e559f2e44b" code_ref="packages/ai/providers/vercel-ai-provider.ts#systemPrompt" -->
**Purpose**: The `systemPrompt` variable generates a system prompt, providing context or instructions needed for the AI system.

**Type**: `string`

**Return Type**: `string`

**Usage Example**:
```typescript
const systemPrompt = PromptBuilder.buildSystemPrompt();
console.log(systemPrompt);
```
<!-- doctype:end id="895558e4-bb1f-4496-b9cc-33e559f2e44b" -->


### prompt

<!-- doctype:start id="292910cb-385c-4fc3-ab3b-1322e2d8582d" code_ref="packages/ai/providers/vercel-ai-provider.ts#prompt" -->
**Purpose**: The `prompt` variable holds a generated string prompt, ready for use in further processing or user interaction.

**Type**: `string`

**Return Type**: `string`  
Represents the constructed prompt based on internal logic or user input.

**Usage**:
After constructing and assigning a value to `prompt`, it can be used directly in various applications. 

**Example**:
```typescript
const prompt: string = "Please describe your experience using our service.";
console.log(prompt);
```

**Note**: Since `prompt` is now a simple string, ensure any previous logic that required the `PromptBuilder.buildBatchPrompt` method is updated accordingly.
<!-- doctype:end id="292910cb-385c-4fc3-ab3b-1322e2d8582d" -->


### model

<!-- doctype:start id="96bcb341-04fc-48f2-9c62-bb0e62bccacb" code_ref="packages/ai/providers/vercel-ai-provider.ts#model" -->
**Purpose**: The `model` variable retrieves the current model through a dedicated method, allowing the application to leverage the specified model for operations.

**Type**: `ModelType`

**Return Type**: `ModelType`

**Usage Example**:
```typescript
const model = this.getModel();
console.log(model);
```
<!-- doctype:end id="96bcb341-04fc-48f2-9c62-bb0e62bccacb" -->


### providerError

<!-- doctype:start id="3344580a-9005-4e61-bd2c-0556946db0fa" code_ref="packages/ai/providers/vercel-ai-provider.ts#providerError" -->
**Purpose**: The `providerError` variable encapsulates an error related to the AI provider, especially when generation fails, enhancing error handling with specific attributes.

**Type**: `AIProviderError`

**Attributes**:
- `code`: `string` - Identifies the specific error scenario.
- `message`: `string` - Error message derived from `err` or defaulted to a generic message.
- `provider`: `string` - The provider associated with the error.
- `originalError`: `any` - The original error that was encountered.

**Return Type**: `AIProviderError`

**Usage Example**:
```typescript
const providerError: AIProviderError = {
    code: 'GENERATION_FAILED',
    message: err.message || 'Unknown error during generation',
    provider: this.provider,
    originalError: error,
};
```
<!-- doctype:end id="3344580a-9005-4e61-bd2c-0556946db0fa" -->


### err

<!-- doctype:start id="5366ee3e-67ba-48f7-ad44-08c1c3af9087" code_ref="packages/ai/providers/vercel-ai-provider.ts#err" -->
**Purpose**: The `err` variable captures the error instance as any type, providing a flexible way to handle errors in the code.

**Type**: `any`

**Return Type**: `any`

**Usage Example**:
```typescript
try {
    // Some operation that might throw an error
} catch (error) {
    const err = error as any;
    console.error(err);
}
```
<!-- doctype:end id="5366ee3e-67ba-48f7-ad44-08c1c3af9087" -->


### sanitizedText

<!-- doctype:start id="64ebddd7-947e-4112-a32c-fddbbf8f80c1" code_ref="packages/ai/providers/vercel-ai-provider.ts#sanitizedText" -->
**Purpose:** Cleans and formats the input text by transforming Markdown headers to bold text.

**Parameters:**
- `text`: `string` - The input text containing Markdown to be sanitized.

**Return Type:** `string` - The sanitized text with headers converted to bold.

**Usage Example:**
```typescript
const sanitizedText = text.replace(/^#+\s+(.*)$/gm, '**$1**');
```
<!-- doctype:end id="64ebddd7-947e-4112-a32c-fddbbf8f80c1" -->


### usageAny

<!-- doctype:start id="645bb40a-d5d6-4477-9dc9-9e7bf1608d1a" code_ref="packages/ai/providers/vercel-ai-provider.ts#usageAny" -->
**Purpose:** Casts usage data to a generic `any` type for flexibility in processing.

**Parameters:**
- `usage`: `unknown` - The input data that can be of any type.

**Return Type:** `any` - The data casted to type `any`.

**Usage Example:**
```typescript
const usageAny = usage as any;
```
<!-- doctype:end id="645bb40a-d5d6-4477-9dc9-9e7bf1608d1a" -->


### options

<!-- doctype:start id="167bd481-b17b-452d-bf17-4112b4260c7b" code_ref="packages/ai/providers/vercel-ai-provider.ts#options" -->
**Purpose**: The `options` object consolidates configurations to be passed for further operations, including model selection, prompts, and schema validations.

**Type**: `any`

**Attributes**:
- `model`: `ModelType` - The model to be used.
- `prompt`: `string` - The constructed prompt.
- `system`: `string` - The system prompt.
- `schema`: `ZodSchema` - Schema defining the structure of documentations.

**Return Type**: `any`

**Usage Example**:
```typescript
const options: any = {
    model,
    prompt,
    system: systemPrompt,
    schema: z.object({
        documentations: z.array(z.object({
            symbolName: z.string(),
            content: z.string(),
        })),
    }),
};
```
<!-- doctype:end id="167bd481-b17b-452d-bf17-4112b4260c7b" -->


### systemPrompt

<!-- doctype:start id="2c98fa8d-7da2-49d1-a05a-02bcd426027b" code_ref="packages/ai/providers/vercel-ai-provider.ts#systemPrompt" -->
**Purpose**: The `systemPrompt` variable generates a system prompt, providing context or instructions needed for the AI system.

**Type**: `string`

**Return Type**: `string`

**Usage Example**:
```typescript
const systemPrompt = PromptBuilder.buildSystemPrompt();
console.log(systemPrompt);
```
<!-- doctype:end id="2c98fa8d-7da2-49d1-a05a-02bcd426027b" -->


### prompt

<!-- doctype:start id="ff5de95e-88e4-4354-9523-00b175680c09" code_ref="packages/ai/providers/vercel-ai-provider.ts#prompt" -->
**Purpose**: The `prompt` variable is generated using a built batch prompt, which combines the provided items into a structured prompt.

**Type**: `string`

**Return Type**: `string`

**Usage Example**:
```typescript
const prompt = PromptBuilder.buildBatchPrompt(items);
console.log(prompt);
```
<!-- doctype:end id="ff5de95e-88e4-4354-9523-00b175680c09" -->


### model

<!-- doctype:start id="3dab5d03-080b-4943-a20d-0ab926b532e8" code_ref="packages/ai/providers/vercel-ai-provider.ts#model" -->
**Purpose**: The `model` variable retrieves the current model through a dedicated method, allowing the application to leverage the specified model for operations.

**Type**: `ModelType`

**Return Type**: `ModelType`

**Usage Example**:
```typescript
const model = this.getModel();
console.log(model);
```
<!-- doctype:end id="3dab5d03-080b-4943-a20d-0ab926b532e8" -->


### customOpenAI

<!-- doctype:start id="c9675313-fce7-492e-8832-e4e19f547bdb" code_ref="packages/ai/providers/vercel-ai-provider.ts#customOpenAI" -->
**Purpose:** Initializes a custom OpenAI instance for API communications.

**Parameters:**
- `baseURL`: `string` - The base URL for the OpenAI API endpoint.
- `apiKey`: `string` - The API key for authenticating requests.

**Return Type:** `OpenAI` - An instance of the OpenAI client configured with the provided settings.

**Usage Example:**
```typescript
const customOpenAI = createOpenAI({ baseURL: this.modelConfig.endpoint, apiKey: this.modelConfig.apiKey });
```
<!-- doctype:end id="c9675313-fce7-492e-8832-e4e19f547bdb" -->



### VercelAIProvider

<!-- doctype:start id="1089e066-9976-4be8-91e2-061934b8b620" code_ref="packages/ai/providers/vercel-ai-provider.ts#VercelAIProvider" -->
**Purpose:** Provides AI functionalities including model configuration and debugging options.

**Parameters:**
- `config`: `AIModel` - The model configuration object containing details such as model name and settings.
- `debug`: `boolean` (default: `false`) - Enables debug logging if set to true.

**Return Type:** Instance of `VercelAIProvider` - Contains methods for generating documentation and validating connections.

**Usage Example:**
```typescript
const provider = new VercelAIProvider(modelConfig, true);
```
<!-- doctype:end id="1089e066-9976-4be8-91e2-061934b8b620" -->
