import { NextResponse } from "next/server";
import {
  UnauthorizedError,
  clearAdminSessionCookie,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedAdminOrigin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await requireAdminSession();
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      throw error;
    }
  }

  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
