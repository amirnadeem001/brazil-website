export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const GITHUB_IMAGE_DIR = "public/images";

export type DetectedImageType = {
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  extension: "jpg" | "png" | "webp" | "gif";
};

export class ImageUploadError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ImageUploadError";
    this.status = status;
  }
}

export function detectImageType(bytes: Uint8Array): DetectedImageType | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }

  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { mime: "image/gif", extension: "gif" };
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", extension: "webp" };
  }

  return null;
}

export function sanitizeImageBaseName(originalName: string): string {
  const basename = originalName.replace(/\\/g, "/").split("/").pop() ?? "";
  const withoutExtension = basename.replace(/\.[^.]+$/, "");
  const slug = withoutExtension
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "image";
}

export function buildImageFilename(
  originalName: string,
  extension: DetectedImageType["extension"],
  suffix?: string
): string {
  const base = sanitizeImageBaseName(originalName);
  const name = suffix ? `${base}-${suffix}` : base;
  return `${name}.${extension}`;
}
