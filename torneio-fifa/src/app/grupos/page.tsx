"use client";

import { useAdmin } from "@/components/AdminContext";
import { useTournament } from "@/hooks/useTournament";
import { computeStandings } from "@/lib/standings";
import GroupTable from "@/components/GroupTable";
import GroupMatchCard from "@/components/GroupMatchCard";
import Link from "next/link";

export default function GruposPage() {
  const { isAdmin } = useAdmin();
  const { players, groups, matches, loading, refetch } = useTournament();

  if (loading) {
    return <p className="text-center text-muted">Carregando...</p>;
  }

  if (groups.length !== 2) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center">
        <h1 className="font-display text-2xl tracking-wide text-chalk">
          Os grupos ainda não foram sorteados
        </h1>
        <p className="mt-2 text-sm text-muted">
          Volte para a página inicial para configurar os jogadores e sortear.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg border border-line bg-pitchnight px-4 py-2 text-sm font-semibold text-chalk hover:border-amber"
        >
          Ir para o início
        </Link>
      </div>
    );
  }

  const nomeById = new Map(players.map((p) => [p._id, p.nome]));

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
          Fase de grupos
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-chalk">
          Tabela e jogos
        </h1>
        <p className="mt-1 text-sm text-muted">
          Turno único, todos contra todos. Os dois primeiros de cada grupo avançam.
        </p>
      </div>

      {groups.map((grupo) => {
        const groupPlayers = players.filter((p) => grupo.jogadores.includes(p._id));
        const groupMatches = matches.filter((m) => m.grupo === grupo.nome);
        const standings = computeStandings(groupPlayers, groupMatches);

        return (
          <section key={grupo._id} className="space-y-4">
            <GroupTable nome={grupo.nome} standings={standings} />
            <div className="space-y-2.5">
              {groupMatches.map((m) => (
                <GroupMatchCard
                  key={m._id}
                  match={m}
                  nomeMandante={nomeById.get(m.mandanteId) ?? "?"}
                  nomeVisitante={nomeById.get(m.visitanteId) ?? "?"}
                  isAdmin={isAdmin}
                  onSaved={refetch}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
