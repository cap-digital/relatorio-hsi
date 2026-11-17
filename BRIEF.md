# Balanço de mídia 2026 · Hospital Santa Izabel (até 31/out)

Balanço de apresentação para a **diretoria do Hospital Santa Izabel**: o ano de 2026 até agora. **Não é pós-venda e não é encerramento**, porque as campanhas continuam no ar. Cada mês teve estratégias, plataformas e campanhas diferentes, e o relatório precisa mostrar essa evolução. Nunca usar "pós-venda", "pós-campanha", "encerrada" nem "10 meses". Ele é **agregado**: números grandes, comparações e destaques. Nada de leitura dia a dia nem filtros de data.

**Base obrigatória:** o repo `pos-venda-campanha2026-jaques` (pós-campanha Jaques Wagner). Copie o sistema de lá e mantenha a mesma arquitetura, os mesmos componentes e a mesma linguagem de motion. Mudam só a **pele** (cores, fontes, textos e imagens) e o **conteúdo**. Não invente componentes, bibliotecas ou seções fora do que está descrito aqui.

> O projeto `relatorio-hsi` já é Next 16 (App Router), como o do Jaques. Antes de escrever código, leia o `AGENTS.md`, que manda consultar `node_modules/next/dist/docs/`.

---

## 1. Dados

- **`src/data/snapshot.json`** é a única fonte do relatório. Ele é estático, já vem agregado e as páginas são HTML gerado no build. Não há chamada de API em tempo de execução.
- Para regenerar, rode `python3 scripts/build-snapshot.py data/hsi-dados.json src/data/snapshot.json --curativos data/curativos-google.csv --ate 2026-10-31 --imagens`. O `curl` para baixar `data/hsi-dados.json` está no topo do script. Coloque `data/` no `.gitignore` (são ~31 MB).
- O `--imagens` baixa as miniaturas dos criativos para `public/criativos/`, porque as URLs do fbcdn expiram. Rode **uma vez localmente** antes do deploy.
- Crie `src/data/types.ts` com os tipos do snapshot e um `src/data/format.ts`. O format é **copiado** de `src/data/politica/format.ts` do Jaques (fmtNum, fmtCompact, fmtBRL, fmtPct, fmtDia).

**Regras de conteúdo**

- **Sem alcance em lugar nenhum.** A fonte não tem alcance único.
- **Investimento** é o campo `Investimento` da base: o valor ao cliente (spend ÷ margem). Nunca usar spend nem aplicar o "bruto ÷ 0,8785" do Jaques.
- O snapshot já sai com as regras do dashboard em produção (descarte de Estratégia em branco e dos uploads errados da coleta) e com o **investimento igual ao contratado em todos os grupos, no ano todo**: cada grupo de contrato (AON por mês × plataforma × estratégia, Faz Bem por período × plataforma × estratégia, Checkup, Curativos) tem o investimento de todas as linhas multiplicado por contratado ÷ realizado, nos dois sentidos (reduz se passou, aumenta se ficou abaixo). Grupo sem contrato fica com R$ 0; grupo com contrato e sem entrega é listado no terminal pelo script. Só o investimento é ajustado; impressões, cliques, views e engajamento ficam como entregues. A interface não indica o ajuste. Não reaplicar nada disso no front.
- O corte do relatório é 31/10/2026 (`--ate 2026-10-31`): outubro está fechado e nenhum mês é parcial. Novembro já está na base, mas fica fora. Se um corte futuro cair no meio de um mês, `meses[].parcial` liga a hachura e a legenda "Mês parcial" no gráfico mensal e no mosaico.
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
| Investimento | R$ 128.750,00 = contratado (Meta R$ 65.750 · Google R$ 63.000) |
| Impressões | 9,66 mi |
| Cliques | 116,9 mil · CTR 1,21% · CPC R$ 1,10 · CPM R$ 13,32 |
| Views de vídeo | 1,24 mi |
| Engajamentos | 311 mil |
| Campanhas | 38 |

- **Frentes:** Institucional AON R$ 81.250 · Faz Bem R$ 40.500 · Curativos R$ 6.000 · Checkup Torcedor R$ 1.000 (cada uma igual ao contratado).
- **Curativos:** R$ 6,0 mil · 131.246 impressões · 5.291 cliques (PI 355, Google Pesquisa, 02/12/2025 → 25/02/2026, contratado R$ 6.000).
- **Busca Google:** 61,4 mil cliques · CTR 16,4% · CPC R$ 0,63 (inclui Curativos).
- **Palavras-chave (01/01 → 31/10):** Institucional AON 57 termos com clique · 54.880 cliques (= Pesquisa AON no consolidado) · Faz Bem 10 termos com clique · 596 cliques nas keywords contra 1.272 de Pesquisa no consolidado (fonte incompleta).
- **Outubro (fechado):** R$ 8,0 mil · AON só Google Pesquisa R$ 3.000 · Faz Bem: Display R$ 1.500 · In-Stream R$ 1.500 · Meta Alcance R$ 1.500 · Meta Posts de oportunidade R$ 500.
- **Grupos (amostra):** AON Meta Engajamento jun R$ 5.500 · Faz Bem P3 Display (mai) R$ 1.500 · P4 In-Stream (jun) R$ 1.500 · P5 Display (jul) R$ 1.500.
- **Google:** de dezembro/2025 (Curativos) a outubro. **Meta:** entra em maio (12/05).
- **Curativos e dez/25:** os dados vêm de um CSV à parte (`--curativos data/curativos-google.csv`), não da função do Supabase. Dez/25 entra em `meses` e `grade.meses` com `anoAnterior: true` e rótulo "dez/25"; o `periodo` do relatório continua 2026. Observação no rodapé e na seção da frente: "A campanha Curativos começou em dezembro de 2025; os números do relatório incluem esse mês."

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
  - Frentes: Institucional = `--amber`, Faz Bem = `--dusk-2`, Checkup Torcedor = `--copper`, Curativos = `--text` (creme).
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
| `/frentes` | Institucional · Faz Bem · Curativos · Checkup Torcedor | `/territorio` |
| `/relatorio` | As 3 juntas para o PDF | `/relatorio` |

**Nav:** Início · Mídia · Frentes.

### `/` Início

- **Hero** (`tone="amber"`):
  - eyebrow: "Balanço de mídia · Hospital Santa Izabel · 2026 até 31 out";
  - título: "2026, <em>até aqui.</em>";
  - descrição: investimento, impressões e cliques do período, em uma frase.
- **KPIs** (grade de 6, `KpiTile`): Investimento · Impressões · Cliques · Views de vídeo · Engajamentos · CPC médio. O botão "Exportar PDF" fica no hero, como no Jaques.
- **01 · "Meta × Google"**:
  - título: "Duas vitrines, <em>papéis diferentes.</em>";
  - à esquerda, um card com `SplitBar` do investimento por plataforma;
  - à direita, 4 cards `Fato` (iguais ao Jaques): impressões Meta, cliques Google, CPM médio e CTR da busca.
- **02 · "Mês a mês"**:
  - título: "O Google abriu o ano; o Meta <em>entrou em maio.</em>";
  - `MonthlyChart` dentro de um `ChartFrame` com `span={3}`; a coluna "dez/25" (ano anterior) vem antes de janeiro, com rótulo atenuado e sem hachura (hachura só se houver mês parcial; com o corte em 31/10, nenhum).
- **03 · "O ano em mosaico"**:
  - título: "De 2 para 7 <em>estratégias no ar.</em>" (números de `meses[].estrategiasAtivas`, contados a partir de janeiro/2026: dez/25 aparece na grade, com rótulo atenuado, mas não é o ponto de partida);
  - `Heatmap` do Jaques adaptado (`viz/heatmap.tsx` → `viz/grade-estrategias.tsx`): linhas = `grade.linhas` (plataforma · estratégia), colunas = `grade.meses`, cor da célula = investimento do mês (escala raiz, como no original), célula vazia quando a estratégia não rodou;
  - hover mostra investimento, métrica principal da estratégia, frentes e nº de campanhas da célula; a legenda embaixo segue o padrão "Passe o cursor sobre a grade" do original;
  - rótulo da linha com um ponto da cor da plataforma (Meta = `--amber`, Google = `--dusk-2`); mês parcial (se houver) com a mesma marcação do gráfico mensal; com o corte em 31/10, outubro aparece sem hachura.
- **04 · "Explore"**: `PortasCards` com 2 portas.
  - Mídia: número = impressões;
  - Frentes: número = "4 frentes", com legenda de 38 campanhas (calculados).

### `/midia`

O hero tem KPIs de Investimento · Impressões · CPM · CTR · Cliques. Seções:

1. **Estratégias:** dois `HBars` lado a lado, investimento por estratégia e cliques por estratégia. O `sub` mostra plataforma, CTR e CPC.
2. **Busca no Google:** KPIs de cliques, CTR e CPC mais a lista dos 6 anúncios de texto (`busca.anuncios`). A lista segue o padrão da seção "Materiais" do Jaques, com títulos e números em mono.
   - **Palavras-chave** (`busca.palavrasChave`): bloco "Palavras-chave que mais trouxeram cliques" logo abaixo, com abas Institucional AON / Faz Bem e seletor de métrica Cliques · Impressões · CTR (padrão Cliques), os dois no padrão de abas do `EntregaPublico`. `HBars`: rótulo = termo, barra e valor = métrica escolhida, sub = as outras duas (ex.: Cliques → "X impr. · CTR Y%"); trocar a métrica reordena o ranking (maior em cima), e o top 10 + "Ver todos" até 15 seguem a nova ordem. No CTR, termos com menos de 50 impressões ficam fora do ranking.
     - **Fonte:** array `googlekeywords` da função do Supabase (aba Google_keywords: date, campaign, impressions, clicks, engagements, keyword_text). Sem custo por palavra-chave e sem Curativos.
     - **Regras (no `build-snapshot.py`):** descarta `keyword_text` vazio (Display); só datas de 01/01/2026 até o `--ate`; frente pelo nome da campanha ("FAZ BEM" → Faz Bem; senão "INSTITUCIONAL" ou "AON" → Institucional AON; outras são ignoradas e listadas no terminal); termo normalizado (minúsculas, trim, espaços duplicados), mantido como vem da fonte; agregado por frente + termo; **sem termos com 0 clique**. O snapshot guarda todos os termos com clique (`porFrente`); a interface ordena e corta. Resumo (`totais`): termos com clique, cliques e impressões desses termos (AON: 57 termos · 54.880 cliques · 224.158 impressões; Faz Bem: 10 termos com clique).
     - **Conferência:** o script compara os cliques das keywords com os cliques de Pesquisa da frente no consolidado (mesmo período) e grava `totais[frente].cliquesPesquisa` e `completa` (cobertura ≥ 99%).
     - **Faz Bem incompleto:** a fonte de palavras-chave do Faz Bem está incompleta em jan–mar (596 de 1.272 cliques; abril bate). Com `completa: false`, o resumo da aba mostra só o nº de termos com clique (sem cliques e impressões). Na aba AON (100%), o resumo mostra termos, cliques e impressões.
     - **Sem observações no bloco** (tela e PDF): as regras (corte de 50 impressões no CTR, resumo do Faz Bem sem totais) valem, mas não são escritas na interface.
     - **PDF:** página própria logo depois da Busca no Google (bloco `.so-pdf`), sem abas e sem seletor, ranking por cliques, com as duas frentes uma abaixo da outra, top 10 cada (em duas colunas: 1–5 | 6–10).
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

O hero (`tone="dusk"`) tem os KPIs das 4 frentes. Seções:

1. **As quatro frentes:**
   - `SplitBar` do investimento;
   - 3 cards grandes no estilo `PortasCards`, sem link: número = investimento, mais período, número de campanhas e plataformas.
2. **Uma seção por frente** (Institucional AON, Faz Bem, Curativos, Checkup Torcedor):
   - linha de `KpiTile` (investimento, impressões, cliques, CPC);
   - `HBars` de `estrategias` da frente;
   - os criativos dela, filtrados de `criativos[]`;
   - **Checkup Torcedor** e **Curativos** são pequenas: só KPIs e a estratégia (mais o criativo, quando houver), sem gráfico.

---

## 5. Critérios de pronto

- [ ] Passa em `npm run build` sem erros e sem warnings de tipo.
- [ ] Os números batem com a tabela da seção 1.
- [ ] Nenhuma menção a "alcance".
- [ ] Nenhum vermelho do Jaques sobrando: buscar `ef3b36`, `239,59,54` e `Jaques`.
- [ ] Preloader → cortina → reveals → contadores funcionando, e `prefers-reduced-motion` respeitado.
- [ ] `/api/pdf` gera o PDF de `/relatorio`, uma seção por página.
- [ ] Mobile 375px sem scroll horizontal.
