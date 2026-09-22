import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InArticleAd from "@/components/ads/InArticleAd";
import ResponsiveAdBox from "@/components/ads/ResponsiveAdBox";
import ArticleBody from "@/components/ArticleBody";
import ArticleHeader from "@/components/ArticleHeader";
import ArticleHeroVideo from "@/components/ArticleHeroVideo";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MdxArticleBody from "@/components/MdxArticleBody";
import RecommendedGrid from "@/components/RecommendedGrid";
import Sidebar from "@/components/Sidebar";
import ViralPostCard from "@/components/ViralPostCard";
import { getAllPosts, getPostBySlug, getViralPosts } from "@/lib/posts";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Artigo não encontrado" };
  }

  return {
    title: `${post.title} | contosdobrasil`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.featuredImage, alt: post.title }],
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const morePosts = getViralPosts(slug).slice(0, 4);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f3f4f6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
          <main className="min-w-0 flex-1 space-y-6">
            <ResponsiveAdBox placementId="top-banner" className="mb-2" />

            <article className="bg-white p-4 shadow-sm sm:p-6">
              <ArticleHeroVideo
                videoUrl={post.videoUrl}
                featuredImage={post.featuredImage}
                title={post.title}
              />

              <InArticleAd placementId="after-video" />

              <div className="mt-4 space-y-4">
                <ArticleHeader
                  title={post.title}
                  author={post.author}
                  date={post.date}
                  category={post.category}
                />

                <InArticleAd placementId="after-title" />

                <RecommendedGrid posts={post.relatedPosts} />

                {post.mdxBody ? (
                  <MdxArticleBody source={post.mdxBody} />
                ) : (
                  <ArticleBody
                    paragraphs={post.paragraphs}
                    inlineImages={post.inlineImages}
                  />
                )}
              </div>
            </article>

            <section aria-label="Mais histórias" className="space-y-4">
              <h2 className="text-lg font-bold text-black">Mais histórias</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {morePosts.map((item) => (
                  <ViralPostCard key={item.id} post={item} />
                ))}
              </div>
            </section>
          </main>

          <Sidebar />
        </div>
      </div>
      <Footer />
    </>
  );
}
