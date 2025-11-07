import * as core from "@actions/core";
import { CopybaraAction } from "./copybaraAction.js";
import { exit } from "./exit.js";

const action = new CopybaraAction({
  // Credentials
  sshKey: core.getInput("ssh_key"),
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
  committer: core.getInput("committer"),

  // Push config
  push: {
    include: core.getInput("push_include").split(" "),
    exclude: core.getInput("push_exclude").split(" "),
    move: core.getInput("push_move").split(/\r?\n/),
    replace: core.getInput("push_replace").split(/\r?\n/),
  },

  // PR config
  pr: {
    include: core.getInput("pr_include").split(" "),
    exclude: core.getInput("pr_exclude").split(" "),
    move: core.getInput("pr_move").split(/\r?\n/),
    replace: core.getInput("pr_replace").split(/\r?\n/),
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
} else {
  core.debug("BEWARE: Debug mode is on, this could result in this action succeeding while it didn't. Check the logs.");
  action.run().then(exit);
}
