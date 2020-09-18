# Copybara Action

[Copybara](https://github.com/google/copybara) is a great tool for transforming and moving code between repositories.

This action comes with sensible defaults to make it **very easy** for you to use Copybara but is also **100% customizable** so you can use it with your own config, your own Docker image.

## Default flow

```text
 Source of Truth                  Destination

+---------------+   Copybara   +---------------+
|     Branch    +------------> |     Branch    |
+-------+-------+              +---------------+
        ^
        |
        |
+-------+-------+   Copybara   +---------------+
| Pull Requests | <------------+ Pull Requests |
+---------------+              +---------------+
```

- One repo acts as the Source of Truth (SoT)
- One other repo acts as the destination repo
- SoT branch is always pushed by Copybara to destination branch
- Pull Requests can be created on both SoT and destination
- Pull Requests created on destination are always copied by Copybara to SoT

> This is the default generated flow, you can customize it

## Example: simple mirroring

```yaml
on:
  push:
  pull_request:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: olivr/copybara-action@v1
        with:
          sot_repo: your/repo
          destination_repo: other/repo
          access_token: ${{ secrets.GH_TOKEN }} # Personal access token
          ssh_key: ${{ secrets.SSH_KEY }} # For this example, use a key attached to a user
```

More examples in [basic usage](basic-usage.md) and [advanced usage](advanced-usage.md)

## [Basic usage](basic-usage.md)

## [Advanced usage](advanced-usage.md)

## [Options](options.md)

## [Contributing](contributing.md)

## Acknowledgements

Thanks to the developers behind [Copybara](https://github.com/google/copybara). This action would not exist without this excellent tool.
