import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";
import { getAdminSession } from "@/lib/auth/session";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(ADMIN_HOME_PATH);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Login do Admin</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Entre com a senha de administrador.
      </p>
      <LoginForm />
    </main>
  );
}
