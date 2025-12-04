# Map-manager

Auto-generated documentation via Doctype.


## API Reference

### currentHash

<!-- doctype:start id="f6f6574c-14f4-498e-941d-e4024e895be1" code_ref="packages/content/map-manager.ts#currentHash" -->
**Purpose:** Retrieves the current hash value associated with a specific entry ID.

**Behavior:** Accesses the `currentHashes` map to get the hash corresponding to `entry.id`.

**Parameters:**
- None

**Return Type:** `string | undefined` - Returns the hash string if found, otherwise returns undefined.

**Usage Example:**
```typescript
const hash = currentHash; // Replace 'currentHash' with the current context
console.log(hash); // Outputs the current hash for the entry ID
```
<!-- doctype:end id="f6f6574c-14f4-498e-941d-e4024e895be1" -->


### entry

<!-- doctype:start id="1dc6e9d2-2384-4995-b494-020dcb7e607a" code_ref="packages/content/map-manager.ts#entry" -->
**Purpose:** Represents the current entry object in context based on a given identifier.

**Behavior:** This symbol is assigned the result of the method `getEntryById`, which retrieves the data related to a specific entry identified by the `id` parameter.

**Parameters:**
- `id` (type: `string` | `number`): The identifier for the entry to be retrieved.

**Return Type:** `DoctypeMapEntry` - The current entry object associated with the specified `id`.

**Usage Example:**
```typescript
const id = 'entry123'; // Example entry ID
const entry = this.getEntryById(id);
console.log(entry); // Outputs the current entry object corresponding to the provided ID
```
<!-- doctype:end id="1dc6e9d2-2384-4995-b494-020dcb7e607a" -->


### drifted

<!-- doctype:start id="29216f0e-ace9-45a1-b127-2d20b2eb20cf" code_ref="packages/content/map-manager.ts#drifted" -->
**Purpose:** Represents an array to hold entries that have drifted.

**Behavior:** Initialized as an empty array of type `DoctypeMapEntry`.

**Parameters:**
- None

**Return Type:** `DoctypeMapEntry[]` - An array of entries that have drifted.

**Usage Example:**
```typescript
console.log(drifted); // Outputs the current drifted entries (initially empty)
```
<!-- doctype:end id="29216f0e-ace9-45a1-b127-2d20b2eb20cf" -->


### entry

<!-- doctype:start id="ffa3911d-4c3d-44ac-a6a1-733581cc228d" code_ref="packages/content/map-manager.ts#entry" -->
**Purpose:** Represents the current entry object in context.

**Behavior:** This symbol serves as a variable holding the data related to a specific entry.

**Parameters:**
- None

**Return Type:** `DoctypeMapEntry` - The current entry object.

**Usage Example:**
```typescript
console.log(entry); // Outputs the current entry object
```
<!-- doctype:end id="ffa3911d-4c3d-44ac-a6a1-733581cc228d" -->


### index

<!-- doctype:start id="6d0093aa-db44-4982-abb4-0016a12ba305" code_ref="packages/content/map-manager.ts#index" -->
**Purpose:** Finds the index of the entry with a specific ID in the map entries.

**Behavior:** Utilizes `findIndex` to search through `this.map.entries` for an entry where `entry.id` matches the provided `id`.

**Parameters:**
- `id: string` - The ID of the entry to be located.

**Return Type:** `number` - Returns the index of the entry if found, otherwise -1.

**Usage Example:**
```typescript
const idx = index; // Replace 'index' with the current context
console.log(idx); // Outputs the index of the entry based on the given ID
```
<!-- doctype:end id="6d0093aa-db44-4982-abb4-0016a12ba305" -->


### index

<!-- doctype:start id="655af3ab-ce4f-401f-b853-7f1071e7c99b" code_ref="packages/content/map-manager.ts#index" -->
**Purpose:** Finds the index of the entry with a specific ID in the map entries.

**Behavior:** Utilizes `findIndex` to search through `this.map.entries` for an entry where `entry.id` matches the provided `id`.

**Parameters:**
- `id: string` - The ID of the entry to be located.

**Return Type:** `number` - Returns the index of the entry if found, otherwise -1.

**Usage Example:**
```typescript
const idx = index; // Replace 'index' with the current context
console.log(idx); // Outputs the index of the entry based on the given ID
```
<!-- doctype:end id="655af3ab-ce4f-401f-b853-7f1071e7c99b" -->


### content

<!-- doctype:start id="5315d184-2ae4-4327-87eb-f3e8dad158f3" code_ref="packages/content/map-manager.ts#content" -->
**Purpose:** Reads the contents of a file as a UTF-8 encoded string.

**Behavior:** Uses `readFileSync` to synchronously read the content from the specified file path stored in `this.mapFilePath`.

**Parameters:**
- `this.mapFilePath: string` - The file path from which to read the content.

**Return Type:** `string` - Returns the contents of the file as a UTF-8 encoded string.

**Usage Example:**
```typescript
const fileContent = content;
console.log(fileContent); // Outputs the string contents of the file located at this.mapFilePath
```
<!-- doctype:end id="5315d184-2ae4-4327-87eb-f3e8dad158f3" -->


### dir

<!-- doctype:start id="ceda6409-2f9c-4c84-b685-171cc24231cb" code_ref="packages/content/map-manager.ts#dir" -->
**Purpose:** Retrieves the directory name from the specified map file path.

**Behavior:** Utilizes `dirname` to extract the directory portion of `this.mapFilePath`.

**Parameters:**
- None

**Return Type:** `string`

**Usage Example:**
```typescript
const directory = dir;
console.log(directory); // Outputs the directory name from the map file path
```
<!-- doctype:end id="ceda6409-2f9c-4c84-b685-171cc24231cb" -->


### map

<!-- doctype:start id="c3148286-7bb8-451d-a5c0-0f3511b27930" code_ref="packages/content/map-manager.ts#map" -->
**Purpose:** Parses the content string of the map file into a JSON object representing the doctype map.

**Parameters:**  
- `content`: `string` - The content string to be parsed into an object representing the doctype map.

**Return Type:**  
- `DoctypeMap` - The parsed doctype map as a JSON object.

**Usage Example:**  
```typescript
let content = '{ "doctype1": {...} }';
let map = JSON.parse(content) as DoctypeMap;
// map now contains the parsed doctype map object.
```
<!-- doctype:end id="c3148286-7bb8-451d-a5c0-0f3511b27930" -->


### content

<!-- doctype:start id="3f9fecbd-b6bf-41f8-b5a9-20eb82bc1e03" code_ref="packages/content/map-manager.ts#content" -->
**Purpose:** Converts the map object into a JSON string representation.

**Behavior:** Uses `JSON.stringify` with a space indentation of 2 for readability.

**Parameters:**
- None

**Return Type:** `string`

**Usage Example:**
```typescript
const jsonContent = content;
console.log(jsonContent); // Outputs the formatted JSON string of the map
```
<!-- doctype:end id="3f9fecbd-b6bf-41f8-b5a9-20eb82bc1e03" -->



### DoctypeMapManager

<!-- doctype:start id="40fb210e-d34d-4c5f-9787-3597de3d7f4d" code_ref="packages/content/map-manager.ts#DoctypeMapManager" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="40fb210e-d34d-4c5f-9787-3597de3d7f4d" -->
