import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";
import { computeStandings } from "@/lib/standings";
import { Match, Player } from "@/lib/types";

export async function GET() {
  const db = await getDb();
  const knockout = await db.collection("knockout").find().toArray();
  return NextResponse.json({
    knockout: knockout.map((k) => ({
      _id: k._id.toString(),
      fase: k.fase,
      ordem: k.ordem,
      mandanteId: k.mandanteId,
      visitanteId: k.visitanteId,
      origemMandante: k.origemMandante,
      origemVisitante: k.origemVisitante,
      golsMandante: k.golsMandante,
      golsVisitante: k.golsVisitante,
      prorrogacao: k.prorrogacao,
      golsProrrogacaoMandante: k.golsProrrogacaoMandante,
      golsProrrogacaoVisitante: k.golsProrrogacaoVisitante,
      penaltis: k.penaltis,
      penaltisMandante: k.penaltisMandante,
      penaltisVisitante: k.penaltisVisitante,
      vencedorId: k.vencedorId,
      status: k.status,
    })),
  });
}

export async function POST(request: Request) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const db = await getDb();

  const [groupsDocs, playersDocs, matchesDocs] = await Promise.all([
    db.collection("groups").find().toArray(),
    db.collection("players").find().toArray(),
    db.collection("matches").find().toArray(),
  ]);

  if (groupsDocs.length !== 2) {
    return NextResponse.json(
      { error: "Sorteie os grupos antes de gerar o mata-mata." },
      { status: 400 }
    );
  }

  const matches = matchesDocs.map((m) => ({
    _id: m._id.toString(),
    grupo: m.grupo,
    mandanteId: m.mandanteId,
    visitanteId: m.visitanteId,
    golsMandante: m.golsMandante,
    golsVisitante: m.golsVisitante,
    status: m.status,
  })) as Match[];

  const pendentes = matches.filter((m) => m.status !== "finalizado");
  if (pendentes.length > 0) {
    return NextResponse.json(
      {
        error:
          "Ainda há jogos da fase de grupos sem placar. Finalize todos antes de gerar o mata-mata.",
      },
      { status: 400 }
    );
  }

  const players: Player[] = playersDocs.map((p) => ({
    _id: p._id.toString(),
    nome: p.nome,
  }));

  function topTwo(grupoNome: "A" | "B") {
    const group = groupsDocs.find((g) => g.nome === grupoNome)!;
    const groupPlayers = players.filter((p) => group.jogadores.includes(p._id));
    const groupMatches = matches.filter((m) => m.grupo === grupoNome);
    const standings = computeStandings(groupPlayers, groupMatches);
    return [standings[0], standings[1]];
  }

  const [a1, a2] = topTwo("A");
  const [b1, b2] = topTwo("B");

  await db.collection("knockout").deleteMany({});

  const docs = [
    {
      fase: "semifinal",
      ordem: 1,
      mandanteId: a1.playerId,
      visitanteId: b2.playerId,
      origemMandante: "A1",
      origemVisitante: "B2",
      golsMandante: null,
      golsVisitante: null,
      prorrogacao: false,
      golsProrrogacaoMandante: null,
      golsProrrogacaoVisitante: null,
      penaltis: false,
      penaltisMandante: null,
      penaltisVisitante: null,
      vencedorId: null,
      status: "pendente",
    },
    {
      fase: "semifinal",
      ordem: 2,
      mandanteId: b1.playerId,
      visitanteId: a2.playerId,
      origemMandante: "B1",
      origemVisitante: "A2",
      golsMandante: null,
      golsVisitante: null,
      prorrogacao: false,
      golsProrrogacaoMandante: null,
      golsProrrogacaoVisitante: null,
      penaltis: false,
      penaltisMandante: null,
      penaltisVisitante: null,
      vencedorId: null,
      status: "pendente",
    },
    {
      fase: "final",
      ordem: 1,
      mandanteId: null,
      visitanteId: null,
      origemMandante: "Vencedor SF1",
      origemVisitante: "Vencedor SF2",
      golsMandante: null,
      golsVisitante: null,
      prorrogacao: false,
      golsProrrogacaoMandante: null,
      golsProrrogacaoVisitante: null,
      penaltis: false,
      penaltisMandante: null,
      penaltisVisitante: null,
      vencedorId: null,
      status: "pendente",
    },
    {
      fase: "terceiro",
      ordem: 1,
      mandanteId: null,
      visitanteId: null,
      origemMandante: "Perdedor SF1",
      origemVisitante: "Perdedor SF2",
      golsMandante: null,
      golsVisitante: null,
      prorrogacao: false,
      golsProrrogacaoMandante: null,
      golsProrrogacaoVisitante: null,
      penaltis: false,
      penaltisMandante: null,
      penaltisVisitante: null,
      vencedorId: null,
      status: "pendente",
    },
  ];

  await db.collection("knockout").insertMany(docs);
  await db
    .collection<{ _id: string; etapa: string }>("state")
    .updateOne(
      { _id: "state" },
      { $set: { etapa: "mata_mata_gerado" } },
      { upsert: true }
    );

  const knockout = await db.collection("knockout").find().toArray();
  return NextResponse.json({
    knockout: knockout.map((k) => ({ ...k, _id: k._id.toString() })),
  });
}
