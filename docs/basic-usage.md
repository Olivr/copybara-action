# Basic usage

As per the [default flow](README.md#default-flow), Pull Requests **must be merged on the repo that acts as the Source of Truth (SoT)**. They must never be merged on destination!

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
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
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
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
          push_exclude_files: "**/*_PRIVATE.md"
          pr_exclude_files: FUNDING.md
```

### Subfolder as destination's root

Sync all the files from `my/folder` in SoT to be the root in destination. This is ideal for basic monorepos.

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
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
          make_root: "my/folder"
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
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
          push_include_files: "my/folder/**"
          push_move_files: "my/folder/**,"
          pr_move_files: ",my/folder"
```

### Complex structure

> Use the following example in our [playground repo template](https://github.com/olivr/copybara-playground) to try various scenarios before you implement it in your own repo.

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

Here are the transformations we need to apply:

- Keep `package.json` and change the package name
- Move the content of `packages/pkg1` to the root
- Move the content of `docs/pkg1` to `docs`
- Any file ending in `private.md` must not be included
- Keep the build files in `.github` and make sure they work with the new folder structure

Here is the content of `move-repo-pkg1.yml`:

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
          sot_repo: olivr/monorepo-copybara
          destination_repo: olivr/oss-copybara
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}

          # Move and transform files out of the SoT
          push_include_files: ".github/**/*pkg1.yml packages/pkg1/** docs/pkg1/** package.json"
          push_exclude_files: "**/*private.md"
          push_move_files: |
            packages/pkg1||
            docs/pkg1||docs
          push_replace: |
            npm test packages/pkg1/index.js||npm test index.js||.github/**/*pkg1.yml
            copybara-playground||pkg1-playground||package.json

          # Move and transform files back to the SoT (reverse operation)
          pr_replace: |
            npm test index.js||npm test packages/pkg1/index.js||.github/**/*pkg1.yml
            pkg1-playground||copybara-playground||package.json
          pr_move_files: |
            docs||docs/pkg1
            ||packages/pkg1
            packages/pkg1/package.json||
```

You will have noticed that we reversed our transformations for the PR workflow to work seamlessly.
Under the hood, Copybara Action also reversed the order of each transformation (ie. replacements happen after movements in **push** and before movements in **PR**). Changing the order of the fields in the YAML doesn't do anything, we changed it in this example just so it's more intuitive.

You might also have noticed that we added an extra move (`packages/pkg1/package.json||`) in the **PR** workflow because the previous one (`||packages/pkg1`) moved it out of the root! If you use a [custom Copybara configuration](advanced-usage.md#custom-copybara-configuration) instead of our wrapper, you'll have much more control over what's happening without using tricks like this one.

> It is recommended that you structure your monorepo in a way that lets you "Copybara it" without too much moving and replacing. It will be much much easier to maintain!

### [More options](inputs.md)

### [Advanced usage](advanced-usage.md)

## Important notes

This action will work on a normal usage of Git but if you start 'toying' around with the Git history of your SoT, it will most likely break the sync and you will have to debug manually. So, while you can do as many force-pushes, rebases and merges on your pull request branches, **don't do it with the base branch**!

> If you want to revert something on your main branch, use `git revert`
