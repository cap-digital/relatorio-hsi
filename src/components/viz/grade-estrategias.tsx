"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { CelulaGrade, Grade, Mes } from "@/data/types";
import { fmtBRL, fmtDia, fmtMetricaPrincipal, rodou } from "@/data/format";

const COR: Record<string, string> = { Meta: "var(--amber)", Google: "var(--dusk-2)" };
/** Hachura do mês parcial por cima da cor da célula (mesma leitura do gráfico mensal). */
const HACHURA = "repeating-linear-gradient(135deg, rgba(11,22,16,.6) 0 3px, transparent 3px 6px)";

/** Investimento por estratégia × mês, em escala raiz. Célula vazia = a estratégia não rodou no mês. */
export function GradeEstrategias({ grade, meses, fim }: { grade: Grade; meses: Mes[]; /** Último dia com dados. */ fim: string }) {
  // Investimento 0 e impressões 0 = não rodou: célula vazia, sem hover.
  const ativas = grade.celulas.filter(rodou);
  const celulas = new Map(ativas.map((c) => [`${c.plataforma}|${c.estrategia}|${c.mes}`, c]));
  const max = Math.max(...ativas.map((c) => c.investimento), 1);
  const mesInfo = new Map(meses.map((m) => [m.mes, m]));
  const [hi, setHi] = useState<CelulaGrade | null>(null);
  const cols = grade.meses.length;

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2" data-lenis-prevent-horizontal>
        <div className="grid min-w-[620px] gap-[3px]" style={{ gridTemplateColumns: `minmax(150px,190px) repeat(${cols}, minmax(0,1fr))` }}>
          <span className="sticky left-0 z-10 bg-[var(--surface-2)]" />
          {grade.meses.map((m) => {
            const info = mesInfo.get(m);
            return (
              // Mês do ano anterior (dez/25): rótulo atenuado, sem hachura (hachura = só mês parcial).
              <span key={m} className={`pb-1 text-center font-mono text-[10.5px] text-text-3 ${info?.anoAnterior ? "opacity-50" : ""}`}>
                {info ? (info.parcial ? `${info.rotulo}*` : info.rotulo) : m.slice(5)}
              </span>
            );
          })}
          {grade.linhas.map((l, r) => (
            <div key={`${l.plataforma}|${l.estrategia}`} className="contents">
              {/* Rótulo fixo à esquerda quando a grade rola na horizontal (telas estreitas). */}
              <span className="sticky left-0 z-10 flex h-full min-w-0 items-center gap-2 bg-[var(--surface-2)] pr-3 text-[12.5px] text-text-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: COR[l.plataforma] }} />
                <span className="truncate">{l.estrategia}</span>
              </span>
              {grade.meses.map((m, col) => {
                const c = celulas.get(`${l.plataforma}|${l.estrategia}|${m}`);
                const t = c ? Math.sqrt(c.investimento / max) : 0;
                const ativo = c && hi === c;
                return (
                  <motion.span
                    key={m}
                    className="relative h-9 overflow-hidden rounded-[4px] md:h-11"
                    style={{
                      background: c ? `rgba(200,220,76,${0.12 + t * 0.88})` : "rgba(232,240,220,.035)",
                      outline: ativo ? "1.5px solid #eef3e6" : "none",
                    }}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: r * 0.05 + col * 0.04 }}
                    onPointerEnter={() => setHi(c ?? null)}
                    onPointerLeave={() => setHi(null)}
                    aria-label={c ? `${l.estrategia} · ${mesInfo.get(m)?.nome ?? m} · ${fmtBRL(c.investimento)}` : undefined}
                  >
                    {c && mesInfo.get(m)?.parcial && <span className="absolute inset-0" style={{ background: HACHURA }} />}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-text-2">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-dusk-2" />
          Google
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber" />
          Meta
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-10 rounded-[3px]" style={{ background: "linear-gradient(90deg, rgba(200,220,76,.12), rgba(200,220,76,1))" }} />
          Investimento no mês
        </span>
        <span className="flex items-center gap-2">
          <span className="hatch-amber size-2.5 rounded-[3px]" />
          Mês parcial (até {fmtDia(fim)})
        </span>
      </div>

      {/* Leitura do hover: só na tela (no PDF não há cursor). */}
      <p className="no-print mt-4 min-h-10 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-text-3">
        {hi ? (
          <>
            {hi.estrategia} · {hi.plataforma} · {mesInfo.get(hi.mes)?.nome ?? hi.mes} ·{" "}
            <span className="text-text">
              {fmtBRL(hi.investimento)} · {fmtMetricaPrincipal(hi)}
            </span>{" "}
            · {hi.frentes.join(", ")} · {hi.campanhas} {hi.campanhas === 1 ? "campanha" : "campanhas"}
          </>
        ) : (
          "Passe o cursor sobre a grade"
        )}
      </p>
    </div>
  );
}
