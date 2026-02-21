# @github-tools/sdk

GitHub tools for the [Vercel AI SDK v6](https://ai-sdk.dev) — wrap GitHub's REST API as AI SDK tools ready to plug into any agent or `generateText` / `streamText` call.

## Installation

```sh
pnpm add @github-tools/sdk
```

`ai` and `zod` are peer dependencies and must be installed separately:

```sh
pnpm add ai zod
```

## Usage

```ts
import { createGithubTools } from '@github-tools/sdk'
import { ToolLoopAgent, stepCountIs } from 'ai'

const agent = new ToolLoopAgent({
  model: yourModel,
  instructions: 'You are a GitHub assistant.',
  tools: createGithubTools({ token: process.env.GITHUB_TOKEN! }),
  stopWhen: stepCountIs(20),
})

const result = await agent.generate({
  prompt: 'List the open pull requests on vercel/ai and summarize them.',
})
```

You can also cherry-pick individual tools:

```ts
import { createOctokit, listPullRequests, createIssue } from '@github-tools/sdk'

const octokit = createOctokit(process.env.GITHUB_TOKEN!)

const tools = {
  listPullRequests: listPullRequests(octokit),
  createIssue: createIssue(octokit),
}
```

## GitHub Token

All tools authenticate with a GitHub personal access token (PAT). Pass it via `createGithubTools({ token })`.

### Fine-grained personal access token (recommended)

Create one at **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.

| Permission | Level | Required for |
|---|---|---|
| **Metadata** | Read-only | Always required (auto-included) |
| **Contents** | Read-only | `getFileContent`, `listBranches`, `getRepository` |
| **Contents** | Read **and** write | `createOrUpdateFile` |
| **Pull requests** | Read-only | `listPullRequests`, `getPullRequest` |
| **Pull requests** | Read **and** write | `createPullRequest`, `mergePullRequest`, `addPullRequestComment` |
| **Issues** | Read-only | `listIssues`, `getIssue` |
| **Issues** | Read **and** write | `createIssue`, `addIssueComment`, `closeIssue` |

For a read-only agent (inspection only), set Contents, Pull requests, and Issues to **Read-only**.

For a full agentic workflow (can create PRs, issues, push files), set all three to **Read and write**.

> Search tools (`searchCode`, `searchRepositories`) work with any token, including unauthenticated requests for public data.

### Classic personal access token

If you prefer a classic PAT, the single `repo` scope covers everything:

| Scope | Required for |
|---|---|
| `public_repo` | All tools on **public** repositories only |
| `repo` | All tools on public **and** private repositories |

## Available tools

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

### Search

| Tool | Description |
|---|---|
| `searchCode` | Search code across GitHub with qualifier support |
| `searchRepositories` | Search repositories by keyword, topic, language, stars, … |

### Commits

| Tool | Description |
|---|---|
| `listCommits` | List commits, optionally filtered by file path, author, or date range (git blame alternative) |
| `getCommit` | Get a commit's full details including changed files and diffs |

## API

### `createGithubTools(options)`

Returns an object of all 18 tools, ready to spread into `tools` of any AI SDK agent or function.

```ts
type GithubToolsOptions = {
  token: string // GitHub personal access token
}
```

### `createOctokit(token)`

Returns a configured `@octokit/rest` instance. Useful when you need the Octokit client directly or want to build additional tools.

## License

MIT
