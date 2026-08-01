import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const db = await getDb();
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

  return NextResponse.json({ ok: true });
}
