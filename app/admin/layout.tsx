import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import LogoutButton from "./logout-button";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  return (
    <div className="min-h-full bg-neutral-50 text-neutral-900">
      {session ? (
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-6">
              <p className="text-sm font-semibold">Admin</p>
              <nav className="flex items-center gap-4 text-sm text-neutral-600">
                <Link href="/admin" className="hover:text-neutral-900">
                  Painel
                </Link>
                <Link href="/admin/posts" className="hover:text-neutral-900">
                  Posts
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
