# Markdown-anchor-inserter

Auto-generated documentation via Doctype.


## API Reference

### matches

<!-- doctype:start id="f06edaf6-04e3-44e2-8523-d6edfb6dd516" code_ref="packages/content/markdown-anchor-inserter.ts#matches" -->
**Purpose:** Retrieves all matches of the specified regex pattern within a given content string.

**Behavior:** Utilizes the `matchAll` method to find all occurrences that match the defined `pattern` expression.

**Return Type:** `IterableIterator<RegExpMatchArray>`

**Usage Example:**
```typescript
const matches = content.matchAll(pattern);
for (const match of matches) {
    console.log(match[1]); // Logs each captured code_ref found
}
```
<!-- doctype:end id="f06edaf6-04e3-44e2-8523-d6edfb6dd516" -->


### pattern

<!-- doctype:start id="75b0bfc8-c8da-4698-a0f0-1cecf45b868d" code_ref="packages/content/markdown-anchor-inserter.ts#pattern" -->
**Purpose:** Defines a dynamic regex pattern to globally match HTML comment markers indicating the beginning of a document type.

**Behavior:** 
- Generates a `RegExp` object to match HTML comment markers.
- The pattern matches comments that denote the start of a document type, including an `id` and `code_ref` attribute, where `code_ref` is dynamically inserted using the `escapeRegex` method.

**Parameters:**

- `codeRef` (string): The code reference to be escaped and included in the regex pattern.

**Return Type:** 
- `RegExp`: Represents a regular expression object used for matching text patterns in strings.

**Usage Example:**
```typescript
const codeRef = "exampleCode"; // Dynamic value for code reference
const pattern = new RegExp(`<!--\\s*doctype:start\\s+id="[^"]+"\\s+code_ref="${this.escapeRegex(codeRef)}"\\s*-->`);

// Example of using the pattern
const sampleText = '<!-- doctype:start id="doc1" code_ref="exampleCode" -->';
const matches = sampleText.match(pattern);
console.log(matches); // Logs the matched comment markers, if any
```

**File Location:** `packages/content/markdown-anchor-inserter.ts`
<!-- doctype:end id="75b0bfc8-c8da-4698-a0f0-1cecf45b868d" -->


### pattern

<!-- doctype:start id="2348ab46-0644-4cf7-851f-c94071bd3a5c" code_ref="packages/content/markdown-anchor-inserter.ts#pattern" -->
**Purpose:** Defines a regex pattern to globally match HTML comment markers indicating the beginning of a document type.

**Behavior:** Uses capture groups to extract the `code_ref` value from the comments.

**Return Type:** `RegExp`

**Usage Example:**
```typescript
const pattern = /<!--\s*doctype:start\s+id="[^\"]+"\s+code_ref="([^\"]+)"\s*-->/g;
```
<!-- doctype:end id="2348ab46-0644-4cf7-851f-c94071bd3a5c" -->


### allSucceeded

<!-- doctype:start id="a5425342-0daf-424c-b53e-91d21b4f5a8a" code_ref="packages/content/markdown-anchor-inserter.ts#allSucceeded" -->
**Purpose:** Determines whether all insertion results were successful.

**Behavior:** Uses the `every` method to check if the `success` property on every result in the `results` array is true.

**Return Type:** `boolean`

**Usage Example:**
```typescript
const allSucceeded = results.every((r) => r.success);
console.log(allSucceeded); // Outputs true if all insertions succeeded
```
<!-- doctype:end id="a5425342-0daf-424c-b53e-91d21b4f5a8a" -->


### result

<!-- doctype:start id="adab972e-ef95-4d26-bb40-e36d7d6627eb" code_ref="packages/content/markdown-anchor-inserter.ts#result" -->
**Purpose:** Captures the outcome of an insertion operation into content.

**Behavior:** Calls the `insertIntoContent` method with specific parameters including content, code reference, and options passed to perform the insertion action.

**Return Type:** `InjectionResult`

**Usage Example:**
```typescript
const result = this.insertIntoContent(content, codeRef, options);
if (result.success) {
    console.log('Insertion was successful.');
}
```
<!-- doctype:end id="adab972e-ef95-4d26-bb40-e36d7d6627eb" -->


### codeRef

<!-- doctype:start id="143c4824-6712-4ac6-8d1c-86300b18f651" code_ref="packages/content/markdown-anchor-inserter.ts#codeRef" -->
**Purpose:** Represents the reference ID of a code segment or anchor for actions like injection or retrieval.

**Behavior:** This variable serves as a unique identifier to locate code segments in a document.

**Type:** `string`

**Usage Example:**
```typescript
const codeRef = 'uniqueCode123';
```
<!-- doctype:end id="143c4824-6712-4ac6-8d1c-86300b18f651" -->


### results

<!-- doctype:start id="21761826-ee7d-4128-bf15-4c8b1ed6a3da" code_ref="packages/content/markdown-anchor-inserter.ts#results" -->
**Purpose:** Holds an array of results from anchor insertions, specifically of type `AnchorInsertionResult`.

**Behavior:** Initialized as an empty array to store results from processes.

**Type:** `AnchorInsertionResult[]`

**Usage Example:**
```typescript
let results: AnchorInsertionResult[] = [];
results.push({success: true, message: 'Insertion successful'});
```
<!-- doctype:end id="21761826-ee7d-4128-bf15-4c8b1ed6a3da" -->


### fileName

<!-- doctype:start id="a514de52-e486-4b98-a840-7a94d120fe38" code_ref="packages/content/markdown-anchor-inserter.ts#fileName" -->
**Purpose:** Extracts the file name from a file path, removing the `.md` extension if present, and defaults to 'Documentation' if no valid name is found.

**Behavior:** Uses `split` to separate the path and `pop` to retrieve the last segment. Applies optional chaining to safely handle potential undefined values.

**Return Type:** `string`

**Usage Example:**
```typescript
const filePath = '/user/documents/myFile.md';
const fileName = filePath.split('/').pop()?.replace('.md', '') || 'Documentation'; // Results in 'myFile'
```
<!-- doctype:end id="a514de52-e486-4b98-a840-7a94d120fe38" -->


### content

<!-- doctype:start id="74741bf5-1a72-4484-b307-c2fe1c23d8ff" code_ref="packages/content/markdown-anchor-inserter.ts#content" -->
**Purpose:** `content` holds the main text or data that will be processed or displayed. It is initialized as an empty string, suggesting it holds no data at the moment.

**Type:** `string`

**Return Type:** Returns an empty string or any subsequent string value assigned to it.

**Usage Example:**
```typescript
let content = ''; // Initially empty
content = 'Updated content'; // Now contains 'Updated content'
```
<!-- doctype:end id="74741bf5-1a72-4484-b307-c2fe1c23d8ff" -->


### endLine

<!-- doctype:start id="8c430596-6ca5-46f0-8219-74fd19865c43" code_ref="packages/content/markdown-anchor-inserter.ts#endLine" -->
**Purpose:** `endLine` indicates the line index at which the content insertion should end. It's computed as a simple offset from the `insertionPoint`.

**Type:** `number`

**Return Type:** Returns the calculated line index for content termination.

**Usage Example:**
```typescript
let insertionPoint = 2;
const endLine = insertionPoint + 5; // Output: 7
```
<!-- doctype:end id="8c430596-6ca5-46f0-8219-74fd19865c43" -->


### startLine

<!-- doctype:start id="e4046f63-4829-459a-b1f9-389dfeb75cb0" code_ref="packages/content/markdown-anchor-inserter.ts#startLine" -->
**Purpose:** `startLine` determines the line index where new content insertion should begin, calculated based on the `insertionPoint`. This helps in inserting content at the appropriate position.

**Type:** `number`

**Return Type:** Returns the calculated line index.

**Usage Example:**
```typescript
let insertionPoint = 2;
const startLine = insertionPoint + 3; // Output: 5
```
<!-- doctype:end id="e4046f63-4829-459a-b1f9-389dfeb75cb0" -->


### anchorLines

<!-- doctype:start id="2dc1a274-616d-402b-8628-b0b40e4e7a54" code_ref="packages/content/markdown-anchor-inserter.ts#anchorLines" -->
**Purpose:** `anchorLines` constructs an array of strings that represents the formatting for anchor references including comments and placeholders, ready to be inserted into a document section.

**Type:** `string[]`

**Return Type:** Returns an array of formatted strings for anchor sections.

**Usage Example:**
```typescript
const symbolName = 'MySymbol';
const anchorId = 'unique-id';
const codeRef = 'code-ref';
const placeholder = 'Placeholder content';
const anchorLines = [
  '',
  `### ${symbolName}`,
  '',
  `<!-- doctype:start id="${anchorId}" code_ref="${codeRef}" -->`,
  `${placeholder}`,
  `<!-- doctype:end id="${anchorId}" -->`,
  '',
];
console.log(anchorLines);
```
<!-- doctype:end id="2dc1a274-616d-402b-8628-b0b40e4e7a54" -->


### needsNewline

<!-- doctype:start id="d9780345-ad53-452b-98c8-957d380ad529" code_ref="packages/content/markdown-anchor-inserter.ts#needsNewline" -->
**Purpose:** `needsNewline` determines if a newline should be added before appending new content. It checks whether the last line in `lines` is not empty.

**Type:** `boolean`

**Return Type:** Returns true if a newline is needed, otherwise false.

**Usage Example:**
```typescript
const lines = [ 'First line' ];
const needsNewline = lines.length > 0 && lines[lines.length - 1].trim() !== ''; // Output: true
```
<!-- doctype:end id="d9780345-ad53-452b-98c8-957d380ad529" -->


### i

<!-- doctype:start id="4dfd568a-9081-41bf-9d42-3f1a05da08a0" code_ref="packages/content/markdown-anchor-inserter.ts#i" -->
**Purpose:** `i` is a counter variable often used in loops for iteration. Initialized to 0, it typically represents the starting index.

**Type:** `number`

**Return Type:** Returns an integer starting from 0.

**Usage Example:**
```typescript
let i = 0;
for (i; i < 5; i++) {
  console.log(i); // Outputs: 0, 1, 2, 3, 4
}
```
<!-- doctype:end id="4dfd568a-9081-41bf-9d42-3f1a05da08a0" -->


### apiRefPattern

<!-- doctype:start id="96382c39-a7dc-4a57-97df-22a17d6c268c" code_ref="packages/content/markdown-anchor-inserter.ts#apiRefPattern" -->
**Purpose:** `apiRefPattern` defines a regular expression used to match section titles in documentation based on `sectionTitle`. This helps identify relevant sections for processing.

**Type:** `RegExp`

**Return Type:** Returns a RegExp object for pattern matching.

**Usage Example:**
```typescript
const sectionTitle = 'Getting Started';
const apiRefPattern = new RegExp(`^#+\s*${sectionTitle}\s*$`, 'i');
console.log(apiRefPattern.test('# Getting Started')); // Output: true
```
<!-- doctype:end id="96382c39-a7dc-4a57-97df-22a17d6c268c" -->


### insertionPoint

<!-- doctype:start id="c5fd2ef6-8800-4f47-9442-b95e1bc72a4d" code_ref="packages/content/markdown-anchor-inserter.ts#insertionPoint" -->
**Purpose:** `insertionPoint` indicates the position where new content should be inserted. It is initialized to -1, suggesting that no valid insertion point has been set yet.

**Type:** `number`

**Return Type:** Returns an integer, specifically -1 when no insertion point is defined.

**Usage Example:**
```typescript
let insertionPoint = -1; // signifies no insertion point selected yet
```
<!-- doctype:end id="c5fd2ef6-8800-4f47-9442-b95e1bc72a4d" -->


### lines

<!-- doctype:start id="0d6e6338-adbc-4c9b-a0d5-79e3ea77c050" code_ref="packages/content/markdown-anchor-inserter.ts#lines" -->
**Purpose:** `lines` is an array of strings obtained by splitting the `content` into separate lines.

**Type:** `string[]`

**Return Type:** Returns an array of strings, each representing a line from the content.

**Usage Example:**
```typescript
const content = "Line 1\nLine 2";
const lines = content.split('\n');
console.log(lines); // Output: ['Line 1', 'Line 2']
```
<!-- doctype:end id="0d6e6338-adbc-4c9b-a0d5-79e3ea77c050" -->


### anchorId

<!-- doctype:start id="34c51903-3079-49ed-af96-6096facbbc20" code_ref="packages/content/markdown-anchor-inserter.ts#anchorId" -->
**Purpose:** `anchorId` stores a universally unique identifier (UUID) generated for referencing an anchor element in the document.

**Type:** `string`

**Return Type:** Returns a UUID string.

**Usage Example:**
```typescript
const anchorId = randomUUID();
console.log(anchorId); // Output: A unique UUID e.g., '550e8400-e29b-41d4-a716-446655440000'
```
<!-- doctype:end id="34c51903-3079-49ed-af96-6096facbbc20" -->


### result

<!-- doctype:start id="7a60a870-971f-45f8-9338-ed4c4a4038d8" code_ref="packages/content/markdown-anchor-inserter.ts#result" -->
**Purpose:** Captures the outcome of an insertion operation into content.

**Behavior:** Calls the `insertIntoContent` method with specific parameters including content, code reference, and options passed to perform the insertion action.

**Return Type:** `InjectionResult`

**Usage Example:**
```typescript
const result = this.insertIntoContent(content, codeRef, options);
if (result.success) {
    console.log('Insertion was successful.');
}
```
<!-- doctype:end id="7a60a870-971f-45f8-9338-ed4c4a4038d8" -->


### fileName

<!-- doctype:start id="a95beadd-dd93-4e35-91a0-35bba7fb8eca" code_ref="packages/content/markdown-anchor-inserter.ts#fileName" -->
**Purpose:** Extracts the file name from a file path, removing the `.md` extension if present, and defaults to 'Documentation' if no valid name is found.

**Behavior:** Uses `split` to separate the path and `pop` to retrieve the last segment. Applies optional chaining to safely handle potential undefined values.

**Return Type:** `string`

**Usage Example:**
```typescript
const filePath = '/user/documents/myFile.md';
const fileName = filePath.split('/').pop()?.replace('.md', '') || 'Documentation'; // Results in 'myFile'
```
<!-- doctype:end id="a95beadd-dd93-4e35-91a0-35bba7fb8eca" -->


### content

<!-- doctype:start id="5e8a01a9-f1c0-4fa7-a57f-1971a9db7b02" code_ref="packages/content/markdown-anchor-inserter.ts#content" -->
**Purpose:** `content` holds the main text or data that will be processed or displayed. It is initialized as an empty string, suggesting it holds no data at the moment.

**Type:** `string`

**Return Type:** Returns an empty string or any subsequent string value assigned to it.

**Usage Example:**
```typescript
let content = ''; // Initially empty
content = 'Updated content'; // Now contains 'Updated content'
```
<!-- doctype:end id="5e8a01a9-f1c0-4fa7-a57f-1971a9db7b02" -->


### MarkdownAnchorInserter

<!-- doctype:start id="21b55fb1-d113-4fc5-bb17-b63fc1809ff3" code_ref="packages/content/markdown-anchor-inserter.ts#MarkdownAnchorInserter" -->
**Purpose:** A class that provides methods for inserting anchors into markdown files or content.

**Methods:**
- `insertIntoFile(filePath: string, codeRef: string, options: AnchorInsertionOptions): void`
- `insertIntoContent(content: string, codeRef: string, options: AnchorInsertionOptions): AnchorInsertionResult`
- `insertMultiple(filePath: string, codeRefs: string[], options: AnchorInsertionOptions): void`
- `hasAnchor(content: string, codeRef: string): boolean`
- `getExistingCodeRefs(content: string): string[]`
- `escapeRegex(str: string): string`

**Usage Example:**
```typescript
const inserter = new MarkdownAnchorInserter();
inserter.insertIntoFile('path/to/file.md', 'someCodeRef', {createSection: false});
```
<!-- doctype:end id="21b55fb1-d113-4fc5-bb17-b63fc1809ff3" -->


### AnchorInsertionResult

<!-- doctype:start id="007a006d-6697-4f12-a2ac-1b35ae35751d" code_ref="packages/content/markdown-anchor-inserter.ts#AnchorInsertionResult" -->
**Purpose:** An interface representing the result of an anchor insertion operation.

**Properties:**
- `success`: A boolean indicating if the insertion was successful.
- `content`: A string holding the content after insertion.
- `anchorId`: A string that uniquely identifies the anchor.
- `location`: An object containing the insertion location with:
  - `startLine` (number): The line where the anchor starts.
  - `endLine` (number): The line where the anchor ends.
- `error` (optional): An optional string containing error details if the insertion failed.

**Usage Example:**
```typescript
const result: AnchorInsertionResult = {success: true, content: '...', anchorId: 'anchor1', location: {startLine: 1, endLine: 1}};
```
<!-- doctype:end id="007a006d-6697-4f12-a2ac-1b35ae35751d" -->



### AnchorInsertionOptions

<!-- doctype:start id="307db562-cb4c-40ad-8fd0-4df66052b479" code_ref="packages/content/markdown-anchor-inserter.ts#AnchorInsertionOptions" -->
**Purpose:** An interface defining options for inserting an anchor.

**Properties:**
- `createSection` (optional): A boolean indicating whether to create a new section.
- `sectionTitle` (optional): A string denoting the title of the section.
- `placeholder` (optional): A string that serves as a placeholder text.

**Usage Example:**
```typescript
const options: AnchorInsertionOptions = {createSection: true, sectionTitle: 'Introduction'};
```
<!-- doctype:end id="307db562-cb4c-40ad-8fd0-4df66052b479" -->
