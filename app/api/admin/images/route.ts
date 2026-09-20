import { NextResponse } from "next/server";
import {
  UnauthorizedError,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";
import { uploadImageToGitHub } from "@/lib/github/images";
import {
  ImageUploadError,
  MAX_IMAGE_BYTES,
  detectImageType,
} from "@/lib/images/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedAdminOrigin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    throw error;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json({ error: "É necessário um arquivo de imagem." }, { status: 400 });
  }

  const upload = file as Blob & { name?: string; type?: string };
  const size = typeof upload.size === "number" ? upload.size : 0;
  if (size <= 0) {
    return NextResponse.json({ error: "É necessário um arquivo de imagem." }, { status: 400 });
  }
  if (size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "A imagem deve ter no máximo 5 MB." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await upload.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "A imagem deve ter no máximo 5 MB." },
      { status: 400 }
    );
  }

  const detected = detectImageType(bytes);
  if (!detected) {
    return NextResponse.json(
      { error: "Somente imagens JPEG, PNG, WebP e GIF são permitidas." },
      { status: 400 }
    );
  }

  const originalName =
    typeof upload.name === "string" && upload.name.length > 0
      ? upload.name
      : `image.${detected.extension}`;

  try {
    const result = await uploadImageToGitHub({
      originalName,
      bytes,
    });

    return NextResponse.json({
      success: true,
      path: result.path,
      filename: result.filename,
    });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[admin-images]", { error: "upload_failed" });
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem." },
      { status: 500 }
    );
  }
}
