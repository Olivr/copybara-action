# Basic usage

As per the [default flow](README.md#default-flow), Pull Requests **must be merged on the repo that acts as the Source of Truth (SoT)**, not on destination!

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

      - uses: olivr/copybara-action@v1.1.2
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Exclude files from syncing

- You have a few files ending in _\_PRIVATE.md_ in SoT that you don't want to sync to destination
- You added a file _FUNDING.md_ in the destination but you don't want to sync it back to SoT

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

      - uses: olivr/copybara-action@v1.1.2
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          push_exclude_files: "**/*_PRIVATE.md"
          pr_exclude_files: FUNDING.md
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Subfolder as destination's root

Sync all the files from `my/folder` in SoT to be the root in destination.

> All include/exclude_files variables are now relative to the new root. Anything outside of the new root is unknown to Copybara.

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

      - uses: olivr/copybara-action@v1.1.2
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          make_root: "my/folder"
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Subfolder as destination's root (manual)

The variable `make_root` lets you quickly add all files in a folder as root. But if you need to include some files that are outside of your subfolder, you'll need to switch to 'manual mode'.

The example below achieves exactly the same result as the example above.

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

      - uses: olivr/copybara-action@v1.1.2
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          push_include_files: "my/folder/**"
          push_move_files: "my/folder/**,"
          pr_move_files: ",my/folder"
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Monorepo

Let's say you have a private monorepo with the following file structure:

```text
.github/
  workflows/
    build-pkg1.yml
    build-pkg2.yml
    move-repo-pkg1.yml
packages/
  pkg1/
    index.js
    .config/
  pkg2/
docs/
  pkg1/
    README.md
    usage.md
    private.md
  pkg2/
package.json
README.md
private.md
```

You want to open source **pkg1** with the following file structure:

```text
.github/
  workflows/
    build-pkg1.yml
    move-repo-pkg1.yml
src/
  index.js
  .config/
docs/
  usage.md
package.json
README.md
```

- The content of `packages/pkg1` is now under `src`
- The content of `docs/pkg1` is now under `docs`
- The file `docs/pkg1/README.md` has now replaced `README.md` at the root
- Any file `private.md` must not be included
- You have to do some manipulations so your build works with the new paths

Here is the content of `move-repo.yml`:

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

      - uses: olivr/copybara-action@v1.1.2
        with:
          sot_repo: your/repo
          destination_repo: other/repo

          # Move and transform files out of the SoT
          push_include_files: ".github/**/*pkg1.yml packages/pkg1/** docs/pkg1/** package.json"
          push_exclude_files: "**/**/private.md"
          push_move_files: "packages/pkg1/**,src docs/pkg1/**,docs docs/README.md,"
          push_replace: "packages/pkg1/,src/"

          # Move and transform files back to the SoT (reverse operation)
          pr_move_files: "README.md,docs docs/**,docs/pkg1 src/**,packages/pkg1"
          pr_replace: "/src/,packages/pkg1/"
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```

### [More options](inputs.md)

### [Advanced usage](advanced-usage.md)

## Important notes

This action will work on a normal usage of Git but if you start 'toying' around with the Git history of your SoT, it will most likely break the sync and you will have to debug manually. So, while you can do as many force-pushes, rebases and merges on your pull request branches, **don't do it with the base branch**!

> If you want to revert something on your main branch, use `git revert`
