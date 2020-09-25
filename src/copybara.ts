import { exec } from "@actions/exec";
import { exitCodes } from "./exit";
import { hostConfig } from "./hostConfig";

export class CopyBara {
  constructor(readonly image: DockerConfig) {}

  public static validateConfig(config: CopybaraConfig, workflow: string) {
    if (!config.committer) throw 'You need to set a value for "committer".';
    if (!config.image.name) throw 'You need to set a value for "copybara_image".';
    if (!config.image.tag) throw 'You need to set a value for "copybara_image_tag".';
    if (workflow == "push" && !config.push.include.length) throw 'You need to set a value for "push_include_files".';
    if (workflow == "pr" && !config.pr.include.length) throw 'You need to set a value for "pr_include_files".';
    if (!config.sot.repo || !config.destination.repo)
      throw 'You need to set values for "sot_repo" & "destination_repo" or set a value for "custom_config".';
  }

  public static getConfig(workflow: string, config: CopybaraConfig): string {
    this.validateConfig(config, workflow);

    switch (workflow) {
      case "init":
        return this.pushConfig(config);
      case "push":
        return this.pushConfig(config);
      case "pr":
        return this.prConfig(config);
      default:
        throw "This tool can only generate configuration files for workflows of type init, push or pr.";
    }
  }

  public async download(): Promise<number> {
    return exec("docker", ["pull", `${this.image.name}:${this.image.tag}`]);
  }

  public async run(workflow: string, copybaraOptions: string[], ref: string | number = ""): Promise<number> {
    switch (workflow) {
      case "init":
        return this.exec(["-e", "COPYBARA_WORKFLOW=push"], ["--force", "--init-history", ...copybaraOptions]);

      case "pr":
        return this.exec(["-e", "COPYBARA_WORKFLOW=pr", "-e", `COPYBARA_SOURCEREF=${ref}`], copybaraOptions);

      default:
        return this.exec(["-e", `COPYBARA_WORKFLOW=${workflow}`], copybaraOptions);
    }
  }

  private async exec(dockerParams: string[] = [], copybaraOptions: string[] = []): Promise<number> {
    const cbOptions = !copybaraOptions.length ? [] : [`-e`, `COPYBARA_OPTIONS`];

    const execExitCode = await exec(
      `docker`,
      [
        "run",
        `-v`,
        `${process.cwd()}:/usr/src/app`,
        `-v`,
        `${hostConfig.sshKeyPath}:/root/.ssh/id_rsa`,
        `-v`,
        `${hostConfig.knownHostsPath}:/root/.ssh/known_hosts`,
        `-v`,
        `${hostConfig.cbConfigPath}:/root/copy.bara.sky`,
        `-v`,
        `${hostConfig.gitConfigPath}:/root/.gitconfig`,
        `-v`,
        `${hostConfig.gitCredentialsPath}:/root/.git-credentials`,
        `-e`,
        `COPYBARA_CONFIG=/root/copy.bara.sky`,
        ...dockerParams,
        ...cbOptions,
        this.image.name,
        "copybara",
      ],
      {
        ignoreReturnCode: true,
        env: { COPYBARA_OPTIONS: copybaraOptions.join(" ") },
      }
    );

    const exitCode = exitCodes[execExitCode];

    if (exitCode && exitCode.ns == "copybara") {
      // success/warning
      if (exitCode.type == "success" || exitCode.type == "warning") return execExitCode;
      // known errors
      else throw execExitCode;
    } // unknown error
    else throw 52;
  }

  private static pushConfig(config: CopybaraConfig): string {
    let move = "";
    let includeGlobs = config.push.include;
    let excludeGlobs = config.push.exclude;

    if (config.makeRoot) {
      move = `core.move("${config.makeRoot}", ""),`;
      includeGlobs = includeGlobs.map((glob) => glob.replace(/^\/?/, `${config.makeRoot}/`));
      excludeGlobs = excludeGlobs.map((glob) => glob.replace(/^\/?/, `${config.makeRoot}/`));
    }

    const exclude = excludeGlobs[0] ? `, exclude = ["${excludeGlobs.join('",')}"]` : "";

    return `
core.workflow(
    name = "push",
    origin = git.origin(
        url = "file:///usr/src/app",
        ref = "${config.sot.branch}",
    ),
    destination = git.github_destination(
        url = "git@github.com:${config.destination.repo}.git",
        push = "${config.destination.branch}",
    ),
    origin_files = glob(["${includeGlobs.join('",')}"]${exclude}),
    authoring = authoring.pass_thru(default = "${config.committer}"),
    mode = "ITERATIVE",
    transformations = [
        metadata.restore_author("ORIGINAL_AUTHOR", search_all_changes=True),
        metadata.expose_label("COPYBARA_INTEGRATE_REVIEW"),
        ${move}
    ],
)`;
  }

  private static prConfig(config: CopybaraConfig): string {
    const move = config.makeRoot ? `core.move("", "${config.makeRoot}"),` : "";
    const includeGlobs = config.pr.include;
    const excludeGlobs = config.pr.exclude;
    const exclude = excludeGlobs[0] ? `, exclude = ["${excludeGlobs.join('",')}"]` : "";

    return `
core.workflow(
    name = "pr",
    origin = git.github_pr_origin(
        url = "git@github.com:${config.destination.repo}.git",
        branch = "${config.destination.branch}",
    ),
    destination = git.github_pr_destination(
        url = "git@github.com:${config.sot.repo}.git",
        destination_ref = "${config.sot.branch}",
        integrates = [],
    ),
    origin_files = glob(["${includeGlobs.join('",')}"]${exclude}),
    authoring = authoring.pass_thru(default = "${config.committer}"),
    mode = "CHANGE_REQUEST",
    set_rev_id = False,
    transformations = [
        metadata.save_author("ORIGINAL_AUTHOR"),
        metadata.expose_label("GITHUB_PR_NUMBER", new_name ="Closes", separator=" ${config.destination.repo}#"),
        ${move}
    ],
)`;
  }
}

export type CopybaraConfig = {
  // Common config
  sot: RepoConfig;
  destination: RepoConfig;
  makeRoot: string;
  committer: string;

  // Push config
  push: WorkflowConfig;

  // PR config
  pr: WorkflowConfig;

  // Advanced config
  customConfig: string;
  workflow: string;
  copybaraOptions: string[];
  knownHosts: string;
  prNumber: string | number;
  createRepo: boolean;
  image: DockerConfig;
};

export type RepoConfig = {
  repo: string;
  branch: string;
};

export type DockerConfig = {
  name: string;
  tag: string;
};

export type WorkflowConfig = {
  include: string[];
  exclude: string[];
  move: string[];
  replace: string[];
};
