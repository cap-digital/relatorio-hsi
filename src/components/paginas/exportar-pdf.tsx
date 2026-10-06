"use client";

import { FileDown, LoaderCircle } from "lucide-react";
import { useState } from "react";

/** Botão da visão geral: baixa o relatório completo em PDF, gerado no servidor. */
export function BotaoExportarPdf() {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(false);

  async function baixar() {
    setGerando(true);
    setErro(false);
    try {
      const res = await fetch("/api/pdf");
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "relatorio.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro(true);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={baixar}
      disabled={gerando}
      className="no-print inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-ink/50 px-5 py-2.5 text-[13.5px] font-medium text-text backdrop-blur transition-colors hover:border-amber hover:text-amber disabled:cursor-wait disabled:opacity-70"
    >
      {gerando ? <LoaderCircle className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      {gerando ? "Gerando PDF… (até 1 min)" : erro ? "Falhou — tentar de novo" : "Exportar PDF"}
    </button>
  );
}
