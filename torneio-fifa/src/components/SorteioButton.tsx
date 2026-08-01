"use client";

import { useState } from "react";

export default function SorteioButton({
  onDone,
  label = "Sortear grupos",
  resortear = false,
}: {
  onDone: () => void;
  label?: string;
  resortear?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (resortear) {
      const confirmado = window.confirm(
        "Isso vai gerar novos grupos e apagar os jogos e o mata-mata atuais. Continuar?"
      );
      if (!confirmado) return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/groups", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível sortear os grupos.");
      return;
    }
    onDone();
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-amber px-6 py-2.5 text-sm font-bold uppercase tracking-widest2 text-pitchnight transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {loading ? "Sorteando..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
