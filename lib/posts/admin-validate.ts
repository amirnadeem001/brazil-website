import "server-only";

import matter from "gray-matter";
import { getAllPosts } from "@/lib/posts";
import { TEST_POST_SLUG } from "@/lib/posts/admin";
import type { AdminEditorPost } from "@/lib/posts/admin-types";
import {
  serializeMdxPost,
  type SerializableMdxPost,
} from "@/lib/posts/mdx-serializer";
import {
  isPublicAssetPath,
  isReservedSlug,
  isValidPostDate,
  isValidSlug,
} from "@/lib/posts/slug";

export type EditorMode = "create" | "edit";

export type ValidatePostInput = {
  mode: EditorMode;
  originalSlug?: string;
  post: AdminEditorPost;
};

export type ValidatePostResult =
  | { ok: true; mdx: string }
  | { ok: false; error: string; fields: Record<string, string> };

function required(value: string, message: string): string | undefined {
  return value.trim().length > 0 ? undefined : message;
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

async function isValidMdxBody(content: string): Promise<boolean> {
  try {
    const mdx = await import("@mdx-js/mdx");
    await mdx.compile(content);
    return true;
  } catch {
    return false;
  }
}

export async function validateAndSerializePost(
  input: ValidatePostInput
): Promise<ValidatePostResult> {
  const fields: Record<string, string> = {};
  const post = input.post;
  const catalog = getAllPosts();
  const existingSlugs = new Set(catalog.map((item) => item.slug));
  const catalogSlugs = new Set(
    catalog
      .filter((item) => item.slug !== TEST_POST_SLUG)
      .map((item) => item.slug)
  );

  const title = required(post.title, "O título é obrigatório.");
  const slugValue = post.slug.trim();
  const category = required(post.category, "A categoria é obrigatória.");
  const author = required(post.author, "O autor é obrigatório.");
  const dateValue = post.date.trim();
  const excerpt = required(post.excerpt, "O resumo é obrigatório.");
  const content = required(post.content, "O conteúdo é obrigatório.");
  const featuredImage = post.featuredImage.trim();
  const videoUrl = post.videoUrl.trim();
  const relatedSlugs = post.relatedSlugs.map((slug) => slug.trim()).filter(Boolean);

  if (title) fields.title = title;
  if (!slugValue) {
    fields.slug = "O slug é obrigatório.";
  } else if (!isValidSlug(slugValue)) {
    fields.slug =
      "O slug deve ser minúsculo, seguro para URL e sem espaços.";
  } else if (isReservedSlug(slugValue)) {
    fields.slug = "Este slug é reservado pelo site.";
  } else if (input.mode === "create" && existingSlugs.has(slugValue)) {
    fields.slug = "Este slug já está em uso.";
  } else if (
    input.mode === "edit" &&
    slugValue !== input.originalSlug &&
    existingSlugs.has(slugValue)
  ) {
    fields.slug = "Este slug já está em uso.";
  }

  if (category) fields.category = category;
  if (author) fields.author = author;
  if (!dateValue) {
    fields.date = "A data é obrigatória.";
  } else if (!isValidPostDate(dateValue)) {
    fields.date = "Informe uma data válida, por exemplo July 18, 2026.";
  }
  if (excerpt) fields.excerpt = excerpt;
  if (content) fields.content = content;

  if (!featuredImage) {
    fields.featuredImage = "A imagem destacada é obrigatória.";
  } else if (!isPublicAssetPath(featuredImage)) {
    fields.featuredImage =
      "Use um caminho local público, como /images/exemplo.jpg.";
  }

  if (videoUrl && !isPublicAssetPath(videoUrl)) {
    fields.videoUrl =
      "Use um caminho local público, como /images/exemplo.mp4.";
  }

  if (!unique(relatedSlugs)) {
    fields.relatedSlugs =
      "Posts relacionados não podem ser selecionados mais de uma vez.";
  } else if (relatedSlugs.includes(slugValue)) {
    fields.relatedSlugs = "Um post não pode ser relacionado a si mesmo.";
  } else {
    const missing = relatedSlugs.find((slug) => !catalogSlugs.has(slug));
    if (missing) {
      fields.relatedSlugs =
        "Um ou mais posts relacionados não foram encontrados.";
    }
  }

  if (post.content.trim().startsWith("---")) {
    fields.content =
      "O conteúdo não pode começar com delimitadores de frontmatter.";
  } else if (post.content.trim() && !(await isValidMdxBody(post.content))) {
    fields.content = "O conteúdo não é um MDX válido.";
  }

  const id = post.id.trim();
  if (!id) {
    fields.id = "O ID é obrigatório.";
  } else if (input.mode === "create" && catalog.some((item) => item.id === id)) {
    fields.id = "Este ID já está em uso.";
  }

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: "Corrija os campos destacados.",
      fields,
    };
  }

  const payload: SerializableMdxPost = {
    id,
    slug: slugValue,
    title: post.title.trim(),
    category: post.category.trim(),
    author: post.author.trim(),
    date: dateValue,
    featuredImage,
    excerpt: post.excerpt.trim(),
    videoUrl: videoUrl || undefined,
    relatedSlugs,
    content: post.content.trim(),
  };

  const mdx = serializeMdxPost(payload);
  const parsed = matter(mdx);
  const parsedSlug = String(parsed.data.slug ?? "");
  const parsedRelated = Array.isArray(parsed.data.relatedSlugs)
    ? parsed.data.relatedSlugs
    : [];

  if (parsedSlug !== payload.slug) {
    return {
      ok: false,
      error: "Generated MDX could not be parsed.",
      fields: {},
    };
  }

  if (parsedRelated.join("|") !== payload.relatedSlugs.join("|")) {
    return {
      ok: false,
      error: "Generated MDX did not preserve related posts.",
      fields: {},
    };
  }

  return { ok: true, mdx };
}
