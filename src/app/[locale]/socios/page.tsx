import type { Metadata } from "next";
import Image from "next/image";
import { asset } from "@/lib/asset";
import PageHeader from "@/components/PageHeader";
import PartnerCard from "@/components/PartnerCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { PARTNERS, localePath } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  return {
    title: dict.meta.socios.title,
    description: dict.meta.socios.description,
    alternates: { canonical: `/${locale}/socios`, languages: { es: "/es/socios", en: "/en/socios" } },
  };
}

export default async function SociosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.socios;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      {/* Group photo */}
      <section className="pt-14">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl shadow-card">
              <Image
                src={asset("/images/partners-group.jpg")}
                alt="Socios de intervø — Monterrey"
                width={1800}
                height={900}
                className="h-full w-full object-cover"
                sizes="100vw"
                priority
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Partner cards */}
      <section className="section pt-16">
        <div className="container-x">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((p, i) => {
              const info = dict.partners[p.id as keyof typeof dict.partners];
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.05}>
                  <PartnerCard
                    href={localePath(loc, `socios/${p.id}`)}
                    name={p.name}
                    role={info.role}
                    photo={p.photo}
                    chambers={p.chambers}
                    specialties={info.specialties}
                    specialtiesLabel={t.specialtiesLabel}
                    managing={p.managing}
                    email={p.email}
                    phoneDisplay={p.phoneDisplay}
                    phoneHref={p.phoneHref}
                    viewProfileLabel={t.viewProfile}
                  />
                </Reveal>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-muted-2">{t.note}</p>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
