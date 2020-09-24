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

### [More options](inputs.md)

### [Advanced usage](advanced-usage.md)

## Important notes

This action will work on a normal usage of Git but if you start 'toying' around with the Git history of your SoT, it will most likely break the sync and you will have to debug manually. So, while you can do as many force-pushes, rebases and merges on your pull request branches, **don't do it with the base branch**!

> If you want to revert something on your main branch, use `git revert`
