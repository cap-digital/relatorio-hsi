"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/core/reveal";
import { TransitionLink } from "@/components/core/transition-link";
import { cn } from "@/lib/utils";

export interface Porta {
  /** Sem `href`, o cartão é só informativo (sem link nem seta). */
  href?: string;
  titulo: string;
  numero: string;
  legenda: string;
  texto: string;
  tom: "amber" | "copper" | "dusk";
}

const TOM = { amber: "text-amber", copper: "text-copper", dusk: "text-dusk-2" };

/** Cartões de entrada para as páginas internas, cada um com o número que resume a página. */
export function PortasCards({ portas }: { portas: Porta[] }) {
  const tres = portas.length === 3;
  return (
    <Reveal className={cn("grid gap-4", tres ? "lg:grid-cols-3" : "md:grid-cols-2")} stagger={0.08}>
      {portas.map((p) => {
        const className = "hub-card group flex min-h-[340px] flex-col justify-between p-7 md:p-8";
        const tone = p.tom === "amber" ? undefined : p.tom;
        const conteudo = (
          <>
            <div className="flex items-start justify-between">
              <span className="eyebrow text-text-3">{p.titulo}</span>
              {p.href && (
                <ArrowUpRight className="size-5 text-text-3 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-text" />
              )}
            </div>
            <div>
              <span className={cn("display block leading-none tracking-[-0.04em] tabular", tres ? "text-[clamp(2.6rem,4.2vw,4rem)]" : "text-[clamp(3rem,5vw,4.5rem)]", TOM[p.tom])}>{p.numero}</span>
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">{p.legenda}</span>
              <p className="mt-6 text-[15px] leading-relaxed text-text-2">{p.texto}</p>
            </div>
          </>
        );
        return p.href ? (
          <TransitionLink key={p.titulo} href={p.href} data-tone={tone} className={className}>
            {conteudo}
          </TransitionLink>
        ) : (
          <div key={p.titulo} data-tone={tone} className={className}>
            {conteudo}
          </div>
        );
      })}
    </Reveal>
  );
}
