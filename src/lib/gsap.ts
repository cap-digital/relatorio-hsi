import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

/**
 * Single GSAP entry point. Plugins are registered once, client-only.
 * Every component imports `gsap`/`useGSAP`/plugins from here, never from "gsap" directly.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    Flip,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
  );
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Motion language (CONTRACT §2). */
export const EASE = {
  reveal: "expo.out",
  curtain: "power4.inOut",
  hover: "power3.out",
} as const;

export const STAGGER = {
  chars: 0.02,
  words: 0.04,
  lines: 0.08,
  cards: 0.08,
} as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Synchronous check, safe to call inside effects / GSAP callbacks. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

let refreshTimer: number | undefined;

/** Debounced ScrollTrigger.refresh() for content that mounts late (lazy charts, images). */
export function scheduleScrollRefresh(delay = 200): void {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  Flip,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  MorphSVGPlugin,
};
