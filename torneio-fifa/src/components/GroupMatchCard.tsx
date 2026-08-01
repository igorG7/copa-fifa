"use client";

import { useState } from "react";
import { Match } from "@/lib/types";

export default function GroupMatchCard({
  match,
  nomeMandante,
  nomeVisitante,
  isAdmin,
  onSaved,
}: {
  match: Match;
  nomeMandante: string;
  nomeVisitante: string;
  isAdmin: boolean;
  onSaved: () => void;
}) {
  const jogado = match.status === "finalizado";
  const [editando, setEditando] = useState(false);
  const [gm, setGm] = useState(match.golsMandante ?? 0);
  const [gv, setGv] = useState(match.golsVisitante ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/matches/${match._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ golsMandante: gm, golsVisitante: gv }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível salvar o placar.");
      return;
    }
    setEditando(false);
    onSaved();
  }

  const mostrarForm = isAdmin && (editando || !jogado);

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1 text-right text-sm text-chalk">
        <span className="truncate">{nomeMandante}</span>
      </div>

      {mostrarForm ? (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={gm}
            onChange={(e) => setGm(Math.max(0, Number(e.target.value)))}
            className="scoreboard-digit h-9 w-11 rounded-md text-center font-mono text-base font-bold text-amber outline-none"
          />
          <span className="text-muted">×</span>
          <input
            type="number"
            min={0}
            value={gv}
            onChange={(e) => setGv(Math.max(0, Number(e.target.value)))}
            className="scoreboard-digit h-9 w-11 rounded-md text-center font-mono text-base font-bold text-amber outline-none"
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span
            className={`scoreboard-digit${jogado ? "" : "-live"} flex h-9 w-11 items-center justify-center rounded-md font-mono text-base font-bold ${
              jogado ? "text-chalk" : "text-muted"
            }`}
          >
            {jogado ? match.golsMandante : "–"}
          </span>
          <span className="text-muted">×</span>
          <span
            className={`scoreboard-digit${jogado ? "" : "-live"} flex h-9 w-11 items-center justify-center rounded-md font-mono text-base font-bold ${
              jogado ? "text-chalk" : "text-muted"
            }`}
          >
            {jogado ? match.golsVisitante : "–"}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1 text-left text-sm text-chalk">
        <span className="truncate">{nomeVisitante}</span>
      </div>

      {isAdmin && (
        <div className="ml-1 shrink-0">
          {mostrarForm ? (
            <button
              onClick={salvar}
              disabled={saving}
              className="rounded-md bg-amber px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest2 text-pitchnight disabled:opacity-40"
            >
              {saving ? "..." : "Salvar"}
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-chalk"
            >
              Editar
            </button>
          )}
        </div>
      )}

    </div>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
