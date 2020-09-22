# Basic usage

As per the [default flow](README.md#default-flow), Pull Requests **must be merged on the repo that acts as the Source of Truth (SoT)**, not on destination!

Once they are merged on SoT, Copybara will automatically push the code to the destination branch and close the Pull Request that was initially created on destination (if any).

It is recommended to [protect the destination branch](branch-protection.md) to prevent accidental commits.

## Pre-requisite

- **Source of Truth (SoT) repo**
- **Destination repo**
- **[SSH private key](ssh-keys.md)** with write access to destination repo (used to push code)
- **[GitHub Personal access token](https://github.com/settings/tokens)** with 'repo' permissions (used for determining default branches and managing pull requests on both repos)

## Examples

All examples assume you have already added the following secrets to both repos:

- `SSH_KEY`
- `GH_TOKEN` (note: this is different from the `GITHUB_TOKEN` variable which is available in all actions but doesn't have the necessary permissions)

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
      - uses: olivr/copybara-action@v1.1.0
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```
