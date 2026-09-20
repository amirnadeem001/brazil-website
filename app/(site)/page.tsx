import NativeBannerAd from "@/components/ads/NativeBannerAd";
import ResponsiveAdBox from "@/components/ads/ResponsiveAdBox";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeHero from "@/components/home/HomeHero";
import HomeLatestArticles from "@/components/home/HomeLatestArticles";
import HomePagination from "@/components/home/HomePagination";
import HomeSidebar from "@/components/home/HomeSidebar";
import { getAllPosts } from "@/lib/posts";
import type { Post } from "@/types/post";

const LATEST_PAGE_SIZE = 5;

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    archive?: string;
  }>;
}

function archiveLabelFromDate(date: string): string {
  const match = date.match(/^([A-Za-z]+)\s+\d{1,2},\s+(\d{4})$/);
  if (!match) return date;
  return `${match[1]} ${match[2]}`;
}

function firstParam(value: string | undefined): string {
  return value?.trim() ?? "";
}

function pageHref(
  page: number,
  filters: { q: string; category: string; archive: string }
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.archive) params.set("archive", filters.archive);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function filterPosts(
  posts: Post[],
  filters: { q: string; category: string; archive: string }
): Post[] {
  const query = filters.q.toLowerCase();

  return posts.filter((post) => {
    if (filters.category && post.category !== filters.category) return false;
    if (filters.archive && archiveLabelFromDate(post.date) !== filters.archive) {
      return false;
    }
    if (!query) return true;

    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  });
}

/**
 * Homepage ad map (each Adsterra banner size once):
 * 728×90 top | 320×50 strip | Native | 468×60 mid | 300×250 mid
 * Sidebar: 160×600 + 160×300 | Global: Popunder + Social Bar
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const posts = getAllPosts();
  const primary = posts[0];

  if (!primary) {
    throw new Error("[home] No MDX posts found in content/blog");
  }

  const filters = {
    q: firstParam(params.q),
    category: firstParam(params.category),
    archive: firstParam(params.archive),
  };

  const filtered = filterPosts(posts, filters);
  const requestedPage = Number.parseInt(firstParam(params.page), 10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / LATEST_PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * LATEST_PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + LATEST_PAGE_SIZE);
  const featuredLatest = currentPage === 1 ? pageItems[0] : undefined;
  const gridArticles =
    currentPage === 1 ? pageItems.slice(1) : pageItems;

  const categories = [...new Set(posts.map((post) => post.category))]
    .sort()
    .map((label) => ({
      label,
      href: `/?category=${encodeURIComponent(label)}`,
    }));

  const archives = [
    ...new Set(posts.map((post) => archiveLabelFromDate(post.date))),
  ].map((label) => ({
    label,
    href: `/?archive=${encodeURIComponent(label)}`,
  }));

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 bg-[#fafafa] py-3">
          <div className="mx-auto flex max-w-6xl justify-center px-4">
            <ResponsiveAdBox placementId="home-leaderboard" eager />
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
          <HomeHero posts={posts.slice(0, 5)} />

          <div className="flex justify-center">
            <ResponsiveAdBox placementId="home-strip" eager />
          </div>

          <NativeBannerAd />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <main className="min-w-0 flex-1 space-y-8">
              <HomeLatestArticles
                featured={featuredLatest}
                articles={gridArticles}
                midSlot={
                  <div className="flex justify-center">
                    <ResponsiveAdBox placementId="home-mid-banner" />
                  </div>
                }
              />

              <div className="flex justify-center">
                <ResponsiveAdBox placementId="home-mid-rect" />
              </div>

              <HomePagination
                currentPage={currentPage}
                totalPages={totalPages}
                hrefForPage={(page) => pageHref(page, filters)}
              />
            </main>

            <HomeSidebar
              recent={posts.slice(0, 8)}
              archives={archives}
              categories={categories}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
