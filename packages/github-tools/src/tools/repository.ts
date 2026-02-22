import { tool } from 'ai'
import { z } from 'zod'
import type { Octokit, ToolOptions } from '../types'

export const getRepository = (octokit: Octokit) =>
  tool({
    description: 'Get information about a GitHub repository including description, stars, forks, language, and default branch',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner (user or organization)'),
      repo: z.string().describe('Repository name'),
    }),
    execute: async ({ owner, repo }) => {
      const { data } = await octokit.repos.get({ owner, repo })
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.html_url,
        defaultBranch: data.default_branch,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        language: data.language,
        private: data.private,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    },
  })

export const listBranches = (octokit: Octokit) =>
  tool({
    description: 'List branches in a GitHub repository',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      perPage: z.number().optional().default(30).describe('Number of branches to return (max 100)'),
    }),
    execute: async ({ owner, repo, perPage }) => {
      const { data } = await octokit.repos.listBranches({ owner, repo, per_page: perPage })
      return data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected,
      }))
    },
  })

export const getFileContent = (octokit: Octokit) =>
  tool({
    description: 'Get the content of a file from a GitHub repository',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      path: z.string().describe('Path to the file in the repository'),
      ref: z.string().optional().describe('Branch, tag, or commit SHA (defaults to the default branch)'),
    }),
    execute: async ({ owner, repo, path, ref }) => {
      const { data } = await octokit.repos.getContent({ owner, repo, path, ref })
      if (Array.isArray(data)) {
        return { type: 'directory', entries: data.map(e => ({ name: e.name, type: e.type, path: e.path })) }
      }
      if (data.type !== 'file') {
        return { type: data.type, path: data.path }
      }
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      return {
        type: 'file',
        path: data.path,
        sha: data.sha,
        size: data.size,
        content,
      }
    },
  })

export const createOrUpdateFile = (octokit: Octokit, { needsApproval = true }: ToolOptions = {}) =>
  tool({
    description: 'Create or update a file in a GitHub repository. Provide the SHA when updating an existing file.',
    needsApproval,
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      path: z.string().describe('Path to the file in the repository'),
      message: z.string().describe('Commit message'),
      content: z.string().describe('File content (plain text, will be base64-encoded automatically)'),
      branch: z.string().optional().describe('Branch to commit to (defaults to the default branch)'),
      sha: z.string().optional().describe('SHA of the file being replaced (required when updating an existing file)'),
    }),
    execute: async ({ owner, repo, path, message, content, branch, sha }) => {
      const encoded = Buffer.from(content).toString('base64')
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encoded,
        branch,
        sha,
      })
      return {
        path: data.content?.path,
        sha: data.content?.sha,
        commitSha: data.commit.sha,
        commitUrl: data.commit.html_url,
      }
    },
  })
