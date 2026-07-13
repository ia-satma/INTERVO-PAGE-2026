"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PartnerCard from "./PartnerCard";
import FeaturedPartner from "./FeaturedPartner";
import Reveal from "./Reveal";
import { ArrowUpRight } from "./icons";

export type DirectoryPartner = {
  id: string;
  href: string;
  name: string;
  role: string;
  photo: string;
  chambers: string | null;
  specialties: string[];
  managing?: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
};

type Props = {
  partners: DirectoryPartner[];
  specialtiesLabel: string;
  chambersLabel: string;
  viewProfileLabel: string;
  filterLabel: string;
  filterAllLabel: string;
  filterEmptyLabel: string;
  contactHref: string;
  contactLabel: string;
  statsPartnersLabel: string;
  statsAreasLabel: string;
};

/** Client-side directory: filter chips by practice area (no backend needed at
 * this scale), a masthead treatment for the Managing Partner, and an
 * editorial alternating roster for the rest — filtering both together so the
 * chips stay meaningful. */
export default function SociosDirectory({
  partners,
  specialtiesLabel,
  chambersLabel,
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
  const managing = filtered.find((p) => p.managing);
  const rest = filtered.filter((p) => !p.managing);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 border-b border-line pb-8">
        <div className="flex gap-10">
          <div>
            <span className="font-serif text-4xl leading-none text-navy md:text-5xl">
              {String(partners.length).padStart(2, "0")}
            </span>
            <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {statsPartnersLabel}
            </p>
          </div>
          <div>
            <span className="font-serif text-4xl leading-none text-navy md:text-5xl">
              {String(areas.length).padStart(2, "0")}
            </span>
            <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {statsAreasLabel}
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-2">{filterLabel}</p>
          <div role="group" aria-label={filterLabel} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-pressed={active === null}
              className={`link-underline font-display text-[0.92rem] font-semibold transition-colors ${
                active === null ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"
              }`}
            >
              {filterAllLabel}
            </button>
            {areas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setActive(area)}
                aria-pressed={active === area}
                className={`link-underline text-[0.92rem] transition-colors ${
                  active === area ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="mx-auto max-w-md font-serif text-2xl leading-snug text-ink">{filterEmptyLabel}</p>
          <Link href={contactHref} className="btn btn-primary mt-7">
            {contactLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {managing && (
            <Reveal className="mt-12">
              <FeaturedPartner
                href={managing.href}
                name={managing.name}
                role={managing.role}
                photo={managing.photo}
                chambers={managing.chambers}
                chambersLabel={chambersLabel}
                specialties={managing.specialties}
                specialtiesLabel={specialtiesLabel}
                activeSpecialty={active}
                email={managing.email}
                phoneDisplay={managing.phoneDisplay}
                phoneHref={managing.phoneHref}
                viewProfileLabel={viewProfileLabel}
              />
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className={managing ? "mt-4" : "mt-6"}>
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 2) * 0.05}>
                  <PartnerCard
                    href={p.href}
                    index={i + 1}
                    name={p.name}
                    role={p.role}
                    photo={p.photo}
                    chambers={p.chambers}
                    specialties={p.specialties}
                    specialtiesLabel={specialtiesLabel}
                    activeSpecialty={active}
                    email={p.email}
                    phoneDisplay={p.phoneDisplay}
                    phoneHref={p.phoneHref}
                    viewProfileLabel={viewProfileLabel}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
