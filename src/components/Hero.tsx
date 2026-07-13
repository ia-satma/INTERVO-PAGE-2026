"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GradientMesh } from "./abstract";
import { ArrowUpRight } from "./icons";
import { localePath } from "@/lib/site";
import { asset } from "@/lib/asset";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** Thematic (no faces) imagery revealed through the intervø isotype — the
 * firm's own marble/stone: the visual world of corporate, real estate and
 * estate-planning practice. One per slide. */
const SLIDE_IMAGES = [
  "/images/textures/marble-2.jpg",
  "/images/textures/marble-1.jpg",
  "/images/textures/marble-3.jpg",
];
const AUTO_MS = 6000;

const MASK = asset("/brand/isotype-white.png");
const maskStyle = {
  WebkitMaskImage: `url(${MASK})`,
  maskImage: `url(${MASK})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as const;

export default function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.hero;
  const slides = t.slides;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const current = slides[i];

  return (
    <section
      className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-navy-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <GradientMesh className="absolute inset-0 opacity-70" grain={false} />

      {/* Giant intervø isotype (static) masking the crossfading firm imagery */}
      <div className="pointer-events-none absolute right-[-16%] top-1/2 -translate-y-1/2 md:right-[-8%]">
        <div
          className="relative h-[94vmin] w-[94vmin] max-h-[1000px] max-w-[1000px]"
          style={maskStyle}
        >
          {SLIDE_IMAGES.map((src, idx) => (
            <Image
              key={src}
              src={asset(src)}
              alt=""
              fill
              priority={idx === 0}
              sizes="94vmin"
              className={`object-cover transition-opacity duration-[1200ms] ease-out ${
                idx === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-azure/25 via-transparent to-navy-950/60" />
        </div>
      </div>

      {/* Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/25" />

      <div className="container-x relative z-10 w-full pb-28 pt-36">
        <div className="max-w-3xl">
          <div key={`k-${i}`} className="hero-anim">
            <span className="eyebrow eyebrow--light">{current.kicker}</span>
          </div>
          <h1
            key={`t-${i}`}
            className="hero-anim display-1 mt-7 text-white"
            style={{ animationDelay: "0.08s" }}
          >
            {current.title}
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={localePath(locale, "contacto")} className="btn btn-light !px-7 !py-3.5">
              {t.ctaPrimary}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={localePath(locale, "servicios")} className="btn btn-outline-light !px-7 !py-3.5">
              {t.ctaSecondary}
            </Link>
          </div>

          <div className="mt-11 flex max-w-md items-center gap-3.5 border-l-2 border-accent pl-4">
            <p className="text-[0.88rem] leading-snug text-white/70">{t.chambers}</p>
          </div>

          {/* Carousel indicators */}
          <div className="mt-12 flex items-center gap-2.5">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`${idx + 1}. ${s.title}`}
                aria-current={idx === i}
                className="group -m-2.5 flex items-center justify-center p-4"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    idx === i ? "w-9 bg-accent" : "w-1.5 bg-white/30 group-hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
