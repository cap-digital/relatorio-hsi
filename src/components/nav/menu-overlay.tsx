"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useLenisLock } from "@/hooks/use-lenis-lock";
import { LogoHSI } from "@/components/core/logo";
import { TransitionLink } from "@/components/core/transition-link";
import { fmtAtualizado, fmtDia } from "@/data/format";
import { usePainel } from "@/data/provider";

type PreviewImage = "inicio" | "midia" | "frentes";

interface MenuLink {
  index: string;
  href: string;
  label: string;
  meta: string;
  image: PreviewImage;
}

const LINKS: MenuLink[] = [
  { index: "01", href: "/", label: "Início", meta: "Panorama · Meta × Google", image: "inicio" },
  { index: "02", href: "/midia", label: "Mídia", meta: "Estratégias, busca, público, criativos", image: "midia" },
  { index: "03", href: "/frentes", label: "Frentes", meta: "Investimento, estratégias e criativos por frente", image: "frentes" },
];

/** Um criativo do hospital por página (cópias locais em public/criativos/). */
const PREVIEW_SRC: Record<PreviewImage, string> = {
  inicio: "/criativos/meta-03.jpg",
  midia: "/criativos/meta-02.jpg",
  frentes: "/criativos/meta-06.jpg",
};

export interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Fullscreen ink menu: giant links with index numbers, cursor-following image preview, ESC to close. */
export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const mounted = useRef(false);
  const pathname = usePathname();
  const painel = usePainel();
  const links = LINKS;

  useLenisLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Open / close choreography.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const panel = root.querySelector(".menu-panel");
      const links = gsap.utils.toArray<HTMLElement>(".menu-link-inner");
      const metas = gsap.utils.toArray<HTMLElement>(".menu-meta");
      const reduce = prefersReducedMotion();

      if (open) {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.set(root, { autoAlpha: 1 })
          .fromTo(
            panel,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0.3 : 0.95, ease: "power4.inOut" },
          )
          .fromTo(links, { yPercent: reduce ? 0 : 110, autoAlpha: reduce ? 0 : 1 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08 }, "-=0.4")
          .fromTo(metas, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 }, "-=0.9")
          .add(() => firstLinkRef.current?.focus({ preventScroll: true }), "-=0.6");
        return;
      }

      if (!mounted.current) {
        mounted.current = true;
        gsap.set(root, { autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(root, { autoAlpha: 0 });
        },
      });
      tl.to(links, { yPercent: reduce ? 0 : -110, autoAlpha: reduce ? 0 : 1, duration: 0.5, ease: "power3.in", stagger: 0.04 })
        .to(metas, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(previewRef.current, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(panel, { clipPath: "inset(100% 0 0 0)", duration: reduce ? 0.3 : 0.85, ease: "power4.inOut" }, "-=0.25");
    },
    { scope: rootRef, dependencies: [open] },
  );

  // Cursor-following preview.
  useGSAP(
    () => {
      const root = rootRef.current;
      const preview = previewRef.current;
      if (!root || !preview || !open) return;
      if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

      const xTo = gsap.quickTo(preview, "x", { duration: 0.9, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.9, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        xTo(nx * 48);
        yTo(ny * 36);
      };
      root.addEventListener("pointermove", onMove, { passive: true });
      return () => root.removeEventListener("pointermove", onMove);
    },
    { scope: rootRef, dependencies: [open] },
  );

  const showPreview = (image: PreviewImage) => {
    const preview = previewRef.current;
    if (!preview) return;
    const imgs = preview.querySelectorAll<HTMLElement>("[data-image]");
    imgs.forEach((img) => {
      gsap.to(img, { autoAlpha: img.dataset.image === image ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
    });
    gsap.to(preview, { autoAlpha: 1, scale: 1, rotate: -2, duration: 0.8, ease: "expo.out", overwrite: "auto" });
  };

  const hidePreview = () => {
    const preview = previewRef.current;
    if (!preview) return;
    gsap.to(preview, { autoAlpha: 0, scale: 0.94, rotate: 0, duration: 0.6, ease: "expo.out", overwrite: "auto" });
  };

  return (
    <div
      ref={rootRef}
      id="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className="fixed inset-0 opacity-0"
      style={{ zIndex: "var(--z-menu)", visibility: "hidden" }}
    >
      <div className="menu-panel absolute inset-0 overflow-hidden bg-ink">
        <div className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_30%_40%,#000,transparent)]" />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 size-[60vmin] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(200,220,76,.16), transparent 65%)" }}
        />
        <div className="noise" />

        <div className="container-hub relative flex h-full flex-col justify-between pb-8 pt-[96px] md:pb-10 md:pt-[120px]">
          <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_minmax(280px,420px)]">
            <ul className="menu-list flex flex-col" onPointerLeave={hidePreview}>
              {links.map((link, i) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href} className="border-b border-line last:border-b-0">
                    <TransitionLink
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={() => onClose()}
                      onPointerEnter={() => showPreview(link.image)}
                      onFocus={() => showPreview(link.image)}
                      className="menu-link group/link flex items-baseline gap-5 py-3 md:gap-8 md:py-4"
                      data-cursor="Abrir"
                    >
                      <span className="line-mask flex-1">
                        <span className="menu-link-inner flex items-baseline gap-5 md:gap-8">
                          <span className="font-mono text-[12px] text-amber tabular md:text-[13px]">{link.index}</span>
                          <span
                            className={cn(
                              "menu-link-label display text-[clamp(2.75rem,8.5vw,7.25rem)] leading-[0.95] tracking-[-0.035em] text-text group-hover/link:text-amber",
                              active && "text-amber",
                            )}
                          >
                            {link.label}
                          </span>
                        </span>
                      </span>
                      <span className="menu-meta hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-text-3 md:inline">
                        {link.meta}
                      </span>
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>

            <div className="relative hidden aspect-[4/5] w-full max-w-[420px] justify-self-end lg:block">
              <div
                ref={previewRef}
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden rounded-[20px] border border-line opacity-0 shadow-[0_40px_120px_-40px_rgba(0,0,0,.8)]"
              >
                {(Object.keys(PREVIEW_SRC) as PreviewImage[]).map((key) => (
                  <Image
                    key={key}
                    data-image={key}
                    src={PREVIEW_SRC[key]}
                    alt=""
                    fill
                    sizes="420px"
                    className="object-cover opacity-0"
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 via-30% to-transparent" />
                <span className="menu-meta absolute bottom-4 left-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-2">
                  {painel.cliente} · criativos 2026
                </span>
              </div>
            </div>
          </div>

          <div className="menu-meta mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line pt-6">
            <div className="flex items-center gap-4">
              <LogoHSI className="text-[15px]" />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-3">
              <span>
                Período {fmtDia(painel.periodo.inicio)} → {fmtDia(painel.periodo.fim)}
              </span>
              <span className="hidden sm:inline">Atualizado {fmtAtualizado(painel.atualizadoEm)}</span>
              <span>Meta Ads · Google Ads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
