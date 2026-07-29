import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import StructuredData from "@/components/StructuredData";
import { ArrowLeft, ArrowUpRight, Award, Mail, Phone, Linkedin } from "@/components/icons";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { PARTNERS, type OrganizationMember } from "@/lib/site";
import { asset } from "@/lib/asset";
import { resolveNavigationLink } from "@/lib/cms/links";
import { buildPageMetadata, buildPersonSchema } from "@/lib/seo";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`;
}

function practiceAreaLabels(
  person: OrganizationMember,
  locale: "es" | "en",
  services: {
    featured: Record<string, { title: string }>;
    other: Record<string, string>;
  },
) {
  const catalogLabels = (person.practiceAreaIds ?? []).flatMap((practiceId) => {
    const label = services.featured[practiceId]?.title ?? services.other[practiceId];
    return label ? [label] : [];
  });
  const additional = locale === "es" ? person.specialtiesEs ?? [] : person.specialtiesEn ?? [];
  return Array.from(new Set([...catalogLabels, ...additional]));
}

export function generateStaticParams() {
  return PARTNERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const partner = siteConfig.partners.find((item) => item.id === id && item.visible !== false);
  if (!partner) return {};
  const info = (dict.partners as Record<string, { role: string; specialties: string[]; bio: string }>)[id];
  if (!info) return {};
  const title = `${partner.name} — ${info.role} · ${siteConfig.site.name}`;
  const description = info.bio;
  return buildPageMetadata({
    locale: loc,
    title,
    description,
    siteConfig,
    canonical: resolveNavigationLink(siteConfig, loc, "socios", id),
    es: resolveNavigationLink(siteConfig, "es", "socios", id),
    en: resolveNavigationLink(siteConfig, "en", "socios", id),
    image: partner.photo,
  });
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const partner = siteConfig.partners.find((item) => item.id === id && item.visible !== false);
  if (!partner) notFound();

  const profiles = dict.partners as Record<string, { role: string; specialties: string[]; bio: string }>;
  const profileInfo = profiles[id] ?? {
    role: partner.managing ? dict.socios.managingLabel : dict.socios.partnerLabel,
    specialties: [],
    bio: "",
  };
  const organizationMember = siteConfig.organization.partners.find((person) => person.id === id);
  const hasControlledPracticeAreas = Boolean(
    organizationMember &&
    (
      organizationMember.practiceAreaIds !== undefined ||
      organizationMember.specialtiesEs !== undefined ||
      organizationMember.specialtiesEn !== undefined
    ),
  );
  const info = {
    ...profileInfo,
    specialties:
      hasControlledPracticeAreas && organizationMember
        ? practiceAreaLabels(organizationMember, loc, dict.services)
        : profileInfo.specialties,
  };
  const t = dict.socios;
  const visiblePartners = siteConfig.partners.filter((item) => item.visible !== false);
  const others = visiblePartners.filter((p) => p.id !== id);
  const index = visiblePartners.findIndex((p) => p.id === id) + 1;
  const profileUrl = resolveNavigationLink(siteConfig, loc, "socios", id);
  const personSchema = buildPersonSchema({
    locale: loc,
    siteConfig,
    id,
    name: partner.name,
    role: info.role,
    bio: info.bio,
    specialties: info.specialties,
    photo: partner.photo,
    email: partner.email,
    phone: partner.phoneDisplay,
    linkedin: partner.linkedin,
    recognition: partner.chambers,
    url: profileUrl,
  });

  return (
    <>
      <StructuredData id={`intervo-person-${id}`} data={personSchema} />
      <section className="relative overflow-hidden border-b border-line bg-mist pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="container-x relative">
          <Reveal>
            <Link
              href={resolveNavigationLink(siteConfig, loc, "socios")}
              className="inline-flex items-center gap-2 font-display text-sm font-semibold text-muted transition-colors hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.profile.back}
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-4">
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-card">
                {partner.photo ? (
                  <Image
                    src={asset(partner.photo)}
                    alt={partner.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <>
                    <Image
                      src={asset(siteConfig.media.teamBackground)}
                      alt=""
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center bg-navy-950/55 font-serif text-8xl text-white/35"
                    >
                      {initials(partner.name)}
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.08} className="relative lg:col-span-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 right-0 hidden font-serif text-[7rem] leading-none text-navy/[0.05] md:block lg:-top-10 lg:text-[9rem]"
              >
                {String(index).padStart(2, "0")}
              </span>
              <span className="eyebrow">{info.role}</span>
              <h1 className="display-1 mt-5">{partner.name}</h1>
              {partner.chambers && (
                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.07] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-deep">
                  <Award className="h-3.5 w-3.5" />
                  {t.profile.chambersLabel} · Chambers · {partner.chambers}
                </span>
              )}
              <p className="lead mt-7 max-w-2xl text-muted">{info.bio}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-muted-2">
              {t.profile.practiceLabel}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {info.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-line bg-white px-4 py-2 text-[0.92rem] text-ink/85"
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9 lg:self-start lg:sticky lg:top-28">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-muted-2">
              {t.profile.contactLabel}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={`mailto:${partner.email}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[0.95rem] text-ink/85 transition-colors hover:border-navy/30"
              >
                <Mail className="h-4 w-4 shrink-0 text-azure" />
                <span className="truncate">{partner.email}</span>
              </a>
              <a
                href={partner.phoneHref}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[0.95rem] text-ink/85 transition-colors hover:border-navy/30"
              >
                <Phone className="h-4 w-4 shrink-0 text-azure" />
                {partner.phoneDisplay}
              </a>
              {partner.linkedin && (
                <a
                  href={partner.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[0.95rem] text-ink/85 transition-colors hover:border-navy/30"
                >
                  <Linkedin className="h-4 w-4 shrink-0 text-azure" />
                  LinkedIn
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-mist py-16 md:py-20">
        <div className="container-x">
          <Reveal>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-muted-2">
              {t.otherPartners}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((p) => {
                const oInfo = profiles[p.id] ?? {
                  role: p.managing ? t.managingLabel : t.partnerLabel,
                  specialties: [],
                  bio: "",
                };
                return (
                  <Link
                    key={p.id}
                    href={resolveNavigationLink(siteConfig, loc, "socios", p.id)}
                    className="group flex items-center gap-3.5 rounded-xl border border-line bg-white p-3.5 transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-mist">
                      {p.photo ? (
                        <Image
                          src={asset(p.photo)}
                          alt={p.name}
                          fill
                          className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                          sizes="56px"
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center bg-navy font-display text-xs font-semibold text-white">
                          {initials(p.name)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-base leading-tight transition-colors group-hover:text-navy">
                        {p.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[0.82rem] text-azure">
                        {oInfo.role}
                        <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
