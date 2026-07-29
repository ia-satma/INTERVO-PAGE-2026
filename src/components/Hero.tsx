"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./icons";
import { asset } from "@/lib/asset";
import type { Dictionary } from "@/i18n/dictionaries";

/** Brand-shapes imagery (no faces) revealed through the intervø isotype —
 * one per slide, crossfading. */
const SLIDE_IMAGES = [
  "/images/textures/brand-shapes-navy-5.webp",
  "/images/textures/brand-shapes-azure-2.webp",
  "/images/textures/brand-shapes-navy-2.webp",
];
const AUTO_MS = 6000;

type Props = {
  content: Dictionary["home"]["hero"];
  media: {
    homeHero: string[];
    isotypeWhite: string;
    heroVideo: string;
    heroPoster: string;
  };
  primaryHref: string;
  secondaryHref: string;
};

export default function Hero({ content: t, media, primaryHref, secondaryHref }: Props) {
  const slides = t.slides;
  const slideImages = media.homeHero.length ? media.homeHero : SLIDE_IMAGES;
  const mask = asset(media.isotypeWhite);
  const maskStyle = {
    WebkitMaskImage: `url(${mask})`,
    maskImage: `url(${mask})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;
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
      className="grain relative flex min-h-[100dvh] items-center overflow-hidden bg-navy-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {media.heroVideo ? (
        <video
          src={media.heroVideo}
          poster={media.heroPoster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
      ) : (
        <Image
          src={asset(slideImages[0] ?? "/images/textures/brand-shapes-navy-4.webp")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      )}

      {/* Giant intervø isotype (static) masking the crossfading firm imagery */}
      <div className="pointer-events-none absolute right-[-20%] top-1/2 -translate-y-1/2 md:right-[-10%]">
        <div
          className="relative h-[118vmin] w-[118vmin] max-h-[1260px] max-w-[1260px]"
          style={maskStyle}
        >
          <Image
            key={`${slideImages[i % slideImages.length]}-${i}`}
            src={asset(slideImages[i % slideImages.length] ?? SLIDE_IMAGES[i % SLIDE_IMAGES.length])}
            alt=""
            fill
            priority={i === 0}
            sizes="118vmin"
            className={`${i === 0 ? "" : "hero-image-in"} object-cover`}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-azure/25 via-transparent to-navy-950/60" />
        </div>
      </div>

      {/* Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/25" />

      <div className="container-x relative z-10 w-full pb-28 pt-36">
        <div className="max-w-3xl">
          <div key={`k-${i}`} className={i === 0 ? "" : "hero-anim"}>
            <span className="eyebrow eyebrow--light">{current.kicker}</span>
          </div>
          <h1
            key={`t-${i}`}
            className={`${i === 0 ? "" : "hero-anim"} display-1 mt-7 text-white`}
            style={{ animationDelay: "0.08s" }}
          >
            {current.title}
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryHref} className="btn btn-light !px-7 !py-3.5">
              {t.ctaPrimary}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={secondaryHref} className="btn btn-outline-light !px-7 !py-3.5">
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
