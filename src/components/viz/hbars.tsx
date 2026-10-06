"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HBarItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Texto à direita (valor formatado). */
  display: ReactNode;
  /** Linha secundária sob o rótulo. */
  sub?: ReactNode;
  color?: string;
  highlight?: boolean;
}

export interface HBarsProps {
  items: HBarItem[];
  max?: number;
  className?: string;
}

/** Ranking horizontal animado — rótulo em cima, barra fina, valor à direita. */
export function HBars({ items, max, className }: HBarsProps) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className={cn("flex flex-col gap-4", className)}>
      {items.map((it, i) => (
        <li key={it.key} className="group">
          <div className="flex items-baseline justify-between gap-4">
            <span className={cn("min-w-0 truncate text-[14px]", it.highlight ? "font-medium text-text" : "text-text-2")}>{it.label}</span>
            <span className="shrink-0 font-mono text-[12.5px] text-text tabular">{it.display}</span>
          </div>
          <div className="relative mt-2 h-[6px] overflow-hidden rounded-full bg-surface-3">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: it.color ?? "var(--amber)" }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(it.value / top) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {it.sub && <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-text-3">{it.sub}</p>}
        </li>
      ))}
    </ol>
  );
}
