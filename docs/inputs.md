| Input              | Required | Default                             | Description                                                                                                             |
| ------------------ | -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ssh_key            | true     |                                     | SSH public key.                                                                                                         |
| sot_repo           | false    |                                     | Source repository (source of truth).                                                                                    |
| destination_repo   | false    |                                     | Destination repository.                                                                                                 |
| access_token       | false    |                                     | Personal access token.                                                                                                  |
| sot_branch         | false    |                                     | SoT branch. Leave empty to use your repository's default branch.                                                        |
| destination_branch | false    |                                     | Destination branch. Leave empty to use the same as your SoT's branch name.                                              |
| workflow           | false    |                                     | Workflow to execute. Leave empty to auto-detect (init / push / pr).                                                     |
| ssh_known_hosts    | false    |                                     | SSH known hosts file contents, for authenticating with Copybara                                                         |
| include_files_sot  | false    | **                                  | Files to include when pushing from SoT => Destination (comma separated globs).                                          |
| exclude_files_sot  | false    |                                     | Files to exclude when pushing from SoT => Destination (comma separated globs).                                          |
| include_files_dest | false    | **                                  | Files to include when pulling from Destination => SoT (comma separated globs).                                          |
| exclude_files_dest | false    |                                     | Files to exclude when pulling from Destination => SoT (comma separated globs).                                          |
| make_root_path     | false    |                                     | Use a sub-path of the source repo for the root path of the destination repo.                                            |
| committer          | false    | Github Actions <actions@github.com> | Who will commit changes.                                                                                                |
| default_author     | false    | Github Actions <actions@github.com> | Default author if the original author can't passed through.                                                             |
| copybara_image     | false    | olivr/copybara                      | Copybara Docker image to run.                                                                                           |
| copybara_image_tag | false    | latest                              | Copybara Docker image tag to use.                                                                                       |
| custom_config      | false    |                                     | Copybara configuration file to use.                                                                                     |
| pr_number          | false    |                                     | If you manually specified the 'pr' workflow, you will need to specify the PR number as well.                            |
| create_repo        | false    | true                                | If the destination repo doesn't exist, it will be created (subject to enough permissions attached to the access token). |
| copybara_options   | false    |                                     | Use this, if you want to manually specify some command line options.                                                    |
