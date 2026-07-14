"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import CountUp from "./motion/CountUp";
import { ArrowUpRight, Award } from "./icons";

export type TeamMember = {
  id: string;
  href: string;
  name: string;
  role: string;
  photo: string;
  specialties: string[];
  managing?: boolean;
};

type Props = {
  partners: TeamMember[];
  eyebrow: string;
  specialtiesLabel: string;
  managingLabel: string;
  viewProfileLabel: string;
  filterLabel: string;
  filterAllLabel: string;
  filterEmptyLabel: string;
  contactHref: string;
  contactLabel: string;
  statsPartnersLabel: string;
  statsAreasLabel: string;
};

/** The team page's single "meet everyone" moment: a full-bleed navy-duotone
 * wall of faces that widens under the cursor, turns to color, and opens up
 * to reveal role/specialties/profile-link — one interactive surface instead
 * of a static photo strip plus a separate text roster below it. */
export default function TeamWall({
  partners,
  eyebrow,
  specialtiesLabel,
  managingLabel,
  viewProfileLabel,
  filterLabel,
  filterAllLabel,
  filterEmptyLabel,
  contactHref,
  contactLabel,
  statsPartnersLabel,
  statsAreasLabel,
}: Props) {
  const [active, setActive] = useState<string | null>(null);

  const areas = useMemo(() => {
    const set = new Set<string>();
    partners.forEach((p) => p.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [partners]);

  const filtered = active ? partners.filter((p) => p.specialties.includes(active)) : partners;

  return (
    <section className="border-b border-line bg-paper py-14 md:py-20">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="flex gap-10">
            <span className="eyebrow self-end">{eyebrow}</span>
            <div>
              <CountUp value={partners.length} className="block font-serif text-3xl leading-none text-navy" />
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {statsPartnersLabel}
              </p>
            </div>
            <div>
              <CountUp value={areas.length} className="block font-serif text-3xl leading-none text-navy" />
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {statsAreasLabel}
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">{filterLabel}</p>
            <div role="group" aria-label={filterLabel} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-pressed={active === null}
                style={{ animationDelay: "0.05s" }}
                className={`chip-anim link-underline font-display text-[0.9rem] font-semibold transition-colors ${
                  active === null ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"
                }`}
              >
                {filterAllLabel}
              </button>
              {areas.map((area, i) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setActive(area)}
                  aria-pressed={active === area}
                  style={{ animationDelay: `${0.05 + Math.min(i + 1, 10) * 0.03}s` }}
                  className={`chip-anim link-underline text-[0.9rem] transition-colors ${
                    active === area ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {filtered.length === 0 ? (
        <div className="container-x mt-14 text-center">
          <p className="mx-auto max-w-md font-serif text-2xl leading-snug text-ink">{filterEmptyLabel}</p>
          <Link href={contactHref} className="btn btn-primary mt-7">
            {contactLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <Reveal delay={0.1} className="mt-10 md:mt-12">
          <div className="grain relative flex h-[440px] snap-x snap-mandatory overflow-x-auto md:h-[62vh] md:max-h-[660px] md:snap-none md:overflow-visible">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="wall-tile group relative h-full w-[82vw] shrink-0 snap-center transition-[flex-grow] duration-500 ease-[var(--ease-out-expo)] md:w-auto md:flex-1 md:hover:flex-[2.6] md:focus-within:flex-[2.6]"
              >
                <Link href={p.href} className="absolute inset-0 block overflow-hidden focus-visible:z-10">
                  <Image
                    src={asset(p.photo)}
                    alt={p.name}
                    fill
                    className="wall-tile-photo object-cover grayscale transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.08] group-hover:grayscale-0 group-focus-within:grayscale-0"
                    sizes="(max-width: 767px) 82vw, 22vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-0 group-focus-within:opacity-0"
                    style={{ background: "var(--color-navy-900)" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />

                  {p.managing && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-navy-950/60 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5" />
                      {managingLabel}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-[0.82rem] font-medium text-white/70">{p.role}</p>
                    <p className="mt-1 truncate font-serif text-xl leading-tight text-white">{p.name}</p>

                    <div className="mt-3 grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-within:grid-rows-[1fr]">
                      <div className="flex flex-wrap gap-1.5 overflow-hidden opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <p className="w-full text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                          {specialtiesLabel}
                        </p>
                        {p.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[0.72rem] leading-none text-white/85"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="mt-3 flex items-center gap-1.5 font-display text-sm font-semibold text-white opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      {viewProfileLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </section>
  );
}
