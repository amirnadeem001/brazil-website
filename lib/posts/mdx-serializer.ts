export type SerializableMdxPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  featuredImage: string;
  excerpt: string;
  videoUrl?: string;
  relatedSlugs: string[];
  content: string;
};

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

export function serializeMdxPost(post: SerializableMdxPost): string {
  const lines = [
    "---",
    `id: ${yamlQuote(post.id)}`,
    `slug: ${yamlQuote(post.slug)}`,
    `title: ${yamlQuote(post.title)}`,
    `category: ${yamlQuote(post.category)}`,
    `author: ${yamlQuote(post.author)}`,
    `date: ${yamlQuote(post.date)}`,
    `featuredImage: ${yamlQuote(post.featuredImage)}`,
    `excerpt: ${yamlQuote(post.excerpt)}`,
  ];

  if (post.videoUrl) {
    lines.push(`videoUrl: ${yamlQuote(post.videoUrl)}`);
  }

  if (post.relatedSlugs.length === 0) {
    lines.push("relatedSlugs: []");
  } else {
    lines.push("relatedSlugs:");
    for (const slug of post.relatedSlugs) {
      lines.push(`  - ${yamlQuote(slug)}`);
    }
  }

  const body = post.content.trim();
  lines.push("---", "", body, "");
  return lines.join("\n");
}
