"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import ArticleBodyPreview from "@/components/admin/ArticleBodyPreview";
import type {
  AdminEditorPost,
  AdminPostSummary,
} from "@/lib/posts/admin-types";
import { isPublicAssetPath, postHref, slugifyTitle } from "@/lib/posts/slug";

interface PostEditorProps {
  mode: "create" | "edit";
  initialValue: AdminEditorPost;
  relatedCandidates: AdminPostSummary[];
  categories: string[];
  authors: string[];
}

type ValidateResponse =
  | { ok: true; mdx: string }
  | { ok: false; error?: string; fields?: Record<string, string> };

type PublishResponse =
  | {
      success: true;
      slug: string;
      path: string;
      action: "created" | "updated";
    }
  | { success?: false; error?: string; fields?: Record<string, string> };

type PublishState =
  | { status: "idle" }
  | { status: "publishing" }
  | { status: "error"; message: string }
  | {
      status: "success";
      slug: string;
      path: string;
      action: "created" | "updated";
    };

const inputClass =
  "mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500";

async function uploadAdminImage(file: File): Promise<{ path: string; filename: string }> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/admin/images", {
    method: "POST",
    body,
  });
  const data = (await response.json().catch(() => null)) as
    | { success?: boolean; path?: string; filename?: string; error?: string }
    | null;

  if (response.status === 401) {
    throw new Error("Você não está conectado.");
  }

  if (!response.ok || !data?.success || !data.path || !data.filename) {
    throw new Error(data?.error || "Não foi possível enviar a imagem.");
  }

  return { path: data.path, filename: data.filename };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

export default function PostEditor({
  mode,
  initialValue,
  relatedCandidates,
  categories,
  authors,
}: PostEditorProps) {
  const [form, setForm] = useState<AdminEditorPost>(initialValue);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [generatedMdx, setGeneratedMdx] = useState("");
  const [pending, setPending] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>({
    status: "idle",
  });
  const [relatedToAdd, setRelatedToAdd] = useState("");
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [bodyUploading, setBodyUploading] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const bodyFileRef = useRef<HTMLInputElement>(null);

  const originalSlug = initialValue.slug;
  const slugWillChange = mode === "edit" && form.slug.trim() !== originalSlug;

  const availableRelated = useMemo(
    () =>
      relatedCandidates.filter(
        (post) =>
          post.slug !== form.slug && !form.relatedSlugs.includes(post.slug)
      ),
    [relatedCandidates, form.relatedSlugs, form.slug]
  );

  function update<K extends keyof AdminEditorPost>(
    key: K,
    value: AdminEditorPost[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFields((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugifyTitle(value),
    }));
    setFields((current) => {
      const next = { ...current };
      delete next.title;
      if (!slugTouched) delete next.slug;
      return next;
    });
  }

  function insertAtCursor(snippet: string) {
    const textarea = contentRef.current;
    if (!textarea) {
      update(
        "content",
        form.content ? `${form.content.trimEnd()}\n\n${snippet}\n\n` : `${snippet}\n\n`
      );
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      form.content.slice(0, start) + snippet + form.content.slice(end);
    update("content", next);
  }

  async function handleFeaturedUpload(file: File | undefined) {
    if (!file || featuredUploading) return;
    setFeaturedUploading(true);
    setFields((current) => {
      const next = { ...current };
      delete next.featuredImage;
      return next;
    });

    try {
      const result = await uploadAdminImage(file);
      update("featuredImage", result.path);
    } catch (uploadError) {
      setFields((current) => ({
        ...current,
        featuredImage:
          uploadError instanceof Error
            ? uploadError.message
            : "Não foi possível enviar a imagem.",
      }));
    } finally {
      setFeaturedUploading(false);
      if (featuredFileRef.current) featuredFileRef.current.value = "";
    }
  }

  async function handleBodyImageUpload(file: File | undefined) {
    if (!file || bodyUploading) return;
    setBodyUploading(true);

    try {
      const result = await uploadAdminImage(file);
      const alt = imageAlt.trim() || "image";
      insertAtCursor(`![${alt}](${result.path})`);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem."
      );
    } finally {
      setBodyUploading(false);
      if (bodyFileRef.current) bodyFileRef.current.value = "";
    }
  }

  function insertMarkdown(before: string, after = "") {
    const textarea = contentRef.current;
    if (!textarea) {
      update("content", `${form.content}${before}text${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end) || "text";
    const next =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    update("content", next);
  }

  function addRelated() {
    if (!relatedToAdd) return;
    if (form.relatedSlugs.includes(relatedToAdd) || relatedToAdd === form.slug) {
      return;
    }
    update("relatedSlugs", [...form.relatedSlugs, relatedToAdd]);
    setRelatedToAdd("");
  }

  function moveRelated(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.relatedSlugs.length) return;
    const next = [...form.relatedSlugs];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    update("relatedSlugs", next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");
    setFields({});
    setGeneratedMdx("");

    try {
      const response = await fetch("/api/admin/posts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          originalSlug: mode === "edit" ? originalSlug : undefined,
          post: form,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ValidateResponse
        | { error?: string }
        | null;

      if (response.status === 401) {
        setError("Você não está conectado.");
        return;
      }

      if (!data || !("ok" in data) || data.ok !== true) {
        const failed = data as ValidateResponse | { error?: string } | null;
        if (failed && "fields" in failed && failed.fields) {
          setFields(failed.fields);
        }
        setError(
          (failed && "error" in failed && failed.error) ||
            "Não foi possível gerar o MDX."
        );
        return;
      }

      setGeneratedMdx(data.mdx);
    } catch {
      setError("Não foi possível gerar o MDX.");
    } finally {
      setPending(false);
    }
  }

  async function handlePublish() {
    if (
      pending ||
      publishState.status === "publishing" ||
      featuredUploading ||
      bodyUploading
    ) {
      return;
    }

    if (mode === "edit" && form.slug.trim() !== originalSlug) {
      setPublishState({
        status: "error",
        message: "Alterar o slug de um post publicado ainda não é suportado.",
      });
      setFields((current) => ({
        ...current,
        slug: "Alterar o slug de um post publicado ainda não é suportado.",
      }));
      return;
    }

    setPublishState({ status: "publishing" });
    setError("");
    setFields({});

    try {
      const response = await fetch("/api/admin/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          originalSlug: mode === "edit" ? originalSlug : undefined,
          post: form,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | PublishResponse
        | null;

      if (response.status === 401) {
        setPublishState({
          status: "error",
          message: "Você não está conectado.",
        });
        return;
      }

      if (!data || !("success" in data) || data.success !== true) {
        if (data && "fields" in data && data.fields) {
          setFields(data.fields);
        }
        setPublishState({
          status: "error",
          message:
            (data && "error" in data && data.error) ||
            "Não foi possível publicar o post.",
        });
        return;
      }

      setPublishState({
        status: "success",
        slug: data.slug,
        path: data.path,
        action: data.action,
      });
    } catch {
      setPublishState({
        status: "error",
        message: "Não foi possível publicar o post.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "create" ? "Novo post" : "Editar post"}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Gere um MDX válido. A publicação no site acontece no próximo passo.
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Voltar aos posts
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded border border-neutral-200 bg-white p-5">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Título</span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
            <FieldError message={fields.title} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", event.target.value.trim().toLowerCase());
              }}
            />
            {slugWillChange ? (
              <p className="mt-1 text-sm text-amber-700">
                Alterar o slug muda a URL pública. Redirecionamentos ainda não estão configurados.
              </p>
            ) : null}
            <FieldError message={fields.slug} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Categoria</span>
              <input
                className={inputClass}
                list="admin-categories"
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
              />
              <datalist id="admin-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <FieldError message={fields.category} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Autor</span>
              <input
                className={inputClass}
                list="admin-authors"
                value={form.author}
                onChange={(event) => update("author", event.target.value)}
              />
              <datalist id="admin-authors">
                {authors.map((author) => (
                  <option key={author} value={author} />
                ))}
              </datalist>
              <FieldError message={fields.author} />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Data</span>
            <input
              className={inputClass}
              value={form.date}
              onChange={(event) => update("date", event.target.value)}
              placeholder="July 18, 2026"
            />
            <FieldError message={fields.date} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Resumo</span>
            <textarea
              className={`${inputClass} min-h-24`}
              value={form.excerpt}
              onChange={(event) => update("excerpt", event.target.value)}
            />
            <FieldError message={fields.excerpt} />
          </label>

          <div>
            <span className="text-sm font-medium text-neutral-700">
              Imagem destacada
            </span>
            <input
              className={inputClass}
              value={form.featuredImage}
              onChange={(event) => update("featuredImage", event.target.value)}
              placeholder="/images/example.jpg"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={featuredFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) =>
                  void handleFeaturedUpload(event.target.files?.[0])
                }
              />
              <button
                type="button"
                onClick={() => featuredFileRef.current?.click()}
                disabled={featuredUploading}
                className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                {featuredUploading ? "Enviando..." : "Enviar imagem"}
              </button>
              <p className="text-xs text-neutral-500">
                JPEG, PNG, WebP ou GIF. Máx. 5 MB.
              </p>
            </div>
            {isPublicAssetPath(form.featuredImage) ? (
              <figure className="mt-3 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.featuredImage}
                  alt=""
                  className="max-h-48 w-full object-cover"
                />
              </figure>
            ) : null}
            <FieldError message={fields.featuredImage} />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              URL do vídeo
            </span>
            <input
              className={inputClass}
              value={form.videoUrl}
              onChange={(event) => update("videoUrl", event.target.value)}
              placeholder="/images/example.mp4"
            />
            <FieldError message={fields.videoUrl} />
          </label>

          <div>
            <p className="text-sm font-medium text-neutral-700">Posts relacionados</p>
            <div className="mt-1 flex gap-2">
              <select
                className={inputClass + " mt-0"}
                value={relatedToAdd}
                onChange={(event) => setRelatedToAdd(event.target.value)}
              >
                <option value="">Selecione um post</option>
                {availableRelated.map((post) => (
                  <option key={post.slug} value={post.slug}>
                    {post.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addRelated}
                className="rounded border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Add
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {form.relatedSlugs.map((slug, index) => {
                const related = relatedCandidates.find((post) => post.slug === slug);
                return (
                  <li
                    key={slug}
                    className="flex items-center justify-between gap-2 rounded border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {related?.title ?? slug}
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => moveRelated(index, -1)}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRelated(index, 1)}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "relatedSlugs",
                            form.relatedSlugs.filter((item) => item !== slug)
                          )
                        }
                        className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <FieldError message={fields.relatedSlugs} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                onClick={() => insertMarkdown("**", "**")}
              >
                Bold
              </button>
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                onClick={() => insertMarkdown("*", "*")}
              >
                Italic
              </button>
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                onClick={() => insertMarkdown("[", "](/)")}
              >
                Link
              </button>
              <input
                ref={bodyFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) =>
                  void handleBodyImageUpload(event.target.files?.[0])
                }
              />
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-60"
                disabled={bodyUploading}
                onClick={() => bodyFileRef.current?.click()}
              >
                {bodyUploading ? "Enviando..." : "Inserir imagem"}
              </button>
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                onClick={() => insertMarkdown("- ")}
              >
                List
              </button>
            </div>
            <input
              className={`${inputClass} mt-2`}
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Texto alternativo da imagem"
            />
            <label className="mt-3 block">
              <span className="text-sm font-medium text-neutral-700">Conteúdo</span>
              <textarea
                ref={contentRef}
                className={`${inputClass} min-h-80 font-mono`}
                value={form.content}
                onChange={(event) => update("content", event.target.value)}
              />
              <FieldError message={fields.content} />
            </label>
          </div>

          <div className="rounded border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Pré-visualização</h2>
            <div className="mt-4">
              <ArticleBodyPreview source={form.content} />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {publishState.status === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {publishState.message}
        </p>
      ) : null}

      {publishState.status === "success" ? (
        <div className="rounded border border-green-200 bg-green-50 p-5 text-sm">
          <p className="font-semibold text-green-800">
            Post publicado com sucesso.
          </p>
          <p className="mt-2 text-green-800">
            GitHub atualizado. O deploy pode levar um momento.
          </p>
          <dl className="mt-3 space-y-1 text-green-900">
            <div>
              <dt className="text-green-700">Slug</dt>
              <dd className="font-medium">{publishState.slug}</dd>
            </div>
            <div>
              <dt className="text-green-700">Ação</dt>
              <dd className="font-medium">
                {publishState.action === "created" ? "criado" : "atualizado"}
              </dd>
            </div>
            <div>
              <dt className="text-green-700">Caminho no GitHub</dt>
              <dd className="font-medium">{publishState.path}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={postHref(publishState.slug)}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Ver post
            </Link>
            <Link
              href="/admin/posts"
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Voltar aos posts
            </Link>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || publishState.status === "publishing"}
          className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          {pending ? "Gerando..." : "Salvar rascunho localmente"}
        </button>
        <button
          type="button"
          onClick={() => void handlePublish()}
          disabled={
            pending ||
            publishState.status === "publishing" ||
            featuredUploading ||
            bodyUploading
          }
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {publishState.status === "publishing"
            ? "Publicando..."
            : mode === "create"
              ? "Publicar"
              : "Publicar alterações"}
        </button>
        <p className="self-center text-xs text-neutral-500">
          Publicar grava o MDX no GitHub. O deploy pode levar um momento.
        </p>
      </div>

      {generatedMdx ? (
        <div className="rounded border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-900">
            MDX gerado
          </h2>
          <textarea
            readOnly
            className={`${inputClass} min-h-80 font-mono`}
            value={generatedMdx}
          />
        </div>
      ) : null}
    </form>
  );
}
