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

const RECOGNIZED_PARTNER_IDS = ["carlos", "alfredo", "jorge"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: {
      canonical: resolveHomeLink(siteConfig, loc),
      languages: {
        es: resolveHomeLink(siteConfig, "es"),
        en: resolveHomeLink(siteConfig, "en"),
      },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const t = dict.home;
  const recognizedPartners = RECOGNIZED_PARTNER_IDS.flatMap((id) => {
    const partner = siteConfig.partners.find((item) => item.visible !== false && item.id === id);
    return partner ? [partner] : [];
  });
  const recognizedCountLabel = loc === "es" ? "Socios reconocidos" : "Recognized partners";
  const partnerRoleLabel = loc === "es" ? "Socio principal" : "Principal partner";
  const recognitionTopicLabel = "Corporate/Commercial: Monterrey";
  const profileLinkLabel = loc === "es" ? "Ver perfil" : "View profile";

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
            {siteConfig.featuredServices.slice(0, 3).map((id, i) => (
              <Reveal key={id} delay={i * 0.05}>
                <ServiceCard
                  id={id}
                  index={String(i + 1).padStart(2, "0")}
                  title={dict.services.featured[id].title}
                  desc={dict.services.featured[id].desc}
                />
              </Reveal>
            ))}
            <Reveal delay={0.15}>
              <Link
                href={resolveNavigationLink(siteConfig, loc, "servicios")}
                className="group relative flex h-full min-h-[21rem] overflow-hidden rounded-2xl bg-navy-950 shadow-card transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy to-azure" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-white/10" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/12 transition-colors duration-500 group-hover:ring-accent-soft/45" />
                <div className="relative z-10 flex h-full w-full flex-col p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/70 bg-white text-navy shadow-soft transition-colors duration-500 group-hover:bg-accent-soft group-hover:text-navy-950">
                    <ArrowUpRight className="h-6 w-6" />
                  </span>
                  <div className="mt-auto pt-12">
                    <span className="font-serif text-2xl leading-snug text-white">{t.services.cta}</span>
                    <span className="mt-5 block h-px w-10 bg-accent-soft transition-all duration-500 group-hover:w-20" />
                  </div>
                </div>
              </Link>
            </Reveal>
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
                  <span className="block font-serif text-6xl leading-none text-navy">03</span>
                  <span className="mt-2 block text-[0.62rem] font-semibold uppercase leading-snug tracking-[0.22em] text-muted">
                    {recognizedCountLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {recognizedPartners.map((partner) => (
                  <Link
                    key={partner.name}
                    href={resolveNavigationLink(siteConfig, loc, "socios", partner.id)}
                    className="group grid min-h-[11rem] overflow-hidden rounded-xl border border-line bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-accent/35 hover:shadow-card sm:h-[13rem] sm:grid-cols-[0.95fr_1.05fr]"
                    aria-label={partner.name}
                  >
                    <div className="relative min-h-[14rem] overflow-hidden bg-mist sm:min-h-0">
                      <Image
                        src={asset(partner.photo)}
                        alt={partner.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 42vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="grid bg-navy-950 sm:grid-rows-[0.92fr_1.08fr]">
                      <div className="relative overflow-hidden bg-gradient-to-br from-azure-bright via-azure to-navy p-4 text-white md:p-5">
                        <div className="absolute inset-0 bg-grid opacity-25" />
                        <div className="relative">
                          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/68">
                            {partnerRoleLabel}
                          </span>
                          <span className="mt-2.5 block max-w-56 font-serif text-[1.45rem] font-medium leading-none text-white md:text-[1.55rem]">
                            {partner.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between gap-3 bg-navy-950 p-4 text-white md:p-5">
                        <div>
                          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                            Chambers & Partners
                          </span>
                          <p className="mt-2 text-sm leading-relaxed text-white/68">{recognitionTopicLabel}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                          {profileLinkLabel}
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-7 grid gap-5 border-t border-line pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="sm:hidden">
                  <span className="font-serif text-5xl leading-none text-navy">03</span>
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
              <ul className="sr-only">
                {dict.firma.recognition.badges.map((b) => (
                  <li key={b.name} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent" />
                    <span className="font-serif text-xl text-ink">{b.name}</span>
                    <span className="tag rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1">
                      Chambers - {b.band}
                    </span>
                  </li>
                ))}
              </ul>
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
