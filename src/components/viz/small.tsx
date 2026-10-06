"use client";

import { motion } from "motion/react";
import { fmtCompact, fmtNum, fmtPct } from "@/data/format";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- DotMatrix */

/** 100 pontos; os `pct` primeiros acendem em sequência. "X de cada 100". */
export function DotMatrix({ pct, color = "var(--amber)", className }: { pct: number; color?: string; className?: string }) {
  const on = Math.round(Math.min(1, pct) * 100);
  return (
    <div className={cn("grid grid-cols-10 gap-[6px]", className)} aria-label={`${on} de cada 100`}>
      {Array.from({ length: 100 }, (_, i) => (
        <motion.span
          key={i}
          className="aspect-square rounded-full"
          initial={{ scale: 0.3, backgroundColor: "rgba(232,240,220,.08)" }}
          whileInView={{ scale: 1, backgroundColor: i < on ? color : "rgba(232,240,220,.08)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 + (i < on ? i * 0.012 : 1.2 + (i - on) * 0.004) }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Retenção */

export interface Etapa {
  label: string;
  value: number;
}

/** Degraus de retenção de vídeo (plays → 25% → … → 100%). `rgb` = cor da série (padrão: limão). */
export function Retencao({ etapas, soPct = false, rgb = "200,220,76" }: { etapas: Etapa[]; soPct?: boolean; rgb?: string }) {
  const top = etapas[0]?.value || 1;
  return (
    <div className="flex h-[260px] items-end gap-2 md:gap-3">
      {etapas.map((e, i) => {
        const h = (e.value / top) * 100;
        return (
          <div key={e.label} className="flex h-full flex-1 flex-col justify-end">
            <span className="mb-2 font-mono text-[12px] text-text tabular">{fmtPct(e.value / top, 0)}</span>
            <motion.div
              className="rounded-t-[6px]"
              style={{ background: `linear-gradient(180deg, rgb(${rgb}), rgba(${rgb},${0.35 + 0.5 * (1 - i / etapas.length)}))` }}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="mt-3 text-[12.5px] text-text-2">{e.label}</span>
            {!soPct && <span className="font-mono text-[10.5px] text-text-3 tabular">{fmtCompact(e.value)}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Split bar */

/** Barra 100% empilhada com legenda. `soPct` esconde os valores absolutos. */
export function SplitBar({ parts, soPct = false }: { parts: { label: string; value: number; color: string }[]; soPct?: boolean }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-surface-3">
        {parts.map((p, i) => (
          <motion.div
            key={p.label}
            style={{ background: p.color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${(p.value / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {parts.map((p) => (
          <div key={p.label} className="flex items-baseline gap-2">
            <span className="size-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[13.5px] text-text-2">{p.label}</span>
            <span className="font-mono text-[12.5px] text-text tabular">
              {fmtPct(p.value / total)}{soPct ? "" : ` · ${fmtNum(p.value)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
