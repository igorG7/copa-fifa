import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Gera os 6 confrontos de todos-contra-todos (turno único) de um grupo de 4.
function gerarConfrontos(grupo: "A" | "B", jogadores: string[]) {
  const confrontos: {
    grupo: "A" | "B";
    mandanteId: string;
    visitanteId: string;
    golsMandante: null;
    golsVisitante: null;
    status: "pendente";
  }[] = [];
  for (let i = 0; i < jogadores.length; i++) {
    for (let j = i + 1; j < jogadores.length; j++) {
      confrontos.push({
        grupo,
        mandanteId: jogadores[i],
        visitanteId: jogadores[j],
        golsMandante: null,
        golsVisitante: null,
        status: "pendente",
      });
    }
  }
  return shuffle(confrontos);
}

export async function GET() {
  const db = await getDb();
  const groups = await db.collection("groups").find().toArray();
  const state = await db
    .collection<{ _id: string; etapa: string }>("state")
    .findOne({ _id: "state" });

  return NextResponse.json({
    groups: groups.map((g) => ({
      _id: g._id.toString(),
      nome: g.nome,
      jogadores: g.jogadores,
    })),
    etapa: state?.etapa ?? "aguardando_jogadores",
  });
}

export async function POST(request: Request) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const db = await getDb();
  const players = await db.collection("players").find().toArray();

  if (players.length !== 8) {
    return NextResponse.json(
      { error: "É preciso ter exatamente 8 jogadores cadastrados." },
      { status: 400 }
    );
  }

  const ids = players.map((p) => p._id.toString());
  const embaralhados = shuffle(ids);
  const grupoA = embaralhados.slice(0, 4);
  const grupoB = embaralhados.slice(4, 8);

  await db.collection("groups").deleteMany({});
  await db.collection("matches").deleteMany({});
  await db.collection("knockout").deleteMany({});

  await db.collection("groups").insertMany([
    { nome: "A", jogadores: grupoA },
    { nome: "B", jogadores: grupoB },
  ]);

  const confrontos = [
    ...gerarConfrontos("A", grupoA),
    ...gerarConfrontos("B", grupoB),
  ];
  await db.collection("matches").insertMany(confrontos);

  await db
    .collection<{ _id: string; etapa: string }>("state")
    .updateOne(
      { _id: "state" },
      { $set: { etapa: "grupos_sorteados" } },
      { upsert: true }
    );

  const groups = await db.collection("groups").find().toArray();
  return NextResponse.json({
    groups: groups.map((g) => ({
      _id: g._id.toString(),
      nome: g.nome,
      jogadores: g.jogadores,
    })),
  });
}
