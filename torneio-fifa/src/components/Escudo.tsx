"use client";

import { useState } from "react";

function iniciais(texto: string): string {
  const partes = texto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function Escudo({
  escudoUrl,
  rotulo,
  size = 24,
}: {
  escudoUrl?: string | null;
  rotulo: string;
  size?: number;
}) {
  const [erro, setErro] = useState(false);

  if (!escudoUrl || erro) {
    return (
      <span
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        className="flex shrink-0 items-center justify-center rounded-full border border-line bg-surface2 font-mono font-bold text-muted"
      >
        {iniciais(rotulo)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={escudoUrl}
      alt={rotulo}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full border border-line bg-surface2 object-contain p-0.5"
      onError={() => setErro(true)}
    />
  );
}
