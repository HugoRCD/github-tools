import { Octokit } from 'octokit'

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token })
}
