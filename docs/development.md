# Development

Install the dependencies

```sh
yarn install
```

Build the typescript and package it for distribution

```sh
yarn run build && yarn run package
```

Run the tests :heavy_check_mark:

```sh
yarn test
```

> As of writing this doc, there are no unit tests, just some E2E tests in `.github/workflows/test.*` which are run on every merge to `main`. **If you want to add unit tests or more E2E tests, please do so!**

## Debugging

In your repos, set the secret `ACTIONS_STEP_DEBUG` to `true`

The action outputs will be more verbose and you will also be able to download the generated `copy.bara.sky` configuration file.

![artifact](images/artifact.png)

## Validation

You can use [act](https://github.com/nektos/act) for faster feedback at least until Docker is run (Copybara download/run). I haven't had time to look into configuring act to load a runner with docker support.

1. Create file `.secrets`

   ```text
   GH_TOKEN="xxxxxxxxxxxxxxxxxxxxx"
   SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----xxxxxxxxxxxxxxx-----END OPENSSH PRIVATE KEY-----"
   ```

2. Run `act --secret-file=.secrets`

## Maintainers: Publish to a distribution branch

```sh
yarn run package
git add dist
git commit -m "Release"
git push origin releases/v1
```

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
