import { NextResponse } from "next/server";
import { validateAndSerializePost } from "@/lib/posts/admin-validate";
import { parseEditorPostRequest } from "@/lib/posts/admin-request";
import {
  UnauthorizedError,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";

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

  const parsed = parseEditorPostRequest(body);
  if (!parsed) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  try {
    const result = await validateAndSerializePost(parsed);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin-posts-validate]", { error: "validate_failed" });
    return NextResponse.json(
      { error: "Não foi possível gerar o MDX." },
      { status: 500 }
    );
  }
}
