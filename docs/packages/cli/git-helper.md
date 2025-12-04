# Git-helper

Auto-generated documentation via Doctype.


## API Reference

### pushResult

<!-- doctype:start id="a075ba84-c327-4692-bb67-63cb3738cd2d" code_ref="packages/cli/git-helper.ts#pushResult" -->
Calls the push method to upload committed changes to the remote repository.

**Parameters:**  
- None

**Return type:**  
- `boolean`: Indicates whether the push operation was successful.

**Usage example:**  
```typescript
const pushResult = this.push();
console.log(pushResult);
```
<!-- doctype:end id="a075ba84-c327-4692-bb67-63cb3738cd2d" -->


### commitResult

<!-- doctype:start id="191217f6-ec69-4d48-974e-f54aada1ffd9" code_ref="packages/cli/git-helper.ts#commitResult" -->
Invokes the commit method with the specified commit message to finalize changes.

**Parameters:**  
- `commitMessage` (string): The message that describes the changes being committed.

**Return type:**  
- `boolean`: Indicates whether the commit operation was successful.

**Usage example:**  
```typescript
const commitMessage = 'Initial commit';  
const commitResult = this.commit(commitMessage);
console.log(commitResult);
```
<!-- doctype:end id="191217f6-ec69-4d48-974e-f54aada1ffd9" -->


### commitMessage

<!-- doctype:start id="0eb8a54b-08a2-4509-9a60-5cdb8bbffdf4" code_ref="packages/cli/git-helper.ts#commitMessage" -->
Creates a formatted commit message based on the provided symbol names.

**Parameters:**  
- `symbolNames` (Array<string>): An array of symbol names for which to create the commit message.

**Return type:**  
- `string`: The generated commit message.

**Usage example:**  
```typescript
const symbolNames = ['symbol1', 'symbol2'];  
const commitMessage = this.createCommitMessage(symbolNames);
console.log(commitMessage);
```
<!-- doctype:end id="0eb8a54b-08a2-4509-9a60-5cdb8bbffdf4" -->


### addResult

<!-- doctype:start id="822710b1-0a97-46aa-b75a-ef54d6b6bb03" code_ref="packages/cli/git-helper.ts#addResult" -->
Calls the method to add specified files to the internal state of the application.

**Parameters:**  
- `files` (Array<string>): An array of file paths to be added.

**Return type:**  
- `boolean`: Indicates whether files were successfully added.

**Usage example:**  
```typescript
const files = ['file1.js', 'file2.js'];  
const addResult = this.addFiles(files);
console.log(addResult);
```
<!-- doctype:end id="822710b1-0a97-46aa-b75a-ef54d6b6bb03" -->


### output

<!-- doctype:start id="ee74ce06-6c73-4eba-bc38-30ede5e5ab3f" code_ref="packages/cli/git-helper.ts#output" -->
**Purpose:** Captures the output of the `git status --porcelain` command in a specified encoding format.

**Previous Command:** `git push`

**New Command:** `git status --porcelain`

**Type:** `string`

**Parameters:**
- `command: string` - The shell command to be executed. In this case, it is 'git status --porcelain'.
- `options: { encoding: 'utf-8' }` - An object specifying options for the command execution. The `encoding` parameter determines the character encoding of the returned output.

**Return Type:** `string`  
Represents the output of the `git status --porcelain` command, which provides a concise, machine-readable representation of the working tree status.

**Usage Example:**
```typescript
const output = execSync('git status --porcelain', { encoding: 'utf-8' });
console.log(output);  // Displays the current status of the working directory in a formatted manner.
```

**File Location:**  
`packages/cli/git-helper.ts`
<!-- doctype:end id="ee74ce06-6c73-4eba-bc38-30ede5e5ab3f" -->


### output

<!-- doctype:start id="66300b1e-4660-45bd-b94c-c51c7e1b6153" code_ref="packages/cli/git-helper.ts#output" -->
**Purpose:** Captures the output of the `git status --porcelain` command, which provides a concise summary of changes in the working directory and staging area, in a specified encoding.

**Type:** `string`

**Parameters:**
- **command** (`string`): The command to be executed, in this case, `'git status --porcelain'`.
- **options** (`{ encoding: 'utf-8' }`): An object containing options for the command execution, with `encoding` specifying the desired output encoding.

**Return Type:** `string`  
Represents the output of the `git status --porcelain` command, which lists modified, added, or deleted files in a simplified format.

**Usage Example:**
```typescript
const output = execSync('git status --porcelain', { encoding: 'utf-8' });
console.log(output);  // Displays the concise status of staged and unstaged changes.
```

**File Location**  
`packages/cli/git-helper.ts`
<!-- doctype:end id="66300b1e-4660-45bd-b94c-c51c7e1b6153" -->


### escapedMessage

<!-- doctype:start id="4bdefd59-3eb1-4b19-85d4-44d57b5af881" code_ref="packages/cli/git-helper.ts#escapedMessage" -->
Escapes double quotes in a given message to prepare it for inclusion in a Git commit message.

**Parameters:**  
- `message` (string): The original message containing possible double quotes.

**Return type:**  
- `string`: The escaped message with double quotes replaced by escaped versions.

**Usage example:**  
```typescript
const message = 'Commit "fix" for issue';  
const escapedMessage = message.replace(/"/g, '\"');
console.log(escapedMessage);
```
<!-- doctype:end id="4bdefd59-3eb1-4b19-85d4-44d57b5af881" -->


### output

<!-- doctype:start id="38eff555-7374-41c8-8fe1-c3ffc35ba1f3" code_ref="packages/cli/git-helper.ts#output" -->
**Purpose:** Captures the output of the `git status --porcelain` command in a specified encoding.

**Type:** `string`

**Parameters:**
- `command` (string): The command to execute, in this case, `git status --porcelain`.
- `options` (Object): Options for the command execution.
  - `encoding` (string): The character encoding to use for the output. Set to `'utf-8'`.

**Return Type:** `string`  
Represents the formatted output of the `git status --porcelain` command, reflecting the state of the working directory and staging area.

**Usage Example:**
```typescript
const output = execSync('git status --porcelain', {encoding: 'utf-8'});
console.log(output);  // Displays the git status in a concise format indicating changes.
```

**File Location:**  
`packages/cli/git-helper.ts`
<!-- doctype:end id="38eff555-7374-41c8-8fe1-c3ffc35ba1f3" -->


### filesArg

<!-- doctype:start id="ae407baf-3825-4baf-a74f-4ca847995ccd" code_ref="packages/cli/git-helper.ts#filesArg" -->
**Purpose:** Constructs a string of quoted file names separated by spaces for command-line operations.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
console.log(`Files to commit: ${filesArg}`);
```
<!-- doctype:end id="ae407baf-3825-4baf-a74f-4ca847995ccd" -->


### status

<!-- doctype:start id="10dba15b-f575-4b29-af07-b288a74ac8ae" code_ref="packages/cli/git-helper.ts#status" -->
**Purpose:** Stores the current Git status by calling the `getStatus()` method on the instance.

**Return Type:** `GitOperationResult`

**Usage Example:**
```typescript
const currentStatus: GitOperationResult = this.getStatus();
if (!currentStatus.success) {
    console.error(currentStatus.error);
}
```
<!-- doctype:end id="10dba15b-f575-4b29-af07-b288a74ac8ae" -->


### output

<!-- doctype:start id="36bfed33-72ae-497b-9da5-3d9fca5f61fc" code_ref="packages/cli/git-helper.ts#output" -->
**Purpose:** Captures the output of the `git status --porcelain` command in a specified encoding.

**Type:** `string`

**Return Type:** `string`

**Usage Example:**
```typescript
console.log(output);  // Displays the git status in a formatted manner.
```
<!-- doctype:end id="36bfed33-72ae-497b-9da5-3d9fca5f61fc" -->


### GitHelper

<!-- doctype:start id="7ced5f2e-0cd2-4a48-bd8a-ef09ee35804f" code_ref="packages/cli/git-helper.ts#GitHelper" -->
**Purpose:** A class that aids in performing Git operations and handling status and logging.

**Constructor Parameters:**
- `logger: Logger` - An instance of a logger for logging purposes.

**Methods:**
- `isGitRepository(): boolean` - Checks if the current directory is a Git repository.
- `getStatus(): GitOperationResult` - Gets the status of the current Git workspace.
- `hasUncommittedChanges(): boolean` - Checks for uncommitted changes in the workspace.
- `addFiles(files: string[]): GitOperationResult` - Adds specified files to staging.
- `commit(message: string): GitOperationResult` - Commits staged changes with the provided message.
- `push(): GitOperationResult` - Pushes commits to the remote repository.
- `autoCommit(files: string[], symbolNames: string[], push: boolean = false): GitOperationResult` - Adds files, commits them, and optionally pushes.

**Return Type:** `void`

**Usage Example:**
```typescript
const gitHelper = new GitHelper(logger);
gitHelper.addFiles(['file1.txt', 'file2.txt']);
```
<!-- doctype:end id="7ced5f2e-0cd2-4a48-bd8a-ef09ee35804f" -->



### GitOperationResult

<!-- doctype:start id="8b576549-c59d-4a64-8a34-ffd5a1f1c5b4" code_ref="packages/cli/git-helper.ts#GitOperationResult" -->
**Purpose:** Represents the result of a Git operation, including success status and optional output or error messages.

**Properties:**
- `success: boolean` - Indicates if the operation was successful.
- `output?: string` - Optional output from the Git operation.
- `error?: string` - Optional error message if the operation failed.

**Return Type:** `GitOperationResult`

**Usage Example:**
```typescript
const result: GitOperationResult = gitHelper.getStatus();
if (result.success) {
    console.log(result.output);
}
```
<!-- doctype:end id="8b576549-c59d-4a64-8a34-ffd5a1f1c5b4" -->
