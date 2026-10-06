"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, scheduleScrollRefresh, useGSAP } from "@/lib/gsap";

/** Fades/translates each page in on navigation (opacity 0→1, y 24→0, expo.out). */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.25,
          ease: "expo.out",
          clearProps: "transform,opacity",
          onComplete: () => scheduleScrollRefresh(60),
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} id="content" className="relative flex flex-1 flex-col" style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
