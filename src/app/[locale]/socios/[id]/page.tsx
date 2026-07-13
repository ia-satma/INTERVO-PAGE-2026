import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { BridgeMotif } from "@/components/abstract";
import { ArrowLeft, ArrowUpRight, Award, Mail, Phone, Linkedin } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { PARTNERS, getPartner, localePath, SITE } from "@/lib/site";
import { asset } from "@/lib/asset";

export const dynamicParams = false;

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
  const dict = getDictionary(loc);
  const partner = getPartner(id);
  if (!partner) return {};
  const info = dict.partners[id as keyof typeof dict.partners];
  const title = `${partner.name} — ${info.role} · ${SITE.name}`;
  const description = info.bio;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/socios/${id}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/socios/${id}`])),
    },
  };
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const partner = getPartner(id);
  if (!partner) notFound();

  const info = dict.partners[id as keyof typeof dict.partners];
  const t = dict.socios;
  const others = PARTNERS.filter((p) => p.id !== id);
  const index = PARTNERS.findIndex((p) => p.id === id) + 1;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-mist pb-16 pt-32 md:pb-20 md:pt-40">
        <BridgeMotif className="pointer-events-none absolute -right-16 -top-6 hidden w-[34rem] text-navy/[0.06] md:block" />
        <div className="container-x relative">
          <Reveal>
            <Link
              href={localePath(loc, "socios")}
              className="inline-flex items-center gap-2 font-display text-sm font-semibold text-muted transition-colors hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.profile.back}
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-4">
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-card">
                <Image
                  src={asset(partner.photo)}
                  alt={partner.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
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
                const oInfo = dict.partners[p.id as keyof typeof dict.partners];
                return (
                  <Link
                    key={p.id}
                    href={localePath(loc, `socios/${p.id}`)}
                    className="group flex items-center gap-3.5 rounded-xl border border-line bg-white p-3.5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-mist">
                      <Image
                        src={asset(p.photo)}
                        alt={p.name}
                        fill
                        className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                        sizes="56px"
                      />
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
