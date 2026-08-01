"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";
import { useTournament } from "@/hooks/useTournament";
import PlayersSetupForm from "@/components/PlayersSetupForm";
import DrawAnimation from "@/components/DrawAnimation";
import TeamPicker from "@/components/TeamPicker";
import Escudo from "@/components/Escudo";

export default function HomePage() {
  const { isAdmin } = useAdmin();
  const { players, groups, matches, knockout, loading, refetch } =
    useTournament();
  const [editandoJogadores, setEditandoJogadores] = useState(false);

  if (loading) {
    return <p className="text-center text-muted">Carregando torneio...</p>;
  }

  const temJogadores = players.length === 8;
  const temGrupos = groups.length === 2;
  const jogosFinalizados = matches.filter(
    (m) => m.status === "finalizado",
  ).length;
  const totalJogos = matches.length;
  const grupoCompleto = totalJogos > 0 && jogosFinalizados === totalJogos;
  const temMataMata = knockout.length > 0;

  const nomeById = new Map(players.map((p) => [p._id, p.nome]));

  async function reiniciarTorneio() {
    const ok = window.confirm(
      "Isso apaga grupos, jogos e mata-mata (os jogadores continuam salvos). Continuar?",
    );
    if (!ok) return;
    await fetch("/api/reset", { method: "POST" });
    refetch();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
          Torneio entre amigos
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-chalk sm:text-6xl">
          8 jogadores. <span className="text-amber">1</span> campeão.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Fase de grupos com dois quartetos, depois semifinal, disputa de 3º
          lugar e a grande final. FIFA 17, todos contra todos.
        </p>
      </section>

      {!temJogadores && (
        <>
          {isAdmin ? (
            <PlayersSetupForm initial={players} onSaved={refetch} />
          ) : (
            <EmptyState
              titulo="Aguardando o admin cadastrar os jogadores"
              texto="Assim que os 8 nomes forem definidos, o sorteio dos grupos aparece aqui."
            />
          )}
        </>
      )}

      {temJogadores && !temGrupos && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
            Elenco confirmado
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-wide text-chalk">
            Prontos para o sorteio
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-chalk sm:grid-cols-4">
            {players.map((p, i) => (
              <li key={p._id} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted">{i + 1}</span>
                <Escudo
                  escudoUrl={p.escudoUrl}
                  rotulo={p.time || p.nome}
                  size={45}
                />
                {p.nome}
              </li>
            ))}
          </ul>

          {isAdmin ? (
            <div className="mt-6 space-y-4">
              <DrawAnimation players={players} onFinished={refetch} />
              <button
                onClick={() => setEditandoJogadores((v) => !v)}
                className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-chalk"
              >
                {editandoJogadores ? "Cancelar edição" : "Editar jogadores"}
              </button>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Aguardando o admin sortear os grupos.
            </p>
          )}

          {isAdmin && editandoJogadores && (
            <div className="mt-6">
              <PlayersSetupForm
                initial={players}
                onSaved={() => {
                  setEditandoJogadores(false);
                  refetch();
                }}
              />
            </div>
          )}
        </section>
      )}

      {temJogadores && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
            Escudos
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-wide text-chalk">
            Time de cada jogador
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isAdmin
              ? "Escolha o time de cada um pra aparecer o escudo na tabela e nos jogos."
              : "Times escolhidos pelos jogadores para o torneio."}
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {players.map((p) =>
              isAdmin ? (
                <TeamPicker key={p._id} player={p} onSaved={refetch} />
              ) : (
                <div
                  key={p._id}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5"
                >
                  <Escudo
                    escudoUrl={p.escudoUrl}
                    rotulo={p.time || p.nome}
                    size={45}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-chalk">
                      {p.nome}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {p.time || "Sem time definido"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {temGrupos && (
        <section className="grid gap-4 sm:grid-cols-2">
          <StatusCard
            titulo="Fase de grupos"
            valor={`${jogosFinalizados}/${totalJogos} jogos`}
            descricao={
              grupoCompleto
                ? "Todos os jogos foram lançados."
                : "Ainda faltam placares para completar a fase."
            }
            href="/grupos"
            cta="Ver tabela e jogos"
          />
          <StatusCard
            titulo="Mata-mata"
            valor={
              temMataMata
                ? "Chaveamento gerado"
                : grupoCompleto
                  ? "Pronto para gerar"
                  : "Aguardando fase de grupos"
            }
            descricao={
              temMataMata
                ? "Acompanhe semifinais, final e disputa de 3º lugar."
                : "É liberado assim que todos os jogos de grupo tiverem placar."
            }
            href="/mata-mata"
            cta="Ver chaveamento"
          />
        </section>
      )}

      {temGrupos && isAdmin && (
        <div className="flex justify-center">
          <button
            onClick={reiniciarTorneio}
            className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-danger"
          >
            Reiniciar sorteio e jogos
          </button>
        </div>
      )}

      {temGrupos && !isAdmin && nomeById.size > 0 && null}
    </div>
  );
}

function EmptyState({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center">
      <h2 className="font-display text-2xl tracking-wide text-chalk">
        {titulo}
      </h2>
      <p className="mt-2 text-sm text-muted">{texto}</p>
    </section>
  );
}

function StatusCard({
  titulo,
  valor,
  descricao,
  href,
  cta,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
          {titulo}
        </p>
        <p className="mt-2 font-display text-3xl tracking-wide text-chalk">
          {valor}
        </p>
        <p className="mt-1 text-sm text-muted">{descricao}</p>
      </div>
      <Link
        href={href}
        className="mt-5 inline-block rounded-lg border border-line bg-pitchnight px-4 py-2 text-center text-sm font-semibold text-chalk transition-colors hover:border-amber"
      >
        {cta}
      </Link>
    </div>
  );
}
