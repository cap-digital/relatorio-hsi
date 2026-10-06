/**
 * GET /api/pdf — gera o relatório (Início + Mídia + Frentes) em PDF num
 * Chrome headless no servidor: a rolagem que monta os gráficos acontece lá,
 * invisível para quem clicou, e o arquivo já sai pronto para download.
 * Na Vercel usa @sparticuz/chromium; em dev, o Chromium do playwright (ou o Chrome instalado).
 */

import type { Browser } from "playwright-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Página do PDF = largura do layout desktop, proporção A4 deitada. */
const LARGURA = 1440;
const ALTURA = 1018;

async function abrirNavegador(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: pw } = await import("playwright-core");
    return pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
  }
  const { chromium: pw } = await import("playwright");
  try {
    return await pw.launch({ headless: true });
  } catch {
    // O Playwright não baixa Chromium para alguns macOS (ex.: 13): usa o Google Chrome instalado.
    return pw.launch({ headless: true, channel: "chrome" });
  }
}

export async function GET(req: Request) {
  try {
    return await gerar(req);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("[api/pdf]", e);
    return new Response(`Falha ao gerar o PDF — ${msg}`, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function gerar(req: Request): Promise<Response> {
  const origem = new URL(req.url).origin;
  const browser = await abrirNavegador();
  try {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 1 });
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("hub:preloaded", "1");
      } catch {
        /* sem storage */
      }
    });
    await page.goto(`${origem}/relatorio`, { waitUntil: "networkidle", timeout: 60_000 });

    // Rola tudo para montar os gráficos que só renderizam ao entrar na tela.
    await page.evaluate(async () => {
      const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const passo = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
        window.scrollTo(0, y);
        await espera(160);
      }
      // Gráfico que a rolagem rápida pulou ainda mostra o placeholder (.shimmer): leva cada um à tela até montar.
      for (let volta = 0; volta < 3; volta++) {
        const pendentes = Array.from(document.querySelectorAll<HTMLElement>("main .shimmer"));
        if (!pendentes.length) break;
        for (const el of pendentes) {
          el.scrollIntoView({ block: "center" });
          await espera(400);
        }
      }
      await espera(2500);
      document.documentElement.classList.add("exportando");
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.emulateMedia({ media: "print" });

    // Encaixe: cada seção vira exatamente uma página; as mais altas que a página
    // são reduzidas por zoom (vetorial — o texto segue nítido no PDF).
    await page.evaluate(
      ({ altura, largura }) => {
        const util = altura - 32; // folga para arredondamentos da paginação
        for (const s of Array.from(document.querySelectorAll<HTMLElement>("section.section-pad"))) {
          s.style.zoom = "";
          s.style.marginLeft = "";
          const h = s.getBoundingClientRect().height;
          if (h <= util) continue;
          const z = Math.floor((util / h) * 1000) / 1000;
          s.style.zoom = String(z);
          // centraliza: a margem também é escalada pelo zoom
          s.style.marginLeft = `${(largura * (1 - z)) / 2 / z}px`;
        }
      },
      { altura: ALTURA, largura: LARGURA },
    );
    await page.waitForTimeout(300);

    const pdf = await page.pdf({ width: `${LARGURA}px`, height: `${ALTURA}px`, printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hospital-santa-izabel-balanco-de-midia-${hoje}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
