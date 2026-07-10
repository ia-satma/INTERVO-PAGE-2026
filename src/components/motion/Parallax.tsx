"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initGsap, prefersReduced } from "./gsap";

/**
 * Subtle scroll parallax. Wrap an element that is slightly taller than its
 * container (e.g. an image at scale/height 120%) so no gaps appear at the edges.
 */
export default function Parallax({
  children,
  className,
  amount = 12,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const { gsap } = initGsap();
    const anim = gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
