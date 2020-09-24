# Advanced usage

## What this action does

This action manages 2 workflows out of the box (push, pr) and essentially does two things:

1. **Detect** which workflow to run depending on the context:

   - _Push to SoT_ => **push**
   - _PR opened/changed on destination_ => **pr**

   > If the destination branch doesn't exist on **push**, it will add the flags `--force --init-history`

2. **Generate** a configuration for each workflow

## What you can do

### Force specific workflows

The following will ensure the **push** workflow is ran using the auto-generated configuration file.

```yaml
on:
  push:
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
          workflow: push
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Custom Copybara configuration

The following will use your configuration instead of the automatically generated one.
You can get inspiration from the [generated config](#generated-config) to get started.

> This example is still making use of the workflow detection so `my.own.copy.bara.sky` must contain a **push** and a **pr** workflow

```yaml
on:
  push:
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
          custom_config: my.own.copy.bara.sky
          ssh_key: ${{ secrets.SSH_KEY }}
```

### Completely custom

The following doesn't make use of any of our helpers for detecting the workflow and generating the configuration.
It is even using a custom Copybara docker image!

```yaml
on:
  push:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: olivr/copybara-action@v1.1.2
        with:
          workflow: export
          custom_config: my.own.copy.bara.sky
          copybara_image: sharelatex/copybara
          ssh_key: ${{ secrets.SSH_KEY }}
```

### SoT not on GitHub

This action's auto-generated configuration was made for a use case with two GitHub repos. However
If your SoT is not on GitHub, you can still use this action on your destination using a custom config and forcing a specific workflow:

```yaml
on:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: olivr/copybara-action@v1.1.2
        with:
          workflow: pr
          custom_config: my.own.copy.bara.sky
          ssh_key: ${{ secrets.SSH_KEY }}
```

### [More options](inputs.md)

## Generated config

So you don't have to start your config from scratch, let's download your current generated one.

When you enable debug mode, this action will create an artifact containing your copy.bara.sky configuration.

1. In your repo(s), add the secret `ACTIONS_STEP_DEBUG` and set it to `true`
2. Run the action workflow (most likely create a commit in SoT and a PR in destination)
3. Check out the artifacts for this workflow run

![artifact](images/artifact.png)
