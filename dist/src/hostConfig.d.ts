export declare class hostConfig {
    static gitConfigPath: string;
    static gitCredentialsPath: string;
    static sshKeyPath: string;
    static knownHostsPath: string;
    static cbConfigPath: string;
    static githubKnownHost: string;
    static saveCommitter(committer: string): Promise<void>;
    static saveAccessToken(accessToken: string): Promise<void>;
    static saveSshKey(sshKey: string): Promise<void>;
    static saveKnownHosts(knownHosts: string): Promise<void>;
    static saveCopybaraConfig(config: string): Promise<void>;
    static save(file: string, content: string): Promise<void>;
}
//# sourceMappingURL=hostConfig.d.ts.map