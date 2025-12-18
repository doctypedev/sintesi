---
layout: home

hero:
    name: 'Sintesi'
    text: 'Autonomous Documentation Platform'
    tagline: Keep your documentation in sync with your code using AI agents and RAG.
    actions:
        - theme: brand
          text: Get Started
          link: /guides/getting-started
        - theme: alt
          text: View on GitHub
          link: https://github.com/doctypedev/doctype

features:
    - title: Multi-Agent AI Workflow
      details: Planner, Writer, Reviewer, and Researcher agents collaborate to produce high-quality, up-to-date docs.
      icon: 🤖
    - title: RAG-Powered
      details: Retrieval-Augmented Generation ensures your documentation is semantically accurate and context-aware.
      icon: 🧠
    - title: Monorepo Native
      details: Built for complex workspaces with per-package change tracking and scalable orchestration.
      icon: 🏢
---

## Quick Start

Install the Sintesi CLI (global install recommended for CI or local usage):

```bash
npm install -g @sintesi/sintesi
```

### Core Workflow

```mermaid
graph TD
    A[Code Changes] --> B[Sintesi CLI]
    B --> C[AI Agents]
    C --> D[Updated Docs]
```

### Common Commands

::: code-group

```bash [Generate Docs]
# Generate documentation for the current project
sintesi documentation
```

```bash [Check Drift]
# Verify documentation integrity
sintesi check
```

```bash [Update README]
# Generate a README based on project context
sintesi readme
```

:::

## Primary Use-Cases

- **CLI for automated documentation**: A lightweight, scriptable command-line interface that drives documentation generation, verification, and changeset creation.
- **RAG-enabled doc generation**: AI-assisted generation that reads actual source code, indexes context, and writes up-to-date documentation.
- **Monorepo-aware workflows**: Detects monorepo structure, maps changes to affected packages, and supports per-package updates and changesets.

---

## CLI Reference Summary

| Command         | Description                                           |
| :-------------- | :---------------------------------------------------- |
| `readme`        | Generate a `README.md` based on project context.      |
| `documentation` | Generate comprehensive documentation site structure.  |
| `check`         | Verify documentation is in sync with code.            |
| `changeset`     | Generate a changeset file from code changes using AI. |

> **Note**: The CLI surface is implemented in the `packages/cli` workspace. Commands documented here map to the code paths under `packages/cli`.
