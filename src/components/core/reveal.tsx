"use client";

import { createElement, useRef, type ReactNode } from "react";
import { gsap, scheduleScrollRefresh, useGSAP } from "@/lib/gsap";
import { useHubReady } from "./preloader";

export interface RevealProps {
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  /** Travel distance in px (default 32). */
  y?: number;
  /** When set, direct children are staggered instead of the wrapper. */
  stagger?: number;
  once?: boolean;
  className?: string;
  children: ReactNode;
}

/** Opacity + y reveal on scroll (`top 85%`), waits for `hub:ready`. */
export function Reveal({ as = "div", delay = 0, y = 32, stagger, once = true, className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const ready = useHubReady();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !ready) return;

      const staggered = stagger !== undefined;
      const targets: Element | Element[] = staggered ? Array.from(el.children) : el;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          targets,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            delay,
            ease: "none",
            stagger: staggered ? stagger : 0,
            scrollTrigger: { trigger: el, start: "clamp(top 90%)", once: true },
          },
        );
        if (staggered) gsap.set(el, { visibility: "visible" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            delay,
            ease: "expo.out",
            stagger: staggered ? stagger : 0,
            clearProps: once ? "transform" : undefined,
            onComplete: () => scheduleScrollRefresh(120),
            scrollTrigger: {
              trigger: el,
              start: "clamp(top 85%)",
              once,
              toggleActions: once ? "play none none none" : "play none none reverse",
            },
          },
        );
        if (staggered) gsap.set(el, { visibility: "visible" });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [ready, delay, y, stagger, once] },
  );

  // eslint-disable-next-line react-hooks/refs -- ref object is forwarded to the element, not read during render
  return createElement(as, { ref, className, style: { visibility: "hidden" } }, children);
}
