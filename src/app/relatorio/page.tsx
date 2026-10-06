import type { Metadata } from "next";
import Home from "../page";
import Midia from "../midia/page";
import Frentes from "../frentes/page";

export const metadata: Metadata = { title: "Relatório · Hospital Santa Izabel" };

/** Início + Mídia + Frentes numa página só; /api/pdf transforma esta página em PDF. */
export default function Relatorio() {
  return (
    <div className="relatorio">
      <Home />
      <div className="quebra-pagina">
        <Midia />
      </div>
      <div className="quebra-pagina">
        <Frentes />
      </div>
    </div>
  );
}
