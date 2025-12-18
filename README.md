<p align="center">
  <img src="assets/full_logo.png" alt="Sintesi Logo" width="500" />
</p>

# Sintesi

[![npm version](https://badge.fury.io/js/sintesi-monorepo-root.svg)](https://www.npmjs.com/package/sintesi-monorepo-root)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The intelligent documentation engine.**

Sintesi ensures your documentation remains aligned with your codebase. It leverages **Multi-Agent AI** and **Retrieval-Augmented Generation (RAG)** to analyze your source code, plan a documentation structure, and produce comprehensive, up-to-date documentation. Say goodbye to outdated wikis and "docs rot."

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

            - name: Cache Sintesi RAG State
              if: steps.check_skip.outputs.should_skip != 'true'
              uses: actions/cache@v4
              with:
                  path: .sintesi
                  key: sintesi-rag-${{ runner.os }}-${{ github.sha }}
                  restore-keys: |
                      sintesi-rag-${{ runner.os }}-

            - name: Sintesi Check & Fix
              uses: doctypedev/action@v0
              with:
                  openai_api_key: ${{ secrets.OPENAI_API_KEY }}
                  cohere_api_key: ${{ secrets.COHERE_API_KEY }} # Add COHERE_API_KEY for semantic retrieval
                  github_token: ${{ secrets.GITHUB_TOKEN }}
                  targets: 'readme,docs' # Documentation targets to generate (comma-separated). Options: readme, docs
                  docs_output: 'docs' # Optional: Directory for the output documentation - Default: docs
```

1.  **Install**

    ```bash
    npm install -g sintesi-monorepo-root
    ```

2.  **Generate Documentation**
    Don't have documentation? Let Sintesi inspect your code and create a living documentation site.

    ```bash
    sintesi documentation
    ```

    Or just a README:

    ```bash
    sintesi readme
    ```

3.  **Verify Integrity**
    Run this in your CI/CD pipeline. If the code changes but the documentation doesn't, this returns exit code 1.

    ```bash
    sintesi check
    ```

    The `check` command performs dual drift detection for both the README and the documentation site. You can use the `--no-strict` flag to allow non-blocking CI usage. You can also run separate checks for the README or documentation site using:

    ```bash
    sintesi check --readme
    sintesi check --doc
    ```

4.  **Force Overwrite**
    If you need to regenerate documentation or README files and want to bypass existing content checks, you can use the `--force` flag:

    ```bash
    sintesi documentation --force
    sintesi readme --force
    ```

    This will ignore existing files and regenerate them from scratch.

5.  **Output Options**
    You can specify custom output paths for the README check and documentation check using the `--output` and `--output-dir` flags, respectively:
    ```bash
    sintesi check --output path/to/README.md
    sintesi check --output-dir path/to/docs
    ```

## 🧠 How it Works

Sintesi is not just a generator; it is a full **documentation lifecycle manager**.

1.  **Analyze:** It scans your project structure and reads key files to understand the "DNA" of your codebase.
2.  **Plan:** An AI Architect designs a documentation structure tailored to your project type.
3.  **Generate:** Specialized agents (Planner, Writer, Reviewer, and Researcher) write comprehensive documentation, ensuring accuracy by reading actual source code.
4.  **Verify:** The `check` command ensures your documentation stays in sync with your latest code changes.

## 📚 Documentation

We believe in eating our own dog food. This repository's documentation is maintained by Sintesi.

👉 **[Read the Architecture Guide](https://sintesicli.dev/architecture/ai-architecture.html)**
👉 **[CLI Reference](https://sintesicli.dev/reference/commands.html)**

---

### What is Multi-Agent AI?

**Multi-Agent AI** refers to the use of multiple specialized agents that work collaboratively to achieve a common goal. In the context of Sintesi, these agents (Planner, Writer, Reviewer, and Researcher) each have distinct roles that enhance the quality and accuracy of the documentation process. This approach allows for a more nuanced understanding of the codebase, resulting in documentation that is not only comprehensive but also contextually relevant.

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

---

## Troubleshooting & FAQs

### Common Issues

1. **Installation Errors**: Ensure you have the correct package name `sintesi-monorepo-root` and that your Node.js version is compatible.
2. **Documentation Not Updating**: Check if the `sintesi check` command is included in your CI/CD pipeline and that it runs successfully.
3. **API Key Issues**: Verify that your API keys are correctly set in your environment variables.

### Frequently Asked Questions

- **What is the purpose of the Multi-Agent AI?**
  Multi-Agent AI enhances the documentation process by utilizing specialized agents for different tasks, ensuring high-quality and contextually relevant documentation.

- **How does RAG improve documentation?**
  RAG allows Sintesi to retrieve semantic context, making the generated documentation more accurate and relevant to the codebase.

---

## Contributing

We love contributions! Please check out our [Contributing Guide](./docs/community/contributing.md).

---

## License

MIT © [Doctypedev](https://github.com/doctypedev)
