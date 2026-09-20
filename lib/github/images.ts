import "server-only";

import {
  GitHubConfigError,
  createGitHubClient,
  getGitHubConfig,
} from "@/lib/github/client";
import {
  GITHUB_IMAGE_DIR,
  ImageUploadError,
  buildImageFilename,
  detectImageType,
  type DetectedImageType,
} from "@/lib/images/validate";

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

function safeUploadError(error: unknown): ImageUploadError {
  const status = httpStatusFromError(error);

  if (status === 401) {
    return new ImageUploadError(502, "O token do GitHub é inválido ou expirou.");
  }

  if (isRateLimited(error, status)) {
    return new ImageUploadError(429, "Limite de taxa do GitHub excedido. Tente novamente mais tarde.");
  }

  if (status === 403) {
    return new ImageUploadError(
      403,
      "O token do GitHub não tem permissão para enviar arquivos."
    );
  }

  if (status === 404) {
    return new ImageUploadError(
      502,
      "Repositório ou branch não encontrado."
    );
  }

  if (status === 409 || status === 422) {
    return new ImageUploadError(
      409,
      "Já existe uma imagem com este nome. Tente novamente."
    );
  }

  return new ImageUploadError(502, "Não foi possível enviar a imagem para o GitHub.");
}

async function fileExists(
  octokit: ReturnType<typeof createGitHubClient>,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<boolean> {
  try {
    await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    return true;
  } catch (error) {
    if (httpStatusFromError(error) === 404) {
      return false;
    }
    throw error;
  }
}

async function uniqueFilename(options: {
  octokit: ReturnType<typeof createGitHubClient>;
  owner: string;
  repo: string;
  branch: string;
  originalName: string;
  extension: DetectedImageType["extension"];
}): Promise<string> {
  const { octokit, owner, repo, branch, originalName, extension } = options;
  let filename = buildImageFilename(originalName, extension);
  let path = `${GITHUB_IMAGE_DIR}/${filename}`;

  if (!(await fileExists(octokit, owner, repo, path, branch))) {
    return filename;
  }

  filename = buildImageFilename(originalName, extension, String(Date.now()));
  path = `${GITHUB_IMAGE_DIR}/${filename}`;

  if (!(await fileExists(octokit, owner, repo, path, branch))) {
    return filename;
  }

  filename = buildImageFilename(
    originalName,
    extension,
    `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  );
  return filename;
}

export async function uploadImageToGitHub(options: {
  originalName: string;
  bytes: Uint8Array;
}): Promise<{ filename: string; path: string }> {
  const detected = detectImageType(options.bytes);
  if (!detected) {
    throw new ImageUploadError(
      400,
      "Somente imagens JPEG, PNG, WebP e GIF são permitidas."
    );
  }

  try {
    const config = getGitHubConfig();
    const octokit = createGitHubClient(config.token);
    const filename = await uniqueFilename({
      octokit,
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      originalName: options.originalName,
      extension: detected.extension,
    });
    const repoPath = `${GITHUB_IMAGE_DIR}/${filename}`;

    if (
      !filename ||
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      throw new ImageUploadError(400, "Nome de arquivo inválido.");
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: repoPath,
      message: `cms: upload image ${filename}`,
      content: Buffer.from(options.bytes).toString("base64"),
      branch: config.branch,
    });

    return {
      filename,
      path: `/images/${filename}`,
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }
    if (error instanceof GitHubConfigError) {
      throw new ImageUploadError(500, error.message);
    }
    console.error("[github-image-upload]", {
      status: httpStatusFromError(error),
    });
    throw safeUploadError(error);
  }
}
