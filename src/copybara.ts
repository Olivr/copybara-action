import { exec } from "@actions/exec";
import { exitCodes } from "./exitCodes";
import { hostConfig } from "./hostConfig";

export class CopyBara {
  constructor(readonly image: string, readonly imageTag: string) {}

  public static getConfig(workflow: string, config: CopybaraConfig): string {
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
    return exec(`docker pull ${this.image}:${this.imageTag}`);
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
        this.image,
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
    const exclude =
      config.excludeFilesSot && config.excludeFilesSot[0] ? `, exclude = ["${config.excludeFilesSot.join('",')}"]` : "";

    const move = config.makeRootPath ? `core.move("${config.makeRootPath}", ""),` : "";

    return `
core.workflow(
    name = "push",
    origin = git.github_origin(
        url = "git@github.com:${config.sotRepo}.git",
        ref = "${config.sotBranch}",
    ),
    destination = git.github_destination(
        url = "git@github.com:${config.destinationRepo}.git",
        push = "${config.destinationBranch}",
    ),
    origin_files = glob(["${config.includeFilesSot.join('",')}"]${exclude}),
    authoring = authoring.pass_thru(default = "${config.defaultAuthor}"),
    mode = "ITERATIVE",
    transformations = [
        metadata.restore_author("ORIGINAL_AUTHOR", search_all_changes=True),
        metadata.expose_label("COPYBARA_INTEGRATE_REVIEW"),
        ${move}
    ],
)`;
  }

  private static prConfig(config: CopybaraConfig): string {
    const exclude =
      config.excludeFilesDest && config.excludeFilesDest[0]
        ? `, exclude = ["${config.excludeFilesDest.join('",')}"]`
        : "";

    const move = config.makeRootPath ? `core.move("", "${config.makeRootPath}"),` : "";

    return `
core.workflow(
    name = "pr",
    origin = git.github_pr_origin(
        url = "git@github.com:${config.destinationRepo}.git",
        branch = "${config.destinationBranch}",
    ),
    destination = git.github_pr_destination(
        url = "git@github.com:${config.sotRepo}.git",
        destination_ref = "${config.sotBranch}",
        integrates = [],
    ),
    origin_files = glob(["${config.includeFilesDest.join('",')}"]${exclude}),
    authoring = authoring.pass_thru(default = "${config.defaultAuthor}"),
    mode = "CHANGE_REQUEST",
    set_rev_id = False,
    transformations = [
        metadata.save_author("ORIGINAL_AUTHOR"),
        metadata.expose_label("GITHUB_PR_NUMBER", new_name ="Closes", separator=" ${config.destinationRepo}#"),
        ${move}
    ],
)`;
  }
}

type CopybaraConfig = {
  // Required
  sotRepo: string;
  destinationRepo: string;
  sotBranch: string;
  destinationBranch: string;
  committer: string;
  defaultAuthor: string;
  copybaraImage: string;
  includeFilesSot: Array<string>;
  includeFilesDest: Array<string>;

  // Optional
  excludeFilesSot?: Array<string>;
  excludeFilesDest?: Array<string>;
  makeRootPath?: string;
  prNumber?: string | number;
};
