export declare class CopyBara {
    readonly image: DockerConfig;
    constructor(image: DockerConfig);
    download(): Promise<number>;
    run(workflow: string, copybaraOptions: string[], ref?: string | number): Promise<number>;
    static getConfig(workflow: string, config: CopybaraConfig): string;
    private exec;
    private static validateConfig;
    private static generateInExcludes;
    private static generateTransformations;
    private static transformer;
}
export type CopybaraConfig = {
    sot: RepoConfig;
    destination: RepoConfig;
    committer: string;
    push: WorkflowConfig;
    pr: WorkflowConfig;
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
//# sourceMappingURL=copybara.d.ts.map