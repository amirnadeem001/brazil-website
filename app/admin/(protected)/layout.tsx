import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/constants";
import { getAdminSession } from "@/lib/auth/session";

/**
 * Session gate for authenticated admin pages.
 * Add new CMS routes under app/admin/(protected)/ so they inherit this check.
 * /admin/login stays outside this group and remains public.
 */
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return children;
}
