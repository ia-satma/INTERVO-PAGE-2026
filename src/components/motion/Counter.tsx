"use client";

import { useEffect, useRef } from "react";
import { initGsap, prefersReduced } from "./gsap";

/**
 * Animates the numeric portion of a value string from 0 → target when scrolled
 * into view. Keeps any prefix/suffix ("+2,500", "USD 1.5B", "3 años", "32").
 * SSR renders the final value, so no-JS / reduced-motion users see it correctly.
 */
export default function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const match = value.match(/^(\D*)([\d.,]+)(.*)$/s);
    if (!match || prefersReduced()) {
      el.textContent = value;
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const hasComma = numStr.includes(",");
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ""));

    const fmt = (n: number) => {
      const rounded = decimals ? n.toFixed(decimals) : String(Math.round(n));
      const grouped = hasComma
        ? Number(rounded).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : rounded;
      return `${prefix}${grouped}${suffix}`;
    };

    const { gsap } = initGsap();
    const state = { n: 0 };
    el.textContent = fmt(0);
    const tween = gsap.to(state, {
      n: target,
      duration: 1.7,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = fmt(state.n);
      },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
