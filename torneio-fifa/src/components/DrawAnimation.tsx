"use client";

import { useRef, useState } from "react";
import { Player } from "@/lib/types";
import Escudo from "./Escudo";

type Pick = { playerId: string; grupo: "A" | "B" };
type Fase = "idle" | "sorteando" | "concluido";

const TEMPO_SPOTLIGHT = 5000; // quanto tempo o nome fica em destaque antes de ir pra coluna
const TEMPO_PAUSA = 1000; // pausa entre um sorteado e o próximo
const TEMPO_FINAL = 5000; // pausa antes de liberar a tela final
const ROLETA_DURACAO = 7000; // quanto tempo a roleta gira antes de parar no sorteado
const ROLETA_PASSO = 90; // velocidade de troca de nome durante a roleta

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function DrawAnimation({
  players,
  onFinished,
  resortear = false,
}: {
  players: Player[];
  onFinished: () => void;
  resortear?: boolean;
}) {
  const [fase, setFase] = useState<Fase>("idle");
  const [colunaA, setColunaA] = useState<string[]>([]);
  const [colunaB, setColunaB] = useState<string[]>([]);
  const [destaque, setDestaque] = useState<Pick | null>(null);
  const [destaqueVisivel, setDestaqueVisivel] = useState(false);
  const [girando, setGirando] = useState(false);
  const [nomeGirando, setNomeGirando] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rodandoRef = useRef(false);

  const playerById = new Map(players.map((p) => [p._id, p]));

  async function roleta() {
    const passos = Math.floor(ROLETA_DURACAO / ROLETA_PASSO);
    setGirando(true);
    for (let i = 0; i < passos; i++) {
      if (!rodandoRef.current) break;
      const aleatorio = players[Math.floor(Math.random() * players.length)];
      setNomeGirando(aleatorio);
      await sleep(ROLETA_PASSO);
    }
    setGirando(false);
    setNomeGirando(null);
  }

  async function iniciar() {
    if (resortear) {
      const confirmado = window.confirm(
        "Isso vai gerar novos grupos e apagar os jogos e o mata-mata atuais. Continuar?",
      );
      if (!confirmado) return;
    }
    setError(null);
    setFase("sorteando");
    setColunaA([]);
    setColunaB([]);
    setDestaque(null);

    const res = await fetch("/api/groups", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível sortear os grupos.");
      setFase("idle");
      return;
    }
    const data: { ordem: Pick[] } = await res.json();

    rodandoRef.current = true;
    for (const pick of data.ordem) {
      if (!rodandoRef.current) return;
      await roleta();
      if (!rodandoRef.current) return;
      setDestaque(pick);
      setDestaqueVisivel(false);
      await sleep(30);
      setDestaqueVisivel(true);
      await sleep(TEMPO_SPOTLIGHT);
      if (pick.grupo === "A") {
        setColunaA((prev) => [...prev, pick.playerId]);
      } else {
        setColunaB((prev) => [...prev, pick.playerId]);
      }
      setDestaqueVisivel(false);
      await sleep(TEMPO_PAUSA);
    }

    setDestaque(null);
    setFase("concluido");
    await sleep(TEMPO_FINAL);
    onFinished();
  }

  if (fase === "idle") {
    return (
      <div>
        <button
          onClick={iniciar}
          className="rounded-lg bg-amber px-6 py-2.5 text-sm font-bold uppercase tracking-widest2 text-pitchnight transition-opacity hover:opacity-90"
        >
          {resortear ? "Sortear novamente" : "Sortear grupos"}
        </button>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const jogador = destaque ? playerById.get(destaque.playerId) : null;

  return (
    <div className="space-y-6">
      {/* Spotlight do sorteado atual */}
      <div className="flex h-24 items-center justify-center">
        {girando && nomeGirando ? (
          <div
            key={nomeGirando._id + Math.random()}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface2 px-6 py-3 opacity-60 blur-[1px]"
          >
            <Escudo
              escudoUrl={nomeGirando.escudoUrl}
              rotulo={nomeGirando.time || nomeGirando.nome}
              size={45}
            />
            <p className="font-display text-2xl leading-none tracking-wide text-muted">
              {nomeGirando.nome}
            </p>
          </div>
        ) : jogador ? (
          <div
            className={`flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-card transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              destaqueVisivel ? "scale-100 opacity-100" : "scale-50 opacity-0"
            } ${
              destaque?.grupo === "A"
                ? "border-amber/50 bg-amber/10"
                : "border-pitchbright/60 bg-pitch/15"
            }`}
          >
            <Escudo
              escudoUrl={jogador.escudoUrl}
              rotulo={jogador.time || jogador.nome}
              size={45}
            />
            <div>
              <p className="font-display text-2xl leading-none tracking-wide text-chalk">
                {jogador.nome}
              </p>
              <p
                className={`mt-1 text-xs font-bold uppercase tracking-widest2 ${
                  destaque?.grupo === "A" ? "text-amber" : "text-pitchbright"
                }`}
              >
                Grupo {destaque?.grupo}
              </p>
            </div>
          </div>
        ) : fase === "sorteando" ? (
          <p className="pulse-live text-xs font-bold uppercase tracking-widest2 text-muted">
            Sorteando...
          </p>
        ) : (
          <p className="text-xs font-bold uppercase tracking-widest2 text-amber">
            Sorteio concluído
          </p>
        )}
      </div>

      {/* Colunas dos grupos sendo preenchidas */}
      <div className="grid grid-cols-2 gap-4">
        <ColunaGrupo nome="A" ids={colunaA} playerById={playerById} />
        <ColunaGrupo nome="B" ids={colunaB} playerById={playerById} />
      </div>

      {error && <p className="text-center text-sm text-danger">{error}</p>}
    </div>
  );
}

function ColunaGrupo({
  nome,
  ids,
  playerById,
}: {
  nome: "A" | "B";
  ids: string[];
  playerById: Map<string, Player>;
}) {
  const slots = [...ids, ...Array(4 - ids.length).fill(null)];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="mb-3 text-center font-display text-xl tracking-wide text-chalk">
        Grupo {nome}
      </p>
      <div className="space-y-2">
        {slots.map((id, i) =>
          id ? (
            <div
              key={id}
              className="flex animate-[fadeIn_.3s_ease] items-center gap-2 rounded-lg border border-line bg-pitchnight px-2.5 py-2"
            >
              <Escudo
                escudoUrl={playerById.get(id)?.escudoUrl}
                rotulo={
                  playerById.get(id)?.time || playerById.get(id)?.nome || "?"
                }
                size={45}
              />
              <span className="truncate text-sm text-chalk">
                {playerById.get(id)?.nome}
              </span>
            </div>
          ) : (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-dashed border-line px-2.5 py-2"
            >
              <span className="h-5 w-5 shrink-0 rounded-full border border-line" />
              <span className="text-sm text-muted">—</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
