import { CopybaraConfig, RepoConfig } from "./copybara.js";
import { GitHub } from "./github.js";
export declare class CopybaraAction {
    readonly config: CopybaraActionConfig;
    gh: GitHub | undefined;
    cbConfig: string | undefined;
    current: RepoConfig;
    constructor(config: CopybaraActionConfig);
    getCurrentRepo(): string;
    getCurrentBranch(): string;
    getGitHubClient(): GitHub;
    getSotBranch(): Promise<string>;
    getDestinationBranch(): Promise<string>;
    getPRNumber(): string | number;
    getWorkflow(): Promise<string>;
    isInitWorkflow(): Promise<boolean>;
    getCopybaraConfig(): Promise<string>;
    saveConfigFiles(): Promise<void>;
    run(): Promise<number>;
}
interface CopybaraActionConfig extends CopybaraConfig {
    sshKey: string;
    accessToken: string;
}
export {};
//# sourceMappingURL=copybaraAction.d.ts.map