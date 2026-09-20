export type AdminPostStatus = "published";

export type AdminPostSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featuredImage: string;
  excerpt: string;
  videoUrl?: string;
  status: AdminPostStatus;
};

export type AdminEditorPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featuredImage: string;
  excerpt: string;
  videoUrl: string;
  relatedSlugs: string[];
  content: string;
};

export type AdminEditorOptions = {
  categories: string[];
  authors: string[];
  relatedCandidates: AdminPostSummary[];
  nextId: string;
};
