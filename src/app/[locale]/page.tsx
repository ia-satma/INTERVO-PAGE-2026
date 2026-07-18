import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import ValueCard from "@/components/ValueCard";
import InsightCard from "@/components/InsightCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import Counter from "@/components/motion/Counter";
import { Stat } from "@/components/Stat";
import { MarbleDuotone, BridgeMotif } from "@/components/abstract";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { localePath, FEATURED_SERVICES } from "@/lib/site";
import { asset } from "@/lib/asset";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: { canonical: `/${locale}`, languages: { es: "/es", en: "/en" } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.home;

  return (
    <>
      <Hero locale={loc} dict={dict} />

      {/* Stats band overlapping hero */}
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

      {/* Brand statement — centered */}
      <section className="section">
        <div className="container-x text-center">
          <Reveal>
            <div className="flex justify-center">
              <span className="eyebrow eyebrow--center">{t.brandStatement.eyebrow}</span>
            </div>
            <h2 className="display-1 mx-auto mt-6 max-w-4xl">{t.brandStatement.title}</h2>
            <p className="lead mx-auto mt-7 max-w-2xl text-muted">{t.brandStatement.body}</p>
            <Link href={localePath(loc, "firma")} className="btn btn-primary mt-9 !px-7 !py-3.5">
              {t.brandStatement.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Services preview */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} subtitle={t.services.subtitle} />
            <Link href={localePath(loc, "servicios")} className="btn btn-ghost shrink-0 !px-5 !py-2.5 text-[0.85rem]">
              {t.services.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SERVICES.map((id, i) => (
              <Reveal key={id} delay={(i % 3) * 0.05}>
                <ServiceCard
                  id={id}
                  index={String(i + 1).padStart(2, "0")}
                  title={dict.services.featured[id].title}
                  desc={dict.services.featured[id].desc}
                />
              </Reveal>
            ))}
            <Reveal delay={0.1}>
              <Link
                href={localePath(loc, "servicios")}
                className="group relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-2xl bg-azure p-7 text-white transition-transform duration-500 hover:-translate-y-1"
              >
                <Image
                  src={asset("/images/textures/brand-shapes-azure.webp")}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/25" />
                <BridgeMotif className="pointer-events-none absolute -right-6 -top-6 w-32 text-white/10" />
                <span className="relative font-serif text-2xl">{t.services.cta}</span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white group-hover:text-navy">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Global reach teaser */}
      <section className="mesh grain relative overflow-hidden text-white">
        <MarbleDuotone src="/images/textures/marble-2.webp" className="absolute inset-0 opacity-20" />
        <div className="container-x section relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow={t.global.eyebrow} title={t.global.title} subtitle={t.global.body} tone="light" />
              <Link href={localePath(loc, "global")} className="btn btn-light mt-8 !px-6 !py-3">
                {t.global.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              {t.global.stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} tone="light" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow={t.values.eyebrow} title={t.values.title} align="center" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dict.valuesData.map((v, i) => (
              <Reveal key={v.key} delay={i * 0.06}>
                <ValueCard id={v.key} title={v.title} desc={v.desc} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning — strikethrough statement */}
      <section className="mesh grain relative overflow-hidden text-white">
        <MarbleDuotone src="/images/textures/marble-3.webp" className="absolute inset-0 opacity-20" />
        <BridgeMotif className="pointer-events-none absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 text-white/[0.05]" />
        <div className="container-x section relative z-10 text-center">
          <Reveal>
            <h2 className="display-1 text-white">
              <span className="strike-accent">{t.positioning.strike}</span> {t.positioning.keep}
            </h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-white/75">{t.positioning.body}</p>
            <Link href={localePath(loc, "contacto")} className="btn btn-light mt-9 !px-7 !py-3.5">
              {t.positioning.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Recognition + photo mosaic */}
      <section className="relative overflow-hidden bg-mist">
        <Image
          src={asset("/images/textures/brand-shapes-light-2.webp")}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-mist/50" />
        <div className="section container-x relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t.recognition.eyebrow} title={t.recognition.title} />
            <p className="lead mt-6 text-muted">{t.recognition.lead}</p>
            <ul className="mt-8 space-y-4">
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
            <Link href={localePath(loc, "socios")} className="btn btn-primary mt-9 w-fit !px-7 !py-3.5">
              {t.recognition.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Staggered mosaic of partner portraits */}
          <Reveal>
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              <div className="space-y-4 lg:space-y-5">
                {["/images/team/m1.webp", "/images/team/m3.webp"].map((src) => (
                  <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card">
                    <Image src={asset(src)} alt="" fill className="object-cover" sizes="(max-width:1024px) 45vw, 25vw" />
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-8 lg:space-y-5 lg:pt-14">
                {["/images/team/m2.webp", "/images/team/m4.webp"].map((src) => (
                  <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card">
                    <Image src={asset(src)} alt="" fill className="object-cover" sizes="(max-width:1024px) 45vw, 25vw" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Insights teaser */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow={t.insights.eyebrow} title={t.insights.title} subtitle={t.insights.subtitle} />
            <Link href={localePath(loc, "publicaciones")} className="btn btn-ghost shrink-0 !px-5 !py-2.5 text-[0.85rem]">
              {t.insights.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dict.insights.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.06}>
                <InsightCard item={item} readMore={dict.insights.readMore} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={t.cta.primary} />
    </>
  );
}
