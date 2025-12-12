# CLI Commands Reference for sintesi-monorepo-root

This document provides a comprehensive reference for all available CLI commands in the `sintesi-monorepo-root` project. The commands are designed to facilitate various tasks within the monorepo, enhancing development efficiency and project management.

## Available Commands

### 1. `init`

The `init` command initializes the project environment. It sets up necessary configurations and prepares the workspace for development.

#### Usage
```bash
npm run init
```

#### Description
- Creates a `sintesi.config.json` file with user-provided settings.
- Scans all TypeScript files in the project root.
- Extracts exported symbols and creates documentation anchors in `api.md`.
- Generates `sintesi-map.json` with code signatures and hash tracking.

#### Options
- `--force`: Overwrites existing configurations without prompting.

---

### 2. `check`

The `check` command verifies that documentation is in sync with code by detecting drift.

#### Usage
```bash
npm run check
```

#### Description
- Validates project configurations.
- Checks for missing or incompatible dependencies.
- Reports any issues found in the codebase.

#### Options
- `--verbose`: Provides detailed output of the checks performed.
- `--smart`: Enables high-level drift detection without requiring a map file.
- `--map <path>`: Specifies the path to the map file (overrides the config).

---

### 3. `fix`

The `fix` command is used to automatically correct issues identified in the project documentation.

#### Usage
```bash
npm run fix
```

#### Description
- Fixes documentation drift by updating Markdown files with AI-generated content.
- Prunes missing entries from the documentation if specified.

#### Options
- `--dry-run`: Simulates the fixes without applying them, allowing users to review changes beforehand.
- `--prune`: Removes missing entries from the documentation.

---

### 4. `generate`

The `generate` command creates documentation content using AI.

#### Usage
```bash
npm run generate
```

#### Description
- Generates documentation content based on the current codebase using AI models.
- This command is effectively a semantic alias for the `fix` command but focused on content generation.

#### Options
- `--map <path>`: Specifies the path to the map file (overrides the config).
- `--verbose`: Provides detailed output during the generation process.

---

### 5. `documentation`

The `documentation` command automates the generation of project documentation based on the current codebase.

#### Usage
```bash
npm run documentation
```

#### Description
- Analyzes the project structure and generates documentation files.
- Ensures that documentation is up-to-date with the latest changes in the codebase.

#### Options
- `--output-dir <path>`: Specifies the output directory for the generated documentation.
- `--verbose`: Provides detailed output during the documentation process.

---

### 6. `readme`

The `readme` command generates or updates the README file for the project.

#### Usage
```bash
npm run readme
```

#### Description
- Creates or updates the README file based on the current project state.
- Ensures that all necessary information is included and formatted correctly.

#### Options
- `--overwrite`: Overwrites the existing README file without prompting.

---

## Conclusion

These CLI commands are integral to the development workflow of the `sintesi-monorepo-root` project. By utilizing these commands, developers can streamline their processes, maintain project integrity, and enhance productivity. For further assistance or to report issues, please refer to the project's documentation or contact the development team.
