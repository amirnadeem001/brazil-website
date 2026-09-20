import Image from "next/image";
import Link from "next/link";
import { postHref } from "@/lib/posts/slug";
import type { Post } from "@/types/post";

interface HomeHeroProps {
  posts: Post[];
}

function MosaicCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  return (
    <Link
      href={postHref(post.slug)}
      className={`group relative block h-full overflow-hidden bg-neutral-200 ${
        featured ? "min-h-[280px] sm:min-h-[420px] lg:min-h-full" : "min-h-[200px] sm:min-h-[204px]"
      }`}
    >
      <Image
        src={post.featuredImage}
        alt={post.title}
        fill
        priority={featured}
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 50vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        }
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
          {post.category}
        </p>
        {featured ? (
          <h1 className={`mt-1 font-serif font-bold leading-snug text-white text-2xl sm:text-3xl lg:text-[2rem]`}>
            {post.title}
          </h1>
        ) : (
          <h2 className="mt-1 font-serif text-lg font-bold leading-snug text-white sm:text-xl">
            {post.title}
          </h2>
        )}
      </div>
    </Link>
  );
}

export default function HomeHero({ posts }: HomeHeroProps) {
  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;
  const small = rest.slice(0, 4);

  if (small.length === 0) {
    return (
      <section aria-label="Histórias em destaque">
        <MosaicCard post={featured} featured />
      </section>
    );
  }

  return (
    <section aria-label="Histórias em destaque">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-2 lg:h-[440px]">
        <div className="h-full sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <MosaicCard post={featured} featured />
        </div>
        {small.map((post) => (
          <div key={post.id} className="h-full min-h-[200px]">
            <MosaicCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
