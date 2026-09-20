import InArticleAd from "@/components/ads/InArticleAd";
import NativeBannerAd from "@/components/ads/NativeBannerAd";
import ViralPostCard from "@/components/ViralPostCard";
import type { RelatedPost } from "@/types/post";

interface RecommendedGridProps {
  title?: string;
  posts: RelatedPost[];
}

export default function RecommendedGrid({
  title = "Recomendado para você",
  posts,
}: RecommendedGridProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="recommended-heading" className="space-y-4">
      <h2
        id="recommended-heading"
        className="border-b border-gray-200 pb-2 text-lg font-bold text-black"
      >
        {title}
      </h2>

      <NativeBannerAd />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <ViralPostCard key={post.id} post={post} variant="compact" />
        ))}
      </div>

      <InArticleAd placementId="after-recommended" />
    </section>
  );
}
