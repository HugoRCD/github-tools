import { Octokit } from '@octokit/rest'

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token })
}
