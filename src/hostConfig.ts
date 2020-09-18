import { ensureFile, writeFile } from 'fs-extra';
import { homedir } from 'os';

export class hostConfig {
  static gitConfigPath = homedir() + "/.gitconfig";
  static gitCredentialsPath = homedir() + "/.git-credentials";
  static sshKeyPath = homedir() + "/.ssh/id_rsa";
  static knownHostsPath = homedir() + "/.ssh/known_hosts";
  static cbConfigPath = homedir() + "/copy.bara.sky";

  static githubKnownHost =
    "github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==";

  static async saveCommitter(committer: string): Promise<void> {
    const match = committer.match(/^(.+)\s?<([^>]+)>/i);
    const committerName = match && match[1] ? match[1].trim() : "Github Actions";
    const committerEmail = match && match[2] ? match[2].trim() : "actions@github.com";

    return this.save(
      this.gitConfigPath,
      `
      [user]
          name = ${committerName}
          email = ${committerEmail}
      `
    );
  }

  static async saveAccessToken(accessToken: string): Promise<void> {
    return this.save(this.gitCredentialsPath, `https://user:${accessToken}@github.com`);
  }

  static async saveSshKey(sshKey: string): Promise<void> {
    return this.save(this.sshKeyPath, sshKey);
  }

  static async saveKnownHosts(knownHosts: string): Promise<void> {
    return this.save(this.knownHostsPath, `${this.githubKnownHost}\n${knownHosts}`);
  }

  static async saveCopybaraConfig(config: string): Promise<void> {
    return this.save(this.cbConfigPath, config);
  }

  static async save(file: string, content: string): Promise<void> {
    const filePath = file.replace("~", homedir());
    return ensureFile(filePath).then(() => writeFile(filePath, content));
  }
}
