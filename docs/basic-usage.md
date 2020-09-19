# Basic usage

As per the [default flow](README.md#default-flow), Pull Requests **must be merged on the repo that acts as the Source of Truth (SoT)**, not on destination!

Once they are merged on SoT, Copybara will automatically push the code to the destination branch and close the Pull Request that was initially created on destination (if any).

It is recommended to [protect the destination branch](branch-protection.md) to prevent accidental commits.

## Pre-requisite

- **Source of Truth (SoT) repo**
- **Destination repo**
- **[GitHub Personal access token](https://github.com/settings/tokens)** (used for determining default branches and managing pull requests on both repos)
- **[SSH private key](ssh-keys.md)** with write access to destination repo (used to push code).

## Examples

### Simple mirror

Sync all the files in the SoT repo

```yaml
on:
  push:
  pull_request:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: copybara-action@v1.0.5
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
```
