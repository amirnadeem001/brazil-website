import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

export type AdminSession = {
  role: "admin";
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value.replace(/\\\$/g, "$");
}

function getAuthSecret(): Uint8Array | null {
  const secret = readEnv("AUTH_SECRET");
  if (!secret || secret.length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, cookieOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const secret = getAuthSecret();
  if (!secret) {
    return null;
  }

  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.sub !== "admin" || payload.role !== "admin") {
      return null;
    }

    return { role: "admin" };
  } catch {
    return null;
  }
}

/**
 * Server-side guard for admin API routes and mutations.
 * Throws UnauthorizedError when the session is missing or invalid.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export function isAllowedAdminOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
