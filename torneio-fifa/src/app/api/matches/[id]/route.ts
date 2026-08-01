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

  let body: { golsMandante?: number; golsVisitante?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { golsMandante, golsVisitante } = body;
  if (
    typeof golsMandante !== "number" ||
    typeof golsVisitante !== "number" ||
    golsMandante < 0 ||
    golsVisitante < 0 ||
    !Number.isInteger(golsMandante) ||
    !Number.isInteger(golsVisitante)
  ) {
    return NextResponse.json(
      { error: "Placar inválido. Use números inteiros >= 0." },
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
  const result = await db.collection("matches").findOneAndUpdate(
    { _id: objectId },
    {
      $set: {
        golsMandante,
        golsVisitante,
        status: "finalizado",
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    match: {
      _id: result._id.toString(),
      grupo: result.grupo,
      mandanteId: result.mandanteId,
      visitanteId: result.visitanteId,
      golsMandante: result.golsMandante,
      golsVisitante: result.golsVisitante,
      status: result.status,
    },
  });
}
