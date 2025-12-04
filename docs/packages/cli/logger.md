# Logger

Auto-generated documentation via Doctype.


## API Reference

### icon

<!-- doctype:start id="2f553012-4a98-46f0-bccd-5adbe3e59bb0" code_ref="packages/cli/logger.ts#icon" -->
**Purpose:** The `icon` variable generates a representation of a checked or unchecked state using colored symbols.

**Behavior:** If `checked` is true, it displays a green checkmark; if false, it displays a gray circle.

**Parameters:**  
- `checked: boolean` - The state to determine which icon to display.

**Return Type:** `string` - The generated icon string with appropriate color coding.

**Usage Example:**  
```typescript
const checked = true;
const icon = checked ? `${colors.green}✓${colors.reset}` : `${colors.gray}○${colors.reset}`;
console.log(icon); // Outputs: green checkmark or gray circle
```
<!-- doctype:end id="2f553012-4a98-46f0-bccd-5adbe3e59bb0" -->


### padding

<!-- doctype:start id="306ead09-6b7f-4e11-9435-ccac5235ffc4" code_ref="packages/cli/logger.ts#padding" -->
**Purpose:** This constant calculates the needed padding for proper alignment within a defined width based on the length of the provided text.

**Value:**
- `Math.max(0, Math.floor((width - text.length - 2) / 2))`: `number` - Computes padding based on the specified width and the length of the input text, ensuring it is not negative.

**Parameters:**
- `width: number` - The total width available for display.
- `text: string` - The text whose length is to be taken into consideration for padding.

**Return type:** `number` - Represents the calculated padding to be applied on either side of the text.

**Usage example:**
```typescript
const width = 50;
const text = "Hello, World!";
const padding = Math.max(0, Math.floor((width - text.length - 2) / 2));
console.log('Calculated Padding:', padding);
```

**File Location:** `packages/cli/logger.ts`
<!-- doctype:end id="306ead09-6b7f-4e11-9435-ccac5235ffc4" -->


### stripped

<!-- doctype:start id="9791d470-60e3-424d-94b5-7b3721865584" code_ref="packages/cli/logger.ts#stripped" -->
**Purpose:** This constant creates a version of a line without ANSI escape codes, ensuring clean text is displayed.

**Value:**
- `line.replace(/\x1b\[[0-9; ]*m/g, '')`: `string` - Cleans the line of ANSI escape sequences to produce stripped text.

**Return type:** `string`

**Usage example:**
```typescript
const stripped = line.replace(/\x1b\[[0-9; ]*m/g, '');
console.log('Stripped Line:', stripped);
```
<!-- doctype:end id="9791d470-60e3-424d-94b5-7b3721865584" -->


### width

<!-- doctype:start id="c911ea3f-f7ba-44df-b15a-f9be9766cf9b" code_ref="packages/cli/logger.ts#width" -->
**Purpose:** This constant defines a fixed width for display purposes, ensuring that the width remains consistent at 60 units.

**Value:**
- `60`: `number` - A constant value representing the fixed width for display.

**Return type:** `number` - Represents the fixed width for alignment or formatting in the output.

**Usage example:**
```typescript
const width = 60;
console.log('Fixed Width:', width);
```

**File Location:** `packages/cli/logger.ts`
<!-- doctype:end id="c911ea3f-f7ba-44df-b15a-f9be9766cf9b" -->


### maxLength

<!-- doctype:start id="d87683fe-8cae-427d-aef0-0d4116e8e8c7" code_ref="packages/cli/logger.ts#maxLength" -->
**Purpose:** This constant calculates the maximum length of a title and its content, excluding ANSI escape codes.

**Value:**
- `Math.max(title.length, ...content.map(line => line.replace(/\x1b\[[0-9; ]*m/g, '').length))`: `number` - Finds the maximum length between the title and content lengths.

**Return type:** `number`

**Usage example:**
```typescript
const maxLength = Math.max(title.length, ...content.map(line => line.replace(/\x1b\[[0-9; ]*m/g, '').length));
console.log('Max Length:', maxLength);
```
<!-- doctype:end id="d87683fe-8cae-427d-aef0-0d4116e8e8c7" -->


### line

<!-- doctype:start id="12fc608c-5ce1-440c-a824-7a0245897746" code_ref="packages/cli/logger.ts#line" -->
**Purpose:** This constant defines a visual line element, repeated to create a consistent appearance in the output.

**Value:**
- `'═'.repeat(width)`: `string` - Generates a line composed of the repeated '═' character to match the specified width.

**Return type:** `string`

**Usage example:**
```typescript
const line = '═'.repeat(width);
console.log(line);
```
<!-- doctype:end id="12fc608c-5ce1-440c-a824-7a0245897746" -->


### padding

<!-- doctype:start id="44c28b9f-03d4-4bf6-acc8-97f133757d24" code_ref="packages/cli/logger.ts#padding" -->
**Purpose:** This constant calculates the padding required based on the length of the stripped line, ensuring proper alignment within the defined width.

**Value:**
- `width - stripped.length - 1`: `number` - Computes padding based on current width and stripped line length.

**Return type:** `number`

**Usage example:**
```typescript
const padding = width - stripped.length - 1;
console.log('Calculated Padding:', padding);
```
<!-- doctype:end id="44c28b9f-03d4-4bf6-acc8-97f133757d24" -->


### width

<!-- doctype:start id="d8c72e7e-3901-473f-ab21-ed5938eaaf56" code_ref="packages/cli/logger.ts#width" -->
**Purpose:** This constant recalculates the width based on the maximum length of the title and content, ensuring it does not exceed a specified limit.

**Value:**
- `Math.min(maxLength + 4, 70)`: `number` - Adjusts width to be at most 70 units plus additional space.

**Return type:** `number`

**Usage example:**
```typescript
const width = Math.min(maxLength + 4, 70);
console.log('Adjusted Width:', width);
```
<!-- doctype:end id="d8c72e7e-3901-473f-ab21-ed5938eaaf56" -->


### Logger

<!-- doctype:start id="c78f5455-7847-46c6-a407-e35000e9989a" code_ref="packages/cli/logger.ts#Logger" -->
**Purpose:** This class provides methods for logging messages of different severity levels. It supports customizable verbosity.

**Constructor:**
- **verbose**: `boolean` (optional, default: `false`) - If true, enables verbose logging.

**Methods:**
- **error(message: string, ...args: unknown[]): void** - Logs an error message.
- **warn(message: string, ...args: unknown[]): void** - Logs a warning message.
- **info(message: string, ...args: unknown[]): void** - Logs an informational message.
- **success(message: string, ...args: unknown[]): void** - Logs a success message.
- **debug(message: string, ...args: unknown[]): void** - Logs a debug message.
- **log(message: string, ...args: unknown[]): void** - Logs a general message.
- **header(message: string): void** - Logs a header message.
- **divider(): void** - Logs a divider for separation.
- **newline(): void** - Logs a newline character.
- **static color(text: string, color: keyof typeof colors): string** - Returns colored text.
- **static bold(text: string): string** - Returns bolded text.
- **static path(filePath: string): string** - Formats a file path.
- **static symbol(symbolName: string): string** - Formats a symbol.
- **static hash(hash: string, length: number = 8): string** - Shortens a hash string.
- **banner(text: string): void** - Logs a banner.
- **box(title: string, content: string[]): void** - Logs content in a box.
- **step(stepNumber: number, totalSteps: number, title: string, emoji: string = '▶'): void** - Logs the current step in a process.
- **listItem(text: string, checked: boolean = false): void** - Logs a list item.

**Return type:** `Logger`

**Usage example:**
```typescript
const logger = new Logger(true);
logger.info('This is an informational message.');
```
<!-- doctype:end id="c78f5455-7847-46c6-a407-e35000e9989a" -->



### LogLevel

<!-- doctype:start id="cdbd65e5-13d7-479d-bf10-6bc7c8b98e53" code_ref="packages/cli/logger.ts#LogLevel" -->
**Purpose:** This enum defines various logging levels that can be used by the Logger class.

**Values:**
- **ERROR**: `'error'` - Indicates an error has occurred.
- **WARN**: `'warn'` - Indicates a warning that does not prevent execution.
- **INFO**: `'info'` - General informational messages.
- **SUCCESS**: `'success'` - Indicates successful operations.
- **DEBUG**: `'debug'` - Detailed information for debugging purposes.

**Return type:** `LogLevel`

**Usage example:**
```typescript
const logLevel: LogLevel = LogLevel.INFO;
```
<!-- doctype:end id="cdbd65e5-13d7-479d-bf10-6bc7c8b98e53" -->
