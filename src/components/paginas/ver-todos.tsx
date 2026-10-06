"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rodapé "Ver todos (N)" / "Mostrar menos" das listas expansíveis. */
export function BotaoVerTodos({ aberto, total, inicial, onToggle }: { aberto: boolean; total: number; inicial: number; onToggle: () => void }) {
  if (total <= inicial) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="no-print mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[13px] font-medium text-text-2 transition-colors hover:border-text/40 hover:text-text"
    >
      {aberto ? "Mostrar menos" : `Ver todos (${total})`}
      <ChevronDown className={cn("size-4 transition-transform duration-300", aberto && "rotate-180")} />
    </button>
  );
}

/** Área com rolagem própria quando a lista está expandida (não alonga a página). */
export function RolagemLista({ ativo, children, altura = 640 }: { ativo: boolean; children: ReactNode; altura?: number }) {
  return (
    <div className={cn(ativo && "overflow-y-auto overscroll-contain pr-2")} style={ativo ? { maxHeight: altura } : undefined} data-lenis-prevent>
      {children}
    </div>
  );
}
