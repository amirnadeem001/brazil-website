import PostsList from "./posts-list";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PostsList />
    </main>
  );
}
