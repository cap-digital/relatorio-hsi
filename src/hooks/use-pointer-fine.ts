"use client";

import { useMediaQuery } from "./use-media-query";

/** True on devices with a precise pointer that can hover (mouse/trackpad). */
export function usePointerFine(): boolean {
  return useMediaQuery("(pointer: fine) and (hover: hover)", false);
}
