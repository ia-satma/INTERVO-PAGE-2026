"use client";

import { useEffect, useRef } from "react";

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
    if (!match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value;
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const hasComma = numStr.includes(",");
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ""));
    const formatter = hasComma
      ? new Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : null;

    const fmt = (n: number) => {
      const rounded = decimals ? n.toFixed(decimals) : String(Math.round(n));
      const grouped = formatter ? formatter.format(Number(rounded)) : rounded;
      return `${prefix}${grouped}${suffix}`;
    };

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const start = performance.now();
        el.textContent = fmt(0);
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1200);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = fmt(target * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
