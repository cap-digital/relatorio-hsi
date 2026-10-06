"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Counter } from "./counter";
import { formatDelta, type CounterFormat } from "./format-number";
import { Sparkline } from "./sparkline";

export type KpiTone = "default" | "amber" | "copper" | "dusk";
export type KpiSize = "sm" | "md" | "lg" | "hero";

export interface KpiTileProps {
  label: string;
  value: number;
  format?: CounterFormat;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Percent change; sign decides color unless `invertDelta` (e.g. CPL: lower is better). */
  delta?: number;
  deltaLabel?: string;
  invertDelta?: boolean;
  sparkline?: number[];
  tone?: KpiTone;
  hint?: string;
  size?: KpiSize;
  icon?: ReactNode;
  className?: string;
}

/** Value never wraps: sizes are tuned so "R$ 4,86 mi" fits four columns at 1440px (hero ≈ 275px).
 *  `md` is also capped at 20cqi so "R$ 129,3 mil" fits the two-column grid at 375px. */
const VALUE_SIZE: Record<KpiSize, string> = {
  sm: "text-[1.75rem]",
  md: "text-[min(clamp(1.85rem,2.6vw,2.5rem),20cqi)]",
  lg: "text-[clamp(2.25rem,3.5vw,3.25rem)]",
  hero: "text-[clamp(2.4rem,4.4vw,5.25rem)]",
};

/**
 * Container query (tile content width) from which the sparkline sits beside the value.
 * Below it the sparkline drops onto its own row so the value keeps a single line.
 * Thresholds ≈ widest value at the size's max font + gap + sparkline width.
 */
const VALUE_ROW: Record<KpiSize, string> = {
  sm: "@min-[248px]:flex-row @min-[248px]:items-end @min-[248px]:justify-between",
  md: "@min-[300px]:flex-row @min-[300px]:items-end @min-[300px]:justify-between",
  lg: "@min-[352px]:flex-row @min-[352px]:items-end @min-[352px]:justify-between",
  hero: "@min-[520px]:flex-row @min-[520px]:items-end @min-[520px]:justify-between",
};

const PADDING: Record<KpiSize, string> = {
  sm: "p-5",
  md: "p-6",
  lg: "p-7 md:p-8",
  hero: "",
};

const TONE_COLOR: Record<KpiTone, string> = {
  default: "var(--text)",
  amber: "var(--amber)",
  copper: "var(--copper)",
  dusk: "var(--dusk-2)",
};

const TONE_LABEL: Record<KpiTone, string> = {
  default: "text-text-3",
  amber: "text-amber",
  copper: "text-copper",
  dusk: "text-dusk-2",
};

export function KpiTile({
  label,
  value,
  format = "number",
  decimals,
  prefix,
  suffix,
  delta,
  deltaLabel,
  invertDelta = false,
  sparkline,
  tone = "default",
  hint,
  size = "md",
  icon,
  className,
}: KpiTileProps) {
  const hero = size === "hero";
  const hasDelta = false;
  void delta;
  void deltaLabel;
  const positive = hasDelta && (delta ?? 0) > 0;
  const negative = hasDelta && (delta ?? 0) < 0;
  const good = invertDelta ? negative : positive;
  const bad = invertDelta ? positive : negative;
  const DeltaIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const accent = TONE_COLOR[tone];

  return (
    <div
      data-tone={tone}
      data-size={size}
      className={cn(
        "group/kpi @container relative flex flex-col",
        hero ? "border-t border-line pt-6 md:pt-8" : cn("hub-card", PADDING[size]),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={cn("eyebrow", TONE_LABEL[tone])}>{label}</span>
        {icon && <span className="shrink-0 text-text-3 [&_svg]:size-4">{icon}</span>}
      </div>

      <div className={cn("flex flex-col items-start gap-x-4 gap-y-3", VALUE_ROW[size], hero ? "mt-6 md:mt-8" : "mt-4")}>
        <span style={{ color: accent }} className="min-w-0 max-w-full">
          <Counter
            value={value}
            format={format}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            trigger={hero ? "ready" : "scroll"}
            className={cn("display whitespace-nowrap leading-[0.9] tracking-[-0.035em]", VALUE_SIZE[size])}
          />
        </span>
        {sparkline && sparkline.length > 1 && (
          <Sparkline
            data={sparkline}
            color={tone === "default" ? "var(--amber)" : accent}
            width={hero ? 128 : 96}
            height={hero ? 40 : 30}
            fill
            className="mb-1 shrink-0"
          />
        )}
      </div>

      {hint && (
        <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]", hero ? "mt-5" : "mt-4")}>
          {hasDelta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono tabular",
                good && "border-good/30 bg-good/10 text-good",
                bad && "border-bad/30 bg-bad/10 text-bad",
                !good && !bad && "border-line text-text-2",
              )}
            >
              <DeltaIcon className="size-3" aria-hidden="true" />
              {formatDelta(delta ?? 0)}
            </span>
          )}

          {hint && <span className="text-text-3">{hint}</span>}
        </div>
      )}
    </div>
  );
}
