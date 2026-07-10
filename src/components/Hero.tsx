"use client";

import { useRef } from "react";
import Link from "next/link";
import { MarbleDuotone, GradientMesh, BridgeMotif } from "./abstract";
import { ArrowUpRight } from "./icons";
import { initGsap, prefersReduced, useIsoLayoutEffect } from "./motion/gsap";
import { localePath } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Hero({
  locale,
  dict,
  rotating,
}: {
  locale: Locale;
  dict: Dictionary;
  rotating: string[];
}) {
  const root = useRef<HTMLElement>(null);
  const t = dict.home.hero;
  const words = t.title.split(" ");

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.7 })
        .from(".hero-word", { yPercent: 120, duration: 0.9, stagger: 0.06 }, "-=0.35")
        .from(".hero-line", { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.5")
        .from(".hero-cta", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-proof", { y: 16, opacity: 0, duration: 0.6 }, "-=0.3");

      // Background: slow zoom + crossfade between conceptual scenes
      gsap.to(".hero-zoom", { scale: 1.08, duration: 16, ease: "none", yoyo: true, repeat: -1 });
      gsap.to(".hero-scene-b", {
        opacity: 1,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 3,
      });

      // Rotating specialties
      const rot = gsap.utils.toArray<HTMLElement>(".hero-rot");
      if (rot.length > 1) {
        gsap.set(rot, { yPercent: 100, opacity: 0 });
        gsap.set(rot[0], { yPercent: 0, opacity: 1 });
        const rtl = gsap.timeline({ repeat: -1 });
        rot.forEach((cur, i) => {
          const next = rot[(i + 1) % rot.length];
          rtl
            .to(cur, { yPercent: -100, opacity: 0, duration: 0.55, ease: "power2.in" }, "+=1.9")
            .fromTo(
              next,
              { yPercent: 100, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.55, ease: "power2.out" },
              "<",
            );
        });
      }

      gsap.to(".hero-cue", { y: 8, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-navy-950"
    >
      {/* Conceptual scenes */}
      <div className="hero-zoom absolute inset-0">
        <MarbleDuotone src="/images/textures/marble-3.jpg" className="absolute inset-0" priority />
        <MarbleDuotone
          src="/images/textures/marble-2.jpg"
          className="hero-scene-b absolute inset-0 opacity-0"
        />
      </div>
      <GradientMesh className="absolute inset-0 opacity-55" grain={false} />

      {/* Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />

      <BridgeMotif className="pointer-events-none absolute right-[-5%] top-[14%] hidden w-[48%] text-white/[0.06] lg:block" />

      <div className="container-x relative z-10 w-full pb-24 pt-36">
        <div className="max-w-3xl">
          <span className="hero-eyebrow eyebrow eyebrow--light">{t.eyebrow}</span>

          <h1 className="display-1 mt-7 text-white" aria-label={t.title}>
            {words.map((w, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="mr-[0.22em] inline-block overflow-hidden pb-[0.06em] align-bottom"
              >
                <span className="hero-word inline-block">{w}</span>
              </span>
            ))}
          </h1>

          {/* Rotating specialties */}
          <div className="hero-line mt-7 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="relative block h-[1.5em] overflow-hidden">
              {rotating.map((w, i) => (
                <span
                  key={w}
                  className={`hero-rot left-0 top-0 whitespace-nowrap font-display text-sm uppercase tracking-[0.16em] text-white/80 ${
                    i === 0 ? "relative" : "absolute opacity-0"
                  }`}
                >
                  {w}
                </span>
              ))}
            </span>
          </div>

          <p className="hero-line mt-6 max-w-xl text-lg leading-relaxed text-white/75">{t.subtitle}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={localePath(locale, "contacto")} className="hero-cta btn btn-light !px-7 !py-3.5">
              {t.ctaPrimary}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href={localePath(locale, "servicios")} className="hero-cta btn btn-outline-light !px-7 !py-3.5">
              {t.ctaSecondary}
            </Link>
          </div>

          <div className="hero-proof mt-11 flex max-w-md items-center gap-3.5 border-l-2 border-accent pl-4">
            <p className="text-[0.88rem] leading-snug text-white/70">{t.chambers}</p>
          </div>
        </div>
      </div>

      <div className="hero-cue absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
          <span className="h-2 w-1 rounded-full bg-white/60" />
        </span>
      </div>
    </section>
  );
}
