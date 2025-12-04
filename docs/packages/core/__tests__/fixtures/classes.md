# Classes

Auto-generated documentation via Doctype.


## API Reference

### User

<!-- doctype:start id="de8a3c42-39bd-44a3-8d06-73c8a376679e" code_ref="packages/core/__tests__/fixtures/classes.ts#User" -->
TODO: Add documentation for this symbol
<!-- doctype:end id="de8a3c42-39bd-44a3-8d06-73c8a376679e" -->



### Calculator

<!-- doctype:start id="e40b5d65-8f78-4891-8022-67350f3c21f7" code_ref="packages/core/__tests__/fixtures/classes.ts#Calculator" -->
**Purpose:** The `Calculator` class provides basic arithmetic operations such as addition and subtraction, as well as a method to retrieve the current result.  
**Properties:**  
- `result` (number): Holds the current result of calculations.  
**Methods:**  
- `add(value: number): void`  
  - **Parameter:**  
    - `value`: The number to be added to the current result.  
  - **Return Type:** `void`  
- `subtract(value: number): void`  
  - **Parameter:**  
    - `value`: The number to be subtracted from the current result.  
  - **Return Type:** `void`  
- `getResult(): number`  
  - **Return Type:** `number`: Returns the current result value.  
**Usage Example:**  
```typescript  
const calc = new Calculator();  
calc.add(5);  
calc.subtract(2);  
console.log(calc.getResult()); // Outputs: 3  
```
<!-- doctype:end id="e40b5d65-8f78-4891-8022-67350f3c21f7" -->
