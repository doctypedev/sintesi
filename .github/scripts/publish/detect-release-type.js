/**
 * Detect the release type (major, minor, patch) for a commit.
 *
 * This script checks:
 * 1. If triggered via workflow_dispatch, use the manual input
 * 2. Otherwise, check PR labels for merge: major/minor/patch
 *
 * @param {Object} params - GitHub Actions context
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {Object} params.core - GitHub Actions core utilities
 */
module.exports = async ({ github, context, core }) => {
  // If manually triggered, use the provided release type
  if (context.eventName === 'workflow_dispatch') {
    core.setOutput('type', context.payload.inputs.release_type);
    return;
  }

  // Get PRs associated with this commit
  const { data: prs } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: context.sha
  });

  // Extract labels from the first PR
  const labels = prs[0]?.labels.map(l => l.name) || [];

  // Determine release type based on labels
  const type = labels.includes('merge: major')
    ? 'major'
    : labels.includes('merge: minor')
    ? 'minor'
    : labels.includes('merge: patch')
    ? 'patch'
    : '';

  // Set output if a type was detected
  if (type) {
    core.setOutput('type', type);
  }
};
