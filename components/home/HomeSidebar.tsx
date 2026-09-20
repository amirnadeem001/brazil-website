import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import ResponsiveAdBox from "@/components/ads/ResponsiveAdBox";
import SearchBox from "@/components/SearchBox";
import { postHref } from "@/lib/posts/slug";
import type { Post } from "@/types/post";

interface SidebarLink {
  label: string;
  href: string;
}

interface HomeSidebarProps {
  recent: Post[];
  archives: SidebarLink[];
  categories: SidebarLink[];
}

function Widget({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="border-b border-gray-200 pb-2 font-serif text-lg font-bold text-black">
        {title}
      </h2>
      <div className="pt-3">{children}</div>
    </section>
  );
}

export default function HomeSidebar({
  recent,
  archives,
  categories,
}: HomeSidebarProps) {
  return (
    <aside
      className="w-full shrink-0 space-y-8 lg:sticky lg:top-6 lg:w-[300px] lg:self-start"
      aria-label="Barra lateral"
    >
      <Suspense fallback={<div className="h-10 border border-gray-300 bg-white" />}>
        <SearchBox id="sidebar-search" variant="icon" />
      </Suspense>

      <Widget title="Posts recentes">
        {recent.length > 0 ? (
          <ul className="space-y-2">
            {recent.map((post) => (
              <li key={post.id}>
                <Link
                  href={postHref(post.slug)}
                  className="text-sm leading-snug text-gray-700 hover:text-[#c81e1e]"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum post recente ainda.</p>
        )}
      </Widget>

      <div className="hidden justify-center lg:flex">
        <ResponsiveAdBox placementId="home-sidebar" eager />
      </div>

      <Widget title="Arquivos">
        {archives.length > 0 ? (
          <ul className="space-y-2">
            {archives.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-700 hover:text-[#c81e1e]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum arquivo ainda.</p>
        )}
      </Widget>

      <div className="hidden justify-center lg:flex">
        <ResponsiveAdBox placementId="home-sidebar-2" eager />
      </div>

      <Widget title="Categorias">
        {categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-gray-700 hover:text-[#c81e1e]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma categoria ainda.</p>
        )}
      </Widget>
    </aside>
  );
}
