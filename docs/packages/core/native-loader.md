# Native-loader

Auto-generated documentation via Doctype.


## API Reference

### CodeRefParts

<!-- doctype:start id="a01ecf52-f7c6-46f1-b1c1-31ef7a2924e2" code_ref="packages/core/native-loader.ts#CodeRefParts" -->
**Purpose**: Represents the various parts of a code reference for operational clarity.

**Type**: `CoreTypes.CodeRefParts`

**Return Type**: `CoreTypes.CodeRefParts`

**Usage Example**:
```typescript
const refParts: CodeRefParts = { file: 'file.js', line: 10, column: 5 };
```
<!-- doctype:end id="a01ecf52-f7c6-46f1-b1c1-31ef7a2924e2" -->


### ExtractionResult

<!-- doctype:start id="705bfc95-dcbe-4630-b927-a2192d142b03" code_ref="packages/core/native-loader.ts#ExtractionResult" -->
**Purpose**: Holds the results of an extraction operation, including any extracted data.

**Type**: `CoreTypes.ExtractionResult`

**Return Type**: `CoreTypes.ExtractionResult`

**Usage Example**:
```typescript
const extractionResult: ExtractionResult = { data: {}, status: 'success' };
```
<!-- doctype:end id="705bfc95-dcbe-4630-b927-a2192d142b03" -->


### DoctypeAnchor

<!-- doctype:start id="241eb8e7-7211-4317-8ac2-79087387367d" code_ref="packages/core/native-loader.ts#DoctypeAnchor" -->
**Purpose**: Represents an anchor point for a specific document type within the system.

**Type**: `CoreTypes.DoctypeAnchor`

**Return Type**: `CoreTypes.DoctypeAnchor`

**Usage Example**:
```typescript
const anchor: DoctypeAnchor = { id: 'anchor-1', type: 'type-1' };
```
<!-- doctype:end id="241eb8e7-7211-4317-8ac2-79087387367d" -->


### FileDiscoveryOptions

<!-- doctype:start id="93ac2c1e-5cc7-4991-9929-2ba910dfae5a" code_ref="packages/core/native-loader.ts#FileDiscoveryOptions" -->
**Purpose**: Provides options for configuring file discovery behavior.

**Type**: `CoreTypes.FileDiscoveryOptions`

**Return Type**: `CoreTypes.FileDiscoveryOptions`

**Usage Example**:
```typescript
const options: FileDiscoveryOptions = { recursive: true, includeHidden: false };
```
<!-- doctype:end id="93ac2c1e-5cc7-4991-9929-2ba910dfae5a" -->


### FileDiscoveryResult

<!-- doctype:start id="a2e26588-fa83-4e4b-9b6c-6c3958163e07" code_ref="packages/core/native-loader.ts#FileDiscoveryResult" -->
**Purpose**: Encapsulates the result of a file discovery operation.

**Type**: `CoreTypes.FileDiscoveryResult`

**Return Type**: `CoreTypes.FileDiscoveryResult`

**Usage Example**:
```typescript
const result: FileDiscoveryResult = { files: [], errors: [] };
```
<!-- doctype:end id="a2e26588-fa83-4e4b-9b6c-6c3958163e07" -->


### DoctypeMap

<!-- doctype:start id="0d078cc2-418e-487e-a7ab-d1289338aadc" code_ref="packages/core/native-loader.ts#DoctypeMap" -->
**Purpose**: Represents a map of document types in the core system.

**Type**: `CoreTypes.DoctypeMap`

**Return Type**: `CoreTypes.DoctypeMap`

**Usage Example**:
```typescript
const doctypeMap: DoctypeMap = { 'type-1': entry }; // entry from DoctypeMapEntry
```
<!-- doctype:end id="0d078cc2-418e-487e-a7ab-d1289338aadc" -->


### DoctypeMapEntry

<!-- doctype:start id="3c5560cc-69eb-4f29-934e-e16440e330ad" code_ref="packages/core/native-loader.ts#DoctypeMapEntry" -->
**Purpose**: Defines an entry for a document type mapping.

**Type**: `CoreTypes.DoctypeMapEntry`

**Return Type**: `CoreTypes.DoctypeMapEntry`

**Usage Example**:
```typescript
const entry: DoctypeMapEntry = { type: 'type-1', handler: 'handlerFunction' };
```
<!-- doctype:end id="3c5560cc-69eb-4f29-934e-e16440e330ad" -->


### DocRef

<!-- doctype:start id="ff9fe2f0-0f69-4847-8b8e-51580ebb4d41" code_ref="packages/core/native-loader.ts#DocRef" -->
**Purpose**: Represents a reference to a document within the system.

**Type**: `CoreTypes.DocRef`

**Return Type**: `CoreTypes.DocRef`

**Usage Example**:
```typescript
const docRef: DocRef = { id: 'doc-001', version: 1 };
```
<!-- doctype:end id="ff9fe2f0-0f69-4847-8b8e-51580ebb4d41" -->


### SignatureHash

<!-- doctype:start id="8cc4b03d-b7f0-46e5-8fad-4c99bc68eec1" code_ref="packages/core/native-loader.ts#SignatureHash" -->
**Purpose**: A type representing a hash of a signature, commonly used for validation.

**Type**: `CoreTypes.SignatureHash`

**Return Type**: `CoreTypes.SignatureHash`

**Usage Example**:
```typescript
const hash: SignatureHash = 'abc123';
```
<!-- doctype:end id="8cc4b03d-b7f0-46e5-8fad-4c99bc68eec1" -->


### CodeSignature

<!-- doctype:start id="a74f5a91-cc1f-4d56-8e7f-697f218b84dd" code_ref="packages/core/native-loader.ts#CodeSignature" -->
**Purpose**: Represents a code signature used in core operations.

**Type**: `CoreTypes.CodeSignature`

**Return Type**: `CoreTypes.CodeSignature`

**Usage Example**:
```typescript
const signature: CodeSignature = { /* properties */ };
```
<!-- doctype:end id="a74f5a91-cc1f-4d56-8e7f-697f218b84dd" -->



### CodeRef

<!-- doctype:start id="31515afd-faac-48d8-8a94-dfce0bf66736" code_ref="packages/core/native-loader.ts#CodeRef" -->
**Purpose:** This type represents a code reference within the system, and is aliased from CoreTypes.CodeRef.

**Parameters:** None (used as a type alias).

**Return Type:** CoreTypes.CodeRef - The underlying type referenced.

**Usage Example:**  
```typescript
let ref: CodeRef = { /* Properties as defined in CoreTypes.CodeRef */ }; 
```
<!-- doctype:end id="31515afd-faac-48d8-8a94-dfce0bf66736" -->
