# Prompt-builder

Auto-generated documentation via Doctype.


## API Reference

### match

<!-- doctype:start id="f22192a3-24ef-492e-959d-cbbf80efb13e" code_ref="packages/ai/prompt-builder.ts#match" -->
**Purpose:** Extracts the content within parentheses from a function signature using a regex pattern.

**Parameters:**
- `signature`: `string` - The function signature string from which to extract the content within parentheses.

**Return type:** `RegExpMatchArray | null` - The result of the match, or `null` if no match is found.

**Usage example:**
```typescript
const match = signature.match(/\((.*?)\)/);
// match will contain the content within parentheses, e.g., "(number)"
```
<!-- doctype:end id="f22192a3-24ef-492e-959d-cbbf80efb13e" -->


### match

<!-- doctype:start id="76935dbc-da85-4ed7-bfae-bac7d7c8eadc" code_ref="packages/ai/prompt-builder.ts#match" -->
**Purpose:** Matches the return type section of a function signature using a regex pattern.

**Parameters:**
- `signature`: `string` - The function signature string in which to find the return type section.

**Return type:** `RegExpMatchArray | null` - The result of the match, or `null` if no match is found.

**Usage example:**
```typescript
const match = signature.match(/:\s*([^{; ]+)/);
// match will contain the return type, e.g., ": number"
```
<!-- doctype:end id="76935dbc-da85-4ed7-bfae-bac7d7c8eadc" -->


### newReturn

<!-- doctype:start id="241c421f-2d7c-4ae5-9f02-0eb3942d7a0b" code_ref="packages/ai/prompt-builder.ts#newReturn" -->
**Purpose:** Extracts the return type from the given new function signature.

**Parameters:**
- `newSignature`: `string` - The function signature from which the return type is to be extracted.

**Return type:** `string | undefined` - The return type as a string, or `undefined` if no return type is found.

**Usage example:**
```typescript
const newReturn = this.extractReturnType("function bar(): void");
// newReturn will be "void"
```
<!-- doctype:end id="241c421f-2d7c-4ae5-9f02-0eb3942d7a0b" -->


### oldReturn

<!-- doctype:start id="e3235e1b-c485-4511-be91-9e87c3367373" code_ref="packages/ai/prompt-builder.ts#oldReturn" -->
**Purpose:** Extracts the return type from the given old function signature.

**Parameters:**
- `oldSignature`: `string` - The function signature from which the return type is to be extracted.

**Return type:** `string | undefined` - The return type as a string, or `undefined` if no return type is found.

**Usage example:**
```typescript
const oldReturn = this.extractReturnType("function foo(): number");
// oldReturn will be "number"
```
<!-- doctype:end id="e3235e1b-c485-4511-be91-9e87c3367373" -->


### newParams

<!-- doctype:start id="bf846cc1-18ed-4842-a897-16cf56534476" code_ref="packages/ai/prompt-builder.ts#newParams" -->
**Purpose:** Retrieves the parameters from the given new function signature.

**Parameters:**
- `newSignature`: `string` - The function signature from which parameters are to be extracted.

**Return type:** `Array<string>` - An array containing the extracted parameters.

**Usage example:**
```typescript
const newParams = this.extractParameters("function bar(x: string, y: boolean)");
// newParams will be ["x: string", "y: boolean"]
```
<!-- doctype:end id="bf846cc1-18ed-4842-a897-16cf56534476" -->


### oldParams

<!-- doctype:start id="cf63887d-3f25-46af-a1e5-d9790cb223aa" code_ref="packages/ai/prompt-builder.ts#oldParams" -->
**Purpose:** Retrieves the parameters from the given old function signature.

**Parameters:**
- `oldSignature`: `string` - The function signature from which parameters are to be extracted.

**Return type:** `Array<string>` - An array containing the extracted parameters.

**Usage example:**
```typescript
const oldParams = this.extractParameters("function foo(a: string, b: number)");
// oldParams will be ["a: string", "b: number"]
```
<!-- doctype:end id="cf63887d-3f25-46af-a1e5-d9790cb223aa" -->


### changes

<!-- doctype:start id="c270b3d6-7f1f-4067-aa65-2bfc611044b7" code_ref="packages/ai/prompt-builder.ts#changes" -->
**Purpose:** An array tracking changes or modifications made to the documentation or code.

**Parameters:**  
- `changes`: `string[]` - An array of strings that records detail of changes.

**Return Type:** `string[]`

**Usage Example:**  
```typescript
const changes: string[] = ["Updated parameter descriptions", "Changed return type for clarity"];
```
<!-- doctype:end id="c270b3d6-7f1f-4067-aa65-2bfc611044b7" -->


### sections

<!-- doctype:start id="a91f307a-0bfe-4f2c-b798-90654e8d985d" code_ref="packages/ai/prompt-builder.ts#sections" -->
**Purpose:** An array that holds specific section identifiers for structuring documentation.

**Parameters:**  
- `sections`: `string[]` - An array that can hold identifiers for various sections of the documentation.  

**Return Type:** `string[]`

**Usage Example:**  
```typescript
const sections: string[] = ["Overview", "Installation", "Notes"];
```
<!-- doctype:end id="a91f307a-0bfe-4f2c-b798-90654e8d985d" -->


### sections

<!-- doctype:start id="5c8b5148-2955-4f8f-85b6-1f968f684f12" code_ref="packages/ai/prompt-builder.ts#sections" -->
**Purpose:** An array that holds specific section identifiers for structuring documentation.

**Parameters:**  
- `sections`: `string[]` - An array that can hold identifiers for various sections of the documentation.  

**Return Type:** `string[]`

**Usage Example:**  
```typescript
const sections: string[] = ["Overview", "Installation", "Notes"];
```
<!-- doctype:end id="5c8b5148-2955-4f8f-85b6-1f968f684f12" -->


### sections

<!-- doctype:start id="197b28fa-83bf-4c5d-b796-f16a17759b68" code_ref="packages/ai/prompt-builder.ts#sections" -->
**Purpose:** An array that holds specific section identifiers for structuring documentation.

**Parameters:**  
- `sections`: `string[]` - An array that can hold identifiers for various sections of the documentation.  

**Return Type:** `string[]`

**Usage Example:**  
```typescript
const sections: string[] = ["Overview", "Installation", "Notes"];
```
<!-- doctype:end id="197b28fa-83bf-4c5d-b796-f16a17759b68" -->



### PromptBuilder

<!-- doctype:start id="3fed1a80-9e3c-478f-b16f-b7089c472ac4" code_ref="packages/ai/prompt-builder.ts#PromptBuilder" -->
**Purpose:** A utility class for constructing various types of prompts used in documentation generation.

**Methods:**  
- `buildSystemPrompt(): string` - Returns the system prompt utilized for generating documentation.  
- `buildUserPrompt(request: DocumentationRequest, options: GenerateOptions)`: `string`  - Constructs a user prompt based on the provided request and options.  
- `buildInitialPrompt(symbolName: string, signature: string, options: GenerateOptions)`: `string`  - Creates an initial prompt for a specific symbol.  
- `buildBatchPrompt(items: Array<any>)`: `string` - Generates a batch prompt from a collection of items.  
- `summarizeChanges(oldSignature: string, newSignature: string): string` - Summarizes changes between two method signatures.  
- `extractParameters(signature: string): string` - Extracts parameter information from a function signature.  
- `extractReturnType(signature: string): string` - Extracts the return type from a function signature.

**Return Type:** `PromptBuilder`

**Usage Example:**  
```typescript
const prompt = PromptBuilder.buildInitialPrompt('myFunction', 'function myFunction(param1: string): number', { includeContext: true });
```
<!-- doctype:end id="3fed1a80-9e3c-478f-b16f-b7089c472ac4" -->
