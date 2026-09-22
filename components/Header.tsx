import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Header() {
  const categories = [...new Set(getAllPosts().map((post) => post.category))].sort();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-black sm:text-[1.75rem]"
        >
          contosdo<span className="text-orange-500">brasil</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-[#c81e1e]">
            Início
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className="hover:text-[#c81e1e]"
            >
              {category}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
