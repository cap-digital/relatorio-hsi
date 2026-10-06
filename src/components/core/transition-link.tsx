"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import type { ComponentProps, MouseEvent } from "react";
import { playCurtainIn } from "./page-transition";

type LinkProps = ComponentProps<typeof Link>;

function hrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname ?? "";
  const search = typeof href.search === "string" ? href.search : "";
  const hash = typeof href.hash === "string" ? href.hash : "";
  return `${pathname}${search}${hash}`;
}

/** next/link that plays the curtain before pushing internal routes. */
export function TransitionLink({ href, onClick, target, ...props }: LinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const url = hrefToString(href);
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    const isExternal = !url.startsWith("/") || url.startsWith("//");
    if (isModified || isExternal || (target && target !== "_self")) return;

    const [path, hash] = url.split("#");
    const [cleanPath] = path.split("?");

    if (cleanPath === pathname) {
      event.preventDefault();
      if (hash) {
        lenis?.scrollTo(`#${hash}`, { offset: -80 });
      } else {
        lenis?.scrollTo(0);
      }
      return;
    }

    event.preventDefault();
    void playCurtainIn().then(() => router.push(url));
  };

  return <Link href={href} target={target} onClick={handleClick} {...props} />;
}
