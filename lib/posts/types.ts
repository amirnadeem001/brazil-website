import type { Post } from "@/types/post";

export type MdxFrontmatter = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featuredImage: string;
  excerpt: string;
  videoUrl?: string;
  relatedSlugs?: string[];
};

export type MdxPost = Post & {
  mdxBody: string;
};
