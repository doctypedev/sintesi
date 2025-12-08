# Check

Auto-generated documentation via Doctype.


## API Reference

### symbol

<!-- doctype:start id="c80f4fe9-0cac-4730-81c2-4b1dfd97acae" code_ref="packages/cli/src/commands/check.ts#symbol" -->
**symbol** - Documentation needs generation

Current signature:
```typescript
symbol = untrackedSymbols[i]
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="c80f4fe9-0cac-4730-81c2-4b1dfd97acae" -->


### i

<!-- doctype:start id="cfa8c020-763d-4ee3-8e9c-749b27c8fd9e" code_ref="packages/cli/src/commands/check.ts#i" -->
**i** - Documentation needs generation

Current signature:
```typescript
i = 0
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="cfa8c020-763d-4ee3-8e9c-749b27c8fd9e" -->


### showCount

<!-- doctype:start id="b8724b5a-013e-484b-8e2c-a3b8667cdc85" code_ref="packages/cli/src/commands/check.ts#showCount" -->
**showCount** - Documentation needs generation

Current signature:
```typescript
showCount = options.verbose ? untrackedSymbols.length: Math.min(untrackedSymbols.length,  10)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="b8724b5a-013e-484b-8e2c-a3b8667cdc85" -->


### m

<!-- doctype:start id="d255c3fb-02ee-4dfe-bb09-532ac12162cf" code_ref="packages/cli/src/commands/check.ts#m" -->
**m** - Documentation needs generation

Current signature:
```typescript
m
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="d255c3fb-02ee-4dfe-bb09-532ac12162cf" -->


### missingDetails

<!-- doctype:start id="c34bbf7d-ae08-4225-8cb7-8eb47faa595f" code_ref="packages/cli/src/commands/check.ts#missingDetails" -->
**missingDetails** - Documentation needs generation

Current signature:
```typescript
missingDetails: import('../types').MissingSymbolDetail[]= missingSymbols.map((m)=>({id: m.entry.id,  symbolName: m.entry.codeRef.symbolName,  codeFilePath: m.entry.codeRef.filePath,  docFilePath: m.entry.docRef.filePath,  reason: m.reason, }))
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="c34bbf7d-ae08-4225-8cb7-8eb47faa595f" -->


### drifts

<!-- doctype:start id="9fd1642a-75b6-4765-aeab-7d6f5aa4d139" code_ref="packages/cli/src/commands/check.ts#drifts" -->
**drifts** - Documentation needs generation

Current signature:
```typescript
drifts: DriftDetail[]= detectedDrifts.map((drift)=>({id: drift.entry.id,  symbolName: drift.entry.codeRef.symbolName,  codeFilePath: drift.entry.codeRef.filePath,  docFilePath: drift.entry.docRef.filePath,  oldHash: drift.oldHash,  newHash: drift.currentHash,  oldSignature: undefined,  newSignature: drift.currentSignature.signatureText, }))
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="9fd1642a-75b6-4765-aeab-7d6f5aa4d139" -->


### analyzer

<!-- doctype:start id="9f155d6b-6d96-4e4d-9204-d15743aa4f39" code_ref="packages/cli/src/commands/check.ts#analyzer" -->
**analyzer** - Documentation needs generation

Current signature:
```typescript
analyzer = new AstAnalyzer()
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="9f155d6b-6d96-4e4d-9204-d15743aa4f39" -->


### entries

<!-- doctype:start id="7e9bbe04-4c19-4ef1-9db5-c9591bbbff39" code_ref="packages/cli/src/commands/check.ts#entries" -->
**entries** - Documentation needs generation

Current signature:
```typescript
entries = mapManager.getEntries()
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="7e9bbe04-4c19-4ef1-9db5-c9591bbbff39" -->


### mapManager

<!-- doctype:start id="161cfccf-2e45-4fba-85fe-225a42e8f407" code_ref="packages/cli/src/commands/check.ts#mapManager" -->
**mapManager** - Documentation needs generation

Current signature:
```typescript
mapManager = new DoctypeMapManager(mapPath)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="161cfccf-2e45-4fba-85fe-225a42e8f407" -->


### result

<!-- doctype:start id="1d0d419c-5f3c-4aff-8f9a-412030c45bad" code_ref="packages/cli/src/commands/check.ts#result" -->
**Purpose:** The 'result' variable holds an object that summarizes the outcome of a check operation, indicating the counts of total, drifted, and missing entries, as well as the success status of the check.

**Returns:** `CheckResult` - An object containing the total number of entries checked, the number of drifted entries, the number of missing entries, arrays of drifted and missing entries, and a success flag.

**Usage Example:**
```typescript
const result: CheckResult = { totalEntries: entries.length, driftedEntries: drifts.length, missingEntries: missingDetails.length, drifts, missing: missingDetails, success: drifts.length === 0 && missingDetails.length === 0 };
```
<!-- doctype:end id="1d0d419c-5f3c-4aff-8f9a-412030c45bad" -->


### drift

<!-- doctype:start id="9fa23357-e6e3-432d-811e-e8b853bd393b" code_ref="packages/cli/src/commands/check.ts#drift" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="9fa23357-e6e3-432d-811e-e8b853bd393b" -->


### drifts

<!-- doctype:start id="fc49cdc2-9223-44d6-970e-a7015344f50c" code_ref="packages/cli/src/commands/check.ts#drifts" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="fc49cdc2-9223-44d6-970e-a7015344f50c" -->


### detectedDrifts

<!-- doctype:start id="2ae8ddcd-9105-4369-ab50-1c670feddd81" code_ref="packages/cli/src/commands/check.ts#detectedDrifts" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="2ae8ddcd-9105-4369-ab50-1c670feddd81" -->


### analyzer

<!-- doctype:start id="2bbe2e02-e521-4a61-b449-504b08c54819" code_ref="packages/cli/src/commands/check.ts#analyzer" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="2bbe2e02-e521-4a61-b449-504b08c54819" -->


### codeRoot

<!-- doctype:start id="06e6ccfe-9be0-4ef2-8861-7197a73f12d8" code_ref="packages/cli/src/commands/check.ts#codeRoot" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="06e6ccfe-9be0-4ef2-8861-7197a73f12d8" -->


### entries

<!-- doctype:start id="c3271a77-c0cb-42eb-9335-edbbe8b4da8b" code_ref="packages/cli/src/commands/check.ts#entries" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="c3271a77-c0cb-42eb-9335-edbbe8b4da8b" -->


### mapManager

<!-- doctype:start id="4cfdbda4-e083-4c7c-9f3e-23c7abdec0d9" code_ref="packages/cli/src/commands/check.ts#mapManager" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="4cfdbda4-e083-4c7c-9f3e-23c7abdec0d9" -->


### mapPath

<!-- doctype:start id="78914c6a-b03a-4a71-8ac4-6aa396e22690" code_ref="packages/cli/src/commands/check.ts#mapPath" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="78914c6a-b03a-4a71-8ac4-6aa396e22690" -->


### config

<!-- doctype:start id="de7976f7-b477-43bd-a6b0-32b48f30061c" code_ref="packages/cli/src/commands/check.ts#config" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="de7976f7-b477-43bd-a6b0-32b48f30061c" -->


### logger

<!-- doctype:start id="f4451f82-5603-4a7d-bbbe-0518a3637c00" code_ref="packages/cli/src/commands/check.ts#logger" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="f4451f82-5603-4a7d-bbbe-0518a3637c00" -->



### checkCommand

<!-- doctype:start id="a7be3032-531c-47e2-9233-504c4e7a8305" code_ref="packages/cli/src/commands/check.ts#checkCommand" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="a7be3032-531c-47e2-9233-504c4e7a8305" -->
