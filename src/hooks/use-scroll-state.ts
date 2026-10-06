"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";

export interface ScrollState {
  /** Past the threshold (default 40px). */
  scrolled: boolean;
  direction: "up" | "down";
  y: number;
}

/** Scroll position/direction fed by Lenis (which also mirrors native scroll). */
export function useScrollState(threshold = 40): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, direction: "up", y: 0 });

  useLenis(
    (lenis) => {
      const y = lenis.scroll;
      const direction: ScrollState["direction"] = lenis.direction === 1 ? "down" : "up";
      const scrolled = y > threshold;
      setState((prev) =>
        prev.scrolled === scrolled && prev.direction === direction && Math.abs(prev.y - y) < 8
          ? prev
          : { scrolled, direction, y },
      );
    },
    [threshold],
  );

  return state;
}
