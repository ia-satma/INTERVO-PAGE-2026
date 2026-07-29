import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import TeamWall from "@/components/TeamWall";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { asset } from "@/lib/asset";
import { resolveNavigationLink } from "@/lib/cms/links";
import { buildPageMetadata } from "@/lib/seo";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  return buildPageMetadata({
    locale: loc,
    title: dict.meta.socios.title,
    description: dict.meta.socios.description,
    siteConfig,
    canonical: resolveNavigationLink(siteConfig, loc, "socios"),
    es: resolveNavigationLink(siteConfig, "es", "socios"),
    en: resolveNavigationLink(siteConfig, "en", "socios"),
  });
}

export default async function SociosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const t = dict.socios;
  const org = t.organization;
  const partnerProfiles = dict.partners as Record<
    string,
    { role: string; specialties: string[]; bio: string }
  >;

  const partnersById = new Map(
    siteConfig.partners.filter((partner) => partner.visible !== false).map((partner) => [partner.id, partner]),
  );
  const partnerMembers = siteConfig.organization.partners.flatMap((person) => {
    const p = partnersById.get(person.id);
    if (!p) return [];
    const info = partnerProfiles[p.id] ?? {
      role: p.managing ? t.managingLabel : t.partnerLabel,
      specialties: [],
      bio: "",
    };
    return [{
      id: p.id,
      href: resolveNavigationLink(siteConfig, loc, "socios", p.id),
      name: p.name,
      role: info.role,
      photo: p.photo,
      specialties: info.specialties,
      managing: p.managing,
    }];
  });

  const members = [
    ...partnerMembers,
    ...siteConfig.organization.lawyers.map((person) => ({
      id: person.id,
      name: person.name,
      role: org.lawyers,
      photo: person.photo,
      specialties: [],
    })),
    ...siteConfig.organization.interns.map((person) => ({
      id: person.id,
      name: person.name,
      role: org.interns,
      photo: person.photo,
      specialties: [],
    })),
    ...siteConfig.organization.administration.map((person) => ({
      id: person.id,
      name: person.name,
      role: org.administration,
      photo: person.photo,
      specialties: [],
    })),
  ];

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <TeamWall
        members={members}
        eyebrow={t.teamWall.eyebrow}
        specialtiesLabel={t.specialtiesLabel}
        managingLabel={t.managingLabel}
        viewProfileLabel={t.viewProfile}
        filterLabel={t.filter.label}
        filterAllLabel={t.filter.all}
        filterEmptyLabel={t.filter.empty}
        contactHref={resolveNavigationLink(siteConfig, loc, "contacto")}
        contactLabel={dict.actions.contact}
        statsPartnersLabel={t.stats.partners}
        statsAreasLabel={t.stats.areas}
        backgroundImage={siteConfig.media.teamBackground}
      />

      <div className="container-x">
        <p className="mt-8 text-sm text-muted-2">{t.note}</p>
      </div>

      <section className="relative overflow-hidden bg-mist py-20 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={org.eyebrow} title={org.title} subtitle={org.subtitle} align="center" />

          <Reveal className="mt-12">
            <div className="mx-auto max-w-xs rounded-xl border border-line bg-white px-6 py-4 text-center shadow-card">
              <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-2">
                {siteConfig.site.legalName}
              </p>
              <p className="mt-1 font-serif text-2xl text-navy">{org.partners}</p>
            </div>

            <div className="mx-auto h-8 w-px bg-navy/25" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {siteConfig.organization.partners.map((person) => (
                <div
                  key={person.name}
                  className="flex min-h-[12rem] flex-col items-center justify-center rounded-xl bg-navy px-4 py-5 text-center shadow-card"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/25 bg-navy-950 shadow-soft">
                    {person.photo ? (
                      <Image
                        src={asset(person.photo)}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center font-display text-lg font-semibold text-white">
                        {initials(person.name)}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 font-serif text-xl leading-tight text-white">{person.name}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto h-10 w-px bg-navy/25" />
            <div className="mx-auto mb-8 h-px w-full max-w-5xl bg-navy/25" />

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { label: org.lawyers, items: siteConfig.organization.lawyers },
                { label: org.interns, items: siteConfig.organization.interns },
                { label: org.administration, items: siteConfig.organization.administration },
              ].map((group) => (
                <div key={group.label}>
                  <div className="rounded-t-xl bg-navy-950 px-5 py-4">
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
                      {group.label}
                    </p>
                  </div>
                  <div className="grid gap-2 rounded-b-xl border border-t-0 border-line bg-white p-3 shadow-card">
                    {group.items.map((person) => (
                      <div key={person.name} className="flex items-center gap-3 rounded-lg bg-mist px-3 py-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-navy">
                          {person.photo ? (
                            <Image
                              src={asset(person.photo)}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <span
                              aria-hidden
                              className="grid h-full w-full place-items-center font-display text-xs font-semibold text-white"
                            >
                              {initials(person.name)}
                            </span>
                          )}
                        </div>
                        <p className="font-display text-[0.98rem] font-semibold leading-tight text-ink">
                          {person.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
