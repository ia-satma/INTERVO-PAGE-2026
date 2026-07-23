import type { Metadata } from "next";
import Image from "next/image";
import { asset } from "@/lib/asset";
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
      <section className="relative overflow-hidden bg-mist">
        <Image
          src={asset("/images/textures/brand-shapes-light-2.webp")}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-mist/50" />
        <div className="section container-x relative">
          <SectionHeading eyebrow="+" title={t.otherHeading} subtitle={t.otherSubtitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OTHER_SERVICES.map((id, i) => (
              <Reveal key={id} delay={i * 0.04} y={24}>
                <div className="group relative flex min-h-[6.5rem] overflow-hidden rounded-xl bg-navy-950 px-5 py-5 shadow-card transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-soft">
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy to-azure" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-white/8" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/12 transition-colors duration-500 group-hover:ring-accent-soft/45" />

                  <div className="relative z-10 flex w-full items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white text-navy shadow-soft transition-colors duration-500 group-hover:bg-accent-soft group-hover:text-navy-950">
                      <ServiceIcon id={id} className="h-5 w-5" />
                    </span>
                    <span className="font-display text-[0.98rem] font-semibold leading-tight text-white">
                      {dict.services.other[id as keyof typeof dict.services.other]}
                    </span>
                    <span className="ml-auto self-start font-display text-xs font-semibold text-white/45">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
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
