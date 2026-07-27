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
  href?: string;
  name: string;
  role: string;
  photo?: string;
  specialties: string[];
  managing?: boolean;
};

type Props = {
  members: TeamMember[];
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
  backgroundImage?: string;
};

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`;
}

/** The team page's single "meet everyone" moment: the complete organization
 * follows the official chart order. Existing portraits use the firm's real
 * photography; photo-pending members use a branded monogram tile. */
export default function TeamWall({
  members,
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
  backgroundImage = "/images/textures/brand-shapes-navy-2.webp",
}: Props) {
  const [active, setActive] = useState<string | null>(null);

  const areas = useMemo(() => {
    const set = new Set<string>();
    members.forEach((p) => p.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [members]);

  const filtered = active ? members.filter((p) => p.specialties.includes(active)) : members;

  return (
    <section className="overflow-x-clip border-b border-line bg-paper py-14 md:py-20">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="flex gap-10">
            <span className="eyebrow self-end">{eyebrow}</span>
            <div>
              <CountUp value={members.length} className="block font-serif text-3xl leading-none text-navy" />
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
          <div className="grain relative flex h-[440px] snap-x snap-mandatory overflow-x-auto md:h-[62vh] md:max-h-[660px]">
            {filtered.map((p) => {
              const content = (
                <>
                  {p.photo ? (
                    <>
                      <Image
                        src={asset(p.photo)}
                        alt={p.name}
                        fill
                        className="wall-tile-photo object-cover grayscale transition-[filter,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.08] group-hover:grayscale-0 group-focus-within:grayscale-0"
                        sizes="(max-width: 767px) 82vw, 18rem"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-0 group-focus-within:opacity-0"
                        style={{ background: "var(--color-navy-900)" }}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src={asset(backgroundImage)}
                        alt=""
                        fill
                        className="object-cover opacity-65 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                        sizes="(max-width: 767px) 82vw, 18rem"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-navy-950/55" />
                      <span
                        aria-hidden
                        className="absolute inset-0 grid place-items-center font-serif text-[clamp(5rem,10vw,9rem)] font-medium tracking-[-0.06em] text-white/20"
                      >
                        {initials(p.name)}
                      </span>
                    </>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />

                  {p.managing && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-navy-950/60 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5" />
                      {managingLabel}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-[0.82rem] font-medium text-white/70">{p.role}</p>
                    <p className="mt-1 font-serif text-xl leading-tight text-white">{p.name}</p>

                    {p.specialties.length > 0 && (
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
                    )}

                    {p.href && (
                      <span className="mt-3 flex items-center gap-1.5 font-display text-sm font-semibold text-white opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        {viewProfileLabel}
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <div
                  key={p.id}
                  className="wall-tile group relative h-full w-[82vw] shrink-0 snap-center overflow-hidden transition-[width] duration-500 ease-[var(--ease-out-expo)] md:w-72 md:hover:w-[34rem] md:focus-within:w-[34rem]"
                >
                  {p.href ? (
                    <Link href={p.href} className="absolute inset-0 block overflow-hidden focus-visible:z-10">
                      {content}
                    </Link>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden" aria-label={`${p.role}: ${p.name}`}>
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </section>
  );
}
