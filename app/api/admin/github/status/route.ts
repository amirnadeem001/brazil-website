import { NextResponse } from "next/server";
import {
  UnauthorizedError,
  isAllowedAdminOrigin,
  requireAdminSession,
} from "@/lib/auth/session";
import { getGitHubConnectionStatus } from "@/lib/github/repository";

export const runtime = "nodejs";

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

  const status = await getGitHubConnectionStatus();
  return NextResponse.json(status);
}
