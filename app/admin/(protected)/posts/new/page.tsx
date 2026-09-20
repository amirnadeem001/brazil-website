import PostEditor from "@/components/admin/PostEditor";
import { getEditorFormOptions } from "@/lib/posts/admin";
import { formatPostDate } from "@/lib/posts/slug";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const options = getEditorFormOptions();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PostEditor
        mode="create"
        categories={options.categories}
        authors={options.authors}
        relatedCandidates={options.relatedCandidates}
        initialValue={{
          id: options.nextId,
          slug: "",
          title: "",
          category: "",
          author: "",
          date: formatPostDate(),
          featuredImage: "",
          excerpt: "",
          videoUrl: "",
          relatedSlugs: [],
          content: "",
        }}
      />
    </main>
  );
}
