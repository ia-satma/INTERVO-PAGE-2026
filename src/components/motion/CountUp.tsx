"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: number;
  className?: string;
  duration?: number;
};

/** Counts up from 0 to `value` once scrolled into view. Plain
 * requestAnimationFrame — no animation library — respects reduced motion. */
export default function CountUp({ value, className, duration = 1100 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(value).padStart(2, "0");
      return;
    }
    let frame = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          el.textContent = "00";
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(eased * value)).padStart(2, "0");
            if (t < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {String(value).padStart(2, "0")}
    </span>
  );
}
