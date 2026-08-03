import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TeamWall, { type TeamGroup, type TeamMember } from "@/components/TeamWall";
import CTASection from "@/components/CTASection";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { resolveNavigationLink } from "@/lib/cms/links";
import { buildPageMetadata } from "@/lib/seo";
import type { OrganizationMember } from "@/lib/site";

function practiceAreaLabels(
  person: OrganizationMember,
  locale: "es" | "en",
  services: {
    featured: Record<string, { title: string }>;
    other: Record<string, string>;
  },
) {
  const catalogLabels = (person.practiceAreaIds ?? []).flatMap((id) => {
    const label = services.featured[id]?.title ?? services.other[id];
    return label ? [label] : [];
  });
  const additional = locale === "es" ? person.specialtiesEs ?? [] : person.specialtiesEn ?? [];
  return Array.from(new Set([...catalogLabels, ...additional]));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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
  const partnerProfiles = dict.partners as Record<string, { role: string; specialties: string[]; bio: string }>;
  const partnersById = new Map(
    siteConfig.partners.filter((partner) => partner.visible !== false).map((partner) => [partner.id, partner]),
  );

  const partnerMembers: TeamMember[] = siteConfig.organization.partners.flatMap((person) => {
    const partner = partnersById.get(person.id);
    if (!partner) return [];
    const profile = partnerProfiles[partner.id] ?? { role: t.partnerLabel, specialties: [], bio: "" };
    const hasControlledPracticeAreas = person.practiceAreaIds !== undefined || person.specialtiesEs !== undefined || person.specialtiesEn !== undefined;
    return [{
      id: partner.id,
      href: resolveNavigationLink(siteConfig, loc, "socios", partner.id),
      name: partner.name,
      role: profile.role,
      photo: partner.cardPhoto ?? partner.photo,
      specialties: hasControlledPracticeAreas ? practiceAreaLabels(person, loc, dict.services) : profile.specialties,
      managing: partner.managing,
    }];
  });

  const additionalMembers = (members: OrganizationMember[], fallbackRole: string): TeamMember[] =>
    members.filter((person) => person.visible !== false).map((person) => ({
      id: person.id,
      href: person.linkedin?.trim() || undefined,
      external: Boolean(person.linkedin?.trim()),
      name: person.name,
      role: (loc === "es" ? person.roleEs : person.roleEn) || fallbackRole,
      photo: person.photo,
      specialties: practiceAreaLabels(person, loc, dict.services),
    }));

  const groups: TeamGroup[] = [
    { id: "partners", label: org.partners, members: partnerMembers, primary: true },
    { id: "associates", label: org.lawyers, members: additionalMembers(siteConfig.organization.lawyers, org.lawyers) },
    { id: "interns", label: org.interns, members: additionalMembers(siteConfig.organization.interns, org.interns) },
    { id: "administration", label: org.administration, members: additionalMembers(siteConfig.organization.administration, org.administration) },
  ];

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />
      <TeamWall
        groups={groups}
        eyebrow={t.teamWall.eyebrow}
        specialtiesLabel={t.specialtiesLabel}
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
      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
