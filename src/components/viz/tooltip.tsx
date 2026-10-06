"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export interface VizTooltipProps {
  /** Posição em px relativa ao container `relative` do gráfico. */
  x: number;
  y: number;
  /** Largura do container, para virar o balão perto da borda direita. */
  width: number;
  open: boolean;
  children: ReactNode;
}

/** Balão flutuante compartilhado pelos gráficos (vidro escuro, mono nos rótulos). */
export function VizTooltip({ x, y, width, open, children }: VizTooltipProps) {
  const flip = x > width - 240;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1, x: flip ? x - 16 : x + 16, y: y - 12 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.6 }}
          className="pointer-events-none absolute left-0 top-0 z-20 min-w-[200px] max-w-[280px] rounded-[12px] border border-line-strong bg-[rgba(19,36,26,.94)] px-4 py-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur-md"
          style={{ translateX: flip ? "-100%" : "0%", translateY: "-100%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TipTitle({ children }: { children: ReactNode }) {
  return <p className="display text-[15px] leading-tight tracking-[-0.01em] text-text">{children}</p>;
}

export function TipRow({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="mt-1.5 flex items-baseline justify-between gap-6 text-[12.5px]">
      <span className="flex items-center gap-2 text-text-3">
        {color && <span className="size-2 rounded-full" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-mono text-text tabular">{value}</span>
    </div>
  );
}
