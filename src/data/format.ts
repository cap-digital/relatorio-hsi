/** Formatação pt-BR usada nas páginas e gráficos do relatório. */

const cache = new Map<string, Intl.NumberFormat>();
const nf = (o: Intl.NumberFormatOptions) => {
  const k = JSON.stringify(o);
  let f = cache.get(k);
  if (!f) cache.set(k, (f = new Intl.NumberFormat("pt-BR", o)));
  return f;
};

export function fmtNum(v: number, decimals = 0): string {
  return nf({ maximumFractionDigits: decimals, minimumFractionDigits: 0 }).format(v);
}

export function fmtCompact(v: number, decimals = 1): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${fmtNum(v / 1e9, decimals)} bi`;
  if (a >= 1e6) return `${fmtNum(v / 1e6, decimals)} mi`;
  if (a >= 1e3) return `${fmtNum(v / 1e3, a >= 1e5 ? 0 : decimals)} mil`;
  return fmtNum(v, 0);
}

export function fmtBRL(v: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  if (opts.compact && Math.abs(v) >= 1e3) return `R$ ${fmtCompact(v, opts.decimals ?? 1)}`;
  return nf({ style: "currency", currency: "BRL", maximumFractionDigits: opts.decimals ?? 0, minimumFractionDigits: opts.decimals ?? 0 }).format(v);
}

/** "R$ 129,3 mil" — milhares com uma casa fixa, como na tabela de referência do relatório. */
export function fmtMil(v: number): string {
  return `R$ ${nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v / 1e3)} mil`;
}

/** `v` em fração (0.42 → "42%"). */
export function fmtPct(v: number, decimals = 1): string {
  return `${fmtNum(v * 100, decimals)}%`;
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function fmtDia(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MESES[m - 1]}`;
}

export function fmtAtualizado(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/* ------------------------------------------------- métrica principal por estratégia */

type Base = { plataforma: string; estrategia: string; investimento: number; impressoes: number; cliques: number; views: number; engajamento: number };
type Chave = "cliques" | "impressoes" | "views" | "engajamento";

/** Metas do contrato: cada estratégia é medida por uma métrica e um custo. "Alcance" é nome de estratégia, nunca métrica. */
const METRICA: Record<string, { chave: Chave; rotulo: string; custo: string }> = {
  "Google|Pesquisa": { chave: "cliques", rotulo: "cliques", custo: "CPC" },
  "Google|Display": { chave: "cliques", rotulo: "cliques", custo: "CPC" },
  "Google|YouTube In-Stream": { chave: "views", rotulo: "views", custo: "CPV" },
  "Meta|Alcance": { chave: "impressoes", rotulo: "impressões", custo: "CPM" },
  "Meta|Posts de oportunidade": { chave: "impressoes", rotulo: "impressões", custo: "CPM" },
  "Meta|Tráfego": { chave: "cliques", rotulo: "cliques", custo: "CPC" },
  "Meta|Engajamento": { chave: "engajamento", rotulo: "engajamentos", custo: "custo por engajamento" },
};

export interface MetricaPrincipal {
  valor: number;
  /** "cliques", "impressões", "views", "engajamentos" */
  rotulo: string;
  custo: number;
  /** "CPC", "CPM", "CPV", "custo por engajamento" */
  custoRotulo: string;
}

export function metricaPrincipal(e: Base): MetricaPrincipal {
  const m = METRICA[`${e.plataforma}|${e.estrategia}`] ?? { chave: "impressoes", rotulo: "impressões", custo: "CPM" };
  const valor = e[m.chave];
  const custo = valor ? (m.chave === "impressoes" ? (e.investimento / valor) * 1000 : e.investimento / valor) : 0;
  return { valor, rotulo: m.rotulo, custo, custoRotulo: m.custo };
}

/** "53,5 mil cliques · CPC R$ 0,63" */
export function fmtMetricaPrincipal(e: Base): string {
  const m = metricaPrincipal(e);
  return `${fmtCompact(m.valor)} ${m.rotulo} · ${m.custoRotulo} ${fmtBRL(m.custo, { decimals: 2 })}`;
}

/* ------------------------------------------------- textos calculados do snapshot */

const EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

/** 0–10 por extenso ("sete"); acima disso, o número. `maiuscula` capitaliza ("Sete"). */
export function fmtExtenso(n: number, maiuscula = false): string {
  const s = EXTENSO[n] ?? fmtNum(n);
  return maiuscula ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Fração como "quase 1 em cada 4" / "1 em cada 4" / "mais de 1 em cada 4". */
export function fmtUmEmCada(v: number): string {
  if (v <= 0) return "nenhum";
  const n = Math.max(1, Math.round(1 / v));
  const r = v * n;
  return `${r < 0.98 ? "quase " : r > 1.02 ? "mais de " : ""}1 em cada ${n}`;
}

/** Célula da grade (ou métrica) que de fato rodou: investimento 0 e impressões 0 = não rodou (linhas vazias da coleta). */
export function rodou(c: { investimento: number; impressoes: number }): boolean {
  return c.investimento > 0 || c.impressoes > 0;
}
