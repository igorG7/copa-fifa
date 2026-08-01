"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      router.push("/");
    } else {
      setError("Senha incorreta. Confere com quem organiza o torneio.");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
          Acesso restrito
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-chalk">
          Login do administrador
        </h1>
        <p className="mt-2 text-sm text-muted">
          Só o admin sorteia os grupos e lança os placares.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-surface p-6 shadow-card"
      >
        <label className="block text-xs font-semibold uppercase tracking-widest2 text-muted">
          Senha
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line bg-pitchnight px-3.5 py-2.5 text-chalk outline-none focus:border-amber"
          placeholder="••••••••"
        />
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading || password.length === 0}
          className="mt-5 w-full rounded-lg bg-amber py-2.5 text-sm font-bold uppercase tracking-widest2 text-pitchnight transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
