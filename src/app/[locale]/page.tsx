import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import Counter from "@/components/motion/Counter";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { asset } from "@/lib/asset";
import { resolveHomeLink, resolveNavigationLink } from "@/lib/cms/links";
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
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    siteConfig,
    canonical: resolveHomeLink(siteConfig, loc),
    es: resolveHomeLink(siteConfig, "es"),
    en: resolveHomeLink(siteConfig, "en"),
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const t = dict.home;
  const partnersById = new Map(
    siteConfig.partners.filter((partner) => partner.visible !== false).map((partner) => [partner.id, partner]),
  );
  const orderedPartners = siteConfig.organization.partners.flatMap((person) => {
    const partner = partnersById.get(person.id);
    return partner ? [partner] : [];
  });
  const recognizedPartners = orderedPartners.filter((partner) => Boolean(partner.chambers));
  const recognizedCountLabel = loc === "es" ? "Socios reconocidos" : "Recognized partners";
  const partnersLabel = loc === "es" ? "Socios" : "Partners";
  const recognitionTopicLabel = "Corporate/Commercial: Monterrey";

  return (
    <>
      <Hero
        content={t.hero}
        media={{
          homeHero: siteConfig.media.homeHero,
          isotypeWhite: siteConfig.media.isotypeWhite,
          heroVideo: siteConfig.media.heroVideo,
          heroPoster: siteConfig.media.heroPoster,
        }}
        primaryHref={resolveNavigationLink(siteConfig, loc, "contacto")}
        secondaryHref={resolveNavigationLink(siteConfig, loc, "servicios")}
      />

      <div className="container-x relative z-10 -mt-14 md:-mt-20">
        <Reveal>
          <div className="grid grid-cols-2 gap-y-8 rounded-2xl border border-line bg-white px-8 py-9 shadow-card md:grid-cols-4 md:gap-8 md:px-12">
            {t.stats.map((s) => (
              <div key={s.label} className="border-line md:border-l md:pl-8 md:first:border-l-0 md:first:pl-0">
                <Counter
                  value={s.value}
                  className="block font-serif text-3xl font-medium tracking-tight text-navy md:text-4xl"
                />
                <div className="mt-2 text-[0.82rem] leading-snug text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <section className="py-20 md:py-24">
        <div className="container-x text-center">
          <Reveal>
            <div className="flex justify-center">
              <span className="eyebrow eyebrow--center">{t.brandStatement.eyebrow}</span>
            </div>
            <h2 className="display-2 mx-auto mt-6 max-w-4xl">{t.brandStatement.title}</h2>
            <p className="lead mx-auto mt-7 max-w-2xl text-muted">{t.brandStatement.body}</p>
            <Link href={resolveNavigationLink(siteConfig, loc, "firma")} className="btn btn-primary mt-9 !px-7 !py-3.5">
              {t.brandStatement.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} subtitle={t.services.subtitle} />
            <Link href={resolveNavigationLink(siteConfig, loc, "servicios")} className="btn btn-ghost shrink-0 !px-5 !py-2.5 text-[0.85rem]">
              {t.services.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.featuredServices.slice(0, 4).map((id, i) => (
              <Reveal key={id} delay={i * 0.05}>
                <ServiceCard
                  id={id}
                  index={String(i + 1).padStart(2, "0")}
                  title={dict.services.featured[id].title}
                  desc={dict.services.featured[id].desc}
                  image={siteConfig.media.serviceImages[id]}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mist">
        <Image
          src={asset(siteConfig.media.homeServicesBackground)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-mist/50" />
        <div className="container-x relative grid gap-6 py-20 md:py-24 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card md:p-7">
              <div className="flex items-start justify-between gap-6 border-b border-line pb-6">
                <div>
                  <span className="eyebrow">{t.recognition.eyebrow}</span>
                  <h2 className="mt-5 max-w-xl font-serif text-3xl leading-[1.02] text-ink md:text-4xl">
                    {t.recognition.title}
                  </h2>
                </div>
                <div className="hidden min-w-24 text-right sm:block">
                  <span className="block font-serif text-6xl leading-none text-navy">{String(recognizedPartners.length).padStart(2, "0")}</span>
                  <span className="mt-2 block text-[0.62rem] font-semibold uppercase leading-snug tracking-[0.22em] text-muted">
                    {recognizedCountLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-2">{partnersLabel}</span>
                  <span className="font-serif text-xl text-navy">{String(orderedPartners.length).padStart(2, "0")}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {orderedPartners.map((partner) => (
                  <Link
                    key={partner.name}
                    href={resolveNavigationLink(siteConfig, loc, "socios", partner.id)}
                    className="group relative aspect-[4/5] min-h-0 overflow-hidden rounded-xl bg-navy-950 shadow-soft ring-1 ring-navy/10 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card"
                    aria-label={partner.name}
                  >
                    <Image
                      src={asset(partner.cardPhoto ?? partner.photo)}
                      alt={partner.name}
                      fill
                      sizes="(min-width: 1024px) 15vw, (min-width: 640px) 28vw, 50vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                      <span className="block font-serif text-lg leading-[1.05]">{partner.name}</span>
                      <ArrowUpRight className="mt-2 h-4 w-4 text-accent-soft transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                  ))}
                </div>

                <div className="mt-7 border-t border-line pt-6">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-2">Chambers &amp; Partners</p>
                  <div className="mt-3 grid gap-2">
                    {recognizedPartners.map((partner) => (
                      <Link
                        key={partner.id}
                        href={resolveNavigationLink(siteConfig, loc, "socios", partner.id)}
                        className="group flex items-center justify-between gap-5 rounded-lg bg-mist px-4 py-3 transition-colors hover:bg-navy hover:text-white"
                      >
                        <span className="min-w-0">
                          <span className="block font-display text-sm font-semibold">{partner.name}</span>
                          <span className="mt-0.5 block text-xs text-muted group-hover:text-white/65">{recognitionTopicLabel}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-accent/30 px-3 py-1 text-xs font-semibold text-navy group-hover:border-white/25 group-hover:text-accent-soft">
                          {partner.chambers}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-5 border-t border-line pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="sm:hidden">
                  <span className="font-serif text-5xl leading-none text-navy">{String(recognizedPartners.length).padStart(2, "0")}</span>
                  <span className="ml-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">
                    {recognizedCountLabel}
                  </span>
                </div>
                <p className="max-w-xl text-[1rem] leading-relaxed text-muted">{t.recognition.lead}</p>
                <Link href={resolveNavigationLink(siteConfig, loc, "socios")} className="btn btn-primary w-fit !px-7 !py-3.5">
                  {t.recognition.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="relative h-full overflow-hidden rounded-2xl bg-navy-950 p-8 text-white shadow-card md:p-10">
              <Image
                src={asset(siteConfig.media.homeRecognitionBackground)}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy/80 to-azure/40" />
              <div className="relative">
                <SectionHeading eyebrow={t.global.eyebrow} title={t.global.title} subtitle={t.global.body} tone="light" />
                <div className="mt-9 grid grid-cols-3 gap-5 border-t border-white/12 pt-7">
                  {t.global.stats.map((s) => (
                    <div key={s.label}>
                      <Counter
                        value={s.value}
                        className="block font-serif text-3xl font-medium tracking-tight text-white md:text-4xl"
                      />
                      <div className="mt-2 text-xs leading-snug text-white/65">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link href={resolveNavigationLink(siteConfig, loc, "global")} className="btn btn-light mt-9 !px-6 !py-3">
                  {t.global.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={t.cta.primary} />
    </>
  );
}
