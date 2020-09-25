import * as core from "@actions/core";
import { CopybaraAction } from "./copybaraAction";
import { exit } from "./exit";

const action = new CopybaraAction({
  // Credentials
  sshKey: core.getInput("ssh_key", { required: true }),
  accessToken: core.getInput("access_token"),

  // Common config
  sot: {
    repo: core.getInput("sot_repo"),
    branch: core.getInput("sot_branch"),
  },
  destination: {
    repo: core.getInput("destination_repo"),
    branch: core.getInput("destination_branch"),
  },
  makeRoot: core.getInput("make_root"),
  committer: core.getInput("committer"),

  // Push config
  push: {
    include: core.getInput("push_include_files").split(" "),
    exclude: core.getInput("push_exclude_files").split(" "),
    move: core.getInput("push_move_files").split(" "),
    replace: core.getInput("push_replace").split(" "),
  },

  // PR config
  pr: {
    include: core.getInput("pr_include_files").split(" "),
    exclude: core.getInput("pr_exclude_files").split(" "),
    move: core.getInput("pr_move_files").split(" "),
    replace: core.getInput("pr_replace").split(" "),
  },

  // Advanced config
  customConfig: core.getInput("custom_config"),
  workflow: core.getInput("workflow"),
  copybaraOptions: core.getInput("copybara_options").split(" "),
  knownHosts: core.getInput("ssh_known_hosts"),
  prNumber: core.getInput("pr_number"),
  createRepo: core.getInput("create_repo") == "yes" ? true : false,

  // Docker
  image: {
    name: core.getInput("copybara_image"),
    tag: core.getInput("copybara_image_tag"),
  },
});

if (!core.isDebug()) {
  // Action fails gracefully on 'throw'
  process.on("unhandledRejection", (err) => exit(53, err as string));
  action.run().then(exit).catch(exit);
} else action.run().then(exit);
