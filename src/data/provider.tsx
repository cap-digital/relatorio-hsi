"use client";

import { createContext, useContext, type ReactNode } from "react";

/** O que a moldura do site (nav, menu, rodapé) precisa saber do relatório. */
export interface PainelMeta {
  cliente: string;
  periodo: { inicio: string; fim: string };
  atualizadoEm: string;
  avisos: string[];
}

const Ctx = createContext<PainelMeta | null>(null);

export function PainelProvider({ value, children }: { value: PainelMeta; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePainel(): PainelMeta {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePainel fora de <PainelProvider>");
  return v;
}
