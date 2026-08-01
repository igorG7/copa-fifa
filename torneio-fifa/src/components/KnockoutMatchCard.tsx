"use client";

import { useState } from "react";
import { KnockoutMatch } from "@/lib/types";

const faseLabel: Record<KnockoutMatch["fase"], string> = {
  semifinal: "Semifinal",
  final: "Final",
  terceiro: "Disputa de 3º lugar",
};

export default function KnockoutMatchCard({
  match,
  nomeMandante,
  nomeVisitante,
  isAdmin,
  onSaved,
}: {
  match: KnockoutMatch;
  nomeMandante: string | null;
  nomeVisitante: string | null;
  isAdmin: boolean;
  onSaved: () => void;
}) {
  const definido = Boolean(match.mandanteId && match.visitanteId);
  const jogado = match.status === "finalizado";

  const [editando, setEditando] = useState(false);
  const [gm, setGm] = useState(match.golsMandante ?? 0);
  const [gv, setGv] = useState(match.golsVisitante ?? 0);
  const [pm, setPm] = useState(match.golsProrrogacaoMandante ?? 0);
  const [pv, setPv] = useState(match.golsProrrogacaoVisitante ?? 0);
  const [pkm, setPkm] = useState(match.penaltisMandante ?? 0);
  const [pkv, setPkv] = useState(match.penaltisVisitante ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empateNormal = gm === gv;
  const empateProrrogacao = empateNormal && pm === pv;

  async function salvar() {
    setSaving(true);
    setError(null);
    const body: Record<string, number> = { golsMandante: gm, golsVisitante: gv };
    if (empateNormal) {
      body.golsProrrogacaoMandante = pm;
      body.golsProrrogacaoVisitante = pv;
    }
    if (empateProrrogacao) {
      body.penaltisMandante = pkm;
      body.penaltisVisitante = pkv;
    }
    const res = await fetch(`/api/knockout/${match._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível salvar o resultado.");
      return;
    }
    setEditando(false);
    onSaved();
  }

  const mostrarForm = isAdmin && definido && (editando || !jogado);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest2 text-amber">
          {faseLabel[match.fase]}
        </span>
        {jogado && match.penaltis && (
          <span className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
            Pênaltis {match.penaltisMandante}–{match.penaltisVisitante}
          </span>
        )}
        {jogado && match.prorrogacao && !match.penaltis && (
          <span className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
            Prorrogação
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Nome
          nome={nomeMandante}
          origem={match.origemMandante}
          vencedor={jogado && match.vencedorId === match.mandanteId}
          alinhamento="right"
        />

        <div className="flex flex-col items-center gap-1.5">
          {!definido ? (
            <span className="font-mono text-xs text-muted">a definir</span>
          ) : mostrarForm ? (
            <PlacarForm
              gm={gm}
              gv={gv}
              setGm={setGm}
              setGv={setGv}
              empateNormal={empateNormal}
              pm={pm}
              pv={pv}
              setPm={setPm}
              setPv={setPv}
              empateProrrogacao={empateProrrogacao}
              pkm={pkm}
              pkv={pkv}
              setPkm={setPkm}
              setPkv={setPkv}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <Digito valor={jogado ? match.golsMandante : "–"} vivo={!jogado} />
              <span className="text-muted">×</span>
              <Digito valor={jogado ? match.golsVisitante : "–"} vivo={!jogado} />
            </div>
          )}
        </div>

        <Nome
          nome={nomeVisitante}
          origem={match.origemVisitante}
          vencedor={jogado && match.vencedorId === match.visitanteId}
          alinhamento="left"
        />
      </div>

      {isAdmin && definido && (
        <div className="mt-3 flex justify-center">
          {mostrarForm ? (
            <button
              onClick={salvar}
              disabled={saving}
              className="rounded-md bg-amber px-4 py-1.5 text-xs font-bold uppercase tracking-widest2 text-pitchnight disabled:opacity-40"
            >
              {saving ? "Salvando..." : "Salvar resultado"}
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-chalk"
            >
              Editar resultado
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}

function Nome({
  nome,
  origem,
  vencedor,
  alinhamento,
}: {
  nome: string | null;
  origem: string;
  vencedor: boolean;
  alinhamento: "left" | "right";
}) {
  return (
    <div
      className={`min-w-0 flex-1 text-sm ${
        alinhamento === "right" ? "text-right" : "text-left"
      }`}
    >
      <p
        className={`truncate ${
          vencedor ? "font-bold text-amber" : "text-chalk"
        }`}
      >
        {nome ?? origem}
      </p>
      {!nome && (
        <p className="text-[10px] uppercase tracking-widest2 text-muted">
          {origem}
        </p>
      )}
    </div>
  );
}

function Digito({ valor, vivo }: { valor: number | string | null; vivo: boolean }) {
  return (
    <span
      className={`scoreboard-digit${vivo ? "-live" : ""} flex h-9 w-11 items-center justify-center rounded-md font-mono text-base font-bold ${
        vivo ? "text-muted" : "text-chalk"
      }`}
    >
      {valor}
    </span>
  );
}

function PlacarForm(props: {
  gm: number;
  gv: number;
  setGm: (n: number) => void;
  setGv: (n: number) => void;
  empateNormal: boolean;
  pm: number;
  pv: number;
  setPm: (n: number) => void;
  setPv: (n: number) => void;
  empateProrrogacao: boolean;
  pkm: number;
  pkv: number;
  setPkm: (n: number) => void;
  setPkv: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1.5">
        <InputDigito valor={props.gm} onChange={props.setGm} />
        <span className="text-muted">×</span>
        <InputDigito valor={props.gv} onChange={props.setGv} />
      </div>
      <p className="text-center text-[10px] uppercase tracking-widest2 text-muted">
        Tempo normal
      </p>

      {props.empateNormal && (
        <>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <InputDigito valor={props.pm} onChange={props.setPm} pequeno />
            <span className="text-muted">×</span>
            <InputDigito valor={props.pv} onChange={props.setPv} pequeno />
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest2 text-muted">
            Prorrogação
          </p>
        </>
      )}

      {props.empateProrrogacao && (
        <>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <InputDigito valor={props.pkm} onChange={props.setPkm} pequeno />
            <span className="text-muted">×</span>
            <InputDigito valor={props.pkv} onChange={props.setPkv} pequeno />
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest2 text-muted">
            Pênaltis
          </p>
        </>
      )}
    </div>
  );
}

function InputDigito({
  valor,
  onChange,
  pequeno,
}: {
  valor: number;
  onChange: (n: number) => void;
  pequeno?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      value={valor}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className={`scoreboard-digit rounded-md text-center font-mono font-bold text-amber outline-none ${
        pequeno ? "h-7 w-9 text-sm" : "h-9 w-11 text-base"
      }`}
    />
  );
}
