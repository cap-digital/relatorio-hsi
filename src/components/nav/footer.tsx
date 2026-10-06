"use client";

import { LogoHSI } from "@/components/core/logo";
import { Reveal } from "@/components/core/reveal";
import { TransitionLink } from "@/components/core/transition-link";
import { fmtAtualizado, fmtDia } from "@/data/format";
import { usePainel } from "@/data/provider";
import { ROUTES } from "./nav";

const FONTES = ["Meta Ads · conta do hospital", "Google Ads · Pesquisa, Display e YouTube", "Consolidação CAP · jan → out 2026"];

/** Rodapé: assinatura, navegação, fontes de dados e a marca vazada. */
export function Footer() {
  const painel = usePainel();
  const showWarnings = process.env.NODE_ENV !== "production" && painel.avisos.length > 0;

  return (
    <footer className="relative mt-[clamp(64px,8vw,120px)] border-t border-line">
      <div className="container-hub pt-[clamp(56px,7vw,96px)]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <Reveal className="flex flex-col gap-6" y={24}>
            <LogoHSI withCargo className="text-[22px]" />
            <p className="max-w-sm text-[15px] leading-relaxed text-text-2">
              Balanço da mídia digital do {painel.cliente} em {painel.periodo.inicio.slice(0, 4)}, ano em andamento: Meta Ads e Google Ads
              somados por plataforma, estratégia e frente, com as campanhas ainda no ar.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-3">
              Período · {fmtDia(painel.periodo.inicio)} → {fmtDia(painel.periodo.fim)}
            </p>
          </Reveal>

          <Reveal as="nav" aria-label="Rodapé" className="flex flex-col gap-3" y={24} delay={0.05}>
            <span className="eyebrow mb-2 text-text-3">Navegação</span>
            {ROUTES.map((link) => (
              <TransitionLink key={link.href} href={link.href} className="w-fit text-[15px] text-text-2 transition-colors duration-300 hover:text-amber">
                {link.label}
              </TransitionLink>
            ))}
          </Reveal>

          <Reveal className="flex flex-col gap-3" y={24} delay={0.1}>
            <span className="eyebrow mb-2 text-text-3">Fontes</span>
            {FONTES.map((line) => (
              <span key={line} className="text-[15px] text-text-2">
                {line}
              </span>
            ))}
          </Reveal>
        </div>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-3">
          <span>Dados consolidados em {fmtAtualizado(painel.atualizadoEm)} · ano em andamento, campanhas no ar</span>
          <span>CAP · Mídia, dados e tecnologia</span>
        </div>

        {showWarnings ? (
          <ul className="mt-3 flex flex-col gap-1 font-mono text-[10.5px] tracking-[0.06em] text-copper" role="list">
            {painel.avisos.map((warning) => (
              <li key={warning}>⚠ {warning}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="container-hub overflow-hidden pb-2 pt-[clamp(24px,4vw,56px)]">
        <Reveal y={80}>
          <div
            aria-hidden="true"
            className="display outline-text hover:text-amber hover:[-webkit-text-stroke-color:var(--amber)] -mb-[0.12em] whitespace-nowrap text-[clamp(3.2rem,12.4vw,14rem)] leading-none tracking-[-0.045em]"
          >
            SANTA IZABEL
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
