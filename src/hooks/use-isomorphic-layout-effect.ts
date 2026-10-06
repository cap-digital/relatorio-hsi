import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect on the client, useEffect during SSR (no-op there). */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
