import "server-only";

import { publishMdxToGitHub } from "@/lib/github/posts";
import { parseEditorPostRequest } from "@/lib/posts/admin-request";
import { validateAndSerializePost } from "@/lib/posts/admin-validate";

export type PublishPostResult =
  | {
      ok: true;
      success: true;
      slug: string;
      path: string;
      action: "created" | "updated";
    }
  | {
      ok: false;
      error: string;
      fields?: Record<string, string>;
      status: number;
    };

export async function publishAdminPost(body: unknown): Promise<PublishPostResult> {
  const request = parseEditorPostRequest(body);
  if (!request) {
    return { ok: false, error: "Requisição inválida.", status: 400 };
  }

  const slug = request.post.slug.trim();
  if (request.mode === "edit") {
    const originalSlug = request.originalSlug?.trim() ?? "";
    if (!originalSlug || originalSlug !== slug) {
      return {
        ok: false,
        error: "Changing a published slug is not supported yet.",
        fields: { slug: "Changing a published slug is not supported yet." },
        status: 400,
      };
    }
  }

  const validated = await validateAndSerializePost(request);
  if (!validated.ok) {
    return {
      ok: false,
      error: validated.error,
      fields: validated.fields,
      status: 400,
    };
  }

  const published = await publishMdxToGitHub({
    slug,
    mdx: validated.mdx,
    originalSlug: request.mode === "edit" ? request.originalSlug : undefined,
  });

  return {
    ok: true,
    success: true,
    slug: published.slug,
    path: published.path,
    action: published.action,
  };
}
