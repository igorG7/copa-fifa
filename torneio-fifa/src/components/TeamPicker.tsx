"use client";

import { useState } from "react";
import { Player } from "@/lib/types";
import { TEAM_PRESETS } from "@/lib/teams";
import Escudo from "./Escudo";

export default function TeamPicker({
  player,
  onSaved,
}: {
  player: Player;
  onSaved: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [modoCustom, setModoCustom] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar(time: string, escudoUrl: string) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/players/${player._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, escudoUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível salvar o time.");
      return;
    }
    setAberto(false);
    setModoCustom(false);
    setCustomTime("");
    setCustomUrl("");
    onSaved();
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-2.5">
        <Escudo
          escudoUrl={player.escudoUrl}
          rotulo={player.time || player.nome}
          size={45}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-chalk">
            {player.nome}
          </p>
          <p className="truncate text-xs text-muted">
            {player.time || "Sem time definido"}
          </p>
        </div>
        <button
          onClick={() => setAberto((v) => !v)}
          className="shrink-0 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-chalk"
        >
          {aberto ? "Fechar" : player.time ? "Trocar" : "Escolher"}
        </button>
      </div>

      {aberto && (
        <div className="mt-3 border-t border-line pt-3">
          {!modoCustom ? (
            <>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {TEAM_PRESETS.map((t) => (
                  <button
                    key={t.nome}
                    disabled={saving}
                    onClick={() => salvar(t.nome, t.escudoUrl)}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-pitchnight px-2 py-1.5 text-left text-xs text-chalk hover:border-amber disabled:opacity-40"
                  >
                    <Escudo escudoUrl={t.escudoUrl} rotulo={t.nome} size={28} />
                    <span className="truncate">{t.nome}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModoCustom(true)}
                className="mt-2.5 text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-chalk"
              >
                Não está na lista? Colar um link de escudo
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="Nome do time"
                className="w-full rounded-lg border border-line bg-pitchnight px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://... link da imagem do escudo"
                className="w-full rounded-lg border border-line bg-pitchnight px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => salvar(customTime.trim(), customUrl.trim())}
                  disabled={saving || !customTime.trim() || !customUrl.trim()}
                  className="rounded-md bg-amber px-3 py-1.5 text-xs font-bold uppercase tracking-widest2 text-pitchnight disabled:opacity-40"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => setModoCustom(false)}
                  className="text-xs text-muted hover:text-chalk"
                >
                  Voltar pra lista
                </button>
              </div>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
