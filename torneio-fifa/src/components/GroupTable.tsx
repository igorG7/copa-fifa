import { StandingRow } from "@/lib/types";

export default function GroupTable({
  nome,
  standings,
}: {
  nome: string;
  standings: StandingRow[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line bg-surface2 px-4 py-3">
        <h3 className="font-display text-xl tracking-wide text-chalk">
          Grupo {nome}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
          Classificam-se 2
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest2 text-muted">
            <th className="w-8 py-2 pl-4 text-left font-medium">#</th>
            <th className="py-2 text-left font-medium">Jogador</th>
            <th className="w-8 py-2 text-center font-medium">P</th>
            <th className="w-8 py-2 text-center font-medium">J</th>
            <th className="hidden w-8 py-2 text-center font-medium sm:table-cell">V</th>
            <th className="hidden w-8 py-2 text-center font-medium sm:table-cell">E</th>
            <th className="hidden w-8 py-2 text-center font-medium sm:table-cell">D</th>
            <th className="w-10 py-2 text-center font-medium">SG</th>
            <th className="w-10 py-2 pr-4 text-center font-medium">GP</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const classificado = row.posicao <= 2;
            return (
              <tr
                key={row.playerId}
                className={`border-t border-line font-mono ${
                  classificado ? "bg-pitch/10" : ""
                }`}
              >
                <td className="py-2.5 pl-4 text-left">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      classificado ? "bg-amber" : "bg-transparent"
                    }`}
                  />
                </td>
                <td className="py-2.5 text-left font-body font-medium text-chalk">
                  {row.nome}
                </td>
                <td className="py-2.5 text-center font-bold text-chalk">
                  {row.pontos}
                </td>
                <td className="py-2.5 text-center text-muted">{row.jogos}</td>
                <td className="hidden py-2.5 text-center text-muted sm:table-cell">
                  {row.vitorias}
                </td>
                <td className="hidden py-2.5 text-center text-muted sm:table-cell">
                  {row.empates}
                </td>
                <td className="hidden py-2.5 text-center text-muted sm:table-cell">
                  {row.derrotas}
                </td>
                <td className="py-2.5 text-center text-muted">
                  {row.saldoGols > 0 ? `+${row.saldoGols}` : row.saldoGols}
                </td>
                <td className="py-2.5 pr-4 text-center text-muted">
                  {row.golsPro}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
