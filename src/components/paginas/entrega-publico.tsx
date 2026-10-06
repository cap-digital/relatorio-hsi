"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { PublicoMeta } from "@/data/types";
import { fmtPct } from "@/data/format";
import { cn } from "@/lib/utils";

type Tipo = "impressoes" | "cliques" | "investimento" | "engajamento";
const TIPOS: { k: Tipo; label: string }[] = [
  { k: "impressoes", label: "Impressões" },
  { k: "cliques", label: "Cliques" },
  { k: "investimento", label: "Investimento" },
  { k: "engajamento", label: "Engajamento" },
];
const ORDEM = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const F = "var(--amber)";
const M = "var(--dusk-2)";

/**
 * Entrega do Meta por gênero × idade, com seletor do tipo de entrega. Em % do total
 * do tipo escolhido; idade ou gênero não informados entram no total e na nota.
 */
export function EntregaPublico({ linhas }: { linhas: PublicoMeta[] }) {
  const [tipo, setTipo] = useState<Tipo>("impressoes");
  const { rows, total, totF, totM, totU } = useMemo(() => {
    const faixas = ORDEM.filter((f) => linhas.some((l) => l.idade === f));
    const v = (idade: string, g: string) => linhas.filter((l) => l.idade === idade && l.genero === g).reduce((s, l) => s + l[tipo], 0);
    const rows = faixas.map((faixa) => ({ faixa, f: v(faixa, "female"), m: v(faixa, "male") }));
    const totF = rows.reduce((s, r) => s + r.f, 0);
    const totM = rows.reduce((s, r) => s + r.m, 0);
    const total = linhas.reduce((s, l) => s + l[tipo], 0) || 1;
    return { rows, total, totF, totM, totU: total - totF - totM };
  }, [linhas, tipo]);
  const max = Math.max(...rows.flatMap((r) => [r.f, r.m]), 1);

  return (
    <div>
      <div role="tablist" aria-label="Tipo de entrega" className="flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <button
            key={t.k}
            role="tab"
            aria-selected={tipo === t.k}
            onClick={() => setTipo(t.k)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300",
              tipo === t.k ? "border-transparent bg-text text-ink" : "border-line text-text-2 hover:border-line-strong hover:text-text",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-[1fr_64px_1fr] gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em]">
        <span className="text-right" style={{ color: F }}>
          Mulheres · {fmtPct(totF / total, 1)}
        </span>
        <span />
        <span style={{ color: M }}>Homens · {fmtPct(totM / total, 1)}</span>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {[...rows].reverse().map((r, i) => (
          <div key={r.faixa} className="grid grid-cols-[1fr_64px_1fr] items-center gap-3">
            <Bar v={r.f} max={max} total={total} color={F} right delay={i * 0.06} k={tipo} />
            <span className="text-center font-mono text-[12px] text-text-2 tabular">{r.faixa}</span>
            <Bar v={r.m} max={max} total={total} color={M} right={false} delay={i * 0.06} k={tipo} />
          </div>
        ))}
      </div>
      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3">
        Idade ou gênero não informados: {fmtPct(totU / total, 1)} · percentuais sobre o total de {TIPOS.find((t) => t.k === tipo)?.label.toLowerCase()}
      </p>
    </div>
  );
}

function Bar({ v, max, total, color, right, delay, k }: { v: number; max: number; total: number; color: string; right: boolean; delay: number; k: string }) {
  return (
    <div className={cn("relative h-9 rounded-[4px] bg-surface-3/40", right ? "flex justify-end" : "flex")}>
      <motion.div
        key={k}
        className="h-full rounded-[4px]"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(v / max) * 100}%` }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className={cn("absolute top-1/2 -translate-y-1/2 font-mono text-[11px] text-text tabular", right ? "right-2" : "left-2")}>{fmtPct(v / total, 1)}</span>
    </div>
  );
}
