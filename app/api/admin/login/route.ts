import { NextResponse } from "next/server";
import { AUTH_ERROR_MESSAGE, GENERIC_LOGIN_ERROR } from "@/lib/auth/constants";
import { isUsablePassword, verifyAdminPassword } from "@/lib/auth/password";
import {
  getClientIp,
  isLoginRateLimited,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/auth/rate-limit";
import {
  createAdminSessionToken,
  isAllowedAdminOrigin,
  setAdminSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedAdminOrigin(request)) {
    return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
  }

  const ip = getClientIp(request);
  if (isLoginRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    const body = (await request.json()) as { password?: unknown };
    password = body.password;
  } catch {
    recordLoginFailure(ip);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
  }

  if (!isUsablePassword(password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
  }

  const valid = await verifyAdminPassword(password);
  if (!valid) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
  }

  try {
    const token = await createAdminSessionToken();
    await setAdminSessionCookie(token);
  } catch {
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 500 });
  }

  resetLoginFailures(ip);
  return NextResponse.json({ ok: true });
}
