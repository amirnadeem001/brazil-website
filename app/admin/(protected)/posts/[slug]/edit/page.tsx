import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { getAdminEditorPost, getEditorFormOptions } from "@/lib/posts/admin";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const post = getAdminEditorPost(slug);

  if (!post) {
    notFound();
  }

  const options = getEditorFormOptions(post.slug);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PostEditor
        mode="edit"
        initialValue={post}
        categories={options.categories}
        authors={options.authors}
        relatedCandidates={options.relatedCandidates}
      />
    </main>
  );
}
