/** Tipos de src/data/snapshot.json (gerado por scripts/build-snapshot.py). Sem alcance: a fonte não tem alcance único. */

/** Métricas agregadas. `investimento` = valor ao cliente (campo Investimento da base); `ctr` em fração. */
export interface Metricas {
  investimento: number;
  impressoes: number;
  cliques: number;
  views: number;
  engajamento: number;
  ctr: number;
  cpm: number;
  cpc: number;
}

export interface Periodo {
  inicio: string;
  fim: string;
}

export interface Totais extends Metricas {
  campanhas: number;
  meses: number;
}

export interface Plataforma extends Metricas, Periodo {
  plataforma: string;
  campanhas: number;
}

export interface Mes {
  /** "2026-01" */
  mes: string;
  /** "jan" */
  rotulo: string;
  /** "janeiro" */
  nome: string;
  /** Mês ainda em curso (outubro, até 06/out). */
  parcial: boolean;
  /** Quantas estratégias rodaram no mês. */
  estrategiasAtivas: number;
  meta: Metricas;
  google: Metricas;
  total: Metricas;
}

export interface EstrategiaFrente extends Metricas {
  plataforma: string;
  estrategia: string;
}

export interface Estrategia extends EstrategiaFrente {
  frentes: string[];
}

export interface Frente extends Metricas, Periodo {
  frente: string;
  campanhas: number;
  plataformas: Partial<Record<"Google" | "Meta", Metricas>>;
  estrategias: EstrategiaFrente[];
}

export interface LinhaGrade {
  plataforma: string;
  estrategia: string;
}

/** Uma célula da grade estratégia × mês (só existe quando a estratégia rodou no mês). */
export interface CelulaGrade extends Metricas, LinhaGrade {
  /** "2026-01" */
  mes: string;
  frentes: string[];
  campanhas: number;
}

export interface Grade {
  /** Colunas, em ordem: "2026-01" … */
  meses: string[];
  /** Linhas, em ordem: plataforma · estratégia. */
  linhas: LinhaGrade[];
  celulas: CelulaGrade[];
}

export interface AnuncioBusca extends Metricas {
  titulos: string[];
  frente: string;
}

export interface Busca extends Metricas {
  anuncios: AnuncioBusca[];
}

export interface PublicoMeta {
  idade: string;
  genero: string;
  impressoes: number;
  cliques: number;
  investimento: number;
  engajamento: number;
}

export interface PublicoGoogle {
  chave: string;
  impressoes: number;
  cliques: number;
  views: number;
}

export interface Publico {
  meta: PublicoMeta[];
  googleIdade: PublicoGoogle[];
  googleGenero: PublicoGoogle[];
  notaGoogle: string;
}

export interface Quartis {
  views: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
}

export interface Video {
  meta: Quartis;
  /** Quartis estimados (taxa × impressões): mostrar só em %. */
  youtube: Quartis & { impressoes: number; investimento: number };
  notaYoutube: string;
}

/** Engajamento do Meta. As 5 linhas são um recorte: não somam `total`. */
export interface Engajamento {
  total: number;
  reacoes: number;
  comentarios: number;
  compartilhamentos: number;
  salvamentos: number;
  cliquesLink: number;
  youtube: number;
}

export interface Criativo extends Metricas {
  id: string;
  nome: string;
  plataforma: string;
  frente: string;
  estrategia: string;
  formato: string;
  imagemOrigem: string;
  /** Permalink do Instagram ou YouTube; vazio quando não há. */
  link: string;
  /** Cópia local em public/criativos/. */
  imagem: string;
}

export interface Snapshot {
  cliente: string;
  periodo: Periodo;
  atualizadoEm: string;
  totais: Totais;
  plataformas: Plataforma[];
  meses: Mes[];
  frentes: Frente[];
  estrategias: Estrategia[];
  grade: Grade;
  busca: Busca;
  publico: Publico;
  video: Video;
  engajamento: Engajamento;
  criativos: Criativo[];
  /** Notas do build; só aparecem em dev, no rodapé. */
  avisos: string[];
}
