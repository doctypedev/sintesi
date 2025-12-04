# Content-injector

Auto-generated documentation via Doctype.


## API Reference

### endMatch

<!-- doctype:start id="3fe681c2-cc52-4363-a295-eee99ee5df89" code_ref="packages/content/content-injector.ts#endMatch" -->
**Purpose:** Matches a line against a regex pattern to find an end anchor based on a specified ID.

**Parameters:**
- `line`: `string` - The line being verified for the end marker.

**Return Type:** `RegExpMatchArray | null` - Returns an array of matches if the pattern is found, otherwise null.

**Usage Example:**
```typescript
const endMatch = line.match(/<!--\s*doctype:end\s+id="([^"]+)"/);
```
<!-- doctype:end id="3fe681c2-cc52-4363-a295-eee99ee5df89" -->


### startMatch

<!-- doctype:start id="e3cdc47c-7693-4cbe-b575-286b528428b4" code_ref="packages/content/content-injector.ts#startMatch" -->
**Purpose:** Manages a doctype map, providing methods for loading, saving, adding, updating, and retrieving entries from a specified map file.

**Parameters:**  
- `mapFilePath`: `string` (default: './doctype-map.json') - The path to the map file that will be loaded.

**Return Type:**  
- Instance of `DoctypeMapManager` - An object that encapsulates the doctype map management functionality.

**Usage Example:**  
```typescript
let manager = new DoctypeMapManager();
// manager now is an instance that can manage a doctype map.
```
<!-- doctype:end id="e3cdc47c-7693-4cbe-b575-286b528428b4" -->


### line

<!-- doctype:start id="10f9085b-a84e-4fa1-81f6-85251039ba2d" code_ref="packages/content/content-injector.ts#line" -->
**Purpose:** Retrieves the current line based on the value of `i` from the `lines` array.

**Parameters:**  
- `lines`: `string[]` - The array of lines to access.
- `i`: `number` - The current index to access a specific line.

**Return Type:**  
- `string` - The line at index `i` from the `lines` array.

**Usage Example:**  
```typescript
let lines = ["Line 1", "Line 2", "Line 3"];
let i = 1;
let line = lines[i];
// line = "Line 2";
```
<!-- doctype:end id="10f9085b-a84e-4fa1-81f6-85251039ba2d" -->


### i

<!-- doctype:start id="04c6258b-35b0-4c31-a2ad-f4bc31cce6a1" code_ref="packages/content/content-injector.ts#i" -->
**Purpose:** Serves as an index counter for iterating over lines, initialized to 0 (the first line).

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is 0.

**Usage Example:**  
```typescript
let i = 0;
// i can be used to access the first line in an array of lines.
```
<!-- doctype:end id="04c6258b-35b0-4c31-a2ad-f4bc31cce6a1" -->


### endLine

<!-- doctype:start id="a19b325b-031e-4f87-a45b-b304224f5c23" code_ref="packages/content/content-injector.ts#endLine" -->
**Purpose:** Holds the ending line index, initialized to -1 indicating no ending line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let endLine = -1;
// endLine = -1 indicates that no ending line is set.
```
<!-- doctype:end id="a19b325b-031e-4f87-a45b-b304224f5c23" -->


### startLine

<!-- doctype:start id="3d59310a-7c53-4f0e-8f8e-12dd38217caa" code_ref="packages/content/content-injector.ts#startLine" -->
**Purpose:** Holds the starting line index, initialized to -1 indicating no line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let startLine = -1;
// startLine = -1 indicates that no starting line is set.
```
<!-- doctype:end id="3d59310a-7c53-4f0e-8f8e-12dd38217caa" -->


### lines

<!-- doctype:start id="cb64a3dc-30ae-4d57-9fb1-fc15c2e6e018" code_ref="packages/content/content-injector.ts#lines" -->
**Purpose:** Splits the `content` string into an array of lines based on newline characters.

**Parameter:**  
- `content`: `string` - The string to be split into lines.

**Return Type:**  
- `string[]` - An array of strings where each element represents a line from `content`.

**Usage Example:**  
```typescript
let content = "Line 1\nLine 2\nLine 3";
let lines = content.split('\n');
// lines = ["Line 1", "Line 2", "Line 3"];
```
<!-- doctype:end id="cb64a3dc-30ae-4d57-9fb1-fc15c2e6e018" -->


### errors

<!-- doctype:start id="b90e6bab-2c9d-4db9-8e1e-d76fad61f9e0" code_ref="packages/content/content-injector.ts#errors" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="b90e6bab-2c9d-4db9-8e1e-d76fad61f9e0" -->


### endMatch

<!-- doctype:start id="dfdeee67-369d-4188-9c7a-308fa1089e9c" code_ref="packages/content/content-injector.ts#endMatch" -->
**Purpose:** Matches a line against a regex pattern to find an end anchor based on a specified ID.

**Parameters:**
- `line`: `string` - The line being verified for the end marker.

**Return Type:** `RegExpMatchArray | null` - Returns an array of matches if the pattern is found, otherwise null.

**Usage Example:**
```typescript
const endMatch = line.match(/<!--\s*doctype:end\s+id="([^"]+)"/);
```
<!-- doctype:end id="dfdeee67-369d-4188-9c7a-308fa1089e9c" -->


### startMatch

<!-- doctype:start id="d9299ac1-79d2-4535-a46f-9dc493f8abc5" code_ref="packages/content/content-injector.ts#startMatch" -->
**Purpose:** Manages a doctype map, providing methods for loading, saving, adding, updating, and retrieving entries from a specified map file.

**Parameters:**  
- `mapFilePath`: `string` (default: './doctype-map.json') - The path to the map file that will be loaded.

**Return Type:**  
- Instance of `DoctypeMapManager` - An object that encapsulates the doctype map management functionality.

**Usage Example:**  
```typescript
let manager = new DoctypeMapManager();
// manager now is an instance that can manage a doctype map.
```
<!-- doctype:end id="d9299ac1-79d2-4535-a46f-9dc493f8abc5" -->


### line

<!-- doctype:start id="b2cde0bb-d076-4d45-8e34-d7631c4e3465" code_ref="packages/content/content-injector.ts#line" -->
**Purpose:** Retrieves the current line based on the value of `i` from the `lines` array.

**Parameters:**  
- `lines`: `string[]` - The array of lines to access.
- `i`: `number` - The current index to access a specific line.

**Return Type:**  
- `string` - The line at index `i` from the `lines` array.

**Usage Example:**  
```typescript
let lines = ["Line 1", "Line 2", "Line 3"];
let i = 1;
let line = lines[i];
// line = "Line 2";
```
<!-- doctype:end id="b2cde0bb-d076-4d45-8e34-d7631c4e3465" -->


### i

<!-- doctype:start id="9804d664-52e5-487e-a3ee-5c8cf96a8336" code_ref="packages/content/content-injector.ts#i" -->
**Purpose:** Serves as an index counter for iterating over lines, initialized to 0 (the first line).

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is 0.

**Usage Example:**  
```typescript
let i = 0;
// i can be used to access the first line in an array of lines.
```
<!-- doctype:end id="9804d664-52e5-487e-a3ee-5c8cf96a8336" -->


### endLine

<!-- doctype:start id="61940a25-463a-4186-8648-6bb4ce066eaa" code_ref="packages/content/content-injector.ts#endLine" -->
**Purpose:** Holds the ending line index, initialized to -1 indicating no ending line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let endLine = -1;
// endLine = -1 indicates that no ending line is set.
```
<!-- doctype:end id="61940a25-463a-4186-8648-6bb4ce066eaa" -->


### startLine

<!-- doctype:start id="8e169954-fcc0-4b6a-81a0-910e3b081df0" code_ref="packages/content/content-injector.ts#startLine" -->
**Purpose:** Holds the starting line index, initialized to -1 indicating no line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let startLine = -1;
// startLine = -1 indicates that no starting line is set.
```
<!-- doctype:end id="8e169954-fcc0-4b6a-81a0-910e3b081df0" -->


### lines

<!-- doctype:start id="c42c3d63-5334-4a47-a824-b23e68df0dc4" code_ref="packages/content/content-injector.ts#lines" -->
**Purpose:** Splits the `content` string into an array of lines based on newline characters.

**Parameter:**  
- `content`: `string` - The string to be split into lines.

**Return Type:**  
- `string[]` - An array of strings where each element represents a line from `content`.

**Usage Example:**  
```typescript
let content = "Line 1\nLine 2\nLine 3";
let lines = content.split('\n');
// lines = ["Line 1", "Line 2", "Line 3"];
```
<!-- doctype:end id="c42c3d63-5334-4a47-a824-b23e68df0dc4" -->


### content

<!-- doctype:start id="56e1e547-cd44-4be9-8733-e58a3ec33e4e" code_ref="packages/content/content-injector.ts#content" -->
Reads the contents of a file specified by the given `filePath` using UTF-8 encoding.

**Parameters:**  
- `filePath` (string): The path of the file to read.

**Return Type:**  
- `string`: The content of the file as a UTF-8 encoded string.

**Usage Example:**  
```typescript
const fs = require('fs');  
const filePath = "path/to/file.txt";  
const content = fs.readFileSync(filePath, 'utf-8');  
console.log(content); // Outputs the content of the specified file
```

**File Location:**  
`packages/content/content-injector.ts`
<!-- doctype:end id="56e1e547-cd44-4be9-8733-e58a3ec33e4e" -->


### allSucceeded

<!-- doctype:start id="d9ba17c1-ff84-4447-8677-6e4560439427" code_ref="packages/content/content-injector.ts#allSucceeded" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="d9ba17c1-ff84-4447-8677-6e4560439427" -->


### result

<!-- doctype:start id="666912f1-2121-47ef-a71e-7c8caa11bc7c" code_ref="packages/content/content-injector.ts#result" -->
Stores the outcome of injecting `newContent` into `originalContent` at a specified `anchorId`.

**Parameters:**  
- `originalContent` (string): The original content to which new content will be injected.  
- `anchorId` (string): The identifier that determines where to inject the new content.  
- `newContent` (string): The content to be injected into the original content.

**Return Type:**  
- `InjectionResult`: An object representing the result of the injection operation.

**Usage Example:**  
```typescript
const originalContent = "Original Content";  
const anchorId = "anchor";  
const newContent = "Injected Content";  
const result = this.injectIntoContent(originalContent, anchorId, newContent);  
console.log(result); // Outputs the result of the injection process
```

**File Location:**  
`packages/content/content-injector.ts`
<!-- doctype:end id="666912f1-2121-47ef-a71e-7c8caa11bc7c" -->


### results

<!-- doctype:start id="89d5de5f-060e-4136-8725-6aee31704fb8" code_ref="packages/content/content-injector.ts#results" -->
An array that stores multiple injection results.

**Parameters:**  
- None (this symbol represents a static array).

**Return Type:**  
- `InjectionResult[]`: An array of objects containing the results of injections.

**Usage Example:**  
```typescript
const results: InjectionResult[] = [];  
results.push({success: true, message: 'Injection successful'});  
console.log(results); // Outputs: [{ success: true, message: 'Injection successful' }]
```
<!-- doctype:end id="89d5de5f-060e-4136-8725-6aee31704fb8" -->


### content

<!-- doctype:start id="d800acd3-a844-4038-adb3-1bbf901ab675" code_ref="packages/content/content-injector.ts#content" -->
Reads the contents of a file specified by the given `filePath` using UTF-8 encoding. 

**Parameters:**  
- `filePath` (string): The path of the file to read.

**Return Type:**  
- `string`: The content of the file as a UTF-8 encoded string.

**Usage Example:**  
```typescript
const fs = require('fs');  
const filePath = "path/to/file.txt";  
const content = fs.readFileSync(filePath, 'utf-8');  
console.log(content); // Outputs the content of the specified file
```
<!-- doctype:end id="d800acd3-a844-4038-adb3-1bbf901ab675" -->


### updatedContent

<!-- doctype:start id="fedd0501-dc54-4ee1-8f72-cb7aa24f5f99" code_ref="packages/content/content-injector.ts#updatedContent" -->
Joins the array of `updatedLines` into a single string, separating each line with a newline character.

**Parameters:**  
- `updatedLines` (string[]): An array of lines to join into a single content string.

**Return Type:**  
- `string`: A string that represents the `updatedLines` joined together with newline characters.

**Usage Example:**  
```typescript
const updatedLines = ["Line 1", "Line 2", "Line 3"];  
const updatedContent = updatedLines.join('\n');  
console.log(updatedContent); // Outputs: "Line 1\nLine 2\nLine 3"
```
<!-- doctype:end id="fedd0501-dc54-4ee1-8f72-cb7aa24f5f99" -->


### updatedLines

<!-- doctype:start id="ec8d4f72-8938-48a6-9411-951c07e37698" code_ref="packages/content/content-injector.ts#updatedLines" -->
Combines the arrays `before`, `middle`, and `after` into a single array representing the updated content.

**Parameters:**  
- `before` (string[]): An array of lines before the insertion point.  
- `middle` (string[]): An array of new lines to insert.  
- `after` (string[]): An array of lines after the insertion point.

**Return Type:**  
- `string[]`: An array that represents the combination of all input arrays.

**Usage Example:**  
```typescript
const before = ["Line 1", "Line 2"];  
const middle = ["Inserted Line 1", "Inserted Line 2"];  
const after = ["Line 3", "Line 4"];  
const updatedLines = [...before, ...middle, ...after];  
console.log(updatedLines); // Outputs: ["Line 1", "Line 2", "Inserted Line 1", "Inserted Line 2", "Line 3", "Line 4"]
```
<!-- doctype:end id="ec8d4f72-8938-48a6-9411-951c07e37698" -->


### middle

<!-- doctype:start id="b25c2774-01db-4699-9736-78a434fda622" code_ref="packages/content/content-injector.ts#middle" -->
Splits `newContent` into an array of lines.

**Parameters:**  
- `newContent` (string): The content string to be split into an array.  

**Return Type:**  
- `string[]`: An array containing each line from the `newContent`.

**Usage Example:**  
```typescript
const newContent = "Line 1\nLine 2\nLine 3";  
const middle = newContent.split('\n');  
console.log(middle); // Outputs: ["Line 1", "Line 2", "Line 3"]
```
<!-- doctype:end id="b25c2774-01db-4699-9736-78a434fda622" -->


### after

<!-- doctype:start id="38bad78b-a0fc-4a91-a489-91f11279a839" code_ref="packages/content/content-injector.ts#after" -->
Extracts the lines from the `lines` array starting from `endLine` to the end of the array.  

**Parameters:**  
- `lines` (string[]): An array of lines from which to extract the following lines.  
- `endLine` (number): The index at which to start extracting lines.

**Return Type:**  
- `string[]`: An array containing the lines from the `endLine` index to the end of the list.

**Usage Example:**  
```typescript
const lines = ["Line 1", "Line 2", "Line 3"];  
const endLine = 1;  
const after = lines.slice(endLine);  
console.log(after); // Outputs: ["Line 2", "Line 3"]
```
<!-- doctype:end id="38bad78b-a0fc-4a91-a489-91f11279a839" -->


### before

<!-- doctype:start id="7a964eb8-6f6c-4593-96b8-65bc3707cfee" code_ref="packages/content/content-injector.ts#before" -->
Extracts the lines from the start of the `lines` array up to and including `startLine`.  

**Parameters:**  
- `lines` (string[]): An array of lines from which to extract the preceding lines.  
- `startLine` (number): The line index up to which lines should be extracted.  

**Return Type:**  
- `string[]`: An array containing the lines before the `startLine` index.

**Usage Example:**  
```typescript
const lines = ["Line 1", "Line 2", "Line 3"];  
const startLine = 1;  
const before = lines.slice(0, startLine + 1);  
console.log(before); // Outputs: ["Line 1", "Line 2"]
```
<!-- doctype:end id="7a964eb8-6f6c-4593-96b8-65bc3707cfee" -->


### linesChanged

<!-- doctype:start id="1040ef16-2d91-48d6-8bcc-3a1d01272803" code_ref="packages/content/content-injector.ts#linesChanged" -->
Calculates the absolute difference between the number of lines in `newContent` and `oldContent`. 

**Parameters:**  
- `newContentLines` (number): The number of lines in the new content.  
- `oldContentLines` (number): The number of lines in the old content.  

**Return Type:**  
- `number`: The number of lines that have changed between the old and new content.

**Usage Example:**  
```typescript
const oldContentLines = 5;  
const newContentLines = 3;  
const linesChanged = Math.abs(newContentLines - oldContentLines);  
console.log(linesChanged); // Outputs: 2
```
<!-- doctype:end id="1040ef16-2d91-48d6-8bcc-3a1d01272803" -->


### newContentLines

<!-- doctype:start id="7f09d103-5b5c-401e-b85d-4c63d5fe3869" code_ref="packages/content/content-injector.ts#newContentLines" -->
Calculates the number of lines in the `newContent` string by splitting it at newline characters.

**Parameters:**  
- `newContent` (string): The text content that is being split into lines.  

**Return Type:**  
- `number`: The total count of lines in `newContent`.

**Usage Example:**  
```typescript
const newContent = "Line 1\nLine 2\nLine 3";  
const newContentLines = newContent.split('\n').length;  
console.log(newContentLines); // Outputs: 3
```
<!-- doctype:end id="7f09d103-5b5c-401e-b85d-4c63d5fe3869" -->


### oldContentLines

<!-- doctype:start id="8b0f181a-00d1-49c3-83fb-1b37c30e4adf" code_ref="packages/content/content-injector.ts#oldContentLines" -->
**Purpose:** Calculates the number of lines in the old content based on the start and end marker positions.

**Parameters:**
- `endLine`: `number` - The ending index of the block in the content.
- `startLine`: `number` - The starting index of the block in the content.

**Return Type:** `number` - The total number of lines between `startLine` and `endLine`.

**Usage Example:**
```typescript
const oldContentLines = endLine - startLine - 1; // Calculate number of lines in the block.
```
<!-- doctype:end id="8b0f181a-00d1-49c3-83fb-1b37c30e4adf" -->


### endMatch

<!-- doctype:start id="5ce601a1-b6d0-4f87-b99c-5495c10d3731" code_ref="packages/content/content-injector.ts#endMatch" -->
**Purpose:** Matches a line against a regex pattern to find an end anchor based on a specified ID.

**Parameters:**
- `line`: `string` - The line being verified for the end marker.

**Return Type:** `RegExpMatchArray | null` - Returns an array of matches if the pattern is found, otherwise null.

**Usage Example:**
```typescript
const endMatch = line.match(/<!--\s*doctype:end\s+id="([^"]+)"/);
```
<!-- doctype:end id="5ce601a1-b6d0-4f87-b99c-5495c10d3731" -->


### startMatch

<!-- doctype:start id="1e23616e-136a-4c98-bf00-8dd8217392f8" code_ref="packages/content/content-injector.ts#startMatch" -->
**Purpose:** Manages a doctype map, providing methods for loading, saving, adding, updating, and retrieving entries from a specified map file.

**Parameters:**  
- `mapFilePath`: `string` (default: './doctype-map.json') - The path to the map file that will be loaded.

**Return Type:**  
- Instance of `DoctypeMapManager` - An object that encapsulates the doctype map management functionality.

**Usage Example:**  
```typescript
let manager = new DoctypeMapManager();
// manager now is an instance that can manage a doctype map.
```
<!-- doctype:end id="1e23616e-136a-4c98-bf00-8dd8217392f8" -->


### line

<!-- doctype:start id="cbf938de-9722-434d-82af-ea893ae3ada5" code_ref="packages/content/content-injector.ts#line" -->
**Purpose:** Retrieves the current line based on the value of `i` from the `lines` array.

**Parameters:**  
- `lines`: `string[]` - The array of lines to access.
- `i`: `number` - The current index to access a specific line.

**Return Type:**  
- `string` - The line at index `i` from the `lines` array.

**Usage Example:**  
```typescript
let lines = ["Line 1", "Line 2", "Line 3"];
let i = 1;
let line = lines[i];
// line = "Line 2";
```
<!-- doctype:end id="cbf938de-9722-434d-82af-ea893ae3ada5" -->


### i

<!-- doctype:start id="3666a6d5-f590-44e9-b118-5b8ad0455f26" code_ref="packages/content/content-injector.ts#i" -->
**Purpose:** Serves as an index counter for iterating over lines, initialized to 0 (the first line).

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is 0.

**Usage Example:**  
```typescript
let i = 0;
// i can be used to access the first line in an array of lines.
```
<!-- doctype:end id="3666a6d5-f590-44e9-b118-5b8ad0455f26" -->


### endLine

<!-- doctype:start id="6992dd69-03d7-4c58-b82b-75b9223453c2" code_ref="packages/content/content-injector.ts#endLine" -->
**Purpose:** Holds the ending line index, initialized to -1 indicating no ending line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let endLine = -1;
// endLine = -1 indicates that no ending line is set.
```
<!-- doctype:end id="6992dd69-03d7-4c58-b82b-75b9223453c2" -->


### startLine

<!-- doctype:start id="4005b77f-26a1-4771-af77-c2b18ea0958d" code_ref="packages/content/content-injector.ts#startLine" -->
**Purpose:** Holds the starting line index, initialized to -1 indicating no line has been selected.

**Parameter:**  
- None. This is a constant representation within the scope.

**Return Type:**  
- `number` - The default value is -1.

**Usage Example:**  
```typescript
let startLine = -1;
// startLine = -1 indicates that no starting line is set.
```
<!-- doctype:end id="4005b77f-26a1-4771-af77-c2b18ea0958d" -->


### lines

<!-- doctype:start id="8f55ce2d-3725-44e7-98fa-8cb44290ceba" code_ref="packages/content/content-injector.ts#lines" -->
**Purpose:** Splits the `content` string into an array of lines based on newline characters.

**Parameter:**  
- `content`: `string` - The string to be split into lines.

**Return Type:**  
- `string[]` - An array of strings where each element represents a line from `content`.

**Usage Example:**  
```typescript
let content = "Line 1\nLine 2\nLine 3";
let lines = content.split('\n');
// lines = ["Line 1", "Line 2", "Line 3"];
```
<!-- doctype:end id="8f55ce2d-3725-44e7-98fa-8cb44290ceba" -->


### result

<!-- doctype:start id="c43b5473-931a-454f-9c90-62ad80c788bf" code_ref="packages/content/content-injector.ts#result" -->
Stores the outcome of injecting `newContent` into `content` at a specified `anchorId`.

**Parameters:**  
- `content` (string): The original content to which new content will be injected.  
- `anchorId` (string): The identifier that determines where to inject the new content.  
- `newContent` (string): The content to be injected into the original content.

**Return Type:**  
- `InjectionResult`: An object representing the result of the injection operation.

**Usage Example:**  
```typescript
const content = "Original Content";  
const anchorId = "anchor";  
const newContent = "Injected Content";  
const result = this.injectIntoContent(content, anchorId, newContent);  
console.log(result); // Outputs the result of the injection process
```
<!-- doctype:end id="c43b5473-931a-454f-9c90-62ad80c788bf" -->


### originalContent

<!-- doctype:start id="52112abf-56d0-450d-907f-da06f046f5ac" code_ref="packages/content/content-injector.ts#originalContent" -->
**Purpose:** Reads the content of a file asynchronously and stores it in `originalContent`.

**Parameters:**
- `filePath`: `string` - The path of the file to be read.

**Return Type:** `string` - The content of the file as a UTF-8 encoded string.

**Usage Example:**
```typescript
const originalContent = readFileSync('path/to/file.txt', 'utf-8');
```
<!-- doctype:end id="52112abf-56d0-450d-907f-da06f046f5ac" -->


### ContentInjector

<!-- doctype:start id="50e47ebb-954a-425a-a030-ecab2c259351" code_ref="packages/content/content-injector.ts#ContentInjector" -->
**Purpose:** A class responsible for injecting content into files or strings, managing anchors, and validating their locations.

**Methods:**
- `injectIntoFile(filePath: string, anchorId: string, newContent: string, writeToFile: boolean = true): InjectionResult`
- `injectIntoContent(content: string, anchorId: string, newContent: string): InjectionResult`
- `injectMultiple(filePath: string, injections: Map<string, string>, writeToFile: boolean = true): InjectionResult[]`
- `preview(filePath: string, anchorId: string, newContent: string): InjectionResult`
- `getAnchorLocation(filePath: string, anchorId: string): string`
- `getAnchorLocationFromContent(content: string, anchorId: string): string`
- `validateAnchor(content: string, anchorId: string): string[]`

**Return Type:** Varies based on the method called. 

**Usage Example:**
```typescript
const injector = new ContentInjector();
const injectionResult = injector.injectIntoFile('document.md', 'anchor1', 'Hello, World!');
```
<!-- doctype:end id="50e47ebb-954a-425a-a030-ecab2c259351" -->



### InjectionResult

<!-- doctype:start id="c7192751-a634-4a1d-98ed-6d27fec519b2" code_ref="packages/content/content-injector.ts#InjectionResult" -->
**Purpose:** Represents the result of an injection operation with additional context about the operation.

**Properties:**
- `success`: Indicates if the injection was successful (type: `boolean`).
- `content`: The resulting content after injection (type: `string`).
- `linesChanged`: The number of lines modified (type: `number`).
- `error`: Optional error message if the injection fails (type: `string`, optional).

**Return Type:** `InjectionResult`

**Usage Example:**
```typescript
const result: InjectionResult = {success: true, content: 'New content', linesChanged: 3};
```
<!-- doctype:end id="c7192751-a634-4a1d-98ed-6d27fec519b2" -->
