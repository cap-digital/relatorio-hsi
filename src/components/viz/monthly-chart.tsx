"use client";

import { scaleBand, scaleLinear } from "d3-scale";
import { curveMonotoneX, line } from "d3-shape";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import type { Mes } from "@/data/types";
import { fmtBRL, fmtCompact, fmtDia, fmtNum } from "@/data/format";
import { TipRow, TipTitle, VizTooltip } from "./tooltip";

const M = { top: 20, right: 56, bottom: 32, left: 56 };
const GAP = 2;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Barras empilhadas de investimento (Google + Meta) por mês + linha de impressões (eixo à direita). Mês parcial hachurado. */
export function MonthlyChart({ meses, fim, height = 360 }: { meses: Mes[]; /** Último dia com dados (rótulo do mês parcial). */ fim: string; height?: number }) {
  const [ref, bounds] = useMeasure();
  const [hi, setHi] = useState<number | null>(null);
  const width = bounds.width || 0;
  const iw = Math.max(0, width - M.left - M.right);
  const ih = height - M.top - M.bottom;

  const { x, ys, yi, path } = useMemo(() => {
    const x = scaleBand<string>().domain(meses.map((d) => d.mes)).range([0, iw]).padding(0.32);
    const ys = scaleLinear().domain([0, Math.max(...meses.map((d) => d.total.investimento), 1)]).range([ih, 0]).nice();
    const yi = scaleLinear().domain([0, Math.max(...meses.map((d) => d.total.impressoes), 1)]).range([ih, 0]).nice();
    const path =
      line<Mes>()
        .x((d) => (x(d.mes) ?? 0) + x.bandwidth() / 2)
        .y((d) => yi(d.total.impressoes))
        .curve(curveMonotoneX)(meses) ?? "";
    return { x, ys, yi, path };
  }, [meses, iw, ih]);

  const hd = hi === null ? null : meses[hi];
  // Em telas estreitas, rótulo de mês alternado, contado do fim (o último mês, parcial, sempre aparece).
  const step = x.step() < 34 ? 2 : 1;

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-text-2">
        <Chave cor="var(--dusk-2)">Google · investimento</Chave>
        <Chave cor="var(--amber)">Meta · investimento</Chave>
        <span className="flex items-center gap-2">
          <span className="h-[2px] w-4 rounded-full bg-text" />
          Impressões (eixo direito)
        </span>
        <span className="flex items-center gap-2">
          <span className="hatch-amber size-2.5 rounded-[3px]" />
          Mês parcial (até {fmtDia(fim)})
        </span>
      </div>

      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} className="block overflow-visible" onPointerLeave={() => setHi(null)}>
            <defs>
              <Hachura id="hatch-meta" rgb="200,220,76" />
              <Hachura id="hatch-google" rgb="95,194,174" />
            </defs>
            <g transform={`translate(${M.left},${M.top})`}>
              {ys.ticks(4).map((t) => (
                <g key={t} transform={`translate(0,${ys(t)})`}>
                  <line x2={iw} stroke="var(--chart-grid)" />
                  <text x={-12} dy="0.32em" textAnchor="end" className="fill-[var(--text-3)] font-mono text-[10.5px]">
                    {fmtBRL(t, { compact: true, decimals: 0 })}
                  </text>
                </g>
              ))}
              {yi.ticks(4).map((t) => (
                <text key={t} x={iw + 12} y={yi(t)} dy="0.32em" className="fill-[var(--text-2)] font-mono text-[10.5px]">
                  {fmtCompact(t, 0)}
                </text>
              ))}
              {meses.map((d, i) => {
                const bx = x(d.mes) ?? 0;
                const bw = x.bandwidth();
                const yg = ys(d.google.investimento);
                const yt = ys(d.total.investimento);
                const hg = ih - yg;
                const hm = Math.max(0, yg - yt - (hg > 0 && d.meta.investimento > 0 ? GAP : 0));
                const dim = hi !== null && hi !== i;
                return (
                  <g key={d.mes} onPointerEnter={() => setHi(i)} opacity={dim ? 0.45 : 1} style={{ transition: "opacity .3s" }}>
                    <rect x={bx - (x.step() * x.paddingInner()) / 2} width={x.step()} y={0} height={ih} fill="transparent" />
                    <motion.rect
                      x={bx}
                      width={bw}
                      rx={Math.min(3, bw / 2)}
                      fill={d.parcial ? "url(#hatch-google)" : "var(--dusk-2)"}
                      initial={{ y: ih, height: 0 }}
                      whileInView={{ y: yg, height: hg }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                    />
                    <motion.rect
                      x={bx}
                      width={bw}
                      rx={Math.min(3, bw / 2)}
                      fill={d.parcial ? "url(#hatch-meta)" : "var(--amber)"}
                      initial={{ y: ih, height: 0 }}
                      whileInView={{ y: yt, height: hm }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.25 + i * 0.05, ease: EASE }}
                    />
                    {(meses.length - 1 - i) % step === 0 && (
                      // Mês do ano anterior (dez/25): rótulo atenuado, sem hachura (hachura = só mês parcial).
                      <text x={bx + bw / 2} y={ih + 22} textAnchor="middle" opacity={d.anoAnterior ? 0.5 : 1} className="fill-[var(--text-3)] font-mono text-[10.5px]">
                        {d.parcial ? `${d.rotulo}*` : d.rotulo}
                      </text>
                    )}
                  </g>
                );
              })}
              <motion.path
                d={path}
                fill="none"
                stroke="var(--text)"
                strokeWidth={2}
                strokeLinecap="round"
                pointerEvents="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, delay: 0.6 }}
              />
              {meses.map((d) => (
                <circle
                  key={d.mes}
                  cx={(x(d.mes) ?? 0) + x.bandwidth() / 2}
                  cy={yi(d.total.impressoes)}
                  r={hd?.mes === d.mes ? 4.5 : 0}
                  fill="var(--text)"
                  stroke="var(--surface-2)"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              ))}
            </g>
          </svg>
        )}
        <VizTooltip open={Boolean(hd)} x={hd ? M.left + (x(hd.mes) ?? 0) + x.bandwidth() / 2 : 0} y={hd ? M.top + ys(hd.total.investimento) : 0} width={width}>
          {hd && (
            <>
              <TipTitle>
                {hd.nome[0].toUpperCase() + hd.nome.slice(1)}
                {hd.parcial ? ` · até ${fmtDia(fim)}` : ""}
              </TipTitle>
              <TipRow label="Google" value={fmtBRL(hd.google.investimento)} color="var(--dusk-2)" />
              <TipRow label="Meta" value={fmtBRL(hd.meta.investimento)} color="var(--amber)" />
              <TipRow label="Investimento" value={fmtBRL(hd.total.investimento)} />
              <TipRow label="Impressões" value={fmtNum(hd.total.impressoes)} color="var(--text)" />
            </>
          )}
        </VizTooltip>
      </div>
    </div>
  );
}

function Chave({ cor, children }: { cor: string; children: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-2.5 rounded-[3px]" style={{ background: cor }} />
      {children}
    </span>
  );
}

/** Hachura 135° na cor da série (mesma das classes .hatch-* do CSS). */
function Hachura({ id, rgb }: { id: string; rgb: string }) {
  return (
    <pattern id={id} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={6} height={6} fill={`rgba(${rgb},.25)`} />
      <rect width={3} height={6} fill={`rgba(${rgb},.85)`} />
    </pattern>
  );
}
