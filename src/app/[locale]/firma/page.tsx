import type { Metadata } from "next";
import Image from "next/image";
import { asset } from "@/lib/asset";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import ValueCard from "@/components/ValueCard";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { resolveNavigationLink } from "@/lib/cms/links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  return {
    title: dict.meta.firma.title,
    description: dict.meta.firma.description,
    alternates: {
      canonical: resolveNavigationLink(siteConfig, loc, "firma"),
      languages: {
        es: resolveNavigationLink(siteConfig, "es", "firma"),
        en: resolveNavigationLink(siteConfig, "en", "firma"),
      },
    },
  };
}

export default async function FirmaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const t = dict.firma;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      {/* Story */}
      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t.story.eyebrow} title={t.story.title} />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
              {t.story.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal>
            <div className="overflow-hidden rounded-2xl shadow-card">
              <Image
                src={asset(siteConfig.media.firmImage)}
                alt={t.story.imageAlt}
                width={1100}
                height={760}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow={t.values.eyebrow} title={t.values.title} align="center" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.valuesData.map((v, i) => (
              <Reveal key={v.key} delay={i * 0.06}>
                <ValueCard id={v.key} title={v.title} desc={v.desc} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="section">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-14 text-white md:px-14 md:py-16">
            <Image
              src={asset(siteConfig.media.firmRecognitionBackground)}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 80rem"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-navy/55" />
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <SectionHeading eyebrow={t.recognition.eyebrow} title={t.recognition.title} subtitle={t.recognition.body} tone="light" />
              <div className="grid gap-4">
                {t.recognition.badges.map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-4">
                    <span className="font-display font-medium text-white">{b.name}</span>
                    <span className="shrink-0 rounded-full bg-azure-bright/15 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-wide text-azure-bright">
                      {b.band}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
