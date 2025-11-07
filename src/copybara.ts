import { exec } from "@actions/exec";
import { pathExistsSync } from "fs-extra";
import { copyBaraSky } from "./copy.bara.sky.js";
import { exitCodes } from "./exit.js";
import { hostConfig } from "./hostConfig.js";

export class CopyBara {
  constructor(readonly image: DockerConfig) {}

  public async download(): Promise<number> {
    return exec("docker", ["pull", `${this.image.name}:${this.image.tag}`]);
  }

  public async run(workflow: string, copybaraOptions: string[], ref: string | number = ""): Promise<number> {
    // If copybara_options contains a workflow name (starts with "migrate"), don't pass COPYBARA_WORKFLOW env var
    // This allows users to specify the exact workflow name in their custom config
    const hasWorkflowInOptions = copybaraOptions.some(opt => opt.includes("migrate") || opt.includes("copy.bara.sky"));

    switch (workflow) {
      case "init":
        return this.exec(
          ["-e", "COPYBARA_WORKFLOW=push"],
          ["--force", "--init-history", "--ignore-noop", ...copybaraOptions],
        );

      case "pr":
        return this.exec(
          ["-e", "COPYBARA_WORKFLOW=pr", "-e", `COPYBARA_SOURCEREF=${ref}`],
          ["--ignore-noop", ...copybaraOptions],
        );

      default:
        // Don't pass COPYBARA_WORKFLOW if the user is specifying the full copybara command
        if (hasWorkflowInOptions) {
          return this.exec([], ["--ignore-noop", ...copybaraOptions]);
        }
        return this.exec(["-e", `COPYBARA_WORKFLOW=${workflow}`], ["--ignore-noop", ...copybaraOptions]);
    }
  }

  public static getConfig(workflow: string, config: CopybaraConfig): string {
    this.validateConfig(config, workflow);
    return copyBaraSky(
      `git@github.com:${config.sot.repo}.git`,
      config.sot.branch,
      `git@github.com:${config.destination.repo}.git`,
      config.destination.branch,
      config.committer,
      "file:///usr/src/app",
      this.generateInExcludes(config.push.include),
      this.generateInExcludes(config.push.exclude),
      this.generateTransformations(config.push.move, config.push.replace, "push"),
      this.generateInExcludes(config.pr.include),
      this.generateInExcludes(config.pr.exclude),
      this.generateTransformations(config.pr.move, config.pr.replace, "pr"),
    );
  }

  private async exec(dockerParams: string[] = [], copybaraOptions: string[] = []): Promise<number> {
    const dockerArgs = [
      "run",
      `-v`,
      `${process.cwd()}:/usr/src/app`,
    ];

    // Only mount SSH key if it exists
    if (pathExistsSync(hostConfig.sshKeyPath)) {
      dockerArgs.push(`-v`, `${hostConfig.sshKeyPath}:/root/.ssh/id_rsa`);
    }

    // Check if copybara_options contains a config file path (user is providing full command)
    const hasConfigInOptions = copybaraOptions.some(opt => opt.includes(".bara.sky"));

    dockerArgs.push(
      `-v`,
      `${hostConfig.knownHostsPath}:/root/.ssh/known_hosts`,
      `-v`,
      `${hostConfig.cbConfigPath}:/root/copy.bara.sky`,
      `-v`,
      `${hostConfig.gitConfigPath}:/root/.gitconfig`,
      `-v`,
      `${hostConfig.gitCredentialsPath}:/root/.git-credentials`,
    );

    // Only set COPYBARA_CONFIG if user isn't providing config file in options
    if (!hasConfigInOptions) {
      dockerArgs.push(`-e`, `COPYBARA_CONFIG=/root/copy.bara.sky`);
    }

    dockerArgs.push(
      ...dockerParams,
      this.image.name,
      "copybara",
      ...copybaraOptions,
    );

    const execExitCode = await exec(`docker`, dockerArgs,
      {
        ignoreReturnCode: true,
      },
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

  private static validateConfig(config: CopybaraConfig, workflow: string) {
    if (!config.committer) throw 'You need to set a value for "committer".';
    if (!config.image.name) throw 'You need to set a value for "copybara_image".';
    if (!config.image.tag) throw 'You need to set a value for "copybara_image_tag".';
    if (workflow == "push" && !config.push.include.length) throw 'You need to set a value for "push_include".';
    if (workflow == "pr" && !config.pr.include.length) throw 'You need to set a value for "pr_include".';
    if (!config.sot.repo || !config.destination.repo)
      throw 'You need to set values for "sot_repo" & "destination_repo" or set a value for "custom_config".';
  }

  private static generateInExcludes(inExcludesArray: string[]) {
    const inExcludeGlobs = inExcludesArray.filter((v) => v);
    let inExcludeString = "";

    if (inExcludeGlobs.length) inExcludeString = `"${inExcludeGlobs.join('","')}"`;
    return inExcludeString;
  }

  private static generateTransformations(moves: string[], replacements: string[], type: "push" | "pr") {
    const move = this.transformer(moves, "move");
    const replace = this.transformer(replacements, "replace");

    return type == "push"
      ? // Move first then replace for push
        move.concat(replace)
      : // Replace first then move for PR
        replace.concat(move);
  }

  private static transformer(list: string[], method: string) {
    let transformation = "";

    list.forEach((item) => {
      if (item) {
        const [from, to = "", path] = item.split("||");
        const glob = path ? path : "**";

        transformation = transformation.concat(`
        core.${method}("${from}", "${to}", paths = glob(["${glob}"])),`);
      }
    });

    return transformation;
  }
}

export type CopybaraConfig = {
  // Common config
  sot: RepoConfig;
  destination: RepoConfig;
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
