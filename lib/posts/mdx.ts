import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { InlineImage, Post, RelatedPost } from "@/types/post";
import type { MdxFrontmatter, MdxPost } from "@/lib/posts/types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asSlugList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  );
}

function parseFrontmatter(
  data: Record<string, unknown>,
  filename: string
): MdxFrontmatter | null {
  const slugFromFile = filename.replace(/\.mdx$/i, "");
  const id = asNonEmptyString(data.id);
  const slug = asNonEmptyString(data.slug) ?? slugFromFile;
  const title = asNonEmptyString(data.title);
  const category = asNonEmptyString(data.category);
  const author = asNonEmptyString(data.author);
  const date = asNonEmptyString(data.date);
  const featuredImage =
    asNonEmptyString(data.featuredImage) ?? asNonEmptyString(data.image);
  const excerpt =
    asNonEmptyString(data.excerpt) ?? asNonEmptyString(data.description);

  if (
    !id ||
    !slug ||
    !title ||
    !category ||
    !author ||
    !date ||
    !featuredImage ||
    !excerpt
  ) {
    console.error("[mdx]", { file: filename, error: "missing_required_frontmatter" });
    return null;
  }

  return {
    id,
    slug,
    title,
    category,
    author,
    date,
    featuredImage,
    excerpt,
    videoUrl: asNonEmptyString(data.videoUrl),
    relatedSlugs: asSlugList(data.relatedSlugs),
  };
}

function extractParagraphsAndImages(body: string): {
  paragraphs: string[];
  inlineImages: InlineImage[];
} {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const inlineImages: InlineImage[] = [];
  const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/;

  for (const block of blocks) {
    const imageMatch = block.match(imagePattern);
    if (imageMatch) {
      if (paragraphs.length === 0) continue;
      inlineImages.push({
        afterParagraph: paragraphs.length,
        src: imageMatch[2],
        alt: imageMatch[1] || "",
      });
      continue;
    }

    paragraphs.push(block.replace(/\n/g, " "));
  }

  return { paragraphs, inlineImages };
}

function toRelatedPost(post: Post): RelatedPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: post.date,
    featuredImage: post.featuredImage,
    videoUrl: post.videoUrl,
  };
}

export function loadMdxPosts(): {
  posts: MdxPost[];
  relatedSlugMap: Map<string, string[]>;
} {
  if (!fs.existsSync(BLOG_DIR)) {
    return { posts: [], relatedSlugMap: new Map() };
  }

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.toLowerCase().endsWith(".mdx"));

  const posts: MdxPost[] = [];
  const relatedSlugMap = new Map<string, string[]>();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = parseFrontmatter(data as Record<string, unknown>, file);
    if (!frontmatter) continue;

    const mdxBody = content.trim();
    const { paragraphs, inlineImages } = extractParagraphsAndImages(mdxBody);

    relatedSlugMap.set(frontmatter.slug, frontmatter.relatedSlugs ?? []);
    posts.push({
      id: frontmatter.id,
      slug: frontmatter.slug,
      title: frontmatter.title,
      category: frontmatter.category,
      author: frontmatter.author,
      date: frontmatter.date,
      featuredImage: frontmatter.featuredImage,
      videoUrl: frontmatter.videoUrl,
      excerpt: frontmatter.excerpt,
      paragraphs,
      inlineImages,
      relatedPosts: [],
      mdxBody,
    });
  }

  return { posts, relatedSlugMap };
}

export function resolveRelatedPosts(
  mdxPosts: MdxPost[],
  relatedSlugMap: Map<string, string[]>,
  catalog: Post[]
): MdxPost[] {
  const bySlug = new Map(catalog.map((post) => [post.slug, post]));
  const missing: string[] = [];

  const resolved = mdxPosts.map((post) => {
    const relatedPosts = (relatedSlugMap.get(post.slug) ?? []).flatMap((slug) => {
      if (slug === post.slug) {
        missing.push(`${post.slug} -> ${slug} (self-reference)`);
        return [];
      }

      const related = bySlug.get(slug);
      if (!related) {
        missing.push(`${post.slug} -> ${slug}`);
        return [];
      }

      return [toRelatedPost(related)];
    });

    return { ...post, relatedPosts };
  });

  if (missing.length > 0) {
    throw new Error(
      `[posts] Unresolved relatedSlugs:\n${missing.map((item) => `  ${item}`).join("\n")}`
    );
  }

  return resolved;
}
