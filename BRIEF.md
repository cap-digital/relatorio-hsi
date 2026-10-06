# Balanço de mídia 2026 · Hospital Santa Izabel (até 06/out)

Balanço de apresentação para a **diretoria do Hospital Santa Izabel**: o ano de 2026 até agora. **Não é pós-venda e não é encerramento**, porque as campanhas continuam no ar. Cada mês teve estratégias, plataformas e campanhas diferentes, e o relatório precisa mostrar essa evolução. Nunca usar "pós-venda", "pós-campanha", "encerrada" nem "10 meses". Ele é **agregado**: números grandes, comparações e destaques. Nada de leitura dia a dia nem filtros de data.

**Base obrigatória:** o repo `pos-venda-campanha2026-jaques` (pós-campanha Jaques Wagner). Copie o sistema de lá e mantenha a mesma arquitetura, os mesmos componentes e a mesma linguagem de motion. Mudam só a **pele** (cores, fontes, textos e imagens) e o **conteúdo**. Não invente componentes, bibliotecas ou seções fora do que está descrito aqui.

> O projeto `relatorio-hsi` já é Next 16 (App Router), como o do Jaques. Antes de escrever código, leia o `AGENTS.md`, que manda consultar `node_modules/next/dist/docs/`.

---

## 1. Dados

- **`src/data/snapshot.json`** é a única fonte do relatório. Ele é estático, já vem agregado e as páginas são HTML gerado no build. Não há chamada de API em tempo de execução.
- Para regenerar, rode `python3 scripts/build-snapshot.py data/hsi-dados.json src/data/snapshot.json --imagens`. O `curl` para baixar `data/hsi-dados.json` está no topo do script. Coloque `data/` no `.gitignore` (são 27 MB).
- O `--imagens` baixa as miniaturas dos criativos para `public/criativos/`, porque as URLs do fbcdn expiram. Rode **uma vez localmente** antes do deploy.
- Crie `src/data/types.ts` com os tipos do snapshot e um `src/data/format.ts`. O format é **copiado** de `src/data/politica/format.ts` do Jaques (fmtNum, fmtCompact, fmtBRL, fmtPct, fmtDia).

**Regras de conteúdo**

- **Sem alcance em lugar nenhum.** A fonte não tem alcance único.
- **Investimento** é o campo `Investimento` da base: o valor ao cliente (spend ÷ margem). Nunca usar spend nem aplicar o "bruto ÷ 0,8785" do Jaques.
- O snapshot já sai com as **mesmas regras do dashboard em produção** (descarte de Estratégia em branco e dos uploads errados de agosto, mais a trava de investimento no contratado a partir de 01/07). A interface não indica o corte. Não reaplicar nada disso no front.
- Outubro é parcial (até 06/out). Isso deve aparecer no gráfico mensal (`meses[].parcial`).
- Engajamento:
  - `totais.engajamento` = Meta (engajamento do post) + YouTube (engajamentos).
  - Na seção de engajamento do Meta, ao lado do total, aparecem sempre as 5 linhas (Reações, Comentários, Compartilhamentos, Salvamentos, Cliques no link), com 0 explícito quando for o caso.
  - Essas 5 linhas são um recorte, não a decomposição do total: **não somam** o total e não devem ser apresentadas como partes dele.
- Os quartis de vídeo do YouTube são estimados (taxa × impressões). Mostrar só em %, como o `Retencao soPct` do Jaques.
- Botão **"Ver anúncio ↗"** nos criativos: só quando houver link (permalink do Instagram ou YouTube).
- `avisos[]` aparece só em dev, no rodapé, igual ao Jaques.

**Números de referência** (para conferir a renderização)

| Métrica | Valor |
|---|---|
| Investimento | R$ 130,1 mil (Google R$ 65,1 mil · 50,1% · Meta R$ 65,0 mil · 49,9%) |
| Impressões | 9,18 mi |
| Cliques | 101 mil · CTR 1,10% · CPC R$ 1,28 · CPM R$ 14,17 |
| Views de vídeo | 1,22 mi |
| Engajamentos | 285 mil |
| Campanhas | 34 |

- **Frentes:** Institucional AON R$ 79,0 mil · Faz Bem R$ 49,9 mil · Checkup Torcedor R$ 1,1 mil.
- **Busca Google:** 53,5 mil cliques · CTR 23,7% · CPC R$ 0,63.
- **Google:** de janeiro a outubro. **Meta:** entra em maio (12/05).

---

## 2. O que copiar do Jaques (e o que NÃO copiar)

**Copiar e adaptar**

- `src/lib/gsap.ts`, `src/lib/utils.ts`, `src/hooks/*`
- `src/components/core/*`:
  - preloader, hub-ready-store, page-transition, transition-link, smooth-scroll, grain
  - reveal, split-heading, counter, format-number, kpi-tile, sparkline, section, chart-frame, in-view
  - cta, magnetic, logo (vira `LogoHSI`)
- `src/components/hero/page-hero.tsx`
- `src/components/nav/*` (nav, menu-overlay, footer)
- `src/components/viz/hbars.tsx`, `viz/heatmap.tsx` (vira a grade estratégia × mês), `viz/small.tsx` (SplitBar, Retencao, DotMatrix) e `viz/tooltip.tsx`
- `src/components/viz/daily-chart.tsx`, que vira **`monthly-chart.tsx`**:
  - barras empilhadas Google + Meta por mês;
  - linha de impressões no eixo direito;
  - mês parcial com hachura (`.hatch-*`, que já existe no CSS).
- `src/components/paginas/*`: portas, criativos, entrega-publico, exportar-pdf, ver-todos
- `src/app/template.tsx`, `src/app/not-found.tsx`, `src/app/relatorio/page.tsx`, `src/app/api/pdf/route.ts` e o `next.config.ts` (bloco do PDF)
- `src/app/globals.css` inteiro, trocando só os **valores** dos tokens (ver seção 3)

**NÃO copiar**

- `components/charts/*` (Bklit, não usado em nenhuma página) e `docs/`
- TSE, mapa, `bahia-map`, `map-explorer`, `scatter-cidades`, território
- `meta.ts`, `reserva.ts`, Redis
- Dependências sem uso: three/R3F, rive, number-flow, d3-geo, visx

**Dependências**

- `gsap @gsap/react lenis motion d3-scale d3-shape react-use-measure lucide-react clsx tailwind-merge tw-animate-css shadcn playwright-core @sparticuz/chromium`
- Em dev: `playwright`

---

## 3. Identidade: mesma estrutura, outra pele

A mecânica continua a mesma (escuro cinematográfico, grão, cortina, títulos com máscara). A diferença está na paleta da marca HSI e na tipografia. **Mantenha os NOMES dos tokens** (`--amber`, `--copper`, `--dusk`…) para os componentes copiados funcionarem sem refactor. Troque só os valores:

```css
--ink: #0b1610;          /* verde-quase-preto no lugar do preto neutro */
--surface-1: #0f1d15; --surface-2: #13241a; --surface-3: #1a2e22; --surface-4: #22392b;
--line: rgba(232,240,220,.10); --line-strong: rgba(232,240,220,.18);
--text: #eef3e6; --text-2: #b3bfa8; --text-3: #7a8872;
--amber: #c8dc4c;  --amber-2: #a9be2e;  --amber-glow: rgba(200,220,76,.35);   /* limão HSI = cor principal, série Meta */
--copper: #6ba84f; --copper-2: #4f8a3a; --copper-glow: rgba(107,168,79,.35);  /* verde da marca */
--dusk: #2f8f7e;   --dusk-2: #5fc2ae;   --dusk-glow: rgba(95,194,174,.35);    /* verde-água = série Google */
--chart-scale-01..05: do #16261b ao #c8dc4c;
```

- **Cores fixas por série:**
  - Meta = `--amber` (limão), Google = `--dusk-2` (verde-água).
  - Frentes: Institucional = `--amber`, Faz Bem = `--dusk-2`, Checkup Torcedor = `--copper`.
- **Ajustes nos arquivos copiados:**
  - Revise os `rgba(239,59,54,…)` fixos (vermelho do Jaques) em `daily-chart`, `heatmap`, `small` e `menu-overlay`.
  - Revise o `.hub-grain__gradient` do CSS.
  - Todos passam a usar os novos valores.
- **Fontes** (`next/font/google`):
  - display: **Plus Jakarta Sans**, no lugar de Bricolage;
  - destaque em itálico: **Fraunces** italic, no lugar de Instrument Serif;
  - corpo e mono continuam Geist e Geist Mono.
- **Logo:** `LogoHSI` tipográfico, "Santa Izabel" + ponto limão. Com `withCargo`, mostra a linha "Hospital · Santa Casa da Bahia".
- **Preloader:**
  - contador e barra iguais;
  - texto central "Santa Izabel." com o subtítulo "2026 até aqui, em números";
  - metas nos cantos: "Balanço de mídia · 2026" e "Meta Ads × Google Ads".
- **Cortina:** painel limão e depois o ink verde.
- **Hero:** sem retrato. Use o modo mesh do `PageHero` (`image="none"`) com as manchas recoloridas: limão, verde da marca e verde-água.
- **Rodapé:** a palavra vazada passa a ser **SANTA IZABEL**.
- **Fontes listadas no rodapé:** "Meta Ads · conta do hospital", "Google Ads · Pesquisa, Display e YouTube" e "Consolidação CAP · jan → out 2026".

---

## 4. Rotas e seções (espelham Início / Mídia / Território do Jaques)

| Rota | Papel | Equivalente no Jaques |
|---|---|---|
| `/` | Panorama | `/` |
| `/midia` | Mídia agregada | `/midia` |
| `/frentes` | Institucional · Faz Bem · Checkup Torcedor | `/territorio` |
| `/relatorio` | As 3 juntas para o PDF | `/relatorio` |

**Nav:** Início · Mídia · Frentes.

### `/` Início

- **Hero** (`tone="amber"`):
  - eyebrow: "Balanço de mídia · Hospital Santa Izabel · 2026 até 06 out";
  - título: "2026, <em>até aqui.</em>";
  - descrição: investimento, impressões e cliques do período, em uma frase.
- **KPIs** (grade de 6, `KpiTile`): Investimento · Impressões · Cliques · Views de vídeo · Engajamentos · CPC médio. O botão "Exportar PDF" fica no hero, como no Jaques.
- **01 · "Meta × Google"**:
  - título: "Metade da verba em cada <em>vitrine.</em>";
  - à esquerda, um card com `SplitBar` do investimento por plataforma;
  - à direita, 4 cards `Fato` (iguais ao Jaques): impressões Meta, cliques Google, CPM médio e CTR da busca.
- **02 · "Mês a mês"**:
  - título: "O Google abriu o ano; o Meta <em>entrou em maio.</em>";
  - `MonthlyChart` dentro de um `ChartFrame` com `span={3}`.
- **03 · "O ano em mosaico"**:
  - título: "De 2 para 7 <em>estratégias no ar.</em>" (números de `meses[].estrategiasAtivas`: mínimo de jan e máximo do ano);
  - `Heatmap` do Jaques adaptado (`viz/heatmap.tsx` → `viz/grade-estrategias.tsx`): linhas = `grade.linhas` (plataforma · estratégia), colunas = `grade.meses`, cor da célula = investimento do mês (escala raiz, como no original), célula vazia quando a estratégia não rodou;
  - hover mostra investimento, métrica principal da estratégia, frentes e nº de campanhas da célula; a legenda embaixo segue o padrão "Passe o cursor sobre a grade" do original;
  - rótulo da linha com um ponto da cor da plataforma (Meta = `--amber`, Google = `--dusk-2`); outubro com a mesma marcação de parcial do gráfico mensal.
- **04 · "Explore"**: `PortasCards` com 2 portas.
  - Mídia: número = impressões;
  - Frentes: número = "3 frentes", com legenda de 34 campanhas.

### `/midia`

O hero tem KPIs de Investimento · Impressões · CPM · CTR · Cliques. Seções:

1. **Estratégias:** dois `HBars` lado a lado, investimento por estratégia e cliques por estratégia. O `sub` mostra plataforma, CTR e CPC.
2. **Busca no Google:** KPIs de cliques, CTR e CPC mais a lista dos 6 anúncios de texto (`busca.anuncios`). A lista segue o padrão da seção "Materiais" do Jaques, com títulos e números em mono.
3. **Público:**
   - `EntregaPublico` com os dados do Meta. As abas passam a ser **Impressões / Cliques / Investimento / Engajamento**, sem "Alcance".
   - Ao lado, `HBars` de idade do Google (`publico.googleIdade`) com a nota "só Faz Bem".
4. **Plataformas:** `SplitBar` de impressões e de cliques Meta × Google. O título destaca que o Meta trouxe a escala (impressões) e o Google trouxe a intenção (cliques).
5. **Engajamento:** grade de `KpiTile` (total Meta, reações, comentários, compartilhamentos, salvamentos, cliques no link), igual à seção 06 do Jaques.
6. **Vídeo:** dois `Retencao soPct`, Meta e YouTube (25% → 100%), mais as views de cada um.
7. **Criativos:** `CriativosGrid` com os 16 de `criativos[]`.
   - Selo: "#n · frente";
   - links "Instagram ↗" ou "YouTube ↗";
   - número principal = impressões, rotulado "impressões".

### `/frentes`

O hero (`tone="dusk"`) tem os KPIs das 3 frentes. Seções:

1. **As três frentes:**
   - `SplitBar` do investimento;
   - 3 cards grandes no estilo `PortasCards`, sem link: número = investimento, mais período, número de campanhas e plataformas.
2. **Uma seção por frente** (Institucional AON, Faz Bem, Checkup Torcedor):
   - linha de `KpiTile` (investimento, impressões, cliques, CPC);
   - `HBars` de `estrategias` da frente;
   - os criativos dela, filtrados de `criativos[]`;
   - **Checkup Torcedor** é pequena: só KPIs e o criativo, sem gráfico.

---

## 5. Critérios de pronto

- [ ] Passa em `npm run build` sem erros e sem warnings de tipo.
- [ ] Os números batem com a tabela da seção 1.
- [ ] Nenhuma menção a "alcance".
- [ ] Nenhum vermelho do Jaques sobrando: buscar `ef3b36`, `239,59,54` e `Jaques`.
- [ ] Preloader → cortina → reveals → contadores funcionando, e `prefers-reduced-motion` respeitado.
- [ ] `/api/pdf` gera o PDF de `/relatorio`, uma seção por página.
- [ ] Mobile 375px sem scroll horizontal.
