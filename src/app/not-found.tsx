import { Cta } from "@/components/core/cta";
import { Reveal } from "@/components/core/reveal";
import { SplitHeading } from "@/components/core/split-heading";

export default function NotFound() {
  return (
    <main className="container-hub relative flex min-h-svh flex-col justify-center pb-[clamp(96px,12vw,200px)] pt-[clamp(140px,18vw,240px)]">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_40%,#000,transparent)]" />
      <div className="relative max-w-4xl">
        <Reveal className="flex items-center gap-4" y={16}>
          <span className="font-mono text-[11px] tracking-[0.18em] text-text-3 tabular">404</span>
          <span className="h-px w-10 bg-amber/60" />
          <span className="eyebrow">Página não encontrada</span>
        </Reveal>
        <SplitHeading as="h1" type="words" trigger="ready" className="display display-hero mt-8 text-text">
          Esta página <em className="text-amber">não existe.</em>
        </SplitHeading>
        <Reveal delay={0.2} y={20} className="mt-8 max-w-xl text-[17px] leading-relaxed text-text-2">
          O endereço pode ter mudado ou nunca fez parte do relatório. Volte ao início ou siga direto para as
          frentes.
        </Reveal>
        <Reveal delay={0.3} y={20} className="mt-10 flex flex-wrap gap-4">
          <Cta href="/">Voltar ao início</Cta>
          <Cta href="/frentes" variant="ghost">
            Ver frentes
          </Cta>
        </Reveal>
      </div>
    </main>
  );
}
