"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InView } from "./in-view";

export type ChartTone = "default" | "amber" | "copper" | "dusk";

export interface ChartFrameProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  legend?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: ChartTone;
  /** Grid columns to span (parents use `md:grid-cols-2 xl:grid-cols-3`). */
  span?: 1 | 2 | 3;
  minHeight?: number;
  /** Lazy-mount children when in view so Bklit enter animations play on arrival (default true). */
  lazy?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

const SPAN: Record<1 | 2 | 3, string> = {
  1: "",
  2: "md:col-span-2",
  3: "md:col-span-2 xl:col-span-3",
};

const TONE_EYEBROW: Record<ChartTone, string> = {
  default: "text-text-3",
  amber: "text-amber",
  copper: "text-copper",
  dusk: "text-dusk-2",
};

function Shimmer() {
  return (
    <div className="shimmer absolute inset-0 rounded-[14px]" aria-hidden="true">
      <div className="dot-grid absolute inset-0 opacity-50" />
    </div>
  );
}

/** Card shell for Bklit charts: eyebrow + title + subtitle + right slot, lazy body, footer. */
export function ChartFrame({
  title,
  subtitle,
  eyebrow,
  legend,
  actions,
  footer,
  tone = "default",
  span = 1,
  minHeight = 320,
  lazy = true,
  className,
  bodyClassName,
  children,
}: ChartFrameProps) {
  return (
    <div data-tone={tone} className={cn("hub-card flex min-w-0 flex-col", SPAN[span], className)}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-6 pt-6 md:px-7 md:pt-7">
        <div className="min-w-0 flex-1">
          {eyebrow && <span className={cn("eyebrow", TONE_EYEBROW[tone])}>{eyebrow}</span>}
          <h3 className={cn("display text-[clamp(1.2rem,1.5vw,1.5rem)] leading-tight tracking-[-0.02em] text-text", eyebrow && "mt-2")}>
            {title}
          </h3>
          {subtitle && <p className="mt-1.5 max-w-prose text-[13.5px] leading-relaxed text-text-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      {legend && <div className="px-6 pt-4 md:px-7">{legend}</div>}

      <div className={cn("relative min-w-0 flex-1 px-4 pb-5 pt-5 md:px-6", bodyClassName)}>
        {lazy ? (
          <InView minHeight={minHeight} placeholder={<Shimmer />}>
            {children}
          </InView>
        ) : (
          <div className="relative" style={{ minHeight }}>
            {children}
          </div>
        )}
      </div>

      {footer && (
        <footer className="border-t border-line px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-text-3 md:px-7">
          {footer}
        </footer>
      )}
    </div>
  );
}
