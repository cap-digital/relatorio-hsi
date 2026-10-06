import { ChartFrame } from "@/components/core/chart-frame";
import { KpiTile } from "@/components/core/kpi-tile";
import { Reveal } from "@/components/core/reveal";
import { Section } from "@/components/core/section";
import { PageHero } from "@/components/hero/page-hero";
import { BotaoExportarPdf } from "@/components/paginas/exportar-pdf";
import { PortasCards } from "@/components/paginas/portas";
import { GradeEstrategias } from "@/components/viz/grade-estrategias";
import { MonthlyChart } from "@/components/viz/monthly-chart";
import { SplitBar } from "@/components/viz/small";
import { fmtBRL, fmtCompact, fmtDia, fmtMil, fmtNum, fmtPct, fmtUmEmCada, rodou } from "@/data/format";
import snapshot from "@/data/snapshot.json";
import type { Snapshot } from "@/data/types";

const s: Snapshot = snapshot;


export default function Home() {
  const t = s.totais;
  const meta = s.plataformas.find((p) => p.plataforma === "Meta")!;
  const google = s.plataformas.find((p) => p.plataforma === "Google")!;
  const ativasJan = s.meses[0]?.estrategiasAtivas ?? 0;
  const ativasMax = Math.max(...s.meses.map((m) => m.estrategiasAtivas));
  const mesesNoMax = s.meses.filter((m) => m.estrategiasAtivas === ativasMax).map((m) => m.nome);
  const ultimo = s.meses[s.meses.length - 1];
  // Contagem pela grade, com a mesma regra das células (investimento 0 e impressões 0 = não rodou).
  const celulasDoMes = (mes: string) => s.grade.celulas.filter((c) => c.mes === mes && rodou(c));
  const plataformasJan = [...new Set(celulasDoMes(s.meses[0]?.mes ?? "").map((c) => c.plataforma))];
  const ativasUltimo = celulasDoMes(ultimo.mes).length;

  // Mês a mês: antes e depois da entrada do Meta.
  const mesMeta = meta.inicio.slice(0, 7);
  const antes = s.meses.filter((m) => m.mes < mesMeta);
  const depois = s.meses.filter((m) => m.mes >= mesMeta && !m.parcial);
  const soma = (ms: typeof s.meses, f: (m: (typeof s.meses)[number]) => number) => ms.reduce((a, m) => a + f(m), 0);
  const nomeMes = (mes: string) => s.meses.find((m) => m.mes === mes)?.nome ?? mes;
  const metaDepois = soma(depois, (m) => m.meta.investimento) / (soma(depois, (m) => m.total.investimento) || 1);
  const impAntes = soma(antes, (m) => m.total.impressoes) / (antes.length || 1);
  const impDepois = soma(depois, (m) => m.total.impressoes) / (depois.length || 1);

  return (
    <main>
      <PageHero
        tone="amber"
        image="none"
        eyebrow={`Balanço de mídia · ${s.cliente} · ${s.periodo.inicio.slice(0, 4)} até ${fmtDia(s.periodo.fim)}`}
        title={
          <>
            2026, <em>até aqui.</em>
          </>
        }
        description={
          <>
            {fmtMil(t.investimento)} investidos no Meta e no Google, de {fmtDia(s.periodo.inicio)} a {fmtDia(s.periodo.fim)}, colocaram os
            anúncios do hospital {fmtCompact(t.impressoes, 2)} de vezes na tela e trouxeram {fmtCompact(t.cliques)} cliques.
          </>
        }
        kpis={
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiTile label="Investimento" value={t.investimento} format="compactCurrency" decimals={1} tone="amber" hint="Meta + Google, valor ao cliente" />
            <KpiTile label="Impressões" value={t.impressoes} format="compact" decimals={2} hint="Vezes que os anúncios apareceram" />
            <KpiTile label="Cliques" value={t.cliques} format="compact" decimals={0} hint={`CTR de ${fmtPct(t.ctr, 2)}`} />
            <KpiTile label="Views de vídeo" value={t.views} format="compact" decimals={2} hint="Meta + YouTube" />
            <KpiTile label="Engajamentos" value={t.engajamento} format="compact" decimals={0} hint="Interações com os posts (Meta) + YouTube" />
            <KpiTile label="CPC médio" value={t.cpc} format="currency" decimals={2} hint={`CPM médio de ${fmtBRL(t.cpm, { decimals: 2 })}`} />
          </div>
        }
      >
        <BotaoExportarPdf />
      </PageHero>

      <Section
        index="01"
        eyebrow="Meta × Google"
        title={
          <>
            Metade da verba em cada <em>vitrine.</em>
          </>
        }
        description={
          <>
            O Meta ficou com {fmtPct(meta.investimento / t.investimento)} do investimento e entregou {fmtPct(meta.impressoes / t.impressoes, 0)} das
            impressões. O Google ficou com {fmtPct(google.investimento / t.investimento)} e trouxe {fmtPct(google.cliques / t.cliques, 0)} dos cliques.
          </>
        }
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <Reveal className="hub-card p-7 md:p-9">
            <span className="eyebrow text-text-3">Investimento por plataforma</span>
            <span className="display mt-4 block text-[clamp(2.4rem,4vw,3.5rem)] leading-none tracking-[-0.035em] text-text tabular">
              {fmtMil(t.investimento)}
            </span>
            <div className="mt-8">
              <SplitBar
                soPct
                parts={[
                  { label: `Meta · ${fmtMil(meta.investimento)}`, value: meta.investimento, color: "var(--amber)" },
                  { label: `Google · ${fmtMil(google.investimento)}`, value: google.investimento, color: "var(--dusk-2)" },
                ]}
              />
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
              Google desde {fmtDia(google.inicio)} · Meta desde {fmtDia(meta.inicio)}
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <Fato valor={fmtCompact(meta.impressoes, 2)} rotulo="impressões no Meta (Facebook e Instagram)" tom="text-amber" />
            <Fato valor={fmtCompact(google.cliques, 1)} rotulo="cliques no Google (Pesquisa, Display e YouTube)" tom="text-dusk-2" />
            <Fato valor={fmtBRL(t.cpm, { decimals: 2 })} rotulo="CPM médio: o custo de mil impressões" />
            <Fato valor={fmtPct(s.busca.ctr)} rotulo={`CTR da busca no Google: ${fmtUmEmCada(s.busca.ctr)} anúncios vistos virou clique`} tom="text-copper" />
          </div>
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Mês a mês"
        title={
          <>
            O Google abriu o ano; o Meta <em>entrou em {nomeMes(mesMeta)}.</em>
          </>
        }
        description={
          <>
            {antes.length > 0 && <>De {antes[0].nome} a {antes[antes.length - 1].nome}, só Google. </>}A partir de {fmtDia(meta.inicio)} o Meta
            entra e fica com {fmtPct(metaDepois, 0)} da verba dos meses completos seguintes; a média de impressões por mês vai de{" "}
            {fmtCompact(impAntes, 2)} para {fmtCompact(impDepois, 2)}.{ultimo.parcial && <> {ultimo.nome[0].toUpperCase() + ultimo.nome.slice(1)} vai até {fmtDia(s.periodo.fim)}.</>}
          </>
        }
      >
        <ChartFrame
          eyebrow="Meta Ads × Google Ads · por mês"
          title="Investimento e impressões"
          subtitle="Barras: investimento empilhado por plataforma. Linha: impressões das duas plataformas somadas."
          span={3}
          minHeight={420}
          tone="amber"
        >
          <MonthlyChart meses={s.meses} fim={s.periodo.fim} />
        </ChartFrame>
      </Section>

      <Section
        index="03"
        eyebrow="O ano em mosaico"
        title={
          <>
            De {ativasJan} para {ativasMax} <em>estratégias no ar.</em>
          </>
        }
        description={`Cada linha é uma estratégia, cada coluna um mês; quanto mais clara a célula, maior o investimento, e vazia quando a estratégia não rodou. O ano começou com ${ativasJan} estratégias ${plataformasJan.length === 1 ? `no ${plataformasJan[0]}` : "no Google e no Meta"} e chegou a ${ativasMax} em ${mesesNoMax.join(", ").replace(/, ([^,]*)$/, " e $1")}. ${ultimo.parcial ? `Em ${ultimo.nome}, até ${fmtDia(s.periodo.fim)}, ${ativasUltimo} já rodaram.` : ""}`}
      >
        <ChartFrame
          eyebrow="Estratégia × mês · investimento"
          title="O que rodou em cada mês"
          subtitle="Passe o cursor numa célula para ver investimento, métrica principal, frentes e campanhas."
          span={3}
          minHeight={420}
          tone="amber"
        >
          <GradeEstrategias grade={s.grade} meses={s.meses} fim={s.periodo.fim} />
        </ChartFrame>
      </Section>

      <Section index="04" eyebrow="Explore" title={<>Duas leituras do <em>mesmo investimento.</em></>}>
        <PortasCards
          portas={[
            {
              href: "/midia",
              titulo: "Mídia",
              numero: fmtCompact(t.impressoes, 2),
              legenda: "impressões no Meta e no Google",
              texto: "Estratégias, busca no Google, público por idade e gênero, engajamento, retenção de vídeo e os criativos que mais apareceram.",
              tom: "amber",
            },
            {
              href: "/frentes",
              titulo: "Frentes",
              numero: `${s.frentes.length} frentes`,
              legenda: `${fmtNum(t.campanhas)} campanhas`,
              texto: `${s.frentes.map((f) => f.frente).join(" · ")}: quanto cada uma recebeu, o que entregou e com quais criativos.`,
              tom: "dusk",
            },
          ]}
        />
      </Section>
    </main>
  );
}

function Fato({ valor, rotulo, tom = "text-text" }: { valor: string; rotulo: string; tom?: string }) {
  return (
    <Reveal className="hub-card flex flex-col justify-between gap-6 p-6 md:p-7" y={24}>
      <span className={`display text-[clamp(2.2rem,3.6vw,3.25rem)] leading-none tracking-[-0.03em] tabular ${tom}`}>{valor}</span>
      <span className="text-[14px] leading-snug text-text-2">{rotulo}</span>
    </Reveal>
  );
}
