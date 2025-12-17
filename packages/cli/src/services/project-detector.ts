

import { ProjectContext } from '@sintesi/core';
import { ProjectConfig, TechStack } from './generation-context';
import { relative, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

export class ProjectDetector {
    constructor(private cwd: string) { }

    /**
     * Detects Project configuration (binary name, package name, entry point, app type).
     */
    detectProjectConfig(context: ProjectContext): ProjectConfig {
        let binName = '';
        let packageName = context.packageJson?.name || '';
        let relevantCommands: string[] = [];
        let appType: ProjectConfig['appType'] = 'unknown';

        // 1. Detect Commands (CLI specific)
        const commandFiles = context.files.filter(f => {
            const relativePath = relative(this.cwd, f.path);
            return (
                relativePath.includes('commands/') ||
                relativePath.includes('cli/') ||
                (relativePath.includes('bin/') && !relativePath.includes('node_modules'))
            );
        });

        // Extract command names from file paths (e.g. src/commands/foo.ts -> foo)
        relevantCommands = commandFiles
            // eslint-disable-next-line
            .filter(f => f.path.match(/[\/\\]commands[\/\\][a-zA-Z0-9-]+\.ts$/))
            .map(f => {
                const parts = f.path.split(/[\\/]/);
                return parts[parts.length - 1].replace(/\.ts$/, '');
            })
            .filter(name => !['index', 'main', 'types', 'cli'].includes(name));

        if (relevantCommands.length > 0) {
            appType = 'cli';
        }

        // 2. Detect Monorepo / Binary Name
        const pkg = context.packageJson as any;
        const isMonorepo = pkg?.private === true || !!pkg?.workspaces;

        // --- NEW: Detect AppType from Dependencies (Reduce fragility) ---
        if (pkg && (pkg.dependencies || pkg.devDependencies)) {
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            const depNames = Object.keys(allDeps);

            if (depNames.some(d => d.includes('react') || d.includes('vue') || d.includes('nuxt') || d.includes('next'))) {
                appType = 'web';
            } else if (depNames.some(d => d.includes('@angular/core') || d.includes('svelte'))) {
                appType = 'web';
            } else if (depNames.some(d => d.includes('nestjs') || d.includes('fastify') || d.includes('express'))) {
                appType = 'backend';
            } else if (depNames.some(d => d.includes('yargs') || d.includes('commander') || d.includes('cac') || d.includes('oclif'))) {
                appType = 'cli';
            }
        }

        if (isMonorepo) {
            const subPackageFiles = context.files.filter(f => f.path.endsWith('package.json') && f.path !== 'package.json');
            for (const pkgFile of subPackageFiles) {
                try {
                    const pkgContent = JSON.parse(readFileSync(resolve(this.cwd, pkgFile.path), 'utf-8'));
                    if (pkgContent.bin && pkgContent.name) {
                        // Prioritize packages in "cli" folder
                        // to avoid sticking with "monorepo-root" or secondary tools.
                        const isCliFolder = pkgFile.path.includes('/cli/') || pkgFile.path.includes('\\cli\\');

                        // Prefer "cli" packages over generic ones
                        if (!binName || isCliFolder || pkgContent.name.includes('cli')) {
                            packageName = pkgContent.name;
                            if (typeof pkgContent.bin === 'string') {
                                const pName = pkgContent.name;
                                binName = pName.startsWith('@') ? pName.split('/')[1] : pName;
                            } else if (typeof pkgContent.bin === 'object') {
                                binName = Object.keys(pkgContent.bin)[0];
                            }
                            appType = 'cli';
                        }
                    }
                } catch (e) { /* ignore */ }
            }
        }

        // Fallback if no binary found in monorepo, or it's a single repo
        // Only mark as CLI if we have a bin AND appType wasn't forcefully set to web/backend (mixed projects?)
        if (!binName && pkg?.bin) {
            if (typeof pkg.bin === 'string') {
                const pkgName = pkg.name || '';
                binName = pkgName.startsWith('@') ? pkgName.split('/')[1] : pkgName;
            } else if (typeof pkg.bin === 'object') {
                binName = Object.keys(pkg.bin)[0];
            }
            if (appType === 'unknown') appType = 'cli';
        }

        // 3. Detect Entry Point (Generic)
        let entryPoint: string | undefined;

        // Candidate patterns in priority order
        const entryCandidates = [
            // CLI
            'src/index.ts', 'src/cli.ts', 'src/main.ts',
            // Top Level
            'index.ts', 'cli.ts', 'main.ts',
            // Web / Frameworks
            'src/App.tsx', 'src/App.js',
            'src/app/page.tsx', 'src/app/page.js', // Next.js App Router
            'pages/index.tsx', 'pages/index.js',   // Next.js Pages Router
            'src/main.tsx', // Vite + React/Vue
            'src/main.ts'   // Angular / NestJS
        ];

        for (const candidate of entryCandidates) {
            const candidatePath = resolve(this.cwd, candidate);
            if (existsSync(candidatePath)) {
                if ((appType === 'web' || appType === 'backend') && !entryPoint) {
                    entryPoint = candidatePath;
                    break;
                }

                try {
                    // Only read if we don't have an AppType OR if we want to confirm CLI specific traits
                    if (appType === 'unknown' || appType === 'cli') {
                        const content = readFileSync(candidatePath, 'utf-8');

                        // Refine AppType if unknown
                        if (appType === 'unknown') {
                            if (content.includes('yargs') || content.includes('commander') || content.includes('cac')) {
                                appType = 'cli';
                                entryPoint = candidatePath;
                                break;
                            }
                            if (content.includes('react') || content.includes('vue') || content.includes('@angular')) {
                                appType = 'web';
                                entryPoint = candidatePath;
                                break;
                            }
                            if (content.includes('express') || content.includes('fastify') || content.includes('nestjs')) {
                                appType = 'backend';
                                entryPoint = candidatePath;
                                break;
                            }
                        } else if (appType === 'cli') {
                            if (content.includes('yargs') || content.includes('commander') || content.includes('cac') || candidatePath.endsWith('cli.ts')) {
                                entryPoint = candidatePath;
                                break;
                            }
                        }
                    }

                    if (!entryPoint) {
                        entryPoint = candidatePath;
                    }

                } catch (e) { /* ignore */ }
            }
        }

        // Final fallback for libraries
        if (appType === 'unknown' && !entryPoint && pkg.main) {
            entryPoint = resolve(this.cwd, pkg.main);
            appType = 'library';
        }

        return { binName, packageName, relevantCommands, entryPoint, appType };
    }

    /**
     * Analyze package.json to detect the technology stack.
     */
    detectTechStack(context: ProjectContext): TechStack {
        const stack: TechStack = {
            frameworks: [],
            languages: [],
            libraries: [],
            infrastructure: []
        };

        const pkg = context.packageJson;
        if (!pkg) return stack;

        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...(pkg as any).peerDependencies
        };
        const depNames = Object.keys(allDeps);

        // Languages
        if (depNames.some(d => d.includes('typescript'))) stack.languages.push('TypeScript');
        if (depNames.some(d => d.includes('@types/node'))) stack.languages.push('Node.js');

        // Frameworks
        if (depNames.includes('react')) stack.frameworks.push('React');
        if (depNames.includes('vue')) stack.frameworks.push('Vue');
        if (depNames.includes('next')) stack.frameworks.push('Next.js');
        if (depNames.includes('nuxt')) stack.frameworks.push('Nuxt');
        if (depNames.includes('@angular/core')) stack.frameworks.push('Angular');
        if (depNames.includes('svelte')) stack.frameworks.push('Svelte');
        if (depNames.includes('express')) stack.frameworks.push('Express');
        if (depNames.includes('fastify')) stack.frameworks.push('Fastify');
        if (depNames.includes('@nestjs/core')) stack.frameworks.push('NestJS');

        // Libraries
        if (depNames.some(d => d.includes('tailwind'))) stack.libraries.push('TailwindCSS');
        if (depNames.includes('zod')) stack.libraries.push('Zod');
        if (depNames.includes('prisma')) stack.libraries.push('Prisma');
        if (depNames.includes('mongoose')) stack.libraries.push('Mongoose');
        if (depNames.includes('redux') || depNames.includes('@reduxjs/toolkit')) stack.libraries.push('Redux');
        if (depNames.includes('zustand')) stack.libraries.push('Zustand');
        if (depNames.includes('vitest') || depNames.includes('jest')) stack.libraries.push('Testing (Vitest/Jest)');

        // Infrastructure / Tools
        if (depNames.includes('vercel')) stack.infrastructure.push('Vercel');
        if (depNames.includes('vite')) stack.infrastructure.push('Vite');
        if (depNames.includes('webpack')) stack.infrastructure.push('Webpack');
        if (depNames.includes('turbo')) stack.infrastructure.push('Turborepo');

        return stack;
    }
}
