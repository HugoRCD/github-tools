import { createOctokit } from './client'
import { getRepository, listBranches, getFileContent, createOrUpdateFile } from './tools/repository'
import { listPullRequests, getPullRequest, createPullRequest, mergePullRequest, addPullRequestComment } from './tools/pull-requests'
import { listIssues, getIssue, createIssue, addIssueComment, closeIssue } from './tools/issues'
import { searchCode, searchRepositories } from './tools/search'
import { listCommits, getCommit } from './tools/commits'

export type GithubWriteToolName =
  | 'createOrUpdateFile'
  | 'createPullRequest'
  | 'mergePullRequest'
  | 'addPullRequestComment'
  | 'createIssue'
  | 'addIssueComment'
  | 'closeIssue'

/**
 * Whether write operations require user approval.
 * - `true`  — all write tools need approval (default)
 * - `false` — no approval needed for any write tool
 * - object  — per-tool override; unspecified write tools default to `true`
 *
 * @example
 * ```ts
 * // Only merging and file changes need approval, comments are fine
 * requireApproval: {
 *   mergePullRequest: true,
 *   createOrUpdateFile: true,
 *   addPullRequestComment: false,
 *   addIssueComment: false,
 * }
 * ```
 */
export type ApprovalConfig = boolean | Partial<Record<GithubWriteToolName, boolean>>

export type GithubToolsOptions = {
  token: string
  requireApproval?: ApprovalConfig
}

function resolveApproval(toolName: GithubWriteToolName, config: ApprovalConfig): boolean {
  if (typeof config === 'boolean') return config
  return config[toolName] ?? true
}

/**
 * Create a set of GitHub tools for the Vercel AI SDK.
 *
 * Write operations require user approval by default.
 * Control this globally or per-tool via `requireApproval`.
 *
 * @example
 * ```ts
 * // All writes need approval (default)
 * createGithubTools({ token })
 *
 * // No approval at all
 * createGithubTools({ token, requireApproval: false })
 *
 * // Granular: only destructive actions need approval
 * createGithubTools({
 *   token,
 *   requireApproval: {
 *     mergePullRequest: true,
 *     createOrUpdateFile: true,
 *     closeIssue: true,
 *     createPullRequest: false,
 *     addPullRequestComment: false,
 *     createIssue: false,
 *     addIssueComment: false,
 *   }
 * })
 * ```
 */
export function createGithubTools({ token, requireApproval = true }: GithubToolsOptions) {
  const octokit = createOctokit(token)
  const approval = (name: GithubWriteToolName) => ({ needsApproval: resolveApproval(name, requireApproval) })

  return {
    // Read-only — never need approval
    getRepository: getRepository(octokit),
    listBranches: listBranches(octokit),
    getFileContent: getFileContent(octokit),
    listPullRequests: listPullRequests(octokit),
    getPullRequest: getPullRequest(octokit),
    listIssues: listIssues(octokit),
    getIssue: getIssue(octokit),
    searchCode: searchCode(octokit),
    searchRepositories: searchRepositories(octokit),
    listCommits: listCommits(octokit),
    getCommit: getCommit(octokit),
    // Write — approval controlled per tool
    createOrUpdateFile: createOrUpdateFile(octokit, approval('createOrUpdateFile')),
    createPullRequest: createPullRequest(octokit, approval('createPullRequest')),
    mergePullRequest: mergePullRequest(octokit, approval('mergePullRequest')),
    addPullRequestComment: addPullRequestComment(octokit, approval('addPullRequestComment')),
    createIssue: createIssue(octokit, approval('createIssue')),
    addIssueComment: addIssueComment(octokit, approval('addIssueComment')),
    closeIssue: closeIssue(octokit, approval('closeIssue')),
  }
}

export type GithubTools = ReturnType<typeof createGithubTools>

// Re-export individual tool factories for cherry-picking
export { createOctokit } from './client'
export { getRepository, listBranches, getFileContent, createOrUpdateFile } from './tools/repository'
export { listPullRequests, getPullRequest, createPullRequest, mergePullRequest, addPullRequestComment } from './tools/pull-requests'
export { listIssues, getIssue, createIssue, addIssueComment, closeIssue } from './tools/issues'
export { searchCode, searchRepositories } from './tools/search'
export { listCommits, getCommit } from './tools/commits'
export type { Octokit, ToolOptions } from './types'
