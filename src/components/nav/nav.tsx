"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useScrollState } from "@/hooks/use-scroll-state";
import { LogoHSI } from "@/components/core/logo";
import { TransitionLink } from "@/components/core/transition-link";
import { fmtAtualizado } from "@/data/format";
import { usePainel } from "@/data/provider";
import { MenuOverlay } from "./menu-overlay";

export const ROUTES = [
  { href: "/", label: "Início" },
  { href: "/midia", label: "Mídia" },
  { href: "/frentes", label: "Frentes" },
] as const;

export function activeRouteIndex(pathname: string): number {
  return ROUTES.findIndex((r) => (r.href === "/" ? pathname === "/" : pathname.startsWith(r.href)));
}

function RoutePills({ pathname }: { pathname: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const activeIndex = activeRouteIndex(pathname);

  useGSAP(
    () => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      if (!list || !indicator) return;

      let animated = false;
      const move = () => {
        const target = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
        if (!target) {
          gsap.to(indicator, { autoAlpha: 0, duration: 0.3 });
          return;
        }
        gsap.to(indicator, {
          x: target.offsetLeft,
          width: target.offsetWidth,
          autoAlpha: 1,
          duration: animated ? 0.7 : 0,
          ease: "power4.inOut",
          overwrite: "auto",
        });
        animated = true;
      };

      move();
      const ro = new ResizeObserver(() => {
        animated = false;
        move();
      });
      ro.observe(list);
      return () => ro.disconnect();
    },
    { scope: listRef, dependencies: [activeIndex] },
  );

  return (
    <nav aria-label="Seções do relatório" className="hidden md:block">
      <div
        ref={listRef}
        className="relative flex items-center rounded-full border border-line bg-ink/50 p-1 backdrop-blur-md"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="absolute left-0 top-1 h-[calc(100%-8px)] rounded-full bg-amber opacity-0"
        />
        {ROUTES.map((route, i) => {
          const active = i === activeIndex;
          return (
            <TransitionLink
              key={route.href}
              href={route.href}
              data-index={i}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-500 ease-[var(--ease-out-expo)]",
                active ? "text-ink" : "text-text-2 hover:text-text",
              )}
            >
              {route.label}
            </TransitionLink>
          );
        })}
      </div>
    </nav>
  );
}

/** Fixed top bar: logo, segmented route pills, updated-at stamp and the menu button. */
export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrolled, direction, y } = useScrollState(40);
  const hidden = !menuOpen && direction === "down" && y > 320;
  const painel = usePainel();

  // Close the menu whenever the route changes (safety net; links also close it).
  useEffect(() => {
    const id = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      <header
        data-open={menuOpen}
        className={cn(
          "hub-nav fixed inset-x-0 top-0 transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-out-expo)]",
          scrolled && !menuOpen && "hub-nav--glass",
          hidden && "-translate-y-full",
        )}
        style={{ zIndex: "var(--z-nav)" }}
      >
        <div className="container-hub flex h-[72px] items-center justify-between gap-6 md:h-20">
          <TransitionLink href="/" aria-label="Início — Balanço de mídia Hospital Santa Izabel" className="flex shrink-0 items-center">
            <LogoHSI className="text-[17px] md:text-[19px]" />
          </TransitionLink>

          <RoutePills pathname={pathname} />

          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-text-3 lg:inline tabular">
              Atualizado {fmtAtualizado(painel.atualizadoEm)}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-overlay"
              data-open={menuOpen}
              className={cn(
                "group/burger flex h-10 items-center gap-3 rounded-full border px-4 transition-[border-color,background-color] duration-500 ease-[var(--ease-out-expo)]",
                menuOpen ? "border-text/30 bg-text/5" : "border-line hover:border-line-strong hover:bg-text/5",
              )}
            >
              {/* Both labels share one grid cell so the button is as wide as the longest word ("Fechar"). */}
              <span className="relative grid h-[11px] overflow-hidden font-mono text-[11px] uppercase leading-[11px] tracking-[0.16em] text-text">
                <span
                  className={cn(
                    "col-start-1 row-start-1 block transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen && "-translate-y-full",
                  )}
                >
                  Menu
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "col-start-1 row-start-1 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    menuOpen && "translate-y-0",
                  )}
                >
                  Fechar
                </span>
              </span>
              <span className="relative block h-3 w-5 text-text" aria-hidden="true">
                <span className="burger-line" />
                <span className="burger-line" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
