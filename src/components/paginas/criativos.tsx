"use client";

import { Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Criativo } from "@/data/types";
import { fmtBRL, fmtCompact } from "@/data/format";
import { cn } from "@/lib/utils";
import { BotaoVerTodos } from "./ver-todos";

const INICIAL = 8;

/** "Instagram ↗" / "YouTube ↗" — só quando o criativo tem permalink. */
function rotuloLink(link: string): string | null {
  if (!link) return null;
  if (/youtube\.com|youtu\.be/.test(link)) return "YouTube";
  if (/instagram\.com/.test(link)) return "Instagram";
  return "Ver anúncio";
}

/** Grade dos criativos por impressões, com frente, impressões e investimento. */
export function CriativosGrid({ criativos }: { criativos: Criativo[] }) {
  const [aberto, setAberto] = useState(false);
  if (!criativos.length) return <p className="text-text-3">Nenhum criativo nesta frente.</p>;
  const lista = aberto ? criativos : criativos.slice(0, INICIAL);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {lista.map((c, i) => {
          const link = rotuloLink(c.link);
          // Banners do Google Display (320×50, 160×600…) inteiros, sem corte.
          const banner = c.plataforma === "Google" && c.formato === "imagem";
          return (
            <motion.figure
              key={c.id}
              className="group relative overflow-hidden rounded-[16px] border border-line bg-surface-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-3">
                {c.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element -- cópias locais em public/criativos/, tamanhos variados.
                  <img
                    src={c.imagem}
                    alt={c.nome}
                    loading="lazy"
                    className={cn(
                      "size-full transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]",
                      banner ? "object-contain px-4 pb-24 pt-14" : "object-cover",
                    )}
                  />
                ) : (
                  <div className="dot-grid size-full opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text backdrop-blur">
                  #{i + 1} · {c.frente}
                </span>
                {c.formato === "video" && (
                  <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-amber text-ink">
                    <Play className="size-3.5 fill-current" />
                  </span>
                )}
                {link && (
                  <div className="absolute inset-x-3 top-12 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text backdrop-blur hover:text-amber">
                      {link} ↗
                    </a>
                  </div>
                )}
                <figcaption className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                    <div>
                      <span className="display block whitespace-nowrap text-[1.3rem] leading-none tracking-[-0.02em] text-text tabular md:text-[1.6rem]">{fmtCompact(c.impressoes)}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-3">impressões</span>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[11px] text-text-2 tabular">{fmtBRL(c.investimento, { compact: true })}</span>
                  </div>
                </figcaption>
              </div>
            </motion.figure>
          );
        })}
      </div>
      <BotaoVerTodos aberto={aberto} total={criativos.length} inicial={INICIAL} onToggle={() => setAberto((v) => !v)} />
    </div>
  );
}
