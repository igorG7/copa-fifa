"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";
import { useTournament } from "@/hooks/useTournament";
import KnockoutMatchCard from "@/components/KnockoutMatchCard";

export default function MataMataPage() {
  const { isAdmin } = useAdmin();
  const { players, matches, knockout, loading, refetch } = useTournament();
  const [gerando, setGerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <p className="text-center text-muted">Carregando...</p>;
  }

  const totalJogos = matches.length;
  const jogosFinalizados = matches.filter((m) => m.status === "finalizado").length;
  const grupoCompleto = totalJogos > 0 && jogosFinalizados === totalJogos;

  const nomeById = new Map(players.map((p) => [p._id, p.nome]));

  async function gerarMataMata() {
    setError(null);
    setGerando(true);
    const res = await fetch("/api/knockout", { method: "POST" });
    setGerando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível gerar o mata-mata.");
      return;
    }
    refetch();
  }

  if (knockout.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center">
        <h1 className="font-display text-2xl tracking-wide text-chalk">
          Mata-mata ainda não gerado
        </h1>
        <p className="mt-2 text-sm text-muted">
          {grupoCompleto
            ? "A fase de grupos está completa. Já dá para gerar as semifinais."
            : `Faltam ${totalJogos - jogosFinalizados} jogo(s) de grupo para finalizar.`}
        </p>

        {isAdmin && grupoCompleto && (
          <button
            onClick={gerarMataMata}
            disabled={gerando}
            className="mt-5 rounded-lg bg-amber px-6 py-2.5 text-sm font-bold uppercase tracking-widest2 text-pitchnight transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {gerando ? "Gerando..." : "Gerar semifinais"}
          </button>
        )}
        {!grupoCompleto && (
          <Link
            href="/grupos"
            className="mt-5 inline-block rounded-lg border border-line bg-pitchnight px-4 py-2 text-sm font-semibold text-chalk hover:border-amber"
          >
            Ver jogos de grupo
          </Link>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const semifinais = knockout
    .filter((k) => k.fase === "semifinal")
    .sort((a, b) => a.ordem - b.ordem);
  const final = knockout.find((k) => k.fase === "final");
  const terceiro = knockout.find((k) => k.fase === "terceiro");

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
          Mata-mata
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-chalk">
          Chaveamento
        </h1>
        <p className="mt-1 text-sm text-muted">
          Empate no tempo normal vai para a prorrogação e, se persistir, para os pênaltis.
        </p>
      </div>

      <section>
        <SectionTitle>Semifinais</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {semifinais.map((k) => (
            <KnockoutMatchCard
              key={k._id}
              match={k}
              nomeMandante={k.mandanteId ? nomeById.get(k.mandanteId) ?? null : null}
              nomeVisitante={k.visitanteId ? nomeById.get(k.visitanteId) ?? null : null}
              isAdmin={isAdmin}
              onSaved={refetch}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Final</SectionTitle>
          {final && (
            <KnockoutMatchCard
              match={final}
              nomeMandante={final.mandanteId ? nomeById.get(final.mandanteId) ?? null : null}
              nomeVisitante={final.visitanteId ? nomeById.get(final.visitanteId) ?? null : null}
              isAdmin={isAdmin}
              onSaved={refetch}
            />
          )}
        </div>
        <div>
          <SectionTitle>Disputa de 3º lugar</SectionTitle>
          {terceiro && (
            <KnockoutMatchCard
              match={terceiro}
              nomeMandante={terceiro.mandanteId ? nomeById.get(terceiro.mandanteId) ?? null : null}
              nomeVisitante={terceiro.visitanteId ? nomeById.get(terceiro.visitanteId) ?? null : null}
              isAdmin={isAdmin}
              onSaved={refetch}
            />
          )}
        </div>
      </section>

      {final?.status === "finalizado" && (
        <section className="rounded-2xl border border-amber/40 bg-amber/10 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
            Campeão do torneio
          </p>
          <p className="mt-1 font-display text-4xl tracking-wide text-chalk">
            {nomeById.get(final.vencedorId ?? "") ?? "—"}
          </p>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-widest2 text-muted">
      {children}
    </h2>
  );
}
