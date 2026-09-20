"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AdminPostSummary } from "@/lib/posts/admin-types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; posts: AdminPostSummary[]; publishedCount: number };

function matchesQuery(post: AdminPostSummary, query: string): boolean {
  const haystack = [post.title, post.slug, post.category, post.author]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function PostsList() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const response = await fetch("/api/admin/posts");
        const data = (await response.json().catch(() => null)) as
          | { posts?: AdminPostSummary[]; publishedCount?: number; error?: string }
          | null;

        if (cancelled) return;

        if (response.status === 401) {
          setLoadState({
            status: "error",
            message: "Você não está conectado.",
          });
          return;
        }

        if (!response.ok || !data?.posts) {
          setLoadState({
            status: "error",
            message: data?.error || "Não foi possível carregar os posts.",
          });
          return;
        }

        setLoadState({
          status: "ready",
          posts: data.posts,
          publishedCount: data.publishedCount ?? data.posts.length,
        });
      } catch {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: "Não foi possível carregar os posts.",
          });
        }
      }
    }

    void loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (loadState.status !== "ready") return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return loadState.posts;
    return loadState.posts.filter((post) => matchesQuery(post, normalized));
  }, [loadState, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts do Blog</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {loadState.status === "ready"
              ? `${loadState.publishedCount} posts publicados`
              : "Posts publicados"}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo post
        </Link>
      </div>

      <label className="block">
        <span className="sr-only">Buscar posts</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar título, slug, categoria ou autor"
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </label>

      {loadState.status === "loading" ? (
        <p className="text-sm text-neutral-600">Carregando posts...</p>
      ) : null}

      {loadState.status === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {loadState.message}
        </p>
      ) : null}

      {loadState.status === "ready" ? (
        <div className="overflow-x-auto rounded border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Autor</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum post corresponde a esta busca.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{post.title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{post.category}</td>
                    <td className="px-4 py-3 text-neutral-700">{post.author}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                      {post.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Publicado
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
