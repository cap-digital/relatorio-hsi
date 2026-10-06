"use client";

import { createElement, useRef, type ReactNode } from "react";
import { gsap, SplitText, STAGGER, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useHubReady } from "./preloader";

type SplitType = "lines" | "words" | "chars";

export interface SplitHeadingProps {
  as?: "h1" | "h2" | "h3" | "p";
  type?: SplitType;
  /** scroll: ScrollTrigger at 85%; mount: immediately; ready: after the preloader (`hub:ready`). */
  trigger?: "scroll" | "mount" | "ready";
  delay?: number;
  stagger?: number;
  className?: string;
  children: ReactNode;
}

const SPLIT_TYPES: Record<SplitType, string> = {
  lines: "lines",
  words: "lines,words",
  chars: "lines,words,chars",
};

/** Masked line/word/char reveal built on SplitText (autoSplit re-splits on resize / font load). */
export function SplitHeading({
  as = "h2",
  type = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  className,
  children,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const ready = useHubReady();
  const waiting = trigger !== "mount" && !ready;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || waiting) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.6,
            delay,
            ease: "none",
            scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 90%", once: true } : undefined,
          },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(el, {
          type: SPLIT_TYPES[type],
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
          onSplit(self) {
            el.style.visibility = "visible";
            const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
            return gsap.from(targets, {
              yPercent: 110,
              duration: type === "chars" ? 1.1 : 1.3,
              ease: "expo.out",
              delay,
              stagger: stagger ?? STAGGER[type],
              scrollTrigger:
                trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined,
            });
          },
        });
        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [waiting, type, trigger, delay, stagger] },
  );

  return createElement(
    as,
    // eslint-disable-next-line react-hooks/refs -- ref object is forwarded to the element, not read during render
    { ref, className: cn("split-heading", className), style: { visibility: "hidden" } },
    children,
  );
}
