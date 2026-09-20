import Link from "next/link";
import { postHref } from "@/lib/posts/slug";
import type { RelatedPost } from "@/types/post";

interface ViralPostCardProps {
  post: RelatedPost;
  variant?: "default" | "compact" | "large";
  className?: string;
}

export default function ViralPostCard({
  post,
  variant = "default",
  className,
}: ViralPostCardProps) {
  const isLarge = variant === "large";

  return (
    <article
      className={[
        "group h-full overflow-hidden bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={postHref(post.slug)} className="block">
        <figure className="relative aspect-square overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          {post.videoUrl ? (
            <span
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="ml-1 h-5 w-5"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          ) : null}
        </figure>
        <div className={isLarge ? "py-3" : "py-2"}>
          <h2
            className={[
              "font-bold leading-snug text-black group-hover:text-orange-600",
              isLarge ? "text-lg sm:text-xl" : "text-sm sm:text-base",
            ].join(" ")}
          >
            {post.title}
          </h2>
          <p className="mt-1 text-[11px] text-gray-500">
            {post.date} · {post.category}
          </p>
        </div>
      </Link>
    </article>
  );
}
