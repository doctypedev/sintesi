<p align="center">
  <img src="assets/full_logo.png" alt="Sintesi Logo" width="500" />
</p>

# Sintesi

[![npm version](https://badge.fury.io/js/@sintesi%2Fsintesi.svg)](https://www.npmjs.com/package/@sintesi/sintesi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The intelligent documentation engine.**

Sintesi guarantees your documentation never drifts from your codebase. It uses **multi-agent AI** to analyze your source code, plan a documentation structure, and write comprehensive, up-to-date docs. No outdated wikis, no "docs rot".

---

## ⚡️ Why Sintesi?

Traditional documentation often becomes outdated. Sintesi keeps your docs fresh and relevant.

-   **🛡️ Drift Protection:** Detects inconsistencies between code and documentation before you merge.
-   **🕵️ Context-Aware:** Reads your actual source code to write specific, accurate documentation.
-   **🤖 Multi-Agent:** Utilizes specialized agents (Planner, Writer, Reviewer, and Researcher) to produce high-quality content.
-   **📦 Monorepo Native:** Designed for complex workspaces from day one, allowing seamless integration in monorepo environments.

## 🚀 Quick Start

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
    ```
    or
    ```bash
    sintesi check --doc
    ```

4. **Force Overwrite**
    If you need to regenerate documentation or README files and want to bypass existing content checks, you can use the `--force` flag:
    ```bash
    sintesi documentation --force
    ```
    or
    ```bash
    sintesi readme --force
    ```
    This will ignore existing files and regenerate them from scratch.

5. **Output Options**
    You can specify custom output paths for the README check and documentation check using the `--output` and `--output-dir` flags, respectively:
    ```bash
    sintesi check --output path/to/README.md
    ```
    ```bash
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

👉 **[Read the Architecture Guide](./docs/architecture.md)**
👉 **[CLI Reference](./docs/reference/commands.md)**

---

## Contributing

We love contributions! Please check out our [Contributing Guide](./docs/community/contributing.md).

## License

MIT © [Doctypedev](https://github.com/doctypedev)

---

### What is Multi-Agent AI?

**Multi-Agent AI** refers to the use of multiple specialized agents that work collaboratively to achieve a common goal. In the context of Sintesi, these agents (Planner, Writer, Reviewer, and Researcher) each have distinct roles that enhance the quality and accuracy of the documentation process. This approach allows for a more nuanced understanding of the codebase, resulting in documentation that is not only comprehensive but also contextually relevant.
