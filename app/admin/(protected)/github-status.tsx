"use client";

import { useCallback, useState } from "react";
import type { GitHubConnectionStatus } from "@/lib/github/types";

interface GitHubStatusCardProps {
  initialStatus: GitHubConnectionStatus;
}

export default function GitHubStatusCard({
  initialStatus,
}: GitHubStatusCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    if (pending) return;
    setPending(true);

    try {
      const response = await fetch("/api/admin/github/status");
      const data = (await response.json().catch(() => null)) as
        | GitHubConnectionStatus
        | { error?: string }
        | null;

      if (response.status === 401) {
        setStatus({
          connected: false,
          error: "Você não está conectado.",
        });
        return;
      }

      if (data && "connected" in data) {
        setStatus(data);
        return;
      }

      setStatus({
        connected: false,
        error: "Não foi possível verificar o status do GitHub.",
      });
    } catch {
      setStatus({
        connected: false,
        error: "Não foi possível verificar o status do GitHub.",
      });
    } finally {
      setPending(false);
    }
  }, [pending]);

  return (
    <section className="mt-10 rounded border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold tracking-tight">
        Repositório GitHub
      </h2>

      <p className="mt-3 flex items-center gap-2 text-sm">
        <span
          className={[
            "inline-block h-2.5 w-2.5 rounded-full",
            status.connected ? "bg-green-600" : "bg-neutral-400",
          ].join(" ")}
          aria-hidden
        />
        <span className="font-medium">
          {status.connected ? "Conectado" : "Não conectado"}
        </span>
      </p>

      {status.connected ? (
        <dl className="mt-4 space-y-2 text-sm text-neutral-700">
          <div>
            <dt className="text-neutral-500">Repositório</dt>
            <dd className="font-medium">
              {status.owner}/{status.repository}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Branch</dt>
            <dd className="font-medium">{status.branch}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {status.error}
        </p>
      )}

      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="mt-5 rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
      >
        {pending ? "Verificando..." : "Atualizar status"}
      </button>
    </section>
  );
}
