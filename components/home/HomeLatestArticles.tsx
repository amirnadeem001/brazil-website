import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { postHref } from "@/lib/posts/slug";
import type { Post } from "@/types/post";

interface HomeLatestArticlesProps {
  featured?: Post;
  articles: Post[];
  midSlot?: ReactNode;
}

function MetaLine({ post }: { post: Post }) {
  return (
    <p className="text-xs text-gray-500">
      {post.author} <span className="text-gray-300">/</span> {post.date}
    </p>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <article>
      <Link href={postHref(post.slug)} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 35vw"
          />
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c81e1e]">
          {post.category}
        </p>
        <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-black group-hover:underline sm:text-[1.35rem]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {post.excerpt}
        </p>
        <div className="mt-3">
          <MetaLine post={post} />
        </div>
      </Link>
    </article>
  );
}

export default function HomeLatestArticles({
  featured,
  articles,
  midSlot,
}: HomeLatestArticlesProps) {
  return (
    <section aria-labelledby="latest-articles-heading" className="space-y-8">
      <h2
        id="latest-articles-heading"
        className="text-center font-serif text-3xl font-bold text-black"
      >
        Últimos Artigos
      </h2>

      {featured ? (
        <article>
          <Link
            href={postHref(featured.slug)}
            className="group grid items-center gap-6 md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c81e1e]">
                {featured.category}
              </p>
              <h3 className="font-serif text-2xl font-bold leading-tight text-black group-hover:underline sm:text-3xl">
                {featured.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                {featured.excerpt}
              </p>
              <MetaLine post={featured} />
            </div>
          </Link>
        </article>
      ) : null}

      {midSlot}

      {articles.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2">
          {articles.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}

      {!featured && articles.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          Nenhum artigo encontrado.
        </p>
      ) : null}
    </section>
  );
}
