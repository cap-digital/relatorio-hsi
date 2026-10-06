"use client";

import { REDUCED_MOTION_QUERY } from "@/lib/gsap";
import { useMediaQuery } from "./use-media-query";

/** True when the visitor asked for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY, false);
}
