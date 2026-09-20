import { getGitHubConnectionStatus } from "@/lib/github/repository";
import GitHubStatusCard from "./github-status";

export default async function AdminDashboardPage() {
  const githubStatus = await getGitHubConnectionStatus();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Você está conectado. Gerencie os posts MDX publicados na lista de posts.
      </p>
      <GitHubStatusCard initialStatus={githubStatus} />
    </main>
  );
}
