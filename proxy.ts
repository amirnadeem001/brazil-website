import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/constants";

/**
 * Optimistic UX only. Cookie presence is not a security boundary.
 * JWT verification happens in admin layouts and API route handlers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = request.cookies.has(ADMIN_SESSION_COOKIE);
  const isLogin = pathname === ADMIN_LOGIN_PATH;
  const isAdminPage = pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`);

  if (isAdminPage && !isLogin && !hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
