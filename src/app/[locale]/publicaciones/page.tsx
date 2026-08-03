import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import InsightCard from "@/components/InsightCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { resolveNavigationLink } from "@/lib/cms/links";
import { buildPageMetadata } from "@/lib/seo";

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
    title: dict.meta.publicaciones.title,
    description: dict.meta.publicaciones.description,
    siteConfig,
    canonical: resolveNavigationLink(siteConfig, loc, "publicaciones"),
    es: resolveNavigationLink(siteConfig, "es", "publicaciones"),
    en: resolveNavigationLink(siteConfig, "en", "publicaciones"),
  });
}

export default async function PublicacionesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  if (siteConfig.navigation.find((item) => item.key === "publicaciones")?.visible === false) notFound();
  const t = dict.insights;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <section className="section">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.06}>
                <InsightCard item={item} readMore={t.readMore} backgroundImage={siteConfig.media.insightCardBackground} />
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-2">{t.note}</p>
        </div>
      </section>

      <CTASection locale={loc} title={dict.home.cta.title} body={dict.home.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
