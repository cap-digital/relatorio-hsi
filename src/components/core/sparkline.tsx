"use client";

import { useId, useMemo, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}

interface Pt {
  x: number;
  y: number;
}

function buildPaths(data: number[], width: number, height: number) {
  const pad = 2;
  const n = data.length;
  if (n === 0) return { line: "", area: "", last: null as Pt | null };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts: Pt[] = data.map((v, i) => ({
    x: n === 1 ? width / 2 : pad + (i / (n - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  // Catmull-Rom → cubic bezier for a soft line.
  let line = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  const last = pts[n - 1];
  const area = `${line} L${last.x.toFixed(2)},${height} L${pts[0].x.toFixed(2)},${height} Z`;
  return { line, area, last };
}

/** Tiny SVG trend line; draws itself in when scrolled into view. */
export function Sparkline({ data, color = "var(--amber)", width = 96, height = 28, fill = false, className }: SparklineProps) {
  const rawId = useId();
  const gradientId = `spark-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  const { line, area, last } = useMemo(() => buildPaths(data, width, height), [data, width, height]);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !line) return;
      const path = svg.querySelector(".spark-line");
      const areaEl = svg.querySelector(".spark-area");
      const dot = svg.querySelector(".spark-dot");
      if (!path) return;
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 95%", once: true } });
      tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.4, ease: "power3.out" }, 0);
      if (areaEl) tl.fromTo(areaEl, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out" }, 0.4);
      if (dot) tl.fromTo(dot, { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 1.1);
    },
    { scope: ref, dependencies: [line] },
  );

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("block shrink-0 overflow-visible", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.35} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && area && <path className="spark-area" d={area} fill={`url(#${gradientId})`} />}
      {line && (
        <path
          className="spark-line"
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {last && <circle className="spark-dot" cx={last.x} cy={last.y} r={2.25} fill={color} />}
    </svg>
  );
}
