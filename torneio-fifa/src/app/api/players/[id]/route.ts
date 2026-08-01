import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: { time?: string; escudoUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const time = (body.time || "").trim();
  const escudoUrl = (body.escudoUrl || "").trim();

  if (!time || !escudoUrl) {
    return NextResponse.json(
      { error: "Informe o time e a URL do escudo." },
      { status: 400 }
    );
  }

  if (!/^https?:\/\//i.test(escudoUrl)) {
    return NextResponse.json(
      { error: "A URL do escudo precisa começar com http(s)://." },
      { status: 400 }
    );
  }

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("players").findOneAndUpdate(
    { _id: objectId },
    { $set: { time, escudoUrl } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Jogador não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    player: {
      _id: result._id.toString(),
      nome: result.nome,
      time: result.time,
      escudoUrl: result.escudoUrl,
    },
  });
}
