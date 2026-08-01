import { Match, Player, StandingRow } from "./types";

interface Accum {
  playerId: string;
  nome: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
}

function baseRow(p: Player): Accum {
  return {
    playerId: p._id,
    nome: p.nome,
    pontos: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsPro: 0,
    golsContra: 0,
  };
}

function applyResult(
  row: Accum,
  golsFeitos: number,
  golsSofridos: number
) {
  row.jogos += 1;
  row.golsPro += golsFeitos;
  row.golsContra += golsSofridos;
  if (golsFeitos > golsSofridos) {
    row.vitorias += 1;
    row.pontos += 3;
  } else if (golsFeitos === golsSofridos) {
    row.empates += 1;
    row.pontos += 1;
  } else {
    row.derrotas += 1;
  }
}

/**
 * Calcula a tabela de um grupo aplicando, em ordem, os critérios usados em
 * competições como Copa do Mundo e Champions League:
 *  1. Pontos
 *  2. Confronto direto entre os empatados (pontos > saldo > gols marcados,
 *     considerando só os jogos entre eles)
 *  3. Saldo de gols geral
 *  4. Gols marcados geral
 *  5. Sorteio (mantém a ordem atual, sinalizado para o time decidir)
 */
export function computeStandings(
  players: Player[],
  matches: Match[]
): StandingRow[] {
  const rows = new Map<string, Accum>();
  for (const p of players) rows.set(p._id, baseRow(p));

  const finished = matches.filter((m) => m.status === "finalizado");

  for (const m of finished) {
    const home = rows.get(m.mandanteId);
    const away = rows.get(m.visitanteId);
    if (!home || !away || m.golsMandante === null || m.golsVisitante === null)
      continue;
    applyResult(home, m.golsMandante, m.golsVisitante);
    applyResult(away, m.golsVisitante, m.golsMandante);
  }

  const all = Array.from(rows.values());

  // Agrupa por pontos para aplicar confronto direto dentro de cada grupo de empatados
  const byPoints = new Map<number, Accum[]>();
  for (const r of all) {
    const arr = byPoints.get(r.pontos) ?? [];
    arr.push(r);
    byPoints.set(r.pontos, arr);
  }

  function headToHeadScore(group: Accum[]): Map<string, number> {
    // mini tabela só com jogos entre os jogadores empatados
    const ids = new Set(group.map((g) => g.playerId));
    const mini = new Map<string, { pts: number; sg: number; gp: number }>();
    for (const g of group) mini.set(g.playerId, { pts: 0, sg: 0, gp: 0 });

    for (const m of finished) {
      if (!ids.has(m.mandanteId) || !ids.has(m.visitanteId)) continue;
      if (m.golsMandante === null || m.golsVisitante === null) continue;
      const home = mini.get(m.mandanteId)!;
      const away = mini.get(m.visitanteId)!;
      home.gp += m.golsMandante;
      away.gp += m.golsVisitante;
      home.sg += m.golsMandante - m.golsVisitante;
      away.sg += m.golsVisitante - m.golsMandante;
      if (m.golsMandante > m.golsVisitante) home.pts += 3;
      else if (m.golsMandante < m.golsVisitante) away.pts += 3;
      else {
        home.pts += 1;
        away.pts += 1;
      }
    }

    // pontuação composta só para ordenar (pts * 1e6 + sg * 1e3 + gp)
    const score = new Map<string, number>();
    for (const [id, v] of mini) {
      score.set(id, v.pts * 1_000_000 + (v.sg + 500) * 1_000 + v.gp);
    }
    return score;
  }

  const tieBreakScores = new Map<string, number>();
  for (const group of byPoints.values()) {
    if (group.length > 1) {
      const h2h = headToHeadScore(group);
      for (const g of group) tieBreakScores.set(g.playerId, h2h.get(g.playerId) ?? 0);
    } else {
      tieBreakScores.set(group[0].playerId, 0);
    }
  }

  const sorted = [...all].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;

    const h2hA = tieBreakScores.get(a.playerId) ?? 0;
    const h2hB = tieBreakScores.get(b.playerId) ?? 0;
    if (h2hB !== h2hA) return h2hB - h2hA;

    const sgA = a.golsPro - a.golsContra;
    const sgB = b.golsPro - b.golsContra;
    if (sgB !== sgA) return sgB - sgA;

    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;

    return a.nome.localeCompare(b.nome);
  });

  return sorted.map((r, idx) => ({
    playerId: r.playerId,
    nome: r.nome,
    pontos: r.pontos,
    jogos: r.jogos,
    vitorias: r.vitorias,
    empates: r.empates,
    derrotas: r.derrotas,
    golsPro: r.golsPro,
    golsContra: r.golsContra,
    saldoGols: r.golsPro - r.golsContra,
    posicao: idx + 1,
  }));
}
