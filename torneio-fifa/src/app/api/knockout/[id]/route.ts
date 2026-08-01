import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminFromRequest } from "@/lib/auth";

interface Body {
  golsMandante?: number;
  golsVisitante?: number;
  golsProrrogacaoMandante?: number | null;
  golsProrrogacaoVisitante?: number | null;
  penaltisMandante?: number | null;
  penaltisVisitante?: number | null;
}

function isInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminFromRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!isInt(body.golsMandante) || !isInt(body.golsVisitante)) {
    return NextResponse.json(
      { error: "Informe o placar do tempo normal (inteiros >= 0)." },
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
  const jogo = await db.collection("knockout").findOne({ _id: objectId });
  if (!jogo) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }
  if (!jogo.mandanteId || !jogo.visitanteId) {
    return NextResponse.json(
      { error: "Os confrontantes ainda não foram definidos para esse jogo." },
      { status: 400 }
    );
  }

  const empateNormal = body.golsMandante === body.golsVisitante;

  let prorrogacao = false;
  let golsProrrogacaoMandante: number | null = null;
  let golsProrrogacaoVisitante: number | null = null;
  let totalMandante = body.golsMandante;
  let totalVisitante = body.golsVisitante;

  if (empateNormal) {
    if (!isInt(body.golsProrrogacaoMandante) || !isInt(body.golsProrrogacaoVisitante)) {
      return NextResponse.json(
        {
          error:
            "Empate no tempo normal: informe também o placar da prorrogação.",
        },
        { status: 400 }
      );
    }
    prorrogacao = true;
    golsProrrogacaoMandante = body.golsProrrogacaoMandante;
    golsProrrogacaoVisitante = body.golsProrrogacaoVisitante;
    totalMandante += golsProrrogacaoMandante;
    totalVisitante += golsProrrogacaoVisitante;
  }

  let penaltis = false;
  let penaltisMandante: number | null = null;
  let penaltisVisitante: number | null = null;
  let vencedorId: string;

  if (totalMandante === totalVisitante) {
    if (
      !isInt(body.penaltisMandante) ||
      !isInt(body.penaltisVisitante) ||
      body.penaltisMandante === body.penaltisVisitante
    ) {
      return NextResponse.json(
        {
          error:
            "Empate na prorrogação: informe o placar dos pênaltis, sem empate.",
        },
        { status: 400 }
      );
    }
    penaltis = true;
    penaltisMandante = body.penaltisMandante;
    penaltisVisitante = body.penaltisVisitante;
    vencedorId =
      penaltisMandante > penaltisVisitante ? jogo.mandanteId : jogo.visitanteId;
  } else {
    vencedorId = totalMandante > totalVisitante ? jogo.mandanteId : jogo.visitanteId;
  }

  const perdedorId =
    vencedorId === jogo.mandanteId ? jogo.visitanteId : jogo.mandanteId;

  await db.collection("knockout").updateOne(
    { _id: objectId },
    {
      $set: {
        golsMandante: body.golsMandante,
        golsVisitante: body.golsVisitante,
        prorrogacao,
        golsProrrogacaoMandante,
        golsProrrogacaoVisitante,
        penaltis,
        penaltisMandante,
        penaltisVisitante,
        vencedorId,
        status: "finalizado",
      },
    }
  );

  // Propaga vencedor/perdedor das semifinais para a final e a disputa de 3º lugar
  if (jogo.fase === "semifinal") {
    const campoFinal = jogo.ordem === 1 ? "mandanteId" : "visitanteId";
    const campoTerceiro = jogo.ordem === 1 ? "mandanteId" : "visitanteId";

    await db
      .collection("knockout")
      .updateOne({ fase: "final" }, { $set: { [campoFinal]: vencedorId } });

    await db
      .collection("knockout")
      .updateOne(
        { fase: "terceiro" },
        { $set: { [campoTerceiro]: perdedorId } }
      );
  }

  const knockout = await db.collection("knockout").find().toArray();
  return NextResponse.json({
    knockout: knockout.map((k) => ({ ...k, _id: k._id.toString() })),
  });
}
