import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import InsightCard from "@/components/InsightCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  return {
    title: dict.meta.publicaciones.title,
    description: dict.meta.publicaciones.description,
    alternates: {
      canonical: `/${locale}/publicaciones`,
      languages: { es: "/es/publicaciones", en: "/en/publicaciones" },
    },
  };
}

export default async function PublicacionesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.insights;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <section className="section">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.06}>
                <InsightCard item={item} readMore={t.readMore} />
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
