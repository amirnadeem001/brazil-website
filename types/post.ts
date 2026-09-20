export interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  featuredImage: string;
  videoUrl?: string;
}

export interface InlineImage {
  afterParagraph: number;
  src: string;
  alt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featuredImage: string;
  videoUrl?: string;
  excerpt: string;
  paragraphs: string[];
  relatedPosts: RelatedPost[];
  inlineImages?: InlineImage[];
  mdxBody?: string;
}

