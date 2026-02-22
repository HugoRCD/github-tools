import { tool } from 'ai'
import { z } from 'zod'
import type { Octokit } from '../types'

export const listCommits = (octokit: Octokit) =>
  tool({
    description: 'List commits for a GitHub repository. Filter by file path to see who changed a specific file and when (git blame alternative). Filter by author, branch, or date range.',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      path: z.string().optional().describe('Only commits containing this file path'),
      sha: z.string().optional().describe('Branch name or commit SHA to start listing from'),
      author: z.string().optional().describe('GitHub username or email to filter commits by'),
      since: z.string().optional().describe('Only commits after this date (ISO 8601 format)'),
      until: z.string().optional().describe('Only commits before this date (ISO 8601 format)'),
      perPage: z.number().optional().default(30).describe('Number of results to return (max 100)'),
    }),
    execute: async ({ owner, repo, path, sha, author, since, until, perPage }) => {
      const { data } = await octokit.repos.listCommits({
        owner,
        repo,
        path,
        sha,
        author,
        since,
        until,
        per_page: perPage,
      })
      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        authorLogin: commit.author?.login,
        date: commit.commit.author?.date,
        url: commit.html_url,
      }))
    },
  })

export const getCommit = (octokit: Octokit) =>
  tool({
    description: 'Get detailed information about a specific commit, including the list of files changed with additions and deletions',
    inputSchema: z.object({
      owner: z.string().describe('Repository owner'),
      repo: z.string().describe('Repository name'),
      ref: z.string().describe('Commit SHA, branch name, or tag'),
    }),
    execute: async ({ owner, repo, ref }) => {
      const { data } = await octokit.repos.getCommit({ owner, repo, ref })
      return {
        sha: data.sha,
        message: data.commit.message,
        author: data.commit.author?.name,
        authorLogin: data.author?.login,
        date: data.commit.author?.date,
        url: data.html_url,
        stats: data.stats ? {
          additions: data.stats.additions,
          deletions: data.stats.deletions,
          total: data.stats.total,
        } : null,
        files: data.files?.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          patch: file.patch,
        })),
      }
    },
  })
