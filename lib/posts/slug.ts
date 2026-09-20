export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "blog",
  "images",
  "login",
]);

export function postHref(slug: string): string {
  return `/${slug}`;
}

export function isReservedSlug(value: string): boolean {
  return RESERVED_SLUGS.has(value);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function isPublicAssetPath(value: string): boolean {
  if (!value.startsWith("/images/")) return false;
  if (value.includes("..") || value.includes("\\")) return false;
  if (value.includes("//")) return false;
  if (/\s/.test(value)) return false;
  return /^\/images\/[A-Za-z0-9._/-]+$/.test(value);
}

export function formatPostDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function isValidPostDate(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}
