/**
 * pt-BR number formatting for Counter/KpiTile. Mirrors the rules of `src/data/format.ts`
 * (kept local so core never depends on the data layer).
 *   number:          1.234.567
 *   currency:        R$ 1.980.000
 *   percent:         12,4%        (v in 0–100)
 *   compact:         12,4 mi · 812 mil · 1,2 bi
 *   compactCurrency: R$ 1,98 mi · R$ 79,0 mil (casas fixas = decimals)
 */
export type CounterFormat = "number" | "currency" | "percent" | "compact" | "compactCurrency";

export interface FormatOptions {
  /** Max fraction digits (defaults depend on format). */
  decimals?: number;
  /** Force exactly this many fraction digits (used while a counter animates so width stays stable). */
  fixedFraction?: number;
  /** Pick the compact unit from this value instead of `v` (keeps "mi"/"mil" stable while animating). */
  unitOf?: number;
}

const cache = new Map<string, Intl.NumberFormat>();

function nf(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", options);
    cache.set(key, f);
  }
  return f;
}

function fraction(max: number, fixed?: number): Pick<Intl.NumberFormatOptions, "minimumFractionDigits" | "maximumFractionDigits"> {
  if (fixed !== undefined) return { minimumFractionDigits: fixed, maximumFractionDigits: fixed };
  return { minimumFractionDigits: 0, maximumFractionDigits: max };
}

function compactUnit(abs: number): { div: number; unit: string } {
  if (abs >= 1e9) return { div: 1e9, unit: "bi" };
  if (abs >= 1e6) return { div: 1e6, unit: "mi" };
  if (abs >= 1e3) return { div: 1e3, unit: "mil" };
  return { div: 1, unit: "" };
}

export function formatCounterValue(v: number, format: CounterFormat = "number", opts: FormatOptions = {}): string {
  const { decimals, fixedFraction, unitOf } = opts;
  const safe = Number.isFinite(v) ? v : 0;

  switch (format) {
    case "currency":
      return nf({ style: "currency", currency: "BRL", ...fraction(decimals ?? 0, fixedFraction) }).format(safe);
    case "percent":
      return `${nf(fraction(decimals ?? 1, fixedFraction ?? decimals ?? 1)).format(safe)}%`;
    case "compact": {
      const { div, unit } = compactUnit(Math.abs(unitOf ?? safe));
      const n = nf(fraction(decimals ?? 1, fixedFraction)).format(safe / div);
      return unit ? `${n} ${unit}` : n;
    }
    case "compactCurrency": {
      const { div, unit } = compactUnit(Math.abs(unitOf ?? safe));
      const n = nf({ style: "currency", currency: "BRL", ...fraction(decimals ?? 2, fixedFraction ?? decimals) }).format(safe / div);
      return unit ? `${n} ${unit}` : n;
    }
    default:
      return nf(fraction(decimals ?? 0, fixedFraction)).format(safe);
  }
}

/** Fraction digits present in an already formatted pt-BR string ("1,98 mi" → 2). */
export function countFractionDigits(formatted: string): number {
  const match = formatted.match(/,(\d+)/);
  return match ? match[1].length : 0;
}

/** "+12,4%" / "−3,1%" (true minus sign) / "0%" */
export function formatDelta(v: number, decimals = 1): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${nf({ minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(Math.abs(v))}%`;
}
