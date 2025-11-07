import { DefaultArtifactClient } from "@actions/artifact";
import * as core from "@actions/core";
import { context } from "@actions/github";
import { pathExists, readFileSync } from "fs-extra";
import { homedir } from "os";
import * as path from "path";
import { CopyBara, CopybaraConfig, RepoConfig } from "./copybara.js";
import { exit } from "./exit.js";
import { GitHub } from "./github.js";
import { hostConfig } from "./hostConfig.js";

export class CopybaraAction {
  gh: GitHub | undefined;
  cbConfig: string | undefined;
  current: RepoConfig = { repo: "", branch: "" };

  constructor(readonly config: CopybaraActionConfig) {}

  getCurrentRepo() {
    if (!this.current.repo) this.current.repo = `${context.repo.owner}/${context.repo.repo}`;
    core.debug(`Current repo is ${this.current.repo}`);
    return this.current.repo;
  }

  getCurrentBranch() {
    if (!this.current.branch) {
      if (context.payload.pull_request && context.payload.pull_request.base.ref)
        this.current.branch = context.payload.pull_request.base.ref;
      else if (/^refs\/heads\//.test(context.ref)) this.current.branch = context.ref.replace(/^refs\/heads\//, "");
      else throw `Cannot determine head branch from ${context.payload.pull_request?.base.ref} and ${context.ref}`;
    }
    core.debug(`Current branch is ${this.current.branch}`);
    return this.current.branch;
  }

  getGitHubClient() {
    if (!this.gh) {
      if (!this.config.accessToken) throw "You need to specify an access_token";
      else this.gh = new GitHub(this.config.accessToken);
    }

    return this.gh;
  }

  async getSotBranch() {
    if (!this.config.sot.branch) {
      if (!this.config.sot.branch && !this.config.accessToken)
        throw 'You need to set a value for "sot_branch" or "access_token".';

      this.config.sot.branch = await this.getGitHubClient().getDefaultBranch(this.config.sot.repo);
    }

    core.debug(`SoT branch is ${this.config.sot.branch}`);
    return this.config.sot.branch;
  }

  async getDestinationBranch() {
    if (!this.config.destination.branch) this.config.destination.branch = await this.getSotBranch();

    core.debug(`Destination branch is ${this.config.destination.branch}`);
    return this.config.destination.branch;
  }

  getPRNumber() {
    // This might return an empty string
    if (!this.config.prNumber && context.payload.pull_request && context.payload.pull_request.number)
      this.config.prNumber = context.payload.pull_request.number;

    core.debug(`Current PR number is ${this.config.prNumber}`);
    return this.config.prNumber;
  }

  async getWorkflow() {
    if (!this.config.workflow) {
      core.debug("Detect workflow");
      if (!this.config.sot.repo || !this.config.destination.repo)
        exit(51, 'You need to set values for "sot_repo" & "destination_repo" or set a value for "workflow".');

      if (this.getCurrentRepo() === this.config.sot.repo) {
        if (context.eventName != "push") exit(54, "Nothing to do in the SoT repo except for push events.");

        const sotBranch = await this.getSotBranch();
        if (this.getCurrentBranch() != sotBranch)
          exit(54, `Nothing to do in the SoT repo except on the "${sotBranch}" branch.`);

        this.config.workflow = "push";
      } else if (this.getCurrentRepo() === this.config.destination.repo) {
        if (!this.getPRNumber()) exit(54, "Nothing to do in the destination repo except for Pull Requests.");

        const destinationBranch = await this.getDestinationBranch();
        if (this.getCurrentBranch() != destinationBranch)
          exit(54, `Nothing to do in the destination repo except for Pull Requests on '${destinationBranch}'.`);

        this.config.workflow = "pr";
      } else
        exit(
          51,
          'The current repo is neither the SoT nor destination repo. You need to set a value for "workflow" or run this action in the SoT or destination repo.',
        );
    }

    // Detect if init is needed when push is specified
    if (
      this.config.workflow == "push" &&
      this.getCurrentRepo() === this.config.sot.repo &&
      this.getCurrentBranch() == (await this.getSotBranch())
    )
      this.config.workflow = (await this.isInitWorkflow()) ? "init" : "push";

    core.debug(`Workflow is ${this.config.workflow}`);
    return this.config.workflow;
  }

  async isInitWorkflow() {
    core.debug("Detect if init workflow");

    if (!this.config.accessToken)
      exit(51, 'You need to manually set the "workflow" value to "push" or "init" OR set a value for "access_token".');

    return !(await this.getGitHubClient().branchExists(
      this.config.destination.repo,
      await this.getDestinationBranch(),
      this.config.createRepo,
    ));
  }

  async getCopybaraConfig() {
    if (!this.cbConfig) {
      if (this.config.customConfig) {
        const configFile = path.join(process.cwd(), this.config.customConfig);
        if (!pathExists(configFile)) exit(51, `Cannot find the config file ${configFile}`);
        core.debug(`Load custom Copybara config from ${configFile}`);
        this.cbConfig = readFileSync(configFile, "utf8");
      } else this.cbConfig = CopyBara.getConfig(await this.getWorkflow(), this.config);
    }

    return this.cbConfig;
  }

  async saveConfigFiles() {
    core.debug("Save config files");
    if (this.config.sshKey) await hostConfig.saveSshKey(this.config.sshKey);
    await hostConfig.saveAccessToken(this.config.accessToken);
    await hostConfig.saveCommitter(this.config.committer);
    await hostConfig.saveKnownHosts(this.config.knownHosts);
    await hostConfig.saveCopybaraConfig(await this.getCopybaraConfig());

    // Upload Copybara config as an artifact
    if (core.isDebug()) {
      const artifactClient = new DefaultArtifactClient();
      artifactClient.uploadArtifact("copy.bara.sky", [hostConfig.cbConfigPath], homedir());
    }
  }

  async run() {
    await this.saveConfigFiles();

    core.debug(`Download Copybara from ${this.config.image.name}:${this.config.image.tag}`);
    const cb = new CopyBara(this.config.image);
    await cb.download();

    core.debug("Run Copybara");
    return cb.run(await this.getWorkflow(), this.config.copybaraOptions, this.getPRNumber());
  }
}

interface CopybaraActionConfig extends CopybaraConfig {
  sshKey: string;
  accessToken: string;
}
