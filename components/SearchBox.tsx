"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface SearchBoxProps {
  id?: string;
  variant?: "bar" | "icon";
}

export default function SearchBox({
  id = "site-search",
  variant = "bar",
}: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/");
  }

  if (variant === "icon") {
    return (
      <form onSubmit={handleSubmit} className="w-full" role="search">
        <label htmlFor={id} className="sr-only">
          Buscar artigos
        </label>
        <div className="flex items-center border border-gray-300 bg-white">
          <input
            id={id}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar…"
            className="h-10 min-w-0 flex-1 px-3 text-sm text-black outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center text-gray-600 hover:text-black"
            aria-label="Buscar"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16.65 16.65" />
            </svg>
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm items-center gap-0"
      role="search"
    >
      <label htmlFor={id} className="sr-only">
        Buscar artigos
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar..."
        className="h-9 flex-1 rounded-l border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-orange-400"
      />
      <button
        type="submit"
        className="h-9 rounded-r bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600"
      >
        Buscar
      </button>
    </form>
  );
}
