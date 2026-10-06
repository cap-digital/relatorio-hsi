"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

const HIDDEN_BOTTOM = "inset(100% 0 0 0)";
const FULL = "inset(0% 0 0 0)";
const HIDDEN_TOP = "inset(0 0 100% 0)";
const SAFETY_MS = 2500;

let amberPanel: HTMLDivElement | null = null;
let inkPanel: HTMLDivElement | null = null;
let covered = false;
let activeTimeline: gsap.core.Timeline | null = null;
let safetyTimer: number | undefined;

function clearSafety() {
  window.clearTimeout(safetyTimer);
  safetyTimer = undefined;
}

/** Covers the viewport (amber then ink). Resolves when covered, or after 2.5s no matter what. */
export function playCurtainIn(): Promise<void> {
  if (!amberPanel || !inkPanel || covered) return Promise.resolve();
  covered = true;
  document.documentElement.dataset.transition = "in";

  const amber = amberPanel;
  const ink = inkPanel;

  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(guard);
      // If the route never changes (e.g. navigation error) release the curtain.
      clearSafety();
      safetyTimer = window.setTimeout(() => {
        if (covered) void playCurtainOut();
      }, SAFETY_MS);
      resolve();
    };
    const guard = window.setTimeout(finish, SAFETY_MS);

    activeTimeline?.kill();
    const tl = gsap.timeline({ onComplete: finish });

    if (prefersReducedMotion()) {
      tl.set(amber, { clipPath: FULL }).fromTo(
        ink,
        { clipPath: FULL, opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "none" },
      );
    } else {
      tl.fromTo(
        amber,
        { clipPath: HIDDEN_BOTTOM, opacity: 1 },
        { clipPath: FULL, duration: 0.8, ease: "power4.inOut" },
        0,
      ).fromTo(
        ink,
        { clipPath: HIDDEN_BOTTOM, opacity: 1 },
        { clipPath: FULL, duration: 0.8, ease: "power4.inOut" },
        0.14,
      );
    }
    activeTimeline = tl;
  });
}

/** Reveals the new page (ink lifts, then amber). Idempotent. */
export function playCurtainOut(): Promise<void> {
  if (!amberPanel || !inkPanel || !covered) return Promise.resolve();
  covered = false;
  clearSafety();

  const amber = amberPanel;
  const ink = inkPanel;

  return new Promise<void>((resolve) => {
    const finish = () => {
      gsap.set([amber, ink], { clipPath: HIDDEN_BOTTOM, opacity: 1 });
      delete document.documentElement.dataset.transition;
      resolve();
    };

    activeTimeline?.kill();
    const tl = gsap.timeline({ onComplete: finish });

    if (prefersReducedMotion()) {
      tl.to(ink, { opacity: 0, duration: 0.25, ease: "none" }).set(amber, { clipPath: HIDDEN_BOTTOM });
    } else {
      tl.to(ink, { clipPath: HIDDEN_TOP, duration: 0.85, ease: "power4.inOut" }, 0).to(
        amber,
        { clipPath: HIDDEN_TOP, duration: 0.85, ease: "power4.inOut" },
        0.12,
      );
    }
    activeTimeline = tl;
  });
}

/** Curtain overlay, mounted once in the root layout. Plays out whenever the pathname changes. */
export function PageTransition() {
  const pathname = usePathname();
  const lenis = useLenis();
  const amberRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    amberPanel = amberRef.current;
    inkPanel = inkRef.current;
    return () => {
      amberPanel = null;
      inkPanel = null;
    };
  }, []);

  useEffect(() => {
    if (!covered) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        void playCurtainOut();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname, lenis]);

  return (
    <div className="hub-curtain" aria-hidden="true">
      <div ref={amberRef} className="hub-curtain__panel bg-amber" />
      <div ref={inkRef} className="hub-curtain__panel bg-ink">
        <div className="noise" />
      </div>
    </div>
  );
}
