import "server-only";

import {
  GitHubConfigError,
  createGitHubClient,
  getGitHubConfig,
} from "@/lib/github/client";
import { isValidSlug } from "@/lib/posts/slug";

export const GITHUB_BLOG_DIR = "content/blog";

export class PostPublishError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PostPublishError";
    this.status = status;
  }
}

export type PublishAction = "created" | "updated";

export type PublishResult = {
  action: PublishAction;
  slug: string;
  path: string;
};

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

function safePublishError(error: unknown, action: PublishAction): PostPublishError {
  const status = httpStatusFromError(error);

  if (status === 401) {
    return new PostPublishError(502, "O token do GitHub é inválido ou expirou.");
  }

  if (isRateLimited(error, status)) {
    return new PostPublishError(429, "Limite de taxa do GitHub excedido. Tente novamente mais tarde.");
  }

  if (status === 403) {
    return new PostPublishError(
      403,
      "O token do GitHub não tem permissão para enviar arquivos."
    );
  }

  if (status === 404) {
    return new PostPublishError(502, "Repositório ou branch não encontrado.");
  }

  if (status === 409 || status === 422) {
    if (action === "created") {
      return new PostPublishError(409, "Já existe um post com este slug.");
    }
    return new PostPublishError(
      409,
      "O post foi alterado no GitHub. Recarregue o editor e tente novamente."
    );
  }

  return new PostPublishError(502, "Não foi possível publicar o post no GitHub.");
}

export function blogMdxPath(slug: string): string | null {
  if (!isValidSlug(slug)) return null;
  return `${GITHUB_BLOG_DIR}/${slug}.mdx`;
}

async function getExistingFileSha(
  octokit: ReturnType<typeof createGitHubClient>,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data) || data.type !== "file" || typeof data.sha !== "string") {
      throw new PostPublishError(500, "Não foi possível ler o arquivo do post no GitHub.");
    }

    return data.sha;
  } catch (error) {
    if (error instanceof PostPublishError) {
      throw error;
    }
    if (httpStatusFromError(error) === 404) {
      return null;
    }
    throw error;
  }
}

export async function publishMdxToGitHub(options: {
  slug: string;
  mdx: string;
  originalSlug?: string;
}): Promise<PublishResult> {
  const slug = options.slug.trim();
  const path = blogMdxPath(slug);
  if (!path) {
    throw new PostPublishError(400, "O slug deve ser minúsculo, seguro para URL e sem espaços.");
  }

  const originalSlug = options.originalSlug?.trim();
  if (originalSlug && originalSlug !== slug) {
    throw new PostPublishError(
      400,
      "Alterar o slug de um post publicado ainda não é suportado."
    );
  }

  try {
    const config = getGitHubConfig();
    const octokit = createGitHubClient(config.token);
    const existingSha = await getExistingFileSha(
      octokit,
      config.owner,
      config.repo,
      path,
      config.branch
    );

    const wantsUpdate = Boolean(originalSlug);
    if (wantsUpdate && !existingSha) {
      throw new PostPublishError(
        404,
        "O post não foi encontrado no GitHub. Recarregue o editor e tente novamente."
      );
    }
    if (!wantsUpdate && existingSha) {
      throw new PostPublishError(409, "Já existe um post com este slug.");
    }

    const action: PublishAction = existingSha ? "updated" : "created";

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path,
      message:
        action === "created"
          ? `cms: publish post ${slug}`
          : `cms: update post ${slug}`,
      content: Buffer.from(options.mdx, "utf8").toString("base64"),
      branch: config.branch,
      ...(existingSha ? { sha: existingSha } : {}),
    });

    return { action, slug, path };
  } catch (error) {
    if (error instanceof PostPublishError) {
      throw error;
    }
    if (error instanceof GitHubConfigError) {
      throw new PostPublishError(500, error.message);
    }
    console.error("[github-post-publish]", {
      status: httpStatusFromError(error),
    });
    throw safePublishError(error, originalSlug ? "updated" : "created");
  }
}
