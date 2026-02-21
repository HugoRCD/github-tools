# default-repository

<!-- automd:badges color=black license provider=shields -->

[![npm version](https://img.shields.io/npm/v/default-repository?color=black)](https://npmjs.com/package/default-repository)
[![npm downloads](https://img.shields.io/npm/dm/default-repository?color=black)](https://npmjs.com/package/default-repository)
[![license](https://img.shields.io/github/license/HugoRCD/default-repository?color=black)](https://github.com/HugoRCD/default-repository/blob/main/LICENSE)

<!-- /automd -->

This repository is a template repository for creating new repositories with everything you need to get started.

## Usage

Install package:

<!-- automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install default-repository

# npm
npm install default-repository

# yarn
yarn add default-repository

# pnpm
pnpm install default-repository

# bun
bun install default-repository
```

<!-- /automd -->

## Development

Before you start, you can use the `./scripts/rename.sh` script to rename all `default-repository` occurrences in the repository to your new repository name.

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/local_development.md" -->

<details>
  <summary>Local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `bun install`

</details>

<!-- /automd -->

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/contributions.md" -->

## Contributing
To start contributing, you can follow these steps:

1. First raise an issue to discuss the changes you would like to make.
2. Fork the repository.
3. Create a branch using conventional commits and the issue number as the branch name. For example, `feat/123` or `fix/456`.
4. Make changes following the local development steps.
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6. If your changes affect the code, run tests using `bun run test`.
7. Create a pull request following the [Pull Request Template](https://github.com/HugoRCD/markdown/blob/main/src/pull_request_template.md).
   - To be merged, the pull request must pass the tests/workflow and have at least one approval.
   - If your changes affect the documentation, make sure to update it.
   - If your changes affect the code, make sure to update the tests.
8. Wait for the maintainers to review your pull request.
9. Once approved, the pull request will be merged in the next release !

<!-- /automd -->

<!-- automd:contributors license=Apache author=HugoRCD-->

Published under the [APACHE](https://github.com/HugoRCD/default-repository/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/HugoRCD/default-repository/graphs/contributors) 💛
<br><br>
<a href="https://github.com/HugoRCD/default-repository/graphs/contributors">
<img src="https://contrib.rocks/image?repo=HugoRCD/default-repository" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Sat Aug 24 2024)_

<!-- /automd -->
