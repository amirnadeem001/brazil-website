import "server-only";
import {
  GitHubConfigError,
  createGitHubClient,
  getGitHubConfig,
} from "@/lib/github/client";
import type { GitHubConnectionStatus } from "@/lib/github/types";

export type { GitHubConnectionStatus } from "@/lib/github/types";

function httpStatusFromError(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }
  const status = (error as { status: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function isRateLimited(error: unknown, status: number | undefined): boolean {
  if (status === 429) return true;
  if (status !== 403 || !error || typeof error !== "object") return false;

  const headers =
    "response" in error
      ? (error as { response?: { headers?: Record<string, string> } }).response
          ?.headers
      : undefined;
  const remaining = headers?.["x-ratelimit-remaining"];
  return remaining === "0";
}

function safeGitHubError(error: unknown, phase: "repo" | "branch"): string {
  const status = httpStatusFromError(error);

  if (status === 401) {
    return "O token do GitHub é inválido ou expirou.";
  }

  if (isRateLimited(error, status)) {
    return "Limite de taxa do GitHub excedido. Tente novamente mais tarde.";
  }

  if (status === 403) {
    return "Acesso ao GitHub foi negado.";
  }

  if (status === 404) {
    return phase === "branch"
      ? "A branch do GitHub configurada não foi encontrada."
      : "Repositório não encontrado ou o token não tem acesso.";
  }

  return "O GitHub está temporariamente indisponível.";
}

function logSafeGitHubError(phase: "repo" | "branch", error: unknown): void {
  const status = httpStatusFromError(error);
  console.error("[github-status]", { phase, status });
}

/**
 * Read-only check that the configured GitHub repository and branch exist
 * and are accessible. Does not create, update, or delete anything.
 */
export async function getGitHubConnectionStatus(): Promise<GitHubConnectionStatus> {
  try {
    const config = getGitHubConfig();
    const octokit = createGitHubClient(config.token);

    try {
      await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });
    } catch (error) {
      logSafeGitHubError("repo", error);
      return {
        connected: false,
        error: safeGitHubError(error, "repo"),
      };
    }

    try {
      await octokit.rest.repos.getBranch({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
      });
    } catch (error) {
      logSafeGitHubError("branch", error);
      return {
        connected: false,
        error: safeGitHubError(error, "branch"),
      };
    }

    return {
      connected: true,
      owner: config.owner,
      repository: config.repo,
      branch: config.branch,
    };
  } catch (error) {
    if (error instanceof GitHubConfigError) {
      return {
        connected: false,
        error: error.message,
      };
    }

    logSafeGitHubError("repo", error);
    return {
      connected: false,
      error: "O GitHub está temporariamente indisponível.",
    };
  }
}
