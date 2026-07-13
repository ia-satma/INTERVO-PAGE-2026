import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { BridgeMotif } from "@/components/abstract";
import { ArrowLeft, Mail, Phone, Linkedin } from "@/components/icons";
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

            <Reveal delay={0.08} className="lg:col-span-8">
              <span className="eyebrow">{info.role}</span>
              <h1 className="display-1 mt-5">{partner.name}</h1>
              {partner.chambers && (
                <span className="tag mt-5 inline-flex w-fit rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1.5">
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
          <div className="lg:col-span-7">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-muted-2">
              {t.profile.practiceLabel}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {info.specialties.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] text-ink/85"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
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
          </div>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
