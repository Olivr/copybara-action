import { getOctokit } from "@actions/github";
import { GitHub as ghAPI } from "@actions/github/lib/utils";

export class GitHub {
  api: InstanceType<typeof ghAPI>;

  constructor(accessToken: string) {
    this.api = getOctokit(accessToken);
  }

  async branchExists(repoFullName: string, branch: string, createRepo: boolean): Promise<boolean> {
    const [owner, repo] = repoFullName.split("/");

    return this.repoExists(owner, repo, createRepo).then((repoExists) => {
      if (repoExists) {
        return this.api.repos
          .getBranch({ owner, repo, branch })
          .then((res) => res.status == 200)
          .catch((err) => {
            if (err.status == 404) return false;
            else throw err;
          });
      } else return false;
    });
  }

  async getDefaultBranch(repoFullName: string): Promise<string> {
    const [owner, repo] = repoFullName.split("/");
    return this.api.repos.get({ owner, repo }).then((res) => res.data.default_branch);
  }

  private async repoExists(owner: string, repo: string, createRepo: boolean): Promise<boolean> {
    return this.api.repos
      .get({ owner, repo })
      .then((res) => res.status == 200)
      .catch((err) => {
        if (err.status == 404) {
          if (createRepo) return this.createRepo(owner, repo).then((res) => res.status == 200);
          else return false;
        } else throw err;
      });
  }

  private async createRepo(owner: string, repo: string) {
    const currentUser = await this.api.users.getAuthenticated().then((res) => res.data.name);

    return currentUser == owner
      ? this.api.repos.createForAuthenticatedUser({ name: repo })
      : this.api.repos.createInOrg({ org: owner, name: repo });
  }
}
