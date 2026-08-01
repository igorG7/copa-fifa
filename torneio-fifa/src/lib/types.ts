export interface Player {
  _id: string;
  nome: string;
}

export type GroupName = "A" | "B";

export interface Group {
  _id: string;
  nome: GroupName;
  jogadores: string[]; // Player._id[]
}

export interface Match {
  _id: string;
  grupo: GroupName;
  mandanteId: string;
  visitanteId: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  status: "pendente" | "finalizado";
}

export type FaseMataMata = "semifinal" | "terceiro" | "final";

export interface KnockoutMatch {
  _id: string;
  fase: FaseMataMata;
  ordem: number; // 1 ou 2 para semifinais, ajuda a ordenar na tela
  mandanteId: string | null;
  visitanteId: string | null;
  origemMandante: string; // rótulo, ex: "A1", "Vencedor SF1"
  origemVisitante: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  prorrogacao: boolean;
  golsProrrogacaoMandante: number | null;
  golsProrrogacaoVisitante: number | null;
  penaltis: boolean;
  penaltisMandante: number | null;
  penaltisVisitante: number | null;
  vencedorId: string | null;
  status: "pendente" | "finalizado";
}

export interface StandingRow {
  playerId: string;
  nome: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  posicao: number;
}

export interface TournamentState {
  _id: string; // documento único, id fixo "state"
  etapa: "aguardando_jogadores" | "grupos_sorteados" | "mata_mata_gerado" | "finalizado";
}
