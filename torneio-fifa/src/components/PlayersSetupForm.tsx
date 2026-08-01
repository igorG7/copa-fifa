"use client";

import { useState } from "react";
import { Player } from "@/lib/types";

export default function PlayersSetupForm({
  initial,
  onSaved,
}: {
  initial: Player[];
  onSaved: () => void;
}) {
  const [nomes, setNomes] = useState<string[]>(() => {
    const arr = initial.map((p) => p.nome);
    while (arr.length < 8) arr.push("");
    return arr.slice(0, 8);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateNome(i: number, v: string) {
    setNomes((prev) => prev.map((n, idx) => (idx === i ? v : n)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = nomes.map((n) => n.trim());
    if (trimmed.some((n) => n.length === 0)) {
      setError("Preencha os 8 nomes.");
      return;
    }
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== 8) {
      setError("Os nomes precisam ser diferentes entre si.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomes: trimmed }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível salvar os jogadores.");
      return;
    }
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
        Configuração inicial
      </p>
      <h2 className="mt-1 font-display text-2xl tracking-wide text-chalk">
        Quem são os 8 jogadores?
      </h2>
      <p className="mt-1 text-sm text-muted">
        Digite o nome (ou apelido) de cada um. Dá pra editar e sortear de novo depois.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nomes.map((nome, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-pitchnight font-mono text-sm text-muted">
              {i + 1}
            </span>
            <input
              value={nome}
              onChange={(e) => updateNome(i, e.target.value)}
              placeholder={`Jogador ${i + 1}`}
              className="w-full rounded-lg border border-line bg-pitchnight px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-lg bg-amber py-2.5 text-sm font-bold uppercase tracking-widest2 text-pitchnight transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-8"
      >
        {saving ? "Salvando..." : "Salvar jogadores"}
      </button>
    </form>
  );
}
