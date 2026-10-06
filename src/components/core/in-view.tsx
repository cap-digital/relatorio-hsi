"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { scheduleScrollRefresh } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export interface InViewProps {
  rootMargin?: string;
  /** Reserved height so the page never jumps when children mount (default 320). */
  minHeight?: number | string;
  once?: boolean;
  className?: string;
  placeholder?: ReactNode;
  children: ReactNode;
}

/** Renders children only after entering the viewport (so chart enter animations play when reached). */
export function InView({
  rootMargin = "200px 0px",
  minHeight = 320,
  once = true,
  className,
  placeholder,
  children,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);

  useEffect(() => {
    if (inView) scheduleScrollRefresh(300);
  }, [inView]);

  return (
    <div ref={ref} className={cn("relative", className)} style={{ minHeight }} data-inview={inView || undefined}>
      {inView ? children : placeholder ?? null}
    </div>
  );
}
