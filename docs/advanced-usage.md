# Advanced usage

## What this action does

This action manages 2 workflows out of the box (**push**, **pr**) and essentially has three steps:

1. **Detect** which workflow to run depending on the context:

   - _Push to SoT_ => **push**
   - _PR opened/updated on destination_ => **pr**

   > If the destination branch doesn't exist on **push**, it will add the flags `--force --init-history`

2. **Generate** a configuration for each workflow

3. **Run** Copybara

## What you can do

### Force specific workflows

_The following will let you override step 1 but let Copybara Action perform step 2 and 3._

It will ensure the **push** workflow is ran using the auto-generated configuration file.

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

      - uses: olivr/copybara-action@v1.2.1
        with:
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
          workflow: push
```

### Custom Copybara configuration

_The following will let Copybara Action perform step 1 and 3 but let you override step 2._

It will use your configuration instead of the automatically generated one.
You can get inspiration from the [generated config](#generated-config) to get started.

> This example is still making use of the workflow detection so `my.own.copy.bara.sky` must contain a **push** and a **pr** workflow

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

      - uses: olivr/copybara-action@v1.2.1
        with:
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          sot_repo: your/repo
          destination_repo: other/repo
          custom_config: my.own.copy.bara.sky
```

### Completely custom

_The following will let you override step 1, 2 and let you customize how Copybara Action will perform step 3._

It doesn't make use of any of our helpers for detecting the workflow and generating the configuration.
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

      - uses: olivr/copybara-action@v1.2.1
        with:
          access_token: ${{ secrets.GH_TOKEN }}
          ssh_key: ${{ secrets.SSH_KEY }}
          workflow: create
          custom_config: my.own.copy.bara.sky
          copybara_image: sharelatex/copybara
          copybara_options: --force --init-history
```

### SoT not on GitHub

This action's auto-generated configuration was made for a use case with two GitHub repos. However, if your SoT is not on GitHub, this action is still helpful.
Use it on your destination with a custom config and a specific workflow:

```yaml
on:
  pull_request_target:
jobs:
  move-code:
    runs-on: ubuntu-latest
    steps:
      - uses: olivr/copybara-action@v1.2.1
        with:
          ssh_key: ${{ secrets.SSH_KEY }}
          workflow: pr
          custom_config: my.own.copy.bara.sky
```

### [More options](inputs.md)

## Generated config

So you don't have to start your custom config from scratch, you can check out the [config template](/src/copy.bara.sky.ts) used by this action or even better, you can download the one generated for your use case.

1. In your repo(s), add the secret `ACTIONS_STEP_DEBUG` and set it to `true`
2. Run the action workflow (ie. push a commit to SoT and create a PR in destination)
3. Check out the artifacts for your action workflow runs
4. **Delete the `ACTIONS_STEP_DEBUG` secret or set it to `false`** (or you may get false positives)

It will look like this:
![artifact](images/artifact.png)
