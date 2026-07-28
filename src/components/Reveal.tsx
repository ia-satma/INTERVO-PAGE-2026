"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

const revealSettings = new WeakMap<Element, { once: boolean }>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const settings = revealSettings.get(entry.target);
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            if (settings?.once) {
              sharedObserver?.unobserve(entry.target);
              revealSettings.delete(entry.target);
            }
          } else if (!settings?.once) {
            entry.target.classList.remove("reveal-visible");
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
  }
  return sharedObserver;
}

/** Fade + rise on scroll into view. Plain IntersectionObserver + CSS transition —
 * no animation library — since this is the only scroll-reveal need on the site. */
export default function Reveal({ children, className, delay = 0, y = 32, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("reveal-motion");
    revealSettings.set(el, { once });
    const frame = requestAnimationFrame(() => getObserver().observe(el));
    return () => {
      cancelAnimationFrame(frame);
      sharedObserver?.unobserve(el);
      revealSettings.delete(el);
    };
  }, [once]);

  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-y": `${y}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
