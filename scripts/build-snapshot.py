#!/usr/bin/env python3
"""
Gera src/data/snapshot.json (relatório agregado jan→out 2026) a partir do JSON
da edge function do Supabase (HospSantaIzabel2026).

Uso:
  1) baixar os dados:
     curl -sS -L -X POST 'https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/HospSantaIzabel2026' \
       -H 'Authorization: Bearer <chave>' -H 'apikey: <chave>' \
       -H 'Content-Type: application/json' --data '{"name":"Functions"}' -o data/hsi-dados.json
  2) python3 scripts/build-snapshot.py data/hsi-dados.json src/data/snapshot.json --imagens
     (--imagens baixa as miniaturas dos criativos para public/criativos/; as URLs do
      fbcdn expiram em dias, então o relatório usa as cópias locais)

Regras (nada estimado além do indicado):
  - Mesmo pipeline do dashboard em produção: descarta Estratégia em branco e os uploads
    errados de agosto, e trava o investimento no contratado a partir de 01/07/2026
    (ver aplicar_regras). "Investimento" já é o valor ao cliente (spend ÷ margem): nunca usar spend.
  - Sem alcance: a fonte só tem alcance por dia × anúncio × idade × gênero, não único.
  - Colunas "Gênero" e "Idade" vêm TROCADAS na planilha; aqui são corrigidas.
  - "#DIV/0!" e vazios em Investimento contam 0. Linhas sem data são descartadas.
  - YouTube: a fonte traz a TAXA de cada quartil por dia; contagem = taxa × impressões.
  - "Pesquisa" e "Search" (Google) viram a mesma estratégia: "Pesquisa".
"""

import json
import os
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
FAIXAS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
ESTRATEGIA = {"Search": "Pesquisa", "Pesquisa": "Pesquisa", "Display": "Display", "In-Stream": "YouTube In-Stream",
              "Alcance": "Alcance", "Engajamento": "Engajamento", "Tráfego": "Tráfego", "Posts de Oportunidade": "Posts de oportunidade"}


def num(x):
    try:
        v = float(x)
        return v if v == v else 0.0  # NaN
    except (TypeError, ValueError):
        return 0.0


def plataforma(p):
    return p.replace('"', "").replace("()", "").strip()


def metricas():
    return {"investimento": 0.0, "impressoes": 0.0, "cliques": 0.0, "views": 0.0, "engajamento": 0.0}


def soma(m, r):
    m["investimento"] += num(r.get("Investimento"))
    m["impressoes"] += num(r.get("Impressões"))
    m["cliques"] += num(r.get("Cliques"))
    m["views"] += num(r.get("Visualizações"))
    m["engajamento"] += num(r.get("Engajamento"))


def fecha(m, extra=None):
    """Arredonda e acrescenta CTR, CPM e CPC."""
    out = {k: round(v, 2) if k == "investimento" else round(v) for k, v in m.items()}
    imp, cli, inv = m["impressoes"], m["cliques"], m["investimento"]
    out["ctr"] = round(cli / imp, 5) if imp else 0
    out["cpm"] = round(inv / imp * 1000, 2) if imp else 0
    out["cpc"] = round(inv / cli, 2) if cli else 0
    if extra:
        out.update(extra)
    return out


# ------------------------------------------------------------------ regras do dashboard HSI 2026
# Mesmas regras do dashboard em produção (hospsantaizabel.capdigital.company), para os
# números do relatório baterem com o que o cliente já viu.

# (2) Uploads errados: (trecho do nome da campanha, criativo ou None = todos, início, fim)
UPLOADS_ERRADOS = [
    ("[SANTA ISABEL] [DISPLAY] [FAZ BEM - AON]", None, "2026-08-04", "2026-08-10"),
    ("[SANTA ISABEL] [YOUTUBE - IN STREAM] [FAZ BEM - AON]", "[AD] 01 - 01.06 - V2", "2026-08-04", "2026-08-11"),
]

# (4) Investimento contratado por grupo (frente, plataforma, estratégia da base, mês), a partir de 01/07/2026.
#     Faz Bem: os períodos 5–8 coincidem com os meses jul–out.
TRAVA_DESDE = "2026-07-01"
METAS = {}
for _m in ("2026-07", "2026-08", "2026-09", "2026-10"):
    METAS[("Institucional AON", "Google", "Search", _m)] = 3000
    METAS[("Faz Bem", "Google", "Display", _m)] = 1500
    METAS[("Faz Bem", "Meta", "Alcance", _m)] = 1500
    METAS[("Faz Bem", "Meta", "Posts de Oportunidade", _m)] = 500
    METAS[("Faz Bem", "Google", "In-Stream", _m)] = 1500
for _m in ("2026-07", "2026-08", "2026-09"):
    METAS[("Institucional AON", "Meta", "Alcance", _m)] = 4250
    METAS[("Institucional AON", "Meta", "Tráfego", _m)] = 3500
    METAS[("Institucional AON", "Meta", "Engajamento", _m)] = 2000
    METAS[("Institucional AON", "Meta", "Posts de Oportunidade", _m)] = 500


def upload_errado(campanha, criativo, dia):
    for trecho, cr, ini, fim in UPLOADS_ERRADOS:
        if trecho in (campanha or "") and ini <= dia <= fim and (cr is None or criativo is None or criativo == cr):
            return True
    return False


def aplicar_regras(raw, avisos):
    """(1) descarta Estratégia em branco → (2) uploads errados → (3) Display PI 438 → (4) trava no contratado."""
    rows = []
    descartadas = 0
    for r in raw["consolidado"]:
        if not r.get("Data") or not (r.get("Estratégia ") or "").strip():
            descartadas += 1
            continue
        if upload_errado(r.get("Nome Campanha"), r.get("Nome Criativo"), r["Data"][:10]):
            descartadas += 1
            continue
        rows.append(r)
    for tabela in ("googlefazbemage", "googlefazbemgender"):
        # Sem criativo nesses arrays: a regra cai para campanha + data (só aquele criativo rodou na janela).
        raw[tabela] = [r for r in raw.get(tabela, [])
                       if (r.get("Estratégia ") or "").strip() and not upload_errado(r.get("campaign"), None, r["date"][:10])]
    avisos.append(f"{descartadas} linhas descartadas (sem data, Estratégia em branco ou uploads errados de agosto).")

    # (3) Redistribuição do Display PI 438 em setembro: move valores entre dias DENTRO do mês,
    #     sem alterar totais mensais — não afeta nenhum número deste relatório agregado.

    # (4) Trava: grupos acima do contratado são reduzidos na mesma proporção (só reduz).
    grupos = defaultdict(list)
    for r in rows:
        dia = r["Data"][:10]
        if dia < TRAVA_DESDE:
            continue
        k = (r.get("Campanha"), plataforma(r["Plataforma"]), r["Estratégia "].strip(), dia[:7])
        if k in METAS:
            grupos[k].append(r)
    corte = 0.0
    for k, linhas in grupos.items():
        realizado = sum(num(r.get("Investimento")) for r in linhas)
        if realizado > METAS[k]:
            fator = METAS[k] / realizado
            for r in linhas:
                r["Investimento"] = num(r.get("Investimento")) * fator
            corte += realizado - METAS[k]
    brl = f"{corte:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    avisos.append(f"Trava no contratado (desde 01/07): R$ {brl} cortados (não indicado na interface).")
    return rows, corte


def main(src, dst, baixar_imagens):
    raw = json.load(open(src, encoding="utf-8"))
    avisos = []
    rows, corte = aplicar_regras(raw, avisos)
    print(f"regras aplicadas · trava no contratado: R$ {corte:,.2f} cortados")
    for r in rows:
        r["_plat"] = plataforma(r["Plataforma"])
        r["_dia"] = r["Data"][:10]  # T03:00Z = meia-noite em Salvador
        r["_mes"] = r["_dia"][:7]
        r["_estr"] = ESTRATEGIA.get(r.get("Estratégia ", "").strip(), r.get("Estratégia ", "").strip())
        r["_frente"] = r.get("Campanha") or "Outros"
        # Colunas trocadas na planilha: "Gênero" traz a faixa etária e "Idade" o gênero.
        r["_idade"] = (r.get("Gênero") or "").strip()
        r["_genero"] = (r.get("Idade") or "").strip().lower()

    div0 = [r for r in rows if r.get("Investimento") == "#DIV/0!"]
    if div0:
        avisos.append(f"{len(div0)} linhas com #DIV/0! em Investimento contadas como R$ 0 "
                      f"({round(sum(num(r.get('Impressões')) for r in div0)):,} impressões nelas).".replace(",", "."))
    avisos.append("Alcance fora do relatório: a fonte não traz alcance único.")
    avisos.append("Colunas Gênero/Idade da planilha vêm trocadas; corrigido no snapshot.")

    dias = sorted(r["_dia"] for r in rows)
    inicio, fim = dias[0], dias[-1]

    # ---------------------------------------------------------------- totais
    tot = metricas()
    por_plat = defaultdict(metricas)
    plat_dias = defaultdict(list)
    plat_camp = defaultdict(set)
    for r in rows:
        soma(tot, r)
        soma(por_plat[r["_plat"]], r)
        plat_dias[r["_plat"]].append(r["_dia"])
        plat_camp[r["_plat"]].add(r["Nome Campanha"])
    campanhas = {r["Nome Campanha"] for r in rows}

    plataformas = [
        fecha(por_plat[p], {"plataforma": p, "inicio": min(plat_dias[p]), "fim": max(plat_dias[p]), "campanhas": len(plat_camp[p])})
        for p in sorted(por_plat, key=lambda p: -por_plat[p]["investimento"])
    ]

    # ---------------------------------------------------------------- meses
    meses_map = defaultdict(lambda: defaultdict(metricas))
    for r in rows:
        soma(meses_map[r["_mes"]][r["_plat"]], r)
    meses = []
    for mes in sorted(meses_map):
        m_idx = int(mes[5:7]) - 1
        item = {"mes": mes, "rotulo": MESES[m_idx], "nome": MESES_LONGOS[m_idx], "parcial": mes == fim[:7] and fim[8:] < "28"}
        total_mes = metricas()
        for p in ("Meta", "Google"):
            m = meses_map[mes].get(p, metricas())
            item[p.lower()] = fecha(m)
            for k in total_mes:
                total_mes[k] += m[k]
        item["total"] = fecha(total_mes)
        meses.append(item)

    # ---------------------------------------------------------------- frentes e estratégias
    fr = defaultdict(metricas)
    fr_plat = defaultdict(lambda: defaultdict(metricas))
    fr_estr = defaultdict(lambda: defaultdict(metricas))
    fr_dias = defaultdict(list)
    fr_camp = defaultdict(set)
    es = defaultdict(metricas)
    es_frentes = defaultdict(set)
    for r in rows:
        f = r["_frente"]
        soma(fr[f], r)
        soma(fr_plat[f][r["_plat"]], r)
        soma(fr_estr[f][(r["_plat"], r["_estr"])], r)
        fr_dias[f].append(r["_dia"])
        fr_camp[f].add(r["Nome Campanha"])
        soma(es[(r["_plat"], r["_estr"])], r)
        es_frentes[(r["_plat"], r["_estr"])].add(f)

    frentes = []
    for f in sorted(fr, key=lambda f: -fr[f]["investimento"]):
        frentes.append(fecha(fr[f], {
            "frente": f,
            "inicio": min(fr_dias[f]),
            "fim": max(fr_dias[f]),
            "campanhas": len(fr_camp[f]),
            "plataformas": {p: fecha(m) for p, m in fr_plat[f].items()},
            "estrategias": [fecha(m, {"plataforma": k[0], "estrategia": k[1]})
                            for k, m in sorted(fr_estr[f].items(), key=lambda kv: -kv[1]["investimento"])],
        }))

    estrategias = [fecha(m, {"plataforma": k[0], "estrategia": k[1], "frentes": sorted(es_frentes[k])})
                   for k, m in sorted(es.items(), key=lambda kv: -kv[1]["investimento"])]

    # ---------------------------------------------------------------- grade mês × estratégia (o ano em mosaico)
    gm = defaultdict(metricas)
    gm_frentes = defaultdict(set)
    gm_camp = defaultdict(set)
    for r in rows:
        k = (r["_plat"], r["_estr"], r["_mes"])
        soma(gm[k], r)
        gm_frentes[k].add(r["_frente"])
        gm_camp[k].add(r["Nome Campanha"])
    grade = {
        "meses": sorted(meses_map),
        "linhas": [{"plataforma": e["plataforma"], "estrategia": e["estrategia"]} for e in estrategias],
        "celulas": [fecha(m, {"plataforma": k[0], "estrategia": k[1], "mes": k[2],
                              "frentes": sorted(gm_frentes[k]), "campanhas": len(gm_camp[k])})
                    for k, m in sorted(gm.items(), key=lambda kv: (kv[0][2], kv[0][0], kv[0][1]))],
    }
    ativas_mes = defaultdict(set)
    for k in gm:
        ativas_mes[k[2]].add((k[0], k[1]))
    for item in meses:
        item["estrategiasAtivas"] = len(ativas_mes[item["mes"]])
        item["campanhasAtivas"] = len({r["Nome Campanha"] for r in rows if r["_mes"] == item["mes"]})

    # ---------------------------------------------------------------- busca (Google)
    busca_rows = [r for r in rows if r["_plat"] == "Google" and r["_estr"] == "Pesquisa"]
    busca = metricas()
    anuncios = defaultdict(metricas)
    anuncio_frente = {}
    for r in busca_rows:
        soma(busca, r)
        soma(anuncios[r["Nome Criativo"]], r)
        anuncio_frente[r["Nome Criativo"]] = r["_frente"]
    busca_out = fecha(busca, {"anuncios": [
        fecha(m, {"titulos": [t.strip() for t in nome.split("|") if t.strip()][:4], "frente": anuncio_frente[nome]})
        for nome, m in sorted(anuncios.items(), key=lambda kv: -kv[1]["cliques"])[:6]
    ]})

    # ---------------------------------------------------------------- público
    meta_rows = [r for r in rows if r["_plat"] == "Meta"]
    ig = defaultdict(lambda: {"impressoes": 0.0, "cliques": 0.0, "investimento": 0.0, "engajamento": 0.0})
    for r in meta_rows:
        idade = r["_idade"] if r["_idade"] in FAIXAS else ("desconhecida" if r["_idade"] else "")
        gen = r["_genero"] if r["_genero"] in ("female", "male") else "unknown"
        if not idade:
            continue
        x = ig[(idade, gen)]
        x["impressoes"] += num(r.get("Impressões"))
        x["cliques"] += num(r.get("Cliques"))
        x["investimento"] += num(r.get("Investimento"))
        x["engajamento"] += num(r.get("Engajamento"))
    publico_meta = [{"idade": k[0], "genero": k[1], **{m: round(v, 2) for m, v in x.items()}}
                    for k, x in sorted(ig.items())]

    def google_quebra(tabela, campo, mapa):
        acc = defaultdict(lambda: {"impressoes": 0.0, "cliques": 0.0, "views": 0.0})
        for r in raw.get(tabela, []):
            k = mapa.get(r[campo], r[campo])
            acc[k]["impressoes"] += num(r.get("impressions"))
            acc[k]["cliques"] += num(r.get("clicks"))
            acc[k]["views"] += num(r.get("video_trueview_views"))
        return [{"chave": k, **{m: round(v) for m, v in x.items()}} for k, x in acc.items()]

    idade_g = {"AGE_RANGE_18_24": "18-24", "AGE_RANGE_25_34": "25-34", "AGE_RANGE_35_44": "35-44", "AGE_RANGE_45_54": "45-54",
               "AGE_RANGE_55_64": "55-64", "AGE_RANGE_65_UP": "65+", "AGE_RANGE_UNDETERMINED": "desconhecida"}
    gen_g = {"FEMALE": "female", "MALE": "male", "UNDETERMINED": "unknown"}
    google_idade = sorted(google_quebra("googlefazbemage", "age_range_type", idade_g),
                          key=lambda x: (FAIXAS + ["desconhecida"]).index(x["chave"]) if x["chave"] in FAIXAS + ["desconhecida"] else 99)
    google_genero = google_quebra("googlefazbemgender", "gender_type", gen_g)

    # ---------------------------------------------------------------- vídeo
    vm = {"views": 0.0, "p25": 0.0, "p50": 0.0, "p75": 0.0, "p100": 0.0}
    for r in meta_rows:
        vm["views"] += num(r.get("Visualizações"))
        for q, c in (("p25", "Visualização 25%"), ("p50", "Visualização 50%"), ("p75", "Visualização 75%"), ("p100", "Visualização 100%")):
            vm[q] += num(r.get(c))
    yt_rows = [r for r in rows if r["_plat"] == "Google" and r["_estr"] == "YouTube In-Stream"]
    vy = {"impressoes": 0.0, "views": 0.0, "investimento": 0.0, "p25": 0.0, "p50": 0.0, "p75": 0.0, "p100": 0.0}
    for r in yt_rows:
        imp = num(r.get("Impressões"))
        vy["impressoes"] += imp
        vy["views"] += num(r.get("Visualizações"))
        vy["investimento"] += num(r.get("Investimento"))
        for q, c in (("p25", "Visualização 25%"), ("p50", "Visualização 50%"), ("p75", "Visualização 75%"), ("p100", "Visualização 100%")):
            v = r.get(c)
            # Google traz a taxa (0–1) por dia (às vezes 0 ou 1 inteiros, que também são taxa).
            vy[q] += num(v) * imp if num(v) <= 1 else num(v)
    video = {"meta": {k: round(v) for k, v in vm.items()},
             "youtube": {k: round(v, 2) if k == "investimento" else round(v) for k, v in vy.items()},
             "notaYoutube": "Quartis do YouTube = taxa diária × impressões (estimativa da contagem)."}

    # ---------------------------------------------------------------- engajamento Meta
    eng = {"total": round(sum(num(r.get("Engajamento")) for r in meta_rows)),
           "reacoes": round(sum(num(r.get("actions_post_reaction")) for r in meta_rows)),
           "comentarios": round(sum(num(r.get("actions_comment")) for r in meta_rows)),
           "compartilhamentos": round(sum(num(r.get("actions_post")) for r in meta_rows)),
           "salvamentos": round(sum(num(r.get("actions_onsite_conversion_post_save")) for r in meta_rows)),
           "cliquesLink": round(sum(num(r.get("actions_link_click")) for r in meta_rows)),
           "youtube": round(sum(num(r.get("Engajamento")) for r in yt_rows))}

    # ---------------------------------------------------------------- criativos
    cr = defaultdict(metricas)
    cr_info = {}
    for r in rows:
        if r["_estr"] == "Pesquisa":
            continue  # anúncios de texto ficam na seção de busca
        k = (r["_plat"], r["Nome Criativo"])
        soma(cr[k], r)
        thumb = r.get("ThumbnailURL") or ""
        link = r.get("permalink direcionamento") or ""
        if "youtube.com/watch?v=" in thumb:
            vid = thumb.split("v=")[1].split("&")[0]
            link, thumb = thumb, f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
        prev = cr_info.get(k, {})
        cr_info[k] = {
            "frente": r["_frente"],
            "estrategia": r["_estr"],
            "formato": "video" if (r["_estr"] == "YouTube In-Stream" or num(r.get("Visualizações")) > 0 or prev.get("formato") == "video") else "imagem",
            "imagemOrigem": thumb or prev.get("imagemOrigem", ""),
            "link": link or prev.get("link", ""),
        }
    # Top 15 por impressões + o vídeo do YouTube de maior entrega (para todas as frentes de mídia aparecerem).
    ordem = [k for k, _ in sorted(cr.items(), key=lambda kv: -kv[1]["impressoes"]) if cr_info[k]["imagemOrigem"]]
    escolhidos = ordem[:15]
    yt = [k for k in ordem if cr_info[k]["estrategia"] == "YouTube In-Stream"]
    if yt and yt[0] not in escolhidos:
        escolhidos.append(yt[0])
    criativos = []
    for i, (p, nome) in enumerate(escolhidos, 1):
        info = cr_info[(p, nome)]
        criativos.append(fecha(cr[(p, nome)], {"id": f"{p.lower()}-{i:02d}", "nome": nome, "plataforma": p, **info, "imagem": info["imagemOrigem"]}))

    if baixar_imagens:
        pasta = os.path.join(os.path.dirname(os.path.abspath(dst)), "..", "..", "public", "criativos")
        os.makedirs(pasta, exist_ok=True)
        for c in criativos:
            destino = os.path.join(pasta, f"{c['id']}.jpg")
            try:
                req = urllib.request.Request(c["imagemOrigem"], headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp, open(destino, "wb") as fh:
                    fh.write(resp.read())
                c["imagem"] = f"/criativos/{c['id']}.jpg"
            except Exception as e:  # mantém a URL remota
                avisos.append(f"Miniatura não baixada: {c['nome']} ({e.__class__.__name__}).")

    snapshot = {
        "cliente": "Hospital Santa Izabel",
        "periodo": {"inicio": inicio, "fim": fim},
        "atualizadoEm": raw.get("timestamp") or datetime.now(timezone.utc).isoformat(),
        "totais": fecha(tot, {"campanhas": len(campanhas), "meses": len(meses)}),
        "plataformas": plataformas,
        "meses": meses,
        "frentes": frentes,
        "estrategias": estrategias,
        "grade": grade,
        "busca": busca_out,
        "publico": {"meta": publico_meta, "googleIdade": google_idade, "googleGenero": google_genero,
                    "notaGoogle": "Idade e gênero do Google: só campanhas Faz Bem (tabelas googlefazbemage/gender)."},
        "video": video,
        "engajamento": eng,
        "criativos": criativos,
        "avisos": avisos,
    }
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(snapshot, fh, ensure_ascii=False, indent=1)
    t = snapshot["totais"]
    print(f"ok → {dst}  ·  {inicio} → {fim}  ·  R$ {t['investimento']:,.0f}  ·  {t['impressoes']:,} impressões  ·  {len(criativos)} criativos")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2:
        sys.exit("uso: build-snapshot.py <hsi-dados.json> <src/data/snapshot.json> [--imagens]")
    main(args[0], args[1], "--imagens" in sys.argv)
