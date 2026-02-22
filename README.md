# @github-tools/sdk

[![npm version](https://img.shields.io/npm/v/@github-tools/sdk?color=black)](https://npmjs.com/package/@github-tools/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@github-tools/sdk?color=black)](https://npm.chart.dev/@github-tools/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-black?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/github/license/HugoRCD/github-tools?color=black)](https://github.com/HugoRCD/github-tools/blob/main/LICENSE)

GitHub tools for the [AI SDK](https://ai-sdk.dev) — wrap GitHub's REST API as ready-to-use tools for any agent or `generateText` / `streamText` call.

18 tools covering repositories, pull requests, issues, commits, and search. Write operations support granular approval control out of the box.

## Installation

```sh
pnpm add @github-tools/sdk
```

`ai` and `zod` are peer dependencies:

```sh
pnpm add ai zod
```

## Quick Start

```ts
import { createGithubTools } from '@github-tools/sdk'
import { generateText } from 'ai'

const result = await generateText({
  model: yourModel,
  tools: createGithubTools({ token: process.env.GITHUB_TOKEN! }),
  prompt: 'List the open pull requests on vercel/ai and summarize them.',
})
```

### Cherry-Picking Tools

You can import individual tool factories instead of the full set:

```ts
import { createOctokit, listPullRequests, createIssue } from '@github-tools/sdk'

const octokit = createOctokit(process.env.GITHUB_TOKEN!)

const tools = {
  listPullRequests: listPullRequests(octokit),
  createIssue: createIssue(octokit),
}
```

## Approval Control

Write operations (creating issues, merging PRs, pushing files, …) require user approval by default. This is designed for human-in-the-loop agent workflows.

```ts
// All writes need approval (default)
createGithubTools({ token })

// No approval needed
createGithubTools({ token, requireApproval: false })

// Granular: only destructive actions need approval
createGithubTools({
  token,
  requireApproval: {
    mergePullRequest: true,
    createOrUpdateFile: true,
    closeIssue: true,
    createPullRequest: false,
    addPullRequestComment: false,
    createIssue: false,
    addIssueComment: false,
  },
})
```

Write tools: `createOrUpdateFile`, `createPullRequest`, `mergePullRequest`, `addPullRequestComment`, `createIssue`, `addIssueComment`, `closeIssue`.

All other tools are read-only and never require approval.

## Available Tools

### Repository

| Tool | Description |
|---|---|
| `getRepository` | Get repository metadata (stars, language, default branch, …) |
| `listBranches` | List branches |
| `getFileContent` | Read a file or directory listing |
| `createOrUpdateFile` | Create or update a file and commit it |

### Pull Requests

| Tool | Description |
|---|---|
| `listPullRequests` | List PRs filtered by state |
| `getPullRequest` | Get a PR's full details (diff stats, body, merge status) |
| `createPullRequest` | Open a new PR |
| `mergePullRequest` | Merge a PR (merge, squash, or rebase) |
| `addPullRequestComment` | Post a comment on a PR |

### Issues

| Tool | Description |
|---|---|
| `listIssues` | List issues filtered by state and labels |
| `getIssue` | Get an issue's full details |
| `createIssue` | Open a new issue |
| `addIssueComment` | Post a comment on an issue |
| `closeIssue` | Close an issue (completed or not planned) |

### Commits

| Tool | Description |
|---|---|
| `listCommits` | List commits, optionally filtered by file path, author, or date range |
| `getCommit` | Get a commit's full details including changed files and diffs |

### Search

| Tool | Description |
|---|---|
| `searchCode` | Search code across GitHub with qualifier support |
| `searchRepositories` | Search repositories by keyword, topic, language, stars, … |

## GitHub Token

All tools authenticate with a GitHub personal access token (PAT).

### Fine-grained token (recommended)

Create one at **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.

| Permission | Level | Required for |
|---|---|---|
| **Metadata** | Read-only | Always required (auto-included) |
| **Contents** | Read-only | `getRepository`, `listBranches`, `getFileContent`, `listCommits`, `getCommit` |
| **Contents** | Read and write | `createOrUpdateFile` |
| **Pull requests** | Read-only | `listPullRequests`, `getPullRequest` |
| **Pull requests** | Read and write | `createPullRequest`, `mergePullRequest`, `addPullRequestComment` |
| **Issues** | Read-only | `listIssues`, `getIssue` |
| **Issues** | Read and write | `createIssue`, `addIssueComment`, `closeIssue` |

Search tools (`searchCode`, `searchRepositories`) work with any token.

### Classic token

| Scope | Required for |
|---|---|
| `public_repo` | All tools on public repositories |
| `repo` | All tools on public and private repositories |

## API

### `createGithubTools(options)`

Returns an object of all 18 tools, ready to spread into `tools` of any AI SDK call.

```ts
type GithubToolsOptions = {
  token: string
  requireApproval?: boolean | Partial<Record<GithubWriteToolName, boolean>>
}
```

### `createOctokit(token)`

Returns a configured [`@octokit/rest`](https://github.com/octokit/rest.js) instance. Useful when cherry-picking individual tools or building custom ones.

## License

[MIT](./LICENSE)

Made by [@HugoRCD](https://github.com/HugoRCD)
