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

  return (
    <>
      <Hero locale={loc} dict={dict} siteConfig={siteConfig} />

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
            <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-navy-950 via-navy to-azure" />
              <div className="absolute inset-x-0 top-0 h-72 bg-grid opacity-45" />
              <div className="relative p-5 md:p-7">
                <div className="rounded-[1.15rem] border border-white/15 bg-white/10 p-2 shadow-soft backdrop-blur-sm">
                  <Link
                    href={resolveNavigationLink(siteConfig, loc, "socios", recognizedPartners[0]?.id)}
                    className="group relative block aspect-[16/11] overflow-hidden rounded-xl bg-navy-950"
                    aria-label={recognizedPartners[0]?.name}
                  >
                    {recognizedPartners[0] && (
                      <Image
                        src={asset(recognizedPartners[0].photo)}
                        alt={recognizedPartners[0].name}
                        fill
                        sizes="(min-width: 1024px) 36vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/28 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                      <span className="max-w-[14rem] font-serif text-2xl font-medium leading-none text-white md:text-3xl">
                        {recognizedPartners[0]?.name}
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-white/80 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>

                <div className="-mt-6 ml-auto grid w-[88%] grid-cols-2 gap-3 md:w-[82%]">
                  {recognizedPartners.slice(1).map((partner, index) => (
                    <Link
                      key={partner.name}
                      href={resolveNavigationLink(siteConfig, loc, "socios", partner.id)}
                      className={`group relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-950 shadow-card ring-4 ring-white ${index === 1 ? "mt-8" : ""}`}
                      aria-label={partner.name}
                    >
                      <Image
                        src={asset(partner.photo)}
                        alt={partner.name}
                        fill
                        sizes="(min-width: 1024px) 16vw, 44vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/96 via-navy-950/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <span className="block font-serif text-xl font-medium leading-none text-white md:text-2xl">
                          {partner.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 grid gap-7 border-t border-line pt-8 md:grid-cols-[0.72fr_1fr] md:items-start">
                  <div>
                    <span className="eyebrow">{t.recognition.eyebrow}</span>
                    <div className="mt-5 flex items-end gap-3">
                      <span className="font-serif text-6xl leading-none text-navy">03</span>
                      <span className="pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        {recognizedCountLabel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl leading-[1.02] text-ink md:text-4xl">
                      {t.recognition.title}
                    </h2>
                    <p className="mt-5 text-[1rem] leading-relaxed text-muted">{t.recognition.lead}</p>
                    <Link href={resolveNavigationLink(siteConfig, loc, "socios")} className="btn btn-primary mt-7 w-fit !px-7 !py-3.5">
                      {t.recognition.cta}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <ul className="sr-only">
                {dict.firma.recognition.badges.map((b) => (
                  <li key={b.name} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent" />
                    <span className="font-serif text-xl text-ink">{b.name}</span>
                    <span className="tag rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1">
                      Chambers · {b.band}
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
