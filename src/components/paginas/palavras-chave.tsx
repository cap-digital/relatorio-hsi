"use client";

import { useState } from "react";
import { HBars, type HBarItem } from "@/components/viz/hbars";
import { fmtNum, fmtPct } from "@/data/format";
import type { PalavraChave, PalavrasChave as Dados } from "@/data/types";
import { cn } from "@/lib/utils";
import { BotaoVerTodos } from "./ver-todos";

const FRENTES = ["Institucional AON", "Faz Bem"] as const;
const INICIAL = 10;
export const NOTA_PALAVRAS_CHAVE = "Sem custo por palavra-chave na fonte. Não inclui a campanha Curativos.";

function itens(lista: PalavraChave[]): HBarItem[] {
  return lista.map((p) => ({
    key: p.termo,
    label: p.termo,
    value: p.cliques,
    display: fmtNum(p.cliques),
    sub: `${fmtNum(p.impressoes)} impr. · CTR ${fmtPct(p.ctr, 1)}`,
    color: "var(--dusk-2)",
  }));
}

function Resumo({ dados, frente }: { dados: Dados; frente: string }) {
  const t = dados.totais[frente];
  if (!t) return null;
  return (
    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3">
      {fmtNum(t.termos)} termos distintos · {fmtNum(t.cliques)} cliques · {fmtNum(t.impressoes)} impressões
    </p>
  );
}

export function NotaPalavrasChave({ className }: { className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3", className)}>{NOTA_PALAVRAS_CHAVE}</p>;
}

/** Tela: abas por frente (mesmo padrão do EntregaPublico), top 10 e "Ver todos" até 15. */
export function PalavrasChave({ dados }: { dados: Dados }) {
  const frentes = FRENTES.filter((f) => dados.porFrente[f]?.length);
  const [frente, setFrente] = useState<string>(frentes[0] ?? FRENTES[0]);
  const [aberto, setAberto] = useState(false);
  const lista = dados.porFrente[frente] ?? [];

  return (
    <div>
      <div role="tablist" aria-label="Frente" className="flex flex-wrap gap-2">
        {frentes.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={frente === f}
            onClick={() => {
              setFrente(f);
              setAberto(false);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300",
              frente === f ? "border-transparent bg-text text-ink" : "border-line text-text-2 hover:border-line-strong hover:text-text",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Resumo dados={dados} frente={frente} />
      </div>
      <HBars key={frente} className="mt-6" items={itens(aberto ? lista : lista.slice(0, INICIAL))} />
      <BotaoVerTodos aberto={aberto} total={lista.length} inicial={INICIAL} onToggle={() => setAberto((v) => !v)} />
      <NotaPalavrasChave className="mt-6" />
    </div>
  );
}

/** PDF: as duas frentes uma abaixo da outra, sem abas, top 10 cada (em duas colunas: 1–5 | 6–10). */
export function PalavrasChavePdf({ dados }: { dados: Dados }) {
  return (
    <div className="flex flex-col gap-10">
      {FRENTES.filter((f) => dados.porFrente[f]?.length).map((f) => (
        <div key={f}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
            <h3 className="display text-[1.35rem] leading-tight tracking-[-0.02em] text-text">{f}</h3>
            <Resumo dados={dados} frente={f} />
          </div>
          <HBars
            estatico
            className="mt-6 block columns-2 gap-x-14 [&>li]:mb-4 [&>li]:break-inside-avoid"
            items={itens(dados.porFrente[f].slice(0, INICIAL))}
          />
        </div>
      ))}
      <NotaPalavrasChave />
    </div>
  );
}
