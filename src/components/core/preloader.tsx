"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useLenisLock } from "@/hooks/use-lenis-lock";
import {
  getHubReady,
  getHubReadyServer,
  markHubReady,
  subscribeHubReady,
} from "./hub-ready-store";

const STORAGE_KEY = "hub:preloaded";

/** True once the preloader finished (or was skipped this session). */
export function useHubReady(): boolean {
  return useSyncExternalStore(subscribeHubReady, getHubReady, getHubReadyServer);
}

function readPreloaded(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writePreloaded() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode: ignore */
  }
}

const noopSubscribe = () => () => undefined;

export function Preloader() {
  // Server snapshot = false so SSR paints the ink cover; the client value takes over on hydration.
  const alreadyPreloaded = useSyncExternalStore(noopSubscribe, readPreloaded, () => false);
  const [finished, setFinished] = useState(false);
  const showing = !alreadyPreloaded && !finished;

  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useLenisLock(showing);

  useEffect(() => {
    if (alreadyPreloaded) markHubReady();
  }, [alreadyPreloaded]);

  const finish = useCallback(() => setFinished(true), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !showing) return;

      const reduce = prefersReducedMotion();
      const progress = { value: 0 };
      const renderProgress = () => {
        const v = Math.round(progress.value);
        if (counterRef.current) counterRef.current.textContent = String(v).padStart(3, "0");
        if (barRef.current) barRef.current.style.transform = `scaleX(${progress.value / 100})`;
      };

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: finish,
      });

      tl.fromTo(
        ".pre-logo",
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: reduce ? 0.3 : 1.2, stagger: 0.12 },
        0.15,
      )
        .fromTo(".pre-meta", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.35)
        .to(
          progress,
          {
            value: 100,
            duration: reduce ? 0.4 : 1.9,
            ease: "power2.inOut",
            onUpdate: renderProgress,
          },
          0.35,
        )
        .to(
          [".pre-logo", ".pre-meta", ".pre-counter"],
          { y: -18, autoAlpha: 0, duration: 0.55, ease: "power3.in", stagger: 0.03 },
          "+=0.2",
        )
        .add(() => {
          writePreloaded();
        })
        .to(root, {
          clipPath: "inset(0 0 100% 0)",
          duration: reduce ? 0.4 : 1.05,
          ease: "power4.inOut",
        })
        .add(markHubReady, "-=0.75");
    },
    { scope: rootRef, dependencies: [showing, finish] },
  );

  if (!showing) return null;

  return (
    <div
      ref={rootRef}
      className="hub-preloader flex flex-col justify-between overflow-hidden"
      aria-hidden="true"
      data-preloader
    >
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
      <div className="noise" />

      <div className="container-hub flex items-center justify-between pt-8 md:pt-10">
        <span className="pre-meta font-mono text-[11px] uppercase tracking-[0.18em] text-text-3 opacity-0">
          Balanço de mídia · 2026
        </span>
        <span className="pre-meta font-mono text-[11px] uppercase tracking-[0.18em] text-text-3 opacity-0">
          Meta Ads × Google Ads
        </span>
      </div>

      <div className="container-hub flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="pre-logo display text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-none tracking-[-0.04em] text-text opacity-0">
            Santa Izabel<span className="text-amber">.</span>
          </span>
          <span className="pre-logo font-serif text-[clamp(1.1rem,2vw,1.6rem)] italic text-text-2 opacity-0">
            2026 até aqui, em números
          </span>
        </div>
      </div>

      <div className="container-hub relative flex items-end justify-between pb-8 md:pb-10">
        <span className="pre-counter font-mono text-[clamp(3.5rem,10vw,8.5rem)] leading-none tracking-[-0.04em] text-text tabular">
          <span ref={counterRef}>000</span>
          <span className="ml-1 text-[0.35em] text-amber align-top">%</span>
        </span>
        <span
          ref={barRef}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-amber"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
