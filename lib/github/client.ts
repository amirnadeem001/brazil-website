import "server-only";
import { Octokit } from "@octokit/rest";

export type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

export type GitHubConfigCode =
  | "missing_token"
  | "missing_owner"
  | "missing_repo";

export class GitHubConfigError extends Error {
  readonly code: GitHubConfigCode;

  constructor(code: GitHubConfigCode, message: string) {
    super(message);
    this.name = "GitHubConfigError";
    this.code = code;
  }
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value.replace(/\\\$/g, "$");
}

export function getGitHubConfig(): GitHubConfig {
  const token = readEnv("GITHUB_TOKEN");
  if (!token) {
    throw new GitHubConfigError(
      "missing_token",
      "O token do GitHub não está configurado."
    );
  }

  const owner = readEnv("GITHUB_OWNER");
  if (!owner) {
    throw new GitHubConfigError(
      "missing_owner",
      "O owner do GitHub não está configurado."
    );
  }

  const repo = readEnv("GITHUB_REPO");
  if (!repo) {
    throw new GitHubConfigError(
      "missing_repo",
      "O repositório do GitHub não está configurado."
    );
  }

  const branch = readEnv("GITHUB_BRANCH") ?? "main";

  return { token, owner, repo, branch };
}

export function createGitHubClient(token: string): Octokit {
  return new Octokit({
    auth: token,
    userAgent: "mindreads-cms",
    log: {
      debug() {},
      info() {},
      warn() {},
      error() {},
    },
  });
}
