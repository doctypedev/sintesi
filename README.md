<p align="center">
  <img src="assets/full_logo.png" alt="Sintesi Logo" width="500" />
</p>

# Sintesi

[![npm version](https://badge.fury.io/js/sintesi-monorepo-root.svg)](https://www.npmjs.com/package/sintesi-monorepo-root)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The intelligent documentation engine.**

Sintesi guarantees your documentation never drifts from your codebase. It uses **multi-agent AI** to analyze your source code, plan a documentation structure, and write comprehensive, up-to-date docs. No outdated wikis, no "docs rot".

---

## ⚡️ Why Sintesi?

Traditional docs rot. Sintesi keeps them fresh.

-   **🛡️ Drift Protection:** Detects inconsistencies between code and docs before you merge.
-   **🕵️ Context-Aware:** Reads your actual source code to write specific, accurate documentation.
-   **🤖 Multi-Agent:** Uses specialized agents (Planner, Writer, Reviewer) to produce high-quality content.
-   **📦 Monorepo Native:** Designed for complex workspaces from day one.

## 🚀 Quick Start

1.  **Install**
    ```bash
    npm install -g sintesi-monorepo-root
    ```

2.  **Generate Documentation**
    Don't have docs? Let Sintesi inspect your code and create a living documentation site.
    ```bash
    sintesi documentation
    ```
    Or just a README:
    ```bash
    sintesi readme
    ```

3.  **Verify Integrity**
    Run this in your CI/CD. If the code changed but docs didn't, this returns exit code 1.
    ```bash
    sintesi check
    ```
    The `check` command performs dual drift detection for both the README and the documentation site. 

    - Use the `--no-strict` flag to allow non-blocking CI usage.
    - Run separate checks for the README or documentation site using:
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

## 🧠 How it works

Sintesi is not just a generator; it is a full **documentation lifecycle manager**.

1.  **Analyze:** It scans your project structure and reads key files to understand the "DNA" of your codebase.
2.  **Plan:** An AI Architect designs a documentation structure tailored to your project type. Sintesi auto-detects the application type and entry point as part of its project analysis, thereby tailoring the documentation structure accordingly.
3.  **Generate:** Specialized agents write comprehensive documentation, ensuring accuracy by reading actual source code.
4.  **Verify:** The `check` command ensures your documentation stays in sync with your latest code changes.

## 📚 Documentation

We believe in eating our own dog food. This repository's documentation is maintained by Sintesi.

👉 **[Read the Architecture Guide](./docs/architecture.md)**
👉 **[CLI Reference](./docs/reference/commands.md)**

---

## Troubleshooting

If you encounter issues, consider the following common problems:

- **Installation Issues:** Ensure you have the correct package name (`sintesi-monorepo-root`) and that your Node.js and npm versions are up to date.
- **Drift Detection Failures:** If the `check` command fails, verify that your documentation is up to date with your code changes.
- **Command Not Found:** Ensure that the Sintesi binary is in your PATH after installation.

## Contributing

We love contributions! Please check out our [Contributing Guide](./docs/community/contributing.md).

## License

MIT © [Doctypedev](https://github.com/doctypedev)
