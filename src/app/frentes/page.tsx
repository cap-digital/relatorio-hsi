import type { Metadata } from "next";
import { ChartFrame } from "@/components/core/chart-frame";
import { KpiTile, type KpiTone } from "@/components/core/kpi-tile";
import { Reveal } from "@/components/core/reveal";
import { Section, type SectionTone } from "@/components/core/section";
import { PageHero } from "@/components/hero/page-hero";
import { CriativosGrid } from "@/components/paginas/criativos";
import { PortasCards, type Porta } from "@/components/paginas/portas";
import { HBars } from "@/components/viz/hbars";
import { SplitBar } from "@/components/viz/small";
import { fmtBRL, fmtDia, fmtExtenso, fmtLista, fmtMesAno, fmtMesAnoLongo, fmtMetricaPrincipal, fmtMil, fmtNotaAnoAnterior, fmtNum, fmtPct, metricaPrincipal } from "@/data/format";
import snapshot from "@/data/snapshot.json";
import type { Frente, Snapshot } from "@/data/types";

export const metadata: Metadata = { title: "Frentes · Hospital Santa Izabel" };

const s: Snapshot = snapshot;

/** Cor fixa de cada frente: Institucional = limão, Faz Bem = verde-água, Checkup Torcedor = verde da marca, Curativos = creme (--text). */
const TOM: Record<string, Porta["tom"]> = { "Institucional AON": "amber", "Faz Bem": "dusk", "Checkup Torcedor": "copper", Curativos: "neutral" };
const COR = { amber: "var(--amber)", dusk: "var(--dusk-2)", copper: "var(--copper)", neutral: "var(--text)" } as const;
/** KpiTile e ChartFrame chamam o creme de "default". */
const tomKpi = (t: Porta["tom"]): KpiTone => (t === "neutral" ? "default" : t);
const ANO = s.periodo.inicio.slice(0, 4);
/** Objetivo da campanha, quando o cartão e a seção o explicitam (não vem do snapshot). */
const OBJETIVO: Record<string, string> = { Curativos: "tráfego" };
const COR_PLATAFORMA: Record<string, string> = { Meta: "var(--amber)", Google: "var(--dusk-2)" };


const tomDe = (f: Frente) => TOM[f.frente] ?? "amber";
const plataformas = (f: Frente) => Object.keys(f.plataformas).sort().join(" + ");
/** "no Google e no Meta" */
const nasPlataformas = (f: Frente) => Object.keys(f.plataformas).sort().map((p) => `no ${p}`).join(" e ");
/** "Google · Pesquisa (tráfego)" */
const canal = (f: Frente) => `${plataformas(f)} · ${f.estrategias.map((e) => e.estrategia).join(", ")}${OBJETIVO[f.frente] ? ` (${OBJETIVO[f.frente]})` : ""}`;
const campanhas = (n: number) => `${n} ${n === 1 ? "campanha" : "campanhas"}`;

export default function Frentes() {
  const t = s.totais;
  const frentes = s.frentes;
  const maior = [...frentes].sort((a, b) => b.investimento - a.investimento)[0];

  return (
    <main>
      <PageHero
        tone="dusk"
        image="none"
        eyebrow={`Frentes · ${frentes.length} frentes · ${fmtNum(t.campanhas)} campanhas`}
        title={
          <>
            {fmtExtenso(frentes.length, true)} frentes, <em>um hospital.</em>
          </>
        }
        description={`${fmtLista(frentes.map((f) => `${f.frente} recebeu ${fmtMil(f.investimento)}`))}. Cada uma com estratégias, plataformas e criativos próprios.`}
        kpis={
          <div className={`grid grid-cols-2 gap-3 ${frentes.length % 4 === 0 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {frentes.map((f, i) => (
              <KpiTile
                key={f.frente}
                label={f.frente}
                value={f.investimento}
                format="compactCurrency"
                decimals={1}
                tone={tomKpi(tomDe(f))}
                hint={`${fmtPct(f.investimento / t.investimento)} do investimento · ${campanhas(f.campanhas)}`}
                className={frentes.length % 2 === 1 && i === frentes.length - 1 ? "col-span-2 md:col-span-1" : undefined}
              />
            ))}
          </div>
        }
      />

      <Section
        index="01"
        eyebrow={`As ${fmtExtenso(frentes.length)} frentes`}
        tone="dusk"
        title={
          <>
            {fmtExtenso(Math.round((maior.investimento / t.investimento) * 10), true)} de cada dez reais foram para <em>{maior.frente}.</em>
          </>
        }
        description="A divisão do investimento entre as frentes, com o período, as campanhas e as plataformas de cada uma."
      >
        <Reveal className="hub-card p-7 md:p-9">
          <span className="eyebrow text-text-3">Investimento por frente</span>
          <div className="mt-6">
            <SplitBar soPct parts={frentes.map((f) => ({ label: `${f.frente} · ${fmtMil(f.investimento)}`, value: f.investimento, color: COR[tomDe(f)] }))} />
          </div>
        </Reveal>
        <div className="mt-4">
          <PortasCards
            portas={frentes.map((f) => ({
              titulo: f.frente,
              numero: fmtMil(f.investimento),
              legenda: `${campanhas(f.campanhas)} · ${plataformas(f)}`,
              nota: OBJETIVO[f.frente] ? `${canal(f)} · ${fmtMesAno(f.inicio)} → ${fmtMesAno(f.fim)}` : undefined,
              texto: `${fmtDia(f.inicio, ANO)} → ${fmtDia(f.fim, ANO)} · ${f.estrategias.map((e) => e.estrategia).join(", ")}.`,
              tom: tomDe(f),
            }))}
          />
        </div>
      </Section>

      {frentes.map((f, i) => (
        <SecaoFrente key={f.frente} frente={f} index={String(i + 2).padStart(2, "0")} />
      ))}
    </main>
  );
}

function SecaoFrente({ frente: f, index }: { frente: Frente; index: string }) {
  const tom = tomDe(f);
  const criativos = s.criativos.filter((c) => c.frente === f.frente);
  // KPI de custo = o da métrica principal da estratégia com mais investimento (metas do contrato).
  const principal = [...f.estrategias].sort((a, b) => b.investimento - a.investimento)[0];
  const custo = principal && metricaPrincipal(principal).custoRotulo === "CPM" ? { label: "CPM", value: f.cpm } : { label: "CPC", value: f.cpc };
  const pequena = f.estrategias.length <= 1;
  const nota = fmtNotaAnoAnterior(f, s.periodo.inicio);

  const grade = <CriativosGrid criativos={criativos} />;

  return (
    <>
      <Section
        index={index}
        eyebrow={OBJETIVO[f.frente] ? `${f.frente} · ${canal(f)}` : f.frente}
        tone={tom as SectionTone}
        title={
          <>
            {`${f.frente}:`} <em>{fmtPct(f.investimento / s.totais.investimento, f.investimento / s.totais.investimento < 0.1 ? 1 : 0)} da verba.</em>
          </>
        }
        description={
          principal && OBJETIVO[f.frente]
            ? `${plataformas(f)} · ${principal.estrategia} com objetivo de ${OBJETIVO[f.frente]}, de ${fmtMesAnoLongo(f.inicio)} a ${fmtMesAnoLongo(f.fim)}: ${fmtMil(f.investimento)} em ${campanhas(f.campanhas)}. A métrica principal são os ${metricaPrincipal(principal).rotulo} (${metricaPrincipal(principal).custoRotulo}): ${fmtMetricaPrincipal(principal)}.`
            : principal
            ? `${fmtMil(f.investimento)} em ${campanhas(f.campanhas)} ${nasPlataformas(f)}, de ${fmtDia(f.inicio, ANO)} a ${fmtDia(f.fim, ANO)}. ${
                pequena
                  ? `Uma só estratégia, ${principal.estrategia}: ${fmtMetricaPrincipal(principal)}.`
                  : `A maior estratégia foi ${principal.estrategia} (${principal.plataforma}): ${fmtMetricaPrincipal(principal)}.`
              }`
            : undefined
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiTile label="Investimento" value={f.investimento} format="compactCurrency" decimals={1} tone={tomKpi(tom)} />
          <KpiTile label="Impressões" value={f.impressoes} format="compact" decimals={f.impressoes >= 1e6 ? 2 : 0} />
          <KpiTile label="Cliques" value={f.cliques} format="compact" decimals={1} hint={`CTR de ${fmtPct(f.ctr, 2)}`} />
          <KpiTile label={custo.label} value={custo.value} format="currency" decimals={2} hint={custo.label === "CPM" ? "Custo por mil impressões" : "Custo por clique"} />
        </div>

        {!pequena && (
          <div className="mt-4">
            <ChartFrame eyebrow="Estratégias" title="Investimento por estratégia" subtitle="Com a métrica que cada estratégia tinha como meta" minHeight={200} tone={tomKpi(tom)}>
              <HBars
                items={f.estrategias.map((e) => ({
                  key: `${e.plataforma}-${e.estrategia}`,
                  label: e.estrategia,
                  value: e.investimento,
                  display: fmtBRL(e.investimento, { compact: true }),
                  sub: `${e.plataforma} · ${fmtMetricaPrincipal(e)}`,
                  color: COR_PLATAFORMA[e.plataforma],
                }))}
              />
            </ChartFrame>
          </div>
        )}

        {nota && <p className="mt-5 font-mono text-[11.5px] leading-relaxed text-text-3">{nota}</p>}

        {pequena && criativos.length > 0 && (
          <div className="mt-[clamp(32px,4vw,56px)]">
            <span className="eyebrow text-text-3">{criativos.length === 1 ? "O criativo" : `Os ${criativos.length} criativos`} da frente</span>
            <div className="mt-5">{grade}</div>
          </div>
        )}
      </Section>

      {/* Frentes maiores: criativos em seção própria (uma página a mais no PDF, sem zoom excessivo). */}
      {!pequena && (
        <Section eyebrow={`${f.frente} · ${criativos.length} criativos`} tone={tom as SectionTone}>
          {grade}
        </Section>
      )}
    </>
  );
}
