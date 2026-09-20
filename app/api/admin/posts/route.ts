import { NextResponse } from "next/server";
import { getAdminPostSummaries } from "@/lib/posts/admin";
import {
  UnauthorizedError,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  try {
    const posts = getAdminPostSummaries();
    return NextResponse.json({
      posts,
      publishedCount: posts.length,
    });
  } catch (error) {
    console.error("[admin-posts]", { error: "catalog_load_failed" });
    return NextResponse.json(
      { error: "Não foi possível carregar os posts." },
      { status: 500 }
    );
  }
}
