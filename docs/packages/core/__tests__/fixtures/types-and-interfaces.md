# Types-and-interfaces

Auto-generated documentation via Doctype.


## API Reference

### DEFAULT_TIMEOUT

<!-- doctype:start id="b95e4d50-102e-411f-839f-65b0275d7525" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#DEFAULT_TIMEOUT" -->
**Purpose:** A constant defining the default timeout duration for API requests.

**Type:** `number`
- `DEFAULT_TIMEOUT`: The default timeout duration is set to 5000 milliseconds.

**Usage Example:**
```typescript
const options = {timeout: DEFAULT_TIMEOUT};
```
<!-- doctype:end id="b95e4d50-102e-411f-839f-65b0275d7525" -->


### API_URL

<!-- doctype:start id="e984b306-9744-49bb-b29d-aa7959dfb425" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#API_URL" -->
**Purpose:** A constant holding the base URL for API calls.

**Type:** `string`
- `API_URL`: The base URL is 'https://'.

**Usage Example:**
```typescript
fetch(API_URL + '/endpoint');
```
<!-- doctype:end id="e984b306-9744-49bb-b29d-aa7959dfb425" -->


### Priority

<!-- doctype:start id="771cdaf7-e1b1-4212-9622-3e68de3cb749" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#Priority" -->
**Purpose:** An enumeration representing the priority levels of a task.

**Values:**
- `LOW`: Indicates low priority (1).
- `MEDIUM`: Indicates medium priority (2).
- `HIGH`: Indicates high priority (3).

**Usage Example:**
```typescript
const taskPriority: Priority = Priority.HIGH;
```
<!-- doctype:end id="771cdaf7-e1b1-4212-9622-3e68de3cb749" -->


### Status

<!-- doctype:start id="2f676fde-6926-4af8-bc69-4bcec3fd08a2" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#Status" -->
**Purpose:** An enumeration representing the different statuses of an entity.

**Values:**
- `PENDING`: Indicates that the entity is pending.
- `ACTIVE`: Indicates that the entity is currently active.
- `INACTIVE`: Indicates that the entity is inactive.

**Usage Example:**
```typescript
const currentStatus: Status = Status.ACTIVE;
```
<!-- doctype:end id="2f676fde-6926-4af8-bc69-4bcec3fd08a2" -->


### Point

<!-- doctype:start id="9423c6fa-4a07-4592-a821-53f47d4f882c" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#Point" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="9423c6fa-4a07-4592-a821-53f47d4f882c" -->


### StringOrNumber

<!-- doctype:start id="b6b2175d-7a9b-4eb9-8269-326dcab78d16" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#StringOrNumber" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="b6b2175d-7a9b-4eb9-8269-326dcab78d16" -->


### ApiResponse

<!-- doctype:start id="b2682059-57ba-429e-a15c-6eb2bb6a94ad" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#ApiResponse" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="b2682059-57ba-429e-a15c-6eb2bb6a94ad" -->



### UserProfile

<!-- doctype:start id="d7b5ec54-4a23-43bb-9b72-da16bf351b74" code_ref="packages/core/__tests__/fixtures/types-and-interfaces.ts#UserProfile" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="d7b5ec54-4a23-43bb-9b72-da16bf351b74" -->
