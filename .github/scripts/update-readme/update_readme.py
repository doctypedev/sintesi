import os
import subprocess
from openai import OpenAI

# Configuration
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
README_PATH = "README.md"

def get_git_diff():
    """
    Retrieves the diff of the last commit, including file changes and modifications.
    Returns the diff as a string.
    """
    try:
        result = subprocess.run(
            ["git", "show", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error retrieving git diff: {e}")
        return ""

def get_commit_log():
    """
    Retrieves the last 5 commit messages for context.
    Returns the log as a string.
    """
    try:
        result = subprocess.run(
            ["git", "log", "-5", "--oneline"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error retrieving commit log: {e}")
        return ""

def get_repo_context():
    """
    Reads the current README content.
    Returns the content as a string, or empty string if file doesn't exist.
    """
    if os.path.exists(README_PATH):
        with open(README_PATH, "r") as f:
            return f.read()
    return ""

def generate_updated_readme(current_content, git_diff, commit_log):
    """
    Generates an updated README based on the latest git changes.
    Uses GPT-4 to intelligently update relevant sections.
    """
    prompt = f"""You are an expert technical writer maintaining documentation for a TypeScript-based tool.

Your task is to update the README.md file based on the latest code changes. Review the git diff and commit history below, then update ONLY the relevant sections of the README that are affected by these changes.

**Latest Commit Changes:**
{git_diff[:4000]}

**Recent Commit History:**
{commit_log}

**Current README Content:**
{current_content}

**Instructions:**
1. Analyze the code changes and understand what features were added, modified, or removed
2. Update only the sections of the README that are affected by these changes
3. Maintain the existing structure and style of the README
4. Ensure technical accuracy in all descriptions
5. Keep the language clear, concise, and professional
6. If new features were added, add them to the appropriate sections (Features, Usage, etc.)
7. If implementation details changed significantly, update the relevant technical sections
8. Preserve all existing content that is not affected by the changes
9. Return the COMPLETE updated README content, not just the changed sections

Focus particularly on:
- Features section (new capabilities for Doctype interaction)
- Usage examples (if CLI interface changed or new commands added)
- Technical implementation details (if core logic or API integration changed)
- Any code examples that might need updating (especially TypeScript examples)

Return the complete updated README content."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a technical documentation assistant specializing in TypeScript/Node.js projects and developer tools. You provide accurate, well-structured documentation updates."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=4000
    )
    return response.choices[0].message.content

def write_updated_readme(content):
    """
    Writes the updated content to the README file.
    Creates a backup of the original file before writing.
    """
    # Create backup
    if os.path.exists(README_PATH):
        backup_path = f"{README_PATH}.backup"
        with open(README_PATH, "r") as original:
            with open(backup_path, "w") as backup:
                backup.write(original.read())
        print(f"Backup created at {backup_path}")

    # Write updated content
    with open(README_PATH, "w") as f:
        f.write(content)
    print(f"README updated successfully at {README_PATH}")

# Main execution
if __name__ == "__main__":
    print("Fetching repository context...")
    current_readme = get_repo_context()

    print("Retrieving git diff and commit history...")
    git_diff = get_git_diff()
    commit_log = get_commit_log()

    if not git_diff:
        print("Warning: No git diff found. Proceeding with commit log only.")

    print("Generating updated README content...")
    new_content = generate_updated_readme(current_readme, git_diff, commit_log)

    print("Writing updated README...")
    write_updated_readme(new_content)

    print("✅ README update complete!")
