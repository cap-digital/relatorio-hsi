import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SplitHeading } from "./split-heading";
import { Reveal } from "./reveal";

/** `neutral` = --text (creme): 4ª cor de frente, distinta de limão, verde-água e verde. */
export type SectionTone = "default" | "amber" | "copper" | "dusk" | "neutral";

const TONE_TEXT: Record<SectionTone, string> = {
  default: "text-amber",
  amber: "text-amber",
  copper: "text-copper",
  dusk: "text-dusk-2",
  neutral: "text-text",
};

const TONE_LINE: Record<SectionTone, string> = {
  default: "bg-amber/60",
  amber: "bg-amber/60",
  copper: "bg-copper/60",
  dusk: "bg-dusk-2/60",
  neutral: "bg-text/60",
};

export interface SectionProps {
  id?: string;
  /** Editorial index, e.g. "02". */
  index?: string;
  eyebrow?: string;
  /** Observação curta (mono, pequena) logo abaixo do eyebrow, antes do título. */
  nota?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: SectionTone;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}

/** Server-safe section shell: index + eyebrow, SplitHeading title, description, then content. */
export function Section({
  id,
  index,
  eyebrow,
  nota,
  title,
  description,
  align = "left",
  tone = "default",
  className,
  contentClassName,
  children,
}: SectionProps) {
  const hasHeader = Boolean(index || eyebrow || title || description);
  const centered = align === "center";

  return (
    <section id={id} data-tone={tone} className={cn("section-pad relative", className)}>
      <div className="container-hub">
        {hasHeader && (
          <header
            className={cn(
              "flex flex-col gap-6 md:gap-8",
              centered ? "mx-auto max-w-4xl items-center text-center" : "max-w-5xl items-start",
            )}
          >
            {(index || eyebrow) && !nota && (
              <Reveal className={cn("flex items-center gap-4", centered && "justify-center")} y={16}>
                {index && (
                  <span className="font-mono text-[11px] tracking-[0.18em] text-text-3 tabular">{index}</span>
                )}
                {index && <span className={cn("h-px w-10", TONE_LINE[tone])} />}
                {eyebrow && <span className={cn("eyebrow", TONE_TEXT[tone])}>{eyebrow}</span>}
              </Reveal>
            )}
            {(index || eyebrow) && nota && (
              <Reveal className="flex max-w-2xl flex-col gap-3" y={16}>
                <div className={cn("flex items-center gap-4", centered && "justify-center")}>
                  {index && (
                    <span className="font-mono text-[11px] tracking-[0.18em] text-text-3 tabular">{index}</span>
                  )}
                  {index && <span className={cn("h-px w-10", TONE_LINE[tone])} />}
                  {eyebrow && <span className={cn("eyebrow", TONE_TEXT[tone])}>{eyebrow}</span>}
                </div>
                <p className="font-mono text-[11.5px] leading-relaxed text-text-3">{nota}</p>
              </Reveal>
            )}
            {title && (
              <SplitHeading as="h2" type="lines" className="display display-2 text-text">
                {title}
              </SplitHeading>
            )}
            {description && (
              <Reveal delay={0.15} y={20} className="max-w-2xl text-[16px] leading-relaxed text-text-2 md:text-[17px]">
                {description}
              </Reveal>
            )}
          </header>
        )}
        {children !== undefined && children !== null && (
          <div className={cn(hasHeader && "mt-[clamp(40px,6vw,80px)]", contentClassName)}>{children}</div>
        )}
      </div>
    </section>
  );
}
