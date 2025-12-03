module.exports = async ({ github, context, core }) => {
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!openAIKey) {
        core.setFailed("❌ OPENAI_API_KEY missing.");
        return;
    }

    // 1. Get PR diff
    const { owner, repo } = context.repo;
    const pull_number = context.issue.number;

    let diffData;
    try {
        const response = await github.rest.pulls.get({
            owner,
            repo,
            pull_number,
            mediaType: {
                format: "diff", // Ask for raw diff format
            },
        });
        diffData = response.data;
    } catch (error) {
        core.setFailed(`Failed to download diff: ${error.message}`);
        return;
    }

    // Protection: cut diff if it's too bigger to save tokens and costs
    const MAX_DIFF_LENGTH = 15000;
    if (diffData.length > MAX_DIFF_LENGTH) {
        diffData = diffData.substring(0, MAX_DIFF_LENGTH) + "\n... (Diff was too big)";
    }

    // 2. Preparing the Prompt for OpenAI
    // Instruct the model as a Senior Rust Engineer on Oxy
    const systemPrompt = `
You are a Senior TypeScript Engineer working on "Doctype", a to update documentation automatically when the code changes.
Your task is to perform a critical and constructive Code Review of this Pull Request.

Guidelines:
1. Focus on code quality, maintainability, and adherence to TypeScript best practices.
2. Review for proper type safety and error handling.
3. Evaluate adherence to project conventions and architectural patterns.
4. Look for potential performance bottlenecks in Node.js asynchronous operations.
5. Be very concise. Focus on key architectural insights and high-impact suggestions. Use bullet points.
6. If the code looks good, give brief compliments but still look for areas of improvement.

Respond in Markdown.
`;

    const userPrompt = `Here is the PR diff:\n\n\`\`\`diff\n${diffData}\n\`\`\``;

    // 3. Call to OpenAI (using Node 18+ native fetch)
    let aiReview = "";
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openAIKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o", // Or gpt-3.5-turbo if you want to save costs
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.5,
            }),
        });

        const json = await response.json();
        if (json.error) throw new Error(json.error.message);
        aiReview = json.choices[0].message.content;

    } catch (error) {
        console.error("OpenAI Error:", error);
        aiReview = "⚠️ *Unable to complete AI review at this time.*";
    }

    // 4. Building the final comment


    const commentBody = `
## 🤖 Doctype AI Code Review

| Metric | Status |
|--------|--------|
| **Reviewer** | GPT-4o |

### 🧠 Architectural Analysis
${aiReview}

---
*This review is automatically generated. Developers always have the final say.*
`;

    // 5. Comment Management (Update or Create to avoid spam)
    const comments = await github.rest.issues.listComments({
        owner,
        repo,
        issue_number: pull_number,
    });

    const botComment = comments.data.find(c => c.body.includes('## 🤖 Doctype AI Code Review'));

    if (botComment) {
        await github.rest.issues.updateComment({
            owner,
            repo,
            comment_id: botComment.id,
            body: commentBody,
        });
    } else {
        await github.rest.issues.createComment({
            owner,
            repo,
            issue_number: pull_number,
            body: commentBody,
        });
    }
};
