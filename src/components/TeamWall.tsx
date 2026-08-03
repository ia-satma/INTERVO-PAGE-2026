"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import CountUp from "./motion/CountUp";
import { ArrowUpRight } from "./icons";

export type TeamMember = {
  id: string;
  href?: string;
  external?: boolean;
  name: string;
  role: string;
  photo?: string;
  specialties: string[];
  managing?: boolean;
};

export type TeamGroup = {
  id: "partners" | "associates" | "interns" | "administration";
  label: string;
  members: TeamMember[];
  primary?: boolean;
};

type Props = {
  groups: TeamGroup[];
  eyebrow: string;
  specialtiesLabel: string;
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

function MemberLink({ member, className, children }: { member: TeamMember; className: string; children: ReactNode }) {
  if (!member.href) return <div className={className}>{children}</div>;
  if (member.external) {
    return <a href={member.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  return <Link href={member.href} className={className}>{children}</Link>;
}

export default function TeamWall({
  groups,
  eyebrow,
  specialtiesLabel,
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
  const members = useMemo(() => groups.flatMap((group) => group.members), [groups]);
  const areas = useMemo(() => {
    const values = new Set<string>();
    members.forEach((member) => member.specialties.forEach((specialty) => values.add(specialty)));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [members]);
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      members: active ? group.members.filter((member) => member.specialties.includes(active)) : group.members,
    }))
    .filter((group) => group.members.length > 0);

  return (
    <section className="overflow-x-clip border-b border-line bg-paper py-14 md:py-20">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="flex gap-10">
            <span className="eyebrow self-end">{eyebrow}</span>
            <div>
              <CountUp value={members.length} className="block font-serif text-3xl leading-none text-navy" />
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">{statsPartnersLabel}</p>
            </div>
            <div>
              <CountUp value={areas.length} className="block font-serif text-3xl leading-none text-navy" />
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">{statsAreasLabel}</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-2">{filterLabel}</p>
            <div role="group" aria-label={filterLabel} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button type="button" onClick={() => setActive(null)} aria-pressed={active === null} className={`link-underline font-display text-[0.9rem] font-semibold transition-colors ${active === null ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"}`}>
                {filterAllLabel}
              </button>
              {areas.map((area) => (
                <button key={area} type="button" onClick={() => setActive(area)} aria-pressed={active === area} className={`link-underline text-[0.9rem] transition-colors ${active === area ? "text-navy [background-size:100%_1px]" : "text-muted hover:text-navy"}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {filteredGroups.length === 0 ? (
          <div className="mt-14 text-center">
            <p className="mx-auto max-w-md font-serif text-2xl leading-snug text-ink">{filterEmptyLabel}</p>
            <Link href={contactHref} className="btn btn-primary mt-7">{contactLabel}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="mt-12 space-y-16 md:mt-16 md:space-y-20">
            {filteredGroups.map((group, groupIndex) => (
              <Reveal key={group.id} delay={Math.min(groupIndex * 0.04, 0.12)}>
                <div className="mb-6 flex items-end justify-between gap-5 border-b border-line pb-4">
                  <h2 className="font-serif text-3xl text-navy md:text-4xl">{group.label}</h2>
                  <span className="font-serif text-2xl text-muted-2">{String(group.members.length).padStart(2, "0")}</span>
                </div>

                {group.primary ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                    {group.members.map((member) => (
                      <MemberLink key={member.id} member={member} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-950 shadow-soft ring-1 ring-navy/10 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure">
                        {member.photo ? (
                          <Image src={asset(member.photo)} alt={member.name} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
                        ) : (
                          <>
                            <Image src={asset(backgroundImage)} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover opacity-70" />
                            <span aria-hidden className="absolute inset-0 grid place-items-center font-serif text-6xl text-white/20">{initials(member.name)}</span>
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/5 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-accent-soft">{member.role}</p>
                          <p className="mt-1.5 font-serif text-xl leading-[1.05]">{member.name}</p>
                          {member.specialties.length > 0 && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/65"><span className="sr-only">{specialtiesLabel}: </span>{member.specialties.slice(0, 2).join(" · ")}</p>}
                          {member.href && <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90">{viewProfileLabel}<ArrowUpRight className="h-3.5 w-3.5" /></span>}
                        </div>
                      </MemberLink>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member) => (
                      <MemberLink key={member.id} member={member} className={`group flex min-h-28 items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-soft transition-[border-color,transform,box-shadow] duration-300 ${member.href ? "hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-card" : ""}`}>
                        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-navy">
                          {member.photo ? (
                            <Image src={asset(member.photo)} alt={member.name} fill sizes="80px" className="object-cover object-top" />
                          ) : (
                            <><Image src={asset(backgroundImage)} alt="" fill sizes="80px" className="object-cover opacity-65" /><span aria-hidden className="absolute inset-0 grid place-items-center font-serif text-xl text-white/65">{initials(member.name)}</span></>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-azure">{group.label}</span>
                          <span className="mt-1 block font-serif text-xl leading-tight text-ink">{member.name}</span>
                          <span className="mt-1 block text-xs text-muted">{member.role}</span>
                        </span>
                        {member.href && <ArrowUpRight className="h-4 w-4 shrink-0 text-navy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                      </MemberLink>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
