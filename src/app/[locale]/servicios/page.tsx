import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { ServiceIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { FEATURED_SERVICES, OTHER_SERVICES } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  return {
    title: dict.meta.servicios.title,
    description: dict.meta.servicios.description,
    alternates: { canonical: `/${locale}/servicios`, languages: { es: "/es/servicios", en: "/en/servicios" } },
  };
}

export default async function ServiciosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.servicios;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      {/* Featured specialties */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow={t.featuredHeading} title={dict.home.services.title} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SERVICES.map((id, i) => (
              <Reveal key={id} delay={i * 0.05}>
                <ServiceCard
                  id={id}
                  index={String(i + 1).padStart(2, "0")}
                  title={dict.services.featured[id].title}
                  desc={dict.services.featured[id].desc}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="+" title={t.otherHeading} subtitle={t.otherSubtitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OTHER_SERVICES.map((id, i) => (
              <Reveal key={id} delay={(i % 3) * 0.05}>
                <div className="flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-4 transition-[translate,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-card">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mist text-navy">
                    <ServiceIcon id={id} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-[0.98rem] font-medium leading-tight">
                    {dict.services.other[id as keyof typeof dict.services.other]}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
