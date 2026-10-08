import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/core/smooth-scroll";
import { Preloader } from "@/components/core/preloader";
import { Grain } from "@/components/core/grain";
import { PageTransition } from "@/components/core/page-transition";
import { Nav } from "@/components/nav/nav";
import { Footer } from "@/components/nav/footer";
import { PainelProvider, type PainelMeta } from "@/data/provider";
import snapshot from "@/data/snapshot.json";
import type { Snapshot } from "@/data/types";
import { fmtNotaAnoAnterior } from "@/data/format";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-jakarta",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hospital Santa Izabel · Balanço de mídia 2026",
  description:
    "Balanço de mídia do Hospital Santa Izabel em 2026 até aqui: investimento, impressões, cliques e engajamento no Meta Ads e no Google Ads, com as campanhas ainda no ar.",
  applicationName: "Balanço de mídia · Hospital Santa Izabel",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0B1610",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const s: Snapshot = snapshot;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const painel: PainelMeta = {
    cliente: s.cliente,
    periodo: s.periodo,
    atualizadoEm: s.atualizadoEm,
    // Avisos do build só em dev (o rodapé não os mostra em produção, e nem chegam ao payload).
    avisos: process.env.NODE_ENV !== "production" ? s.avisos : [],
    notas: s.frentes.map((f) => fmtNotaAnoAnterior(f, s.periodo.inicio)).filter((n): n is string => Boolean(n)),
  };
  return (
    <html
      lang="pt-BR"
      className={cn("dark", display.variable, sans.variable, mono.variable, serif.variable, "antialiased")}
    >
      <body className="flex min-h-svh flex-col">
        <PainelProvider value={painel}>
          <SmoothScroll>
            <Preloader />
            <Grain />
            <PageTransition />
            <Nav />
            {children}
            <Footer />
          </SmoothScroll>
        </PainelProvider>
      </body>
    </html>
  );
}
