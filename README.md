<p align="center">
  <img src="assets/full_logo.png" alt="Sintesi Logo" width="500" />
</p>

# Sintesi

[![npm version](https://badge.fury.io/js/@sintesi%2Fsintesi.svg)](https://www.npmjs.com/package/@sintesi/sintesi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The intelligent documentation engine.**

Sintesi ensures your documentation remains aligned with your codebase. It leverages **multi-agent AI** and **Retrieval-Augmented Generation (RAG)** to analyze your source code, plan a documentation structure, and produce comprehensive, up-to-date documentation. Say goodbye to outdated wikis and "docs rot."

---

## ⚡️ Why Sintesi?

Traditional documentation often becomes outdated. Sintesi keeps your docs fresh and relevant.

- **🛡️ Drift Protection:** Detects inconsistencies between code and documentation before you merge.
- **🕵️ Context-Aware:** Reads your actual source code to write specific, accurate documentation.
- **🤖 Multi-Agent:** Utilizes specialized agents (Planner, Writer, Reviewer, and Researcher) to produce high-quality content.
- **📦 Monorepo Native:** Designed for complex workspaces from day one, allowing seamless integration in monorepo environments.

## 🚀 Quick Start

You can integrate Sintesi into your CI/CD pipeline or use it locally.

Add a new workflow in `.github/workflows/docs.yml`:

```yaml
name: Sintesi - Documentation AI
on:
    push:
        branches: [main]

concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

permissions:
    contents: write
    pull-requests: write

jobs:
    sync-docs:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Sintesi Check & Fix
              uses: doctypedev/action@v1 # Updated to the latest verified version
              with:
                  openai_api_key: ${{ secrets.OPENAI_API_KEY }}
                  cohere_api_key: ${{ secrets.COHERE_API_KEY }} # Add COHERE_API_KEY for semantic retrieval
                  github_token: ${{ secrets.GITHUB_TOKEN }}
                  targets: 'readme,docs' # Documentation targets to generate (comma-separated). Options: readme, docs
                  docs_output: 'docs' # Optional: Directory for the output documentation - Default: docs
```

1. **Install**

    ```bash
    npm install -g @sintesi/sintesi
    ```

2. **Generate Documentation**
   Don't have documentation? Let Sintesi inspect your code and create a living documentation site.

    ```bash
    sintesi documentation
    ```

    Or just a README:

    ```bash
    sintesi readme
    ```

3. **Verify Integrity**
   Run this in your CI/CD pipeline. If the code changes but the documentation doesn't, this returns exit code 1.

    ```bash
    sintesi check
    ```

    The `check` command performs dual drift detection for both the README and the documentation site. You can use the `--no-strict` flag to allow non-blocking CI usage. You can also run separate checks for the README or documentation site using:

    ```bash
    sintesi check --readme
    sintesi check --doc
    ```

4. **Force Overwrite**
   If you need to regenerate documentation or README files and want to bypass existing content checks, you can use the `--force` flag:

    ```bash
    sintesi documentation --force
    sintesi readme --force
    ```

    This will ignore existing files and regenerate them from scratch.

5. **Output Options**
   You can specify custom output paths for the README check and documentation check using the `--output` and `--output-dir` flags, respectively:

    ```bash
    sintesi check --output path/to/README.md
    sintesi check --output-dir path/to/docs
    ```

## 🧠 How it Works

Sintesi is not just a generator; it is a full **documentation lifecycle manager**.

1. **Analyze:** It scans your project structure and reads key files to understand the "DNA" of your codebase.
2. **Plan:** An AI Architect designs a documentation structure tailored to your project type.
3. **Generate:** Specialized agents (Planner, Writer, Reviewer, and Researcher) write comprehensive documentation, ensuring accuracy by reading actual source code.
4. **Verify:** The `check` command ensures your documentation stays in sync with your latest code changes.

## 📚 Documentation

We believe in eating our own dog food. This repository's documentation is maintained by Sintesi.

👉 **[Read the Architecture Guide](https://sintesicli.dev/architecture/ai-architecture.html)**
👉 **[CLI Reference](https://sintesicli.dev/reference/commands.html)**

---

### What is Multi-Agent AI?

**Multi-Agent AI** refers to the use of multiple specialized agents that work collaboratively to achieve a common goal. In the context of Sintesi, these agents (Planner, Writer, Reviewer, and Researcher) each have distinct roles that enhance the quality and accuracy of the documentation process. This approach allows for a more nuanced understanding of the codebase, resulting in documentation that is not only comprehensive but also contextually relevant.

#### Example of Multi-Agent AI in Action

For instance, while the **Planner** outlines the structure of the documentation, the **Writer** generates the content based on the latest code changes, and the **Reviewer** ensures that the generated content meets quality standards. This collaborative effort results in documentation that is both accurate and informative.

---

## Retrieval-Augmented Generation (RAG)

Sintesi includes a **Retrieval-Augmented Generation (RAG)** pipeline that enhances the documentation generation process. This feature allows for semantic context retrieval, improving the accuracy and relevance of generated documentation.

### Environment Variables

To utilize the RAG feature to its full potential, set the following environment variable:

| Name           | Required? | Purpose                                    |
| -------------- | --------- | ------------------------------------------ |
| COHERE_API_KEY | no        | Enables `reranking` via Cohere Rerank API. |

You should include `COHERE_API_KEY` in your `.env` configuration:

```plaintext
COHERE_API_KEY=your-cohere-api-key-here
```

### Observability Features

Sintesi now includes enhanced observability capabilities. By setting the `HELICONE_API_KEY`, you can track all AI requests in the Helicone dashboard, providing insights into usage and costs. This feature is optional but recommended for better monitoring of AI interactions.

Additionally, logger support has been integrated for AI agents, which enhances the documentation generation process by providing detailed logs of operations and configurations.

---

## Troubleshooting and FAQs

### Common Issues

- **Documentation not updating:** Ensure that your CI/CD pipeline is correctly configured and that the `sintesi check` command is included.
- **API key errors:** Double-check that your API keys are correctly set in your environment variables.

### Frequently Asked Questions

- **Can I use Sintesi with any programming language?**
  Yes, Sintesi is designed to work with various programming languages by analyzing the code structure.

- **How do I contribute to Sintesi?**
  We welcome contributions! Please check out our [Contributing Guide](./docs/community/contributing.md).

---

## License

MIT © [Doctypedev](https://github.com/doctypedev)
