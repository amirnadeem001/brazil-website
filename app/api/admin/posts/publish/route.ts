import { NextResponse } from "next/server";
import {
  UnauthorizedError,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";
import { PostPublishError } from "@/lib/github/posts";
import { publishAdminPost } from "@/lib/posts/publish";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  try {
    const result = await publishAdminPost(body);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.fields ? { fields: result.fields } : {}),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      slug: result.slug,
      path: result.path,
      action: result.action,
    });
  } catch (error) {
    if (error instanceof PostPublishError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[admin-posts-publish]", { error: "publish_failed" });
    return NextResponse.json(
      { error: "Não foi possível publicar o post." },
      { status: 500 }
    );
  }
}
