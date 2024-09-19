import { GitHub as ghAPI } from "@actions/github/lib/utils";
export declare class GitHub {
    api: InstanceType<typeof ghAPI>;
    constructor(accessToken: string);
    branchExists(repoFullName: string, branch: string, createRepo: boolean): Promise<boolean>;
    getDefaultBranch(repoFullName: string): Promise<string>;
    private repoExists;
    private createRepo;
}
//# sourceMappingURL=github.d.ts.map