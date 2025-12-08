# Drift-detector

Auto-generated documentation via Doctype.


## API Reference

### key

<!-- doctype:start id="bbb792d1-6103-478a-a5a7-371e481d78e5" code_ref="packages/cli/src/services/drift-detector.ts#key" -->
**key** - Documentation needs generation

Current signature:
```typescript
key = `${relativePath}#${sig.symbolName}`
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="bbb792d1-6103-478a-a5a7-371e481d78e5" -->


### sig

<!-- doctype:start id="ce932dfc-ee34-4aa7-8fb1-3621f4cd5a55" code_ref="packages/cli/src/services/drift-detector.ts#sig" -->
**sig** - Documentation needs generation

Current signature:
```typescript
sig
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="ce932dfc-ee34-4aa7-8fb1-3621f4cd5a55" -->


### relativePath

<!-- doctype:start id="f51636bb-e734-4ffb-a0a7-b993cad1e05c" code_ref="packages/cli/src/services/drift-detector.ts#relativePath" -->
**relativePath** - Documentation needs generation

Current signature:
```typescript
relativePath = relative(basePath,  file).split(sep).join('/')
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="f51636bb-e734-4ffb-a0a7-b993cad1e05c" -->


### file

<!-- doctype:start id="45b685ae-640a-45f0-a38e-5a34443cfc4d" code_ref="packages/cli/src/services/drift-detector.ts#file" -->
**file** - Documentation needs generation

Current signature:
```typescript
file
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="45b685ae-640a-45f0-a38e-5a34443cfc4d" -->


### discoveryResult

<!-- doctype:start id="7e1b3893-ac50-449b-a200-886c9f464976" code_ref="packages/cli/src/services/drift-detector.ts#discoveryResult" -->
**discoveryResult** - Documentation needs generation

Current signature:
```typescript
discoveryResult = discoverFiles(absProjectRoot, {respectGitignore: true,  includeHidden: false,  maxDepth: undefined, })
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="7e1b3893-ac50-449b-a200-886c9f464976" -->


### absProjectRoot

<!-- doctype:start id="5e8d1f03-eb7b-4203-9f2b-a5c9e28c41a6" code_ref="packages/cli/src/services/drift-detector.ts#absProjectRoot" -->
**absProjectRoot** - Documentation needs generation

Current signature:
```typescript
absProjectRoot = resolve(basePath,  projectRoot)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="5e8d1f03-eb7b-4203-9f2b-a5c9e28c41a6" -->


### tracked

<!-- doctype:start id="a3cce4d3-9790-4a67-93f5-11ac541c1a63" code_ref="packages/cli/src/services/drift-detector.ts#tracked" -->
**tracked** - Documentation needs generation

Current signature:
```typescript
tracked = new Set<string>()
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="a3cce4d3-9790-4a67-93f5-11ac541c1a63" -->


### untracked

<!-- doctype:start id="ef21043f-2750-4b08-8228-40e302a4181b" code_ref="packages/cli/src/services/drift-detector.ts#untracked" -->
**untracked** - Documentation needs generation

Current signature:
```typescript
untracked: UntrackedSymbolInfo[]=[]
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="ef21043f-2750-4b08-8228-40e302a4181b" -->


### missing

<!-- doctype:start id="bfe32920-da4e-4caf-802c-5cd54fb881aa" code_ref="packages/cli/src/services/drift-detector.ts#missing" -->
**missing** - Documentation needs generation

Current signature:
```typescript
missing: MissingSymbolInfo[]=[]
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="bfe32920-da4e-4caf-802c-5cd54fb881aa" -->


### DriftResult

<!-- doctype:start id="9518cb68-d0b8-497e-9f02-59c76fc8fa2e" code_ref="packages/cli/src/services/drift-detector.ts#DriftResult" -->
**DriftResult** - Documentation needs generation

Current signature:
```typescript
interface DriftResult{drifts: DriftInfo[];  missing: MissingSymbolInfo[];  untracked: UntrackedSymbolInfo[]; }
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="9518cb68-d0b8-497e-9f02-59c76fc8fa2e" -->


### UntrackedSymbolInfo

<!-- doctype:start id="a1fe33e9-904b-45a5-b02f-44b9cb6bdfa6" code_ref="packages/cli/src/services/drift-detector.ts#UntrackedSymbolInfo" -->
**UntrackedSymbolInfo** - Documentation needs generation

Current signature:
```typescript
interface UntrackedSymbolInfo{symbolName: string;  filePath: string;  signature: CodeSignature; }
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="a1fe33e9-904b-45a5-b02f-44b9cb6bdfa6" -->


### MissingSymbolInfo

<!-- doctype:start id="3da63fd2-8010-4847-98c5-a172cacdb99d" code_ref="packages/cli/src/services/drift-detector.ts#MissingSymbolInfo" -->
**MissingSymbolInfo** - Documentation needs generation

Current signature:
```typescript
interface MissingSymbolInfo{entry: DoctypeMapEntry;  reason: 'file_not_found' | 'symbol_not_found';  codeFilePath: string; }
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="3da63fd2-8010-4847-98c5-a172cacdb99d" -->


### oldSignature

<!-- doctype:start id="09ed9209-987c-46d5-b7dd-c71ec5193406" code_ref="packages/cli/src/services/drift-detector.ts#oldSignature" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="09ed9209-987c-46d5-b7dd-c71ec5193406" -->


### currentHash

<!-- doctype:start id="fe9e7d6a-b817-4f2a-b669-04de8f49fc74" code_ref="packages/cli/src/services/drift-detector.ts#currentHash" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="fe9e7d6a-b817-4f2a-b669-04de8f49fc74" -->


### currentSignature

<!-- doctype:start id="e09ccf26-1acb-4bbf-92af-80b80489b8c4" code_ref="packages/cli/src/services/drift-detector.ts#currentSignature" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="e09ccf26-1acb-4bbf-92af-80b80489b8c4" -->


### signatures

<!-- doctype:start id="e8fdee41-1e83-4b69-980f-f0c392f27d7c" code_ref="packages/cli/src/services/drift-detector.ts#signatures" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="e8fdee41-1e83-4b69-980f-f0c392f27d7c" -->


### codeFilePath

<!-- doctype:start id="9a7b3476-6855-4aed-8180-680243d58436" code_ref="packages/cli/src/services/drift-detector.ts#codeFilePath" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="9a7b3476-6855-4aed-8180-680243d58436" -->


### entry

<!-- doctype:start id="20c02e1c-28ca-4960-bc11-3e7df384d8fd" code_ref="packages/cli/src/services/drift-detector.ts#entry" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="20c02e1c-28ca-4960-bc11-3e7df384d8fd" -->


### drifts

<!-- doctype:start id="d3a256f4-d166-4edd-bf38-5641a33dc66b" code_ref="packages/cli/src/services/drift-detector.ts#drifts" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="d3a256f4-d166-4edd-bf38-5641a33dc66b" -->


### entries

<!-- doctype:start id="0de3a4dd-17b4-4113-a2cc-b7fa973aeb2c" code_ref="packages/cli/src/services/drift-detector.ts#entries" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="0de3a4dd-17b4-4113-a2cc-b7fa973aeb2c" -->


### detectDrift

<!-- doctype:start id="02e09b54-a3b7-4b54-9b36-3d0399c6ce45" code_ref="packages/cli/src/services/drift-detector.ts#detectDrift" -->
**Purpose:** The detectDrift function analyzes a given document structure and identifies discrepancies between its expected and actual state, which is crucial for maintaining data integrity.

**Parameters:**
- `mapManager` (`DoctypeMapManager`): An instance of DoctypeMapManager responsible for managing the document types and their maps.
- `analyzer` (`InstanceType<typeof AstAnalyzer>`): An instance of AstAnalyzer used to analyze the document's abstract syntax tree.
- `options` (optional) (`DriftDetectionOptions`): Configuration options for drift detection. Default: `{}`

**Returns:** `DriftResult` - An object containing the results of the drift detection, including any discrepancies found.

**Usage Example:**
```typescript
const driftResults = detectDrift(mapManagerInstance, astAnalyzerInstance, { threshold: 0.1 });
```

**Notes:**
- The options parameter can customize the sensitivity of the drift detection process.
<!-- doctype:end id="02e09b54-a3b7-4b54-9b36-3d0399c6ce45" -->


### DriftDetectionOptions

<!-- doctype:start id="632b7101-ac7e-4f6b-ac44-6ed8972791ae" code_ref="packages/cli/src/services/drift-detector.ts#DriftDetectionOptions" -->
**Purpose:** This interface defines configuration options for drift detection, allowing users to customize the detection process based on specific requirements.

**Parameters:**
- `basePath` (optional) (`string`): The base directory for drift detection operations. Default: `undefined`
- `logger` (optional) (`Logger`): An instance of a logging utility for tracking drift detection events. Default: `undefined`
- `discoverUntracked` (optional) (`boolean`): A flag indicating whether to discover untracked files that may cause drift. Default: `false`
- `projectRoot` (optional) (`string`): The root directory of the project for context in drift detection. Default: `undefined`

**Returns:** `void` - This interface does not have a return type as it is used for configuration.

**Usage Example:**
```typescript
const options: DriftDetectionOptions = { basePath: '/src', discoverUntracked: true };
```
<!-- doctype:end id="632b7101-ac7e-4f6b-ac44-6ed8972791ae" -->



### DriftInfo

<!-- doctype:start id="346dc5a6-40f7-4cf7-b6ac-b2f220a2d65a" code_ref="packages/cli/src/services/drift-detector.ts#DriftInfo" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="346dc5a6-40f7-4cf7-b6ac-b2f220a2d65a" -->
