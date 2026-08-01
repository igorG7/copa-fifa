import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const matches = await db.collection("matches").find().toArray();
  return NextResponse.json({
    matches: matches.map((m) => ({
      _id: m._id.toString(),
      grupo: m.grupo,
      mandanteId: m.mandanteId,
      visitanteId: m.visitanteId,
      golsMandante: m.golsMandante,
      golsVisitante: m.golsVisitante,
      status: m.status,
    })),
  });
}
