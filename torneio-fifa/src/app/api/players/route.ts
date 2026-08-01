import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";

export async function GET() {
  const db = await getDb();
  const players = await db.collection("players").find().toArray();
  const data = players.map((p) => ({ _id: p._id.toString(), nome: p.nome }));
  return NextResponse.json({ players: data });
}

// Substitui a lista completa de jogadores (usado na configuração inicial).
// Isso zera grupos, jogos e mata-mata, já que tudo depende de quem está jogando.
export async function POST(request: Request) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: { nomes?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const nomes = (body.nomes || [])
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (nomes.length !== 8) {
    return NextResponse.json(
      { error: "Informe exatamente 8 nomes." },
      { status: 400 }
    );
  }

  const db = await getDb();
  await db.collection("players").deleteMany({});
  await db.collection("groups").deleteMany({});
  await db.collection("matches").deleteMany({});
  await db.collection("knockout").deleteMany({});
  await db
    .collection<{ _id: string; etapa: string }>("state")
    .updateOne(
      { _id: "state" },
      { $set: { etapa: "aguardando_jogadores" } },
      { upsert: true }
    );

  const docs = nomes.map((nome) => ({ nome }));
  const result = await db.collection("players").insertMany(docs);

  const players = nomes.map((nome, idx) => ({
    _id: result.insertedIds[idx].toString(),
    nome,
  }));

  return NextResponse.json({ players });
}
