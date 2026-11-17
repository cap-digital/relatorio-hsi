"use client";

import { useState } from "react";
import { HBars, type HBarItem } from "@/components/viz/hbars";
import { fmtNum, fmtPct } from "@/data/format";
import type { PalavraChave, PalavrasChave as Dados } from "@/data/types";
import { cn } from "@/lib/utils";
import { BotaoVerTodos } from "./ver-todos";

const FRENTES = ["Institucional AON", "Faz Bem"] as const;
const INICIAL = 10;
const MAXIMO = 15;
/** No ranking por CTR, termos com menos impressões que isso ficam de fora (2 impr. e 1 clique = 50%). */
const CTR_MIN_IMPRESSOES = 50;
export const NOTA_PALAVRAS_CHAVE = "Sem custo por palavra-chave na fonte. Não inclui a campanha Curativos.";
const NOTA_CTR = `CTR considera termos com ${CTR_MIN_IMPRESSOES}+ impressões.`;

type Metrica = "cliques" | "impressoes" | "ctr";
const METRICAS: { k: Metrica; label: string }[] = [
  { k: "cliques", label: "Cliques" },
  { k: "impressoes", label: "Impressões" },
  { k: "ctr", label: "CTR" },
];
/** Ressalva da frente cuja fonte de palavras-chave não cobre os cliques de Pesquisa (totais.completa = false). */
const RESSALVA: Record<string, string> = {
  "Faz Bem": "A fonte de palavras-chave do Faz Bem está incompleta em jan–mar; o ranking mostra os termos registrados.",
};
const ressalva = (dados: Dados, frente: string): string | null =>
  dados.totais[frente]?.completa === false
    ? (RESSALVA[frente] ?? `A fonte de palavras-chave de ${frente} está incompleta; o ranking mostra os termos registrados.`)
    : null;

/** Ranking pela métrica (maior em cima; empate → cliques, depois o termo). No CTR, só termos com 50+ impressões. */
function ranking(lista: PalavraChave[], m: Metrica): PalavraChave[] {
  const base = m === "ctr" ? lista.filter((p) => p.impressoes >= CTR_MIN_IMPRESSOES) : lista;
  return [...base].sort((a, b) => b[m] - a[m] || b.cliques - a.cliques || a.termo.localeCompare(b.termo, "pt-BR"));
}

const cliques = (n: number) => `${fmtNum(n)} ${n === 1 ? "clique" : "cliques"}`;

/** A barra representa a métrica escolhida; o sub mostra as outras duas. */
function itens(lista: PalavraChave[], m: Metrica = "cliques"): HBarItem[] {
  return lista.map((p) => ({
    key: p.termo,
    label: p.termo,
    value: p[m],
    display: m === "ctr" ? fmtPct(p.ctr, 1) : fmtNum(p[m]),
    sub:
      m === "cliques"
        ? `${fmtNum(p.impressoes)} impr. · CTR ${fmtPct(p.ctr, 1)}`
        : m === "impressoes"
          ? `${cliques(p.cliques)} · CTR ${fmtPct(p.ctr, 1)}`
          : `${cliques(p.cliques)} · ${fmtNum(p.impressoes)} impr.`,
    color: "var(--dusk-2)",
  }));
}

function Pilulas<T extends string>({ rotulo, opcoes, ativo, onChange }: { rotulo: string; opcoes: { k: T; label: string }[]; ativo: T; onChange: (k: T) => void }) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o.k}
          role="tab"
          aria-selected={ativo === o.k}
          onClick={() => onChange(o.k)}
          className={cn(
            "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300",
            ativo === o.k ? "border-transparent bg-text text-ink" : "border-line text-text-2 hover:border-line-strong hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Resumo({ dados, frente }: { dados: Dados; frente: string }) {
  const t = dados.totais[frente];
  if (!t) return null;
  // Fonte incompleta: os totais não representam a frente — fica só o nº de termos.
  return (
    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3">
      {fmtNum(t.termos)} {t.termos === 1 ? "termo" : "termos"} com clique
      {t.completa && (
        <>
          {" "}
          · {fmtNum(t.cliques)} cliques · {fmtNum(t.impressoes)} impressões
        </>
      )}
    </p>
  );
}

export function NotaPalavrasChave({ ressalvas = [], ctr = false, className }: { ressalvas?: string[]; ctr?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3", className)}>
      <p>
        {NOTA_PALAVRAS_CHAVE}
        {ctr && ` ${NOTA_CTR}`}
      </p>
      {ressalvas.map((r) => (
        <p key={r}>{r}</p>
      ))}
    </div>
  );
}

/** Tela: abas por frente e seletor de métrica (mesmo padrão do EntregaPublico); top 10 e "Ver todos" até 15. */
export function PalavrasChave({ dados }: { dados: Dados }) {
  const frentes = FRENTES.filter((f) => dados.porFrente[f]?.length).map((f) => ({ k: f as string, label: f as string }));
  const [frente, setFrente] = useState<string>(frentes[0]?.k ?? FRENTES[0]);
  const [metrica, setMetrica] = useState<Metrica>("cliques");
  const [aberto, setAberto] = useState(false);
  const lista = ranking(dados.porFrente[frente] ?? [], metrica).slice(0, MAXIMO);

  return (
    <div>
      <Pilulas
        rotulo="Frente"
        opcoes={frentes}
        ativo={frente}
        onChange={(f) => {
          setFrente(f);
          setAberto(false);
        }}
      />
      <div className="mt-4">
        <Resumo dados={dados} frente={frente} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-3">Ordenar por</span>
        <Pilulas rotulo="Métrica" opcoes={METRICAS} ativo={metrica} onChange={setMetrica} />
      </div>
      <HBars key={`${frente}-${metrica}`} className="mt-6" items={itens(aberto ? lista : lista.slice(0, INICIAL), metrica)} />
      <BotaoVerTodos aberto={aberto} total={lista.length} inicial={INICIAL} onToggle={() => setAberto((v) => !v)} />
      <NotaPalavrasChave className="mt-6" ctr ressalvas={[ressalva(dados, frente)].filter((r): r is string => !!r)} />
    </div>
  );
}

/** PDF: as duas frentes uma abaixo da outra, sem abas, top 10 cada (em duas colunas: 1–5 | 6–10). */
export function PalavrasChavePdf({ dados }: { dados: Dados }) {
  return (
    <div className="flex flex-col gap-10">
      {FRENTES.filter((f) => dados.porFrente[f]?.length).map((f) => (
        <div key={f}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
            <h3 className="display text-[1.35rem] leading-tight tracking-[-0.02em] text-text">{f}</h3>
            <Resumo dados={dados} frente={f} />
          </div>
          <HBars
            estatico
            className="mt-6 block columns-2 gap-x-14 [&>li]:mb-4 [&>li]:break-inside-avoid"
            items={itens(ranking(dados.porFrente[f], "cliques").slice(0, INICIAL))}
          />
        </div>
      ))}
      <NotaPalavrasChave ressalvas={FRENTES.map((f) => ressalva(dados, f)).filter((r): r is string => !!r)} />
    </div>
  );
}
