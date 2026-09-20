import type { AdminEditorPost } from "@/lib/posts/admin-types";
import type { EditorMode } from "@/lib/posts/admin-validate";

export type EditorPostRequest = {
  mode: EditorMode;
  originalSlug?: string;
  post: AdminEditorPost;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asSlugList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseEditorPostRequest(body: unknown): EditorPostRequest | null {
  if (!body || typeof body !== "object") return null;

  const payload = body as {
    mode?: unknown;
    originalSlug?: unknown;
    post?: Record<string, unknown>;
  };

  if (payload.mode !== "create" && payload.mode !== "edit") {
    return null;
  }

  const postInput = payload.post;
  if (!postInput || typeof postInput !== "object") {
    return null;
  }

  return {
    mode: payload.mode,
    originalSlug:
      payload.mode === "edit" ? asString(payload.originalSlug) : undefined,
    post: {
      id: asString(postInput.id),
      slug: asString(postInput.slug),
      title: asString(postInput.title),
      category: asString(postInput.category),
      author: asString(postInput.author),
      date: asString(postInput.date),
      featuredImage: asString(postInput.featuredImage),
      excerpt: asString(postInput.excerpt),
      videoUrl: asString(postInput.videoUrl),
      relatedSlugs: asSlugList(postInput.relatedSlugs),
      content: asString(postInput.content),
    },
  };
}
