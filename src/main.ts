import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import path from "path";
import { context } from "@actions/github";
import { CopyBara } from "./copybara";
import { exitCodes } from "./exitCodes";
import { GitHub } from "./github";
import { homedir } from "os";
import { hostConfig } from "./hostConfig";
import { pathExists, readFileSync } from "fs-extra";

async function run(): Promise<void> {
  // Format inputs
  const sshKey: string = core.getInput("ssh_key", { required: true });
  const sotRepo: string = core.getInput("sot_repo");
  const destinationRepo: string = core.getInput("destination_repo");
  const accessToken: string = core.getInput("access_token");
  let sotBranch: string = core.getInput("sot_branch");
  let destinationBranch: string = core.getInput("destination_branch");
  let workflow: string = core.getInput("workflow");
  let prNumber: string | number = core.getInput("pr_number");
  const knownHosts: string = core.getInput("ssh_known_hosts");
  const makeRootPath: string = core.getInput("make_root_path");
  const committer: string = core.getInput("committer");
  const defaultAuthor: string = core.getInput("default_author");
  const customConfig: string = core.getInput("custom_config");
  const copybaraImage: string = core.getInput("copybara_image");
  const copybaraImageTag: string = core.getInput("copybara_image_tag");
  const createRepo: boolean = core.getInput("create_repo") == "true" ? true : false;
  const copybaraOptions: string[] = !core.getInput("copybara_options")
    ? []
    : core
        .getInput("copybara_options")
        .replace(/\s*,\s*/, ",")
        .split(",");
  const includeFilesSot: string[] = !core.getInput("include_files_sot")
    ? []
    : core
        .getInput("include_files_sot")
        .replace(/\s*,\s*/, ",")
        .split(",");
  const excludeFilesSot: string[] = !core.getInput("exclude_files_sot")
    ? []
    : core
        .getInput("exclude_files_sot")
        .replace(/\s*,\s*/, ",")
        .split(",");
  const includeFilesDest: string[] = !core.getInput("include_files_dest")
    ? []
    : core
        .getInput("include_files_dest")
        .replace(/\s*,\s*/, ",")
        .split(",");
  const excludeFilesDest: string[] = !core.getInput("exclude_files_dest")
    ? []
    : core
        .getInput("exclude_files_dest")
        .replace(/\s*,\s*/, ",")
        .split(",");

  // Detect workflow if none specified
  if (!workflow) {
    core.debug("Detect workflow");

    if (!sotRepo || !destinationRepo)
      exit(51, 'You need to set values for "sot_repo" & "destination_repo" or set a value for "workflow".');

    // Detect current repo
    const currentRepo = `${context.repo.owner}/${context.repo.repo}`;
    core.debug(`  Current repo is ${currentRepo}`);

    // Detect if current repo is SoT or destination
    if (currentRepo == destinationRepo) {
      if (!context.payload.pull_request) exit(54, "Nothing to do in the destination repo except for Pull Requests.");
      else workflow = "pr";
    } else if (currentRepo == sotRepo) {
      if (context.eventName != "push") exit(54, "Nothing to do in the SoT repo except for push events.");
      else {
        if (!accessToken)
          exit(
            51,
            'You need to manually set the "workflow" value to "push" or "init" OR set a value for "access_token".'
          );

        const gh = new GitHub(accessToken);

        // Detect SoT branch if none specified
        sotBranch = sotBranch ? sotBranch : await gh.getDefaultBranch(sotRepo);

        // Determine destination branch if none specified
        destinationBranch = destinationBranch ? destinationBranch : sotBranch;

        workflow = (await gh.branchExists(destinationRepo, destinationBranch, createRepo)) ? "push" : "init";
      }

      core.debug(`Workflow is ${workflow}`);
    } else
      exit(
        51,
        'This repo is neither the SoT nor destination repo. Therefore, this action cannot detect the Copybara workflow to run. You need to set a value for "workflow" or run this action in the SoT or destination repo.'
      );
  }

  // Detect PR number if none specified
  if (workflow == "pr" && !prNumber) {
    core.debug("Detect Pull Request number");

    if (context.payload.pull_request) {
      prNumber = context.payload.pull_request.number;
      core.debug(`Pull Request number is ${prNumber}`);
    } else exit(53, "Cannot detect which pull request to use, please specify a PR number manually.");
  }

  // Load Copybara configuration
  let config = "";
  if (!customConfig) {
    // Build copybara config if none was specified
    core.debug("Build Copybara config");

    if (!sotRepo || !destinationRepo)
      exit(51, 'You need to set values for "sot_repo" & "destination_repo" or set a value for "custom_config".');

    if (!sotBranch && !accessToken) exit(51, 'You need to set a value for "sot_branch" or "access_token".');

    if (!committer) exit(51, 'You need to set a value for "committer".');

    if (!defaultAuthor) exit(51, 'You need to set a value for "default_author".');

    if (!copybaraImage) exit(51, 'You need to set a value for "copybara_image".');

    if (!copybaraImageTag) exit(51, 'You need to set a value for "copybara_image_tag".');

    if (!includeFilesSot.length) exit(51, 'You need to set a value for "include_files_sot".');

    if (!includeFilesDest.length) exit(51, 'You need to set a value for "include_files_dest".');

    // Detect SoT branch if none specified
    if (!sotBranch) {
      const gh = new GitHub(accessToken);
      sotBranch = await gh.getDefaultBranch(sotRepo);
    }

    // Determine destination branch if none specified
    destinationBranch = destinationBranch ? destinationBranch : sotBranch;

    config = CopyBara.getConfig(workflow, {
      // Required
      sotRepo,
      destinationRepo,
      sotBranch,
      destinationBranch,
      committer,
      defaultAuthor,
      copybaraImage,
      includeFilesSot,

      // Optional
      excludeFilesSot,
      includeFilesDest,
      excludeFilesDest,
      makeRootPath,
      prNumber,
    });
  } else {
    // Load custom config if it was specified
    const configFile = path.join(process.cwd(), customConfig);
    core.debug(`Load custom Copybara config from ${configFile}`);

    if (!pathExists(configFile)) exit(51, `Cannot find the config file ${configFile}`);

    config = readFileSync(configFile, "utf8");
  }

  // Save various configuration files
  core.debug("Save config files");
  await hostConfig.saveSshKey(sshKey);
  await hostConfig.saveAccessToken(accessToken);
  await hostConfig.saveCommitter(committer);
  await hostConfig.saveKnownHosts(knownHosts);
  await hostConfig.saveCopybaraConfig(config);

  // Upload Copybara config as an artifact
  if (core.isDebug()) {
    const artifactClient = artifact.create();
    artifactClient.uploadArtifact("copy.bara.sky", [hostConfig.cbConfigPath], homedir());
  }

  // Download Copybara image
  core.debug(`Download Copybara from ${copybaraImage}:${copybaraImageTag}`);
  const cb = new CopyBara(copybaraImage, copybaraImageTag);
  await cb.download();

  // Run Copybara
  core.debug("Run Copybara");
  cb.run(workflow, copybaraOptions, prNumber).then(exit).catch(exit);
}

// Action fails on 'throw'
process.on("unhandledRejection", (err) => exit(53, err as string));

// Exit action
function exit(exitCode: number, message = "") {
  const ec = Object.prototype.hasOwnProperty.call(exitCodes, exitCode) ? exitCodes[exitCode] : exitCodes[53];

  const msg = `[${ec.ns}] ${exitCode}: ${message ? message : ec.msg}`;
  core.setOutput("msg", msg);

  switch (ec.type) {
    case "success":
      core.info(msg);
      process.exit(0); // eslint-disable-line no-process-exit

    case "warning":
      core.warning(msg);
      process.exit(0); // eslint-disable-line no-process-exit

    default:
      core.setFailed(msg);
      process.exit(1); // eslint-disable-line no-process-exit
  }
}

run();
