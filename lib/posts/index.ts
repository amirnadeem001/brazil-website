import { PRODUCTION_CATALOG_ORDER } from "@/lib/posts/catalog-order";
import { loadMdxPosts, resolveRelatedPosts } from "@/lib/posts/mdx";
import type { MdxPost } from "@/lib/posts/types";
import type { Post } from "@/types/post";

function getCatalog(): Post[] {
  const { posts: mdxPosts, relatedSlugMap } = loadMdxPosts();
  const bySlug = new Map<string, MdxPost>();

  for (const post of mdxPosts) {
    if (bySlug.has(post.slug)) {
      throw new Error(`[posts] Duplicate MDX slug: ${post.slug}`);
    }
    bySlug.set(post.slug, post);
  }

  const ordered: MdxPost[] = [];
  const used = new Set<string>();

  for (const slug of PRODUCTION_CATALOG_ORDER) {
    const post = bySlug.get(slug);
    if (!post) {
      throw new Error(`[posts] Missing production MDX post: ${slug}`);
    }
    ordered.push(post);
    used.add(slug);
  }

  const extras = mdxPosts
    .filter((post) => !used.has(post.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const catalog = [...ordered, ...extras];
  return resolveRelatedPosts(catalog, relatedSlugMap, catalog);
}

export function getAllPosts(): Post[] {
  return getCatalog();
}

export function getPostBySlug(slug: string): Post | undefined {
  return getCatalog().find((post) => post.slug === slug);
}

export function getFeaturedPost(): Post {
  const featured = getCatalog()[0];
  if (!featured) {
    throw new Error("[posts] No MDX posts found in content/blog");
  }
  return featured;
}

export function getViralPosts(excludeSlug?: string): Post[] {
  return getCatalog().filter((post) => post.slug !== excludeSlug);
}

export function getPostsPage(
  page: number,
  pageSize: number,
  excludeSlug?: string
): Post[] {
  const pool = getViralPosts(excludeSlug);
  if (pool.length === 0) return [];

  const result: Post[] = [];
  const offset = page * pageSize;

  for (let i = 0; i < pageSize; i++) {
    result.push(pool[(offset + i) % pool.length]);
  }

  return result;
}
