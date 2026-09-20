import "server-only";

import { getAllPosts, getPostBySlug } from "@/lib/posts";
import type {
  AdminEditorOptions,
  AdminEditorPost,
  AdminPostSummary,
} from "@/lib/posts/admin-types";

export const TEST_POST_SLUG = "test-mdx-post";

function toSummary(
  post: ReturnType<typeof getAllPosts>[number]
): AdminPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    author: post.author,
    date: post.date,
    featuredImage: post.featuredImage,
    excerpt: post.excerpt,
    videoUrl: post.videoUrl,
    status: "published",
  };
}

export function getAdminPostSummaries(): AdminPostSummary[] {
  return getAllPosts()
    .filter((post) => post.slug !== TEST_POST_SLUG)
    .map(toSummary);
}

export function getNextPostId(): string {
  const maxId = getAllPosts().reduce((max, post) => {
    const value = Number(post.id);
    if (!Number.isInteger(value) || value <= max) return max;
    return value;
  }, 0);

  return String(maxId + 1);
}

export function getAdminEditorPost(slug: string): AdminEditorPost | undefined {
  const post = getPostBySlug(slug);
  if (!post) return undefined;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    author: post.author,
    date: post.date,
    featuredImage: post.featuredImage,
    excerpt: post.excerpt,
    videoUrl: post.videoUrl ?? "",
    relatedSlugs: post.relatedPosts.map((item) => item.slug),
    content: post.mdxBody ?? post.paragraphs.join("\n\n"),
  };
}

export function getEditorFormOptions(excludeSlug?: string): AdminEditorOptions {
  const summaries = getAdminPostSummaries();
  const categories = [...new Set(summaries.map((post) => post.category))].sort();
  const authors = [...new Set(summaries.map((post) => post.author))].sort();
  const relatedCandidates = summaries.filter(
    (post) => post.slug !== excludeSlug
  );

  return {
    categories,
    authors,
    relatedCandidates,
    nextId: getNextPostId(),
  };
}
