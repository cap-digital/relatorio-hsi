"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";
import { TransitionLink } from "./transition-link";

export type CtaVariant = "primary" | "ghost" | "copper" | "dusk";

export interface CtaProps {
  href?: string;
  onClick?: () => void;
  variant?: CtaVariant;
  size?: "md" | "lg";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const VARIANT: Record<CtaVariant, { root: string; icon: string }> = {
  primary: {
    root: "bg-amber text-ink hover:bg-[#ff5a52] shadow-[0_0_0_0_var(--amber-glow)] hover:shadow-[0_18px_50px_-18px_var(--amber-glow)]",
    icon: "bg-ink/15 text-ink group-hover/cta:bg-ink group-hover/cta:text-amber",
  },
  ghost: {
    root: "border border-line-strong bg-transparent text-text hover:border-text/40 hover:bg-text/5",
    icon: "bg-text/10 text-text group-hover/cta:bg-text group-hover/cta:text-ink",
  },
  copper: {
    root: "bg-copper text-ink hover:bg-[#f7c65e] hover:shadow-[0_18px_50px_-18px_var(--copper-glow)]",
    icon: "bg-ink/15 text-ink group-hover/cta:bg-ink group-hover/cta:text-copper",
  },
  dusk: {
    root: "bg-dusk-2 text-white hover:bg-[#4e97ee] hover:shadow-[0_18px_50px_-18px_var(--dusk-glow)]",
    icon: "bg-white/15 text-white group-hover/cta:bg-white group-hover/cta:text-dusk-2",
  },
};

const SIZE: Record<"md" | "lg", { root: string; icon: string }> = {
  md: { root: "h-12 pl-6 pr-1.5 text-[14.5px]", icon: "size-9" },
  lg: { root: "h-14 pl-8 pr-2 text-[16px]", icon: "size-10" },
};

/** Magnetic pill button. Internal hrefs use the page-transition curtain. */
export function Cta({ href, onClick, variant = "primary", size = "md", icon, className, children }: CtaProps) {
  const classes = cn(
    "group/cta relative inline-flex select-none items-center gap-4 rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
    VARIANT[variant].root,
    SIZE[size].root,
    className,
  );

  const inner = (
    <>
      <span className="relative block overflow-hidden leading-none">
        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/cta:-translate-y-[120%]">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-[120%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/cta:translate-y-0"
        >
          {children}
        </span>
      </span>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover/cta:rotate-45 [&_svg]:size-4",
          VARIANT[variant].icon,
          SIZE[size].icon,
        )}
        aria-hidden="true"
      >
        {icon ?? <ArrowUpRight />}
      </span>
    </>
  );

  const isInternal = Boolean(href && href.startsWith("/") && !href.startsWith("//"));

  let element: ReactNode;
  if (href && isInternal) {
    element = (
      <TransitionLink href={href} className={classes} onClick={onClick ? () => onClick() : undefined}>
        {inner}
      </TransitionLink>
    );
  } else if (href) {
    element = (
      <a href={href} target="_blank" rel="noreferrer" className={classes} onClick={onClick ? () => onClick() : undefined}>
        {inner}
      </a>
    );
  } else {
    element = (
      <button type="button" onClick={onClick} className={classes}>
        {inner}
      </button>
    );
  }

  return <Magnetic strength={0.3}>{element}</Magnetic>;
}
