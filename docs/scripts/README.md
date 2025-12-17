# Documentation Scripts

This directory contains utility scripts for managing VitePress documentation.

## generateSidebar.ts

Automatically generates a VitePress sidebar configuration by scanning markdown files in the `docs/` directory.

### Features

- **Type-safe**: Written in TypeScript with comprehensive type definitions
- **Automatic sorting**: Supports numerical prefixes (e.g., `01. Introduction.md`)
- **Smart grouping**: Organizes files by directory structure
- **Error handling**: Validates directories and provides helpful error messages
- **Configurable**: Supports custom configuration options

### Usage

```bash
# Generate sidebar configuration
npm run generate:sidebar

# The script runs automatically with docs commands:
npm run docs:dev      # Development server
npm run docs:build    # Production build
npm run docs:preview  # Preview production build
```

### How It Works

1. Scans all `.md` files in the `docs/` directory (excluding `index.md`, `README.md`, `scripts/**`, `.vitepress/**`)
2. Groups files by their parent directory (e.g., `api/`, `cli/`, `guide/`)
3. Sorts items by numerical prefix (if present) or alphabetically within each group
4. Sorts groups alphabetically (with "General" always first)
5. Generates a **unified sidebar** - all sections are visible on every page
6. Creates a TypeScript file at `docs/.vitepress/sidebar-auto.ts` with proper VitePress type annotations
7. The sidebar can be imported in VitePress config: `import { autoSidebar } from './sidebar-auto'`

### File Naming Conventions

- **Numerical prefixes**: Files starting with numbers (e.g., `01.`, `02.`) are sorted numerically
- **Titles**: Filenames are converted to titles (e.g., `getting-started.md` → `getting-started`)
- **Directory names**: Used as group titles (e.g., `guide/` → `Guide`)

### Configuration

The script can be customized by modifying `DEFAULT_CONFIG` in `generateSidebar.ts`:

```typescript
const DEFAULT_CONFIG: SidebarConfig = {
    docsRoot: path.resolve(process.cwd(), 'docs'),
    outputPath: path.resolve(process.cwd(), 'docs/.vitepress/sidebar-auto.ts'),
    ignorePatterns: ['index.md', 'README.md', 'node_modules/**', '.vitepress/**', 'scripts/**'],
    sortByPrefix: true,
};
```

### Output Example

The script generates a **unified sidebar** that displays all sections on every page:

```typescript
import type { DefaultTheme } from 'vitepress';

export const autoSidebar: DefaultTheme.Sidebar = [
    {
        text: 'Api',
        items: [
            { text: 'ast-analyzer', link: '/api/ast-analyzer' },
            { text: 'content-injector', link: '/api/content-injector' },
        ],
        collapsed: false,
    },
    {
        text: 'Cli',
        items: [
            { text: 'check', link: '/cli/check' },
            { text: 'fix', link: '/cli/fix' },
        ],
        collapsed: false,
    },
    {
        text: 'Guide',
        items: [
            { text: 'getting-started', link: '/guide/getting-started' },
            { text: 'core-concepts', link: '/guide/core-concepts' },
        ],
        collapsed: false,
    },
];
```

This creates a sidebar where **all sections are always visible**, regardless of which page you're viewing.
