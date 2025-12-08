# Fix

Auto-generated documentation via Doctype.


## API Reference

### result

<!-- doctype:start id="9aeac1c5-9d3d-4817-b92b-2085178a530e" code_ref="packages/cli/src/commands/fix.ts#result" -->
**result** - Documentation needs generation

Current signature:
```typescript
result = injector.removeAnchor(docFilePath,  m.entry.id,  true)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="9aeac1c5-9d3d-4817-b92b-2085178a530e" -->


### docFilePath

<!-- doctype:start id="3ba3c7e9-385e-41c6-aac3-b9453eb372bb" code_ref="packages/cli/src/commands/fix.ts#docFilePath" -->
**docFilePath** - Documentation needs generation

Current signature:
```typescript
docFilePath = resolve(config?.baseDir || process.cwd(),  m.entry.docRef.filePath)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="3ba3c7e9-385e-41c6-aac3-b9453eb372bb" -->


### m

<!-- doctype:start id="16373193-a861-40a5-a622-84fca443be46" code_ref="packages/cli/src/commands/fix.ts#m" -->
**m** - Documentation needs generation

Current signature:
```typescript
m
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="16373193-a861-40a5-a622-84fca443be46" -->


### prunedCount

<!-- doctype:start id="c8f81426-6339-487e-8178-89ce9cdaa877" code_ref="packages/cli/src/commands/fix.ts#prunedCount" -->
**prunedCount** - Documentation needs generation

Current signature:
```typescript
prunedCount = 0
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="c8f81426-6339-487e-8178-89ce9cdaa877" -->


### injector

<!-- doctype:start id="f12267a3-ce67-40ad-9609-59f22e84d3cb" code_ref="packages/cli/src/commands/fix.ts#injector" -->
**injector** - Documentation needs generation

Current signature:
```typescript
injector = new ContentInjector()
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="f12267a3-ce67-40ad-9609-59f22e84d3cb" -->


### newEntry

<!-- doctype:start id="08d23d35-c3c2-40b9-92a0-b21a76c92173" code_ref="packages/cli/src/commands/fix.ts#newEntry" -->
**newEntry** - Documentation needs generation

Current signature:
```typescript
newEntry ={id: uuidv4(),  codeRef:{filePath: symbol.filePath,  symbolName: symbol.symbolName},  codeSignatureHash: symbol.signature.hash!,  codeSignatureText: symbol.signature.signatureText,  docRef:{filePath: targetDocFile},  lastUpdated: Date.now()}
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="08d23d35-c3c2-40b9-92a0-b21a76c92173" -->


### targetDocFile

<!-- doctype:start id="59e97954-b613-4a0a-8cf4-74373f84e2bd" code_ref="packages/cli/src/commands/fix.ts#targetDocFile" -->
**targetDocFile** - Documentation needs generation

Current signature:
```typescript
targetDocFile = determineOutputFile(config.outputStrategy || 'mirror',  config.docsFolder,  symbol.filePath,  symbol.signature.symbolType)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="59e97954-b613-4a0a-8cf4-74373f84e2bd" -->


### symbol

<!-- doctype:start id="0d29f8c6-f5e1-44b7-bcd2-15127e58e94f" code_ref="packages/cli/src/commands/fix.ts#symbol" -->
**symbol** - Documentation needs generation

Current signature:
```typescript
symbol
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="0d29f8c6-f5e1-44b7-bcd2-15127e58e94f" -->


### analyzer

<!-- doctype:start id="ac0fe79a-d338-4dc5-88ed-a5564031081c" code_ref="packages/cli/src/commands/fix.ts#analyzer" -->
**analyzer** - Documentation needs generation

Current signature:
```typescript
analyzer = new AstAnalyzer()
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="ac0fe79a-d338-4dc5-88ed-a5564031081c" -->


### mapManager

<!-- doctype:start id="cd3d6e50-ea36-43cb-8b6b-a4a53a47690c" code_ref="packages/cli/src/commands/fix.ts#mapManager" -->
**mapManager** - Documentation needs generation

Current signature:
```typescript
mapManager = new DoctypeMapManager(mapPath)
```

*This content is a placeholder. Run 'doctype generate' with a valid AI API key to generate full documentation.*
<!-- doctype:end id="cd3d6e50-ea36-43cb-8b6b-a4a53a47690c" -->


### detectedDrifts

<!-- doctype:start id="559df450-ff6c-40aa-aa0b-4bfc93f51ce8" code_ref="packages/cli/src/commands/fix.ts#detectedDrifts" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="559df450-ff6c-40aa-aa0b-4bfc93f51ce8" -->


### analyzer

<!-- doctype:start id="2c291fc6-1083-4d28-ace6-9377b8dd92bc" code_ref="packages/cli/src/commands/fix.ts#analyzer" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="2c291fc6-1083-4d28-ace6-9377b8dd92bc" -->


### codeRoot

<!-- doctype:start id="9df61279-3a02-4adf-86be-9b027697e81d" code_ref="packages/cli/src/commands/fix.ts#codeRoot" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="9df61279-3a02-4adf-86be-9b027697e81d" -->


### entries

<!-- doctype:start id="831336f9-c45f-452e-a13a-0f9abeaeae12" code_ref="packages/cli/src/commands/fix.ts#entries" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="831336f9-c45f-452e-a13a-0f9abeaeae12" -->


### mapManager

<!-- doctype:start id="9121a19e-877c-41ec-8425-2a822196cee2" code_ref="packages/cli/src/commands/fix.ts#mapManager" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="9121a19e-877c-41ec-8425-2a822196cee2" -->


### mapPath

<!-- doctype:start id="e188eabe-f552-4d47-9dc1-282facdcfa5b" code_ref="packages/cli/src/commands/fix.ts#mapPath" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="e188eabe-f552-4d47-9dc1-282facdcfa5b" -->


### config

<!-- doctype:start id="1cbd8007-0ea2-41a7-a168-62b6ec683df3" code_ref="packages/cli/src/commands/fix.ts#config" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="1cbd8007-0ea2-41a7-a168-62b6ec683df3" -->


### logger

<!-- doctype:start id="5ac6bbdd-1a3b-4733-ae25-6188dc80790a" code_ref="packages/cli/src/commands/fix.ts#logger" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="5ac6bbdd-1a3b-4733-ae25-6188dc80790a" -->



### fixCommand

<!-- doctype:start id="12740cba-9c67-4f83-889a-bc5a8ed12330" code_ref="packages/cli/src/commands/fix.ts#fixCommand" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="12740cba-9c67-4f83-889a-bc5a8ed12330" -->
