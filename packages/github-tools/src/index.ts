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
 * requireApproval: {
 *   mergePullRequest: true,
 *   createOrUpdateFile: true,
 *   addPullRequestComment: false,
 *   addIssueComment: false,
 * }
 * ```
 */
export type ApprovalConfig = boolean | Partial<Record<GithubWriteToolName, boolean>>

/**
 * Predefined tool presets for common use cases.
 *
 * - `'code-review'` — Review PRs: read PRs, file content, commits, and post comments
 * - `'issue-triage'` — Triage issues: read/create/close issues, search, and comment
 * - `'repo-explorer'` — Explore repos: read-only access to repos, branches, code, and search
 * - `'maintainer'`   — Full maintenance: all read + create PRs, merge, manage issues
 */
export type GithubToolPreset = 'code-review' | 'issue-triage' | 'repo-explorer' | 'maintainer'

const PRESET_TOOLS: Record<GithubToolPreset, string[]> = {
  'code-review': [
    'getPullRequest', 'listPullRequests', 'getFileContent', 'listCommits', 'getCommit',
    'getRepository', 'listBranches', 'searchCode',
    'addPullRequestComment'
  ],
  'issue-triage': [
    'listIssues', 'getIssue', 'createIssue', 'addIssueComment', 'closeIssue',
    'getRepository', 'searchRepositories', 'searchCode'
  ],
  'repo-explorer': [
    'getRepository', 'listBranches', 'getFileContent',
    'listPullRequests', 'getPullRequest',
    'listIssues', 'getIssue',
    'listCommits', 'getCommit',
    'searchCode', 'searchRepositories'
  ],
  'maintainer': [
    'getRepository', 'listBranches', 'getFileContent', 'createOrUpdateFile',
    'listPullRequests', 'getPullRequest', 'createPullRequest', 'mergePullRequest', 'addPullRequestComment',
    'listIssues', 'getIssue', 'createIssue', 'addIssueComment', 'closeIssue',
    'listCommits', 'getCommit',
    'searchCode', 'searchRepositories'
  ]
}

export type GithubToolsOptions = {
  token: string
  requireApproval?: ApprovalConfig
  /**
   * Restrict the returned tools to a predefined preset.
   * Omit to get all tools.
   *
   * @example
   * ```ts
   * // Only code-review tools
   * createGithubTools({ token, preset: 'code-review' })
   *
   * // Combine presets
   * createGithubTools({ token, preset: ['code-review', 'issue-triage'] })
   * ```
   */
  preset?: GithubToolPreset | GithubToolPreset[]
}

function resolveApproval(toolName: GithubWriteToolName, config: ApprovalConfig): boolean {
  if (typeof config === 'boolean') return config
  return config[toolName] ?? true
}

function resolvePresetTools(preset: GithubToolPreset | GithubToolPreset[]): Set<string> | null {
  if (!preset) return null
  const presets = Array.isArray(preset) ? preset : [preset]
  const tools = new Set<string>()
  for (const p of presets) {
    for (const t of PRESET_TOOLS[p]) tools.add(t)
  }
  return tools
}

/**
 * Create a set of GitHub tools for the Vercel AI SDK.
 *
 * Write operations require user approval by default.
 * Control this globally or per-tool via `requireApproval`.
 * Use `preset` to get only the tools you need.
 *
 * @example
 * ```ts
 * // All tools (default)
 * createGithubTools({ token })
 *
 * // Code-review agent — only PR & commit tools
 * createGithubTools({ token, preset: 'code-review' })
 *
 * // Combine presets
 * createGithubTools({ token, preset: ['code-review', 'issue-triage'] })
 *
 * // Granular approval
 * createGithubTools({
 *   token,
 *   preset: 'maintainer',
 *   requireApproval: {
 *     mergePullRequest: true,
 *     createOrUpdateFile: true,
 *     addPullRequestComment: false,
 *   }
 * })
 * ```
 */
export function createGithubTools({ token, requireApproval = true, preset }: GithubToolsOptions) {
  const octokit = createOctokit(token)
  const approval = (name: GithubWriteToolName) => ({ needsApproval: resolveApproval(name, requireApproval) })
  const allowed = preset ? resolvePresetTools(preset) : null

  const allTools = {
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
    createOrUpdateFile: createOrUpdateFile(octokit, approval('createOrUpdateFile')),
    createPullRequest: createPullRequest(octokit, approval('createPullRequest')),
    mergePullRequest: mergePullRequest(octokit, approval('mergePullRequest')),
    addPullRequestComment: addPullRequestComment(octokit, approval('addPullRequestComment')),
    createIssue: createIssue(octokit, approval('createIssue')),
    addIssueComment: addIssueComment(octokit, approval('addIssueComment')),
    closeIssue: closeIssue(octokit, approval('closeIssue')),
  }

  if (!allowed) return allTools

  return Object.fromEntries(
    Object.entries(allTools).filter(([name]) => allowed.has(name))
  ) as Partial<typeof allTools>
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
