"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { countFractionDigits, formatCounterValue, type CounterFormat } from "./format-number";
import { useHubReady } from "./preloader";

export interface CounterProps {
  value: number;
  format?: CounterFormat;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  /** scroll: when 90% in view; ready: after the preloader; mount: immediately. */
  trigger?: "scroll" | "ready" | "mount";
  className?: string;
}

/** Animated count-up with pt-BR formatting; tabular numerals. Never wraps ("R$ 4,86 mi" stays one line). */
export function Counter({
  value,
  format = "number",
  decimals,
  prefix = "",
  suffix = "",
  duration = 1.8,
  delay = 0,
  trigger = "scroll",
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const ready = useHubReady();
  const waiting = trigger !== "mount" && !ready;

  const finalText = formatCounterValue(value, format, { decimals });
  const fixedFraction = countFractionDigits(finalText);
  const initialText = formatCounterValue(0, format, { decimals, fixedFraction, unitOf: value });

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || waiting) return;

      const state = { v: 0 };
      const render = () => {
        el.textContent = formatCounterValue(state.v, format, { decimals, fixedFraction, unitOf: value });
      };
      const settle = () => {
        el.textContent = finalText;
      };

      if (prefersReducedMotion()) {
        settle();
        return;
      }

      render();
      gsap.to(state, {
        v: value,
        duration,
        delay,
        ease: "power3.out",
        onUpdate: render,
        onComplete: settle,
        scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 92%", once: true } : undefined,
      });
    },
    { dependencies: [waiting, value, format, decimals, duration, delay, trigger, finalText, fixedFraction] },
  );

  return (
    <span className={cn("tabular whitespace-nowrap", className)}>
      {prefix}
      <span ref={ref}>{initialText}</span>
      {suffix}
    </span>
  );
}
