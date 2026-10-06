"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/** Reference-counted so nested locks (preloader + menu) never unlock each other. */
let locks = 0;

/** Stops Lenis while `locked` is true; restarts it when the last lock is released. */
export function useLenisLock(locked: boolean): void {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !locked) return;
    locks += 1;
    if (locks === 1) lenis.stop();
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) lenis.start();
    };
  }, [lenis, locked]);
}
