import type { Metadata } from "next";
import { ChartFrame } from "@/components/core/chart-frame";
import { KpiTile } from "@/components/core/kpi-tile";
import { Section } from "@/components/core/section";
import { PageHero } from "@/components/hero/page-hero";
import { CriativosGrid } from "@/components/paginas/criativos";
import { EntregaPublico } from "@/components/paginas/entrega-publico";
import { HBars } from "@/components/viz/hbars";
import { Retencao, SplitBar } from "@/components/viz/small";
import { CRIATIVOS_NO_ANO, fmtBRL, fmtCompact, fmtExtenso, fmtMetricaPrincipal, fmtMil, fmtNum, fmtPct } from "@/data/format";
import snapshot from "@/data/snapshot.json";
import type { Snapshot } from "@/data/types";

export const metadata: Metadata = { title: "Mídia · Hospital Santa Izabel" };

const s: Snapshot = snapshot;

const COR: Record<string, string> = { Meta: "var(--amber)", Google: "var(--dusk-2)" };
const IDADE: Record<string, string> = { desconhecida: "Não informada" };

export default function Midia() {
  const t = s.totais;
  const meta = s.plataformas.find((p) => p.plataforma === "Meta")!;
  const google = s.plataformas.find((p) => p.plataforma === "Google")!;
  const porInvestimento = [...s.estrategias].sort((a, b) => b.investimento - a.investimento);
  const porCliques = [...s.estrategias].sort((a, b) => b.cliques - a.cliques);
  const b = s.busca;
  const v = s.video;
  const e = s.engajamento;
  const totalIdadeGoogle = s.publico.googleIdade.reduce((a, x) => a + x.impressoes, 0) || 1;

  return (
    <main>
      <PageHero
        tone="amber"
        image="none"
        eyebrow={`Mídia · Meta Ads × Google Ads · ${s.estrategias.length} estratégias`}
        title={
          <>
            Cada real, <em>cada tela.</em>
          </>
        }
        description={`${fmtMil(t.investimento)} investidos em ${fmtNum(t.campanhas)} campanhas e ${s.estrategias.length} estratégias: ${fmtCompact(t.impressoes, 2)} de impressões, ${fmtCompact(t.cliques)} cliques e ${fmtCompact(t.engajamento)} engajamentos.`}
        kpis={
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <KpiTile label="Investimento" value={t.investimento} format="compactCurrency" decimals={1} tone="amber" hint="Meta + Google, valor ao cliente" />
            <KpiTile label="Impressões" value={t.impressoes} format="compact" decimals={2} />
            <KpiTile label="CPM" value={t.cpm} format="currency" decimals={2} hint="Custo por mil impressões" />
            <KpiTile label="CTR" value={t.ctr * 100} format="percent" decimals={2} hint="Cliques ÷ impressões" />
            <KpiTile label="Cliques" value={t.cliques} format="compact" decimals={0} hint={`CPC de ${fmtBRL(t.cpc, { decimals: 2 })}`} className="col-span-2 md:col-span-1" />
          </div>
        }
      />

      <Section
        index="01"
        eyebrow="Estratégias"
        title={
          <>
            {fmtExtenso(s.estrategias.length, true)} estratégias, <em>cada uma</em> com a sua meta.
          </>
        }
        description="À esquerda, onde o investimento foi, com a métrica que cada estratégia tinha como meta. À direita, quem trouxe os cliques."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame eyebrow="Investimento por estratégia" title="Onde o dinheiro foi" minHeight={380}>
            <HBars
              items={porInvestimento.map((x) => ({
                key: `${x.plataforma}-${x.estrategia}`,
                label: x.estrategia,
                value: x.investimento,
                display: fmtBRL(x.investimento, { compact: true }),
                sub: `${x.plataforma} · ${fmtMetricaPrincipal(x)}`,
                color: COR[x.plataforma],
              }))}
            />
          </ChartFrame>
          <ChartFrame eyebrow="Cliques por estratégia" title="Quem trouxe os cliques" minHeight={380} tone="dusk">
            <HBars
              items={porCliques.map((x) => ({
                key: `${x.plataforma}-${x.estrategia}`,
                label: x.estrategia,
                value: x.cliques,
                display: fmtCompact(x.cliques),
                sub: `${x.plataforma} · CTR ${fmtPct(x.ctr, 2)} · CPC ${fmtBRL(x.cpc, { decimals: 2 })}`,
                color: COR[x.plataforma],
              }))}
            />
          </ChartFrame>
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Busca no Google"
        tone="dusk"
        title={
          <>
            {fmtPct(b.ctr)} das impressões na busca <em>viraram clique.</em>
          </>
        }
        description={`Quem procurou o hospital no Google encontrou o anúncio: ${fmtCompact(b.cliques, 1)} cliques a ${fmtBRL(b.cpc, { decimals: 2 })} cada, com ${fmtBRL(b.investimento, { compact: true })} investidos na Pesquisa.`}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <KpiTile label="Cliques na busca" value={b.cliques} format="compact" decimals={1} tone="dusk" className="col-span-2 lg:col-span-1" />
            <KpiTile label="CTR" value={b.ctr * 100} format="percent" decimals={1} />
            <KpiTile label="CPC" value={b.cpc} format="currency" decimals={2} />
          </div>
          <ChartFrame
            eyebrow="Anúncios de texto"
            title={`Os ${b.anuncios.length} anúncios com mais cliques`}
            subtitle="Títulos de cada anúncio, como apareceram na busca"
            minHeight={200}
            lazy={false}
            tone="dusk"
          >
            <ul className="divide-y divide-line">
              {b.anuncios.map((a) => (
                <li key={a.titulos.join("|")} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-3">
                  <div className="min-w-0">
                    <span className="text-[14px] font-medium text-text">{a.titulos[0]}</span>
                    <span className="ml-3 font-mono text-[11px] text-text-3">{a.titulos.slice(1).join(" · ")}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] text-text-2 tabular">
                    <span className="text-text">{fmtNum(a.cliques)}</span> cliques · CTR {fmtPct(a.ctr)} · CPC {fmtBRL(a.cpc, { decimals: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </ChartFrame>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="Público"
        title={
          <>
            Para <em>quem</em> a mídia foi entregue.
          </>
        }
        description={
          <>
            No Meta, entrega por gênero e faixa etária<span className="no-print">; escolha o tipo de entrega</span>. No Google, a faixa etária vem
            só das campanhas Faz Bem.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <ChartFrame eyebrow="Meta · gênero × idade" title="Entrega por gênero e idade" minHeight={420}>
            <EntregaPublico linhas={s.publico.meta} />
          </ChartFrame>
          <ChartFrame eyebrow="Google · idade" title="Impressões por faixa etária" subtitle="Só Faz Bem" minHeight={420} tone="dusk">
            <HBars
              items={s.publico.googleIdade.map((x) => ({
                key: x.chave,
                label: IDADE[x.chave] ?? x.chave,
                value: x.impressoes,
                display: fmtPct(x.impressoes / totalIdadeGoogle, 1),
                sub: `${fmtCompact(x.impressoes)} impressões · ${fmtNum(x.cliques)} cliques`,
                color: "var(--dusk-2)",
              }))}
            />
          </ChartFrame>
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="Plataformas"
        title={
          <>
            O Meta trouxe a <em>escala;</em> o Google, a <em>intenção.</em>
          </>
        }
        description={`${
          Math.abs(meta.investimento - google.investimento) / t.investimento < 0.05
            ? "Com investimentos quase iguais"
            : `Com ${fmtPct(meta.investimento / t.investimento, 0)} da verba no Meta e ${fmtPct(google.investimento / t.investimento, 0)} no Google`
        }, o Meta entregou ${fmtPct(meta.impressoes / t.impressoes, 0)} das impressões e o Google, ${fmtPct(google.cliques / t.cliques, 0)} dos cliques.`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame eyebrow="Impressões" title="Quem colocou o hospital na tela" minHeight={72} lazy={false}>
            <SplitBar
              parts={[
                { label: "Meta", value: meta.impressoes, color: "var(--amber)" },
                { label: "Google", value: google.impressoes, color: "var(--dusk-2)" },
              ]}
            />
          </ChartFrame>
          <ChartFrame eyebrow="Cliques" title="Quem levou o público ao hospital" minHeight={72} lazy={false} tone="dusk">
            <SplitBar
              parts={[
                { label: "Meta", value: meta.cliques, color: "var(--amber)" },
                { label: "Google", value: google.cliques, color: "var(--dusk-2)" },
              ]}
            />
          </ChartFrame>
        </div>
      </Section>

      <Section
        index="05"
        eyebrow="Engajamento"
        title={
          <>
            {fmtCompact(e.total)} engajamentos <em>com os posts</em> no Meta.
          </>
        }
        description={`O total é o engajamento do post, como o Meta conta. As cinco interações ao lado são um recorte e não somam o total. Com os ${fmtCompact(e.youtube)} engajamentos do YouTube, são ${fmtCompact(t.engajamento)} no período.`}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiTile label="Engajamento · Meta" value={e.total} format="compact" decimals={1} tone="amber" hint="Engajamento do post" />
          <KpiTile label="Reações" value={e.reacoes} format="compact" decimals={1} />
          <KpiTile label="Comentários" value={e.comentarios} format="compact" decimals={1} />
          <KpiTile label="Compartilhamentos" value={e.compartilhamentos} format="compact" decimals={1} />
          <KpiTile label="Salvamentos" value={e.salvamentos} format="compact" decimals={1} />
          <KpiTile label="Cliques no link" value={e.cliquesLink} format="compact" decimals={1} />
        </div>
      </Section>

      <Section
        index="06"
        eyebrow="Vídeo"
        title={
          <>
            No YouTube, {Math.round((v.youtube.p25 ? v.youtube.p100 / v.youtube.p25 : 0) * 10)} em cada 10 <em>foram até o fim.</em>
          </>
        }
        description={`${fmtCompact(v.meta.views, 2)} views de vídeo no Meta e ${fmtCompact(v.youtube.views, 1)} no YouTube. As curvas mostram, de quem chegou a 25% do vídeo, quantos seguiram até cada marco: no Meta, ${fmtPct(v.meta.p25 ? v.meta.p100 / v.meta.p25 : 0, 0)} foram até o fim. No YouTube os quartis são estimados.`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame eyebrow="Meta · retenção de vídeo" title="Quem ficou até o fim" footer={`${fmtCompact(v.meta.views, 2)} views`} minHeight={280}>
            <Retencao
              etapas={[
                { label: "25%", value: v.meta.p25 },
                { label: "50%", value: v.meta.p50 },
                { label: "75%", value: v.meta.p75 },
                { label: "100%", value: v.meta.p100 },
              ]}
              soPct
            />
          </ChartFrame>
          <ChartFrame eyebrow="YouTube · retenção de vídeo" title="Quem ficou até o fim" footer={`${fmtCompact(v.youtube.views, 1)} views · quartis estimados`} minHeight={280} tone="dusk">
            <Retencao
              etapas={[
                { label: "25%", value: v.youtube.p25 },
                { label: "50%", value: v.youtube.p50 },
                { label: "75%", value: v.youtube.p75 },
                { label: "100%", value: v.youtube.p100 },
              ]}
              soPct
              rgb="95,194,174"
            />
          </ChartFrame>
        </div>
      </Section>

      <Section
        index="07"
        eyebrow="Alguns dos criativos veiculados · seleção por entrega"
        nota={CRIATIVOS_NO_ANO["Mídia"]}
        title={
          <>
            As peças que <em>mais apareceram.</em>
          </>
        }
        description={
          <>
            Os criativos ordenados por impressões, com a frente e o investimento de cada um.
            <span className="no-print"> Abra o post no Instagram ou o vídeo no YouTube quando houver link.</span>
          </>
        }
      >
        <CriativosGrid criativos={s.criativos} />
      </Section>
    </main>
  );
}
