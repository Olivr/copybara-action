# Basic usage

As per the [default flow](/README.md#default-flow), Pull Requests **must be merged on the repo that acts as the Source of Truth (SoT)**. They must never be merged on destination!

Once they are merged on SoT, Copybara will automatically push the code to the destination branch and close the Pull Request that was initially created on destination (if any).

## Pre-requisite

- **Source of Truth (SoT) repo**
- **Destination repo**
- **[SSH private key](ssh-keys.md)** with write access to destination repo (used to push code)
- **[GitHub Personal access token](https://github.com/settings/tokens)** with 'repo' permissions (used for determining default branches and managing pull requests on both repos)

## Examples

All examples assume you have already added the following secrets to both repos:

- `SSH_KEY`
- `GH_TOKEN` (note: this is different from the `GITHUB_TOKEN` variable which is available in all GitHub Actions but doesn't have cross-repo permissions)

> When moving files in your destination, always make sure you have a Copybara Action config file in the destination repo or you will miss the PR workflow!

### Simple mirror

Sync all the files.

```yaml
on:
  push:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: olivr/copybara-action@v1.2.0
        with:
          ssh_key: ${{ secrets.SSH_KEY }}
          access_token: ${{ secrets.GH_TOKEN }}
          sot_repo: your/repo
          destination_repo: other/repo
```

### Exclude files from syncing

You have a few files ending in _private.md_ in SoT that you don't want to sync to destination

```yaml
on:
  push:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: olivr/copybara-action@v1.2.0
        with:
          ssh_key: ${{ secrets.SSH_KEY }}
          access_token: ${{ secrets.GH_TOKEN }}
          sot_repo: your/repo
          destination_repo: other/repo
          push_exclude: "**/*private.md"
```

### Subfolder as destination's root

Sync all the files from `packages/pkg1` in SoT to be the root in destination. This is ideal for simple monorepos.
We also want to make sure we can sync Pull Requests back to our SoT so we do not forget to include the Github Action.

**Note:** `push_move` is commented out because it is not required. Indeed, if `push_move` is left empty, Copybara will automatically execute the reverse operation of `pr_move`. It's up to you to decide wether you want to specify it or not. Most likely you will specify it initially while you learn and then remove it to clean up.

> Same applies for `push_replace` with `pr_replace`.

```yaml
# .github/workflows/move-repo.yml
on:
  push:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: olivr/copybara-action@v1.2.0
        with:
          ssh_key: ${{ secrets.SSH_KEY }}
          access_token: ${{ secrets.GH_TOKEN }}
          sot_repo: your/repo
          destination_repo: other/repo
          push_include: "packages/pkg1/** .github/workflows/move-repo.yml"
          #push_move: "packages/pkg1||"
          pr_move: |
            ||packages/pkg1
            packages/pkg1/.github||.github
```

### Complex structure

> You can experiment with our [playground repo template](https://github.com/olivr/copybara-playground) to try various scenarios before you implement it in your own repo.

Let's say you have a private monorepo with the following file structure:

```text
.github/
  workflows/
    build-pkg1.yml
    build-pkg2.yml
    move-repo-pkg1.yml
docs/
  pkg1/
    private.md
    README.md
  pkg2/
packages/
  pkg1/
    index.js
  pkg2/
package.json
README.md
```

And you want to open-source **pkg1** with the following file structure:

```text
.github/
  workflows/
    build-pkg1.yml
    move-repo-pkg1.yml
docs/
  README.md
index.js
package.json
```

Here are the transformations you want to apply:

- Change the package name within `package.json`
- Move the content of `packages/pkg1` to the root
- Move the content of `docs/pkg1` to `docs`
- Any file ending in `private.md` must not be included
- Make sure the build files in `.github` work with the new folder structure

```yaml
# .github/workflows/move-repo-pkg1.yml
name: Move Pkg1

on:
  push:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: olivr/copybara-action@v1.2.0
        with:
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo

          push_include: ".github/**/*pkg1.yml docs/pkg1/** packages/pkg1/** package.json"
          push_exclude: "**/*private.md"

          pr_replace: |
            npm test index.js||npm test packages/pkg1/index.js||.github/**/build-pkg1.yml
            pkg1-playground||copybara-playground||package.json
          pr_move: |
            ||packages/pkg1
            packages/pkg1/docs||docs/pkg1
            packages/pkg1/.github||.github
            packages/pkg1/package.json||package.json
```

We need the last three move operations because the first one (`||packages/pkg1`) moves everything from root under the `packages/pkg1` folder.

> It is recommended that you structure your monorepo in a way that lets you run it through Copybara with as little moving and replacing as possible. It will be much easier to maintain!

## [More options](inputs.md)

## [Advanced usage](advanced-usage.md)

## Important notes

This action will work on a normal usage of Git but if you start 'toying' around with the Git history of your SoT, it will most likely break the sync and you will have to debug manually. So, while you can do as many force-pushes as you want on your pull request branches, **don't do it with your base branch**!

> If you want to revert something on your main branch, use `git revert`
