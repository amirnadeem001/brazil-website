import Link from "next/link";

interface HomePaginationProps {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}

export default function HomePagination({
  currentPage,
  totalPages,
  hrefForPage,
}: HomePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginação dos últimos artigos" className="flex flex-wrap gap-2 pt-2">
      {pages.map((page) => {
        const isActive = page === currentPage;

        if (isActive) {
          return (
            <span
              key={page}
              aria-current="page"
              className="inline-flex h-9 min-w-9 items-center justify-center bg-[#c81e1e] px-3 text-sm font-semibold text-white"
            >
              {page}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={hrefForPage(page)}
            className="inline-flex h-9 min-w-9 items-center justify-center border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-black"
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
