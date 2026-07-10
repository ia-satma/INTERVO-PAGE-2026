import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import InsightCard from "@/components/InsightCard";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import Counter from "@/components/motion/Counter";
import { Stat } from "@/components/Stat";
import { MarbleDuotone, BridgeMotif } from "@/components/abstract";
import { ValueIcon, ArrowRight, ArrowUpRight } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { localePath, FEATURED_SERVICES, PARTNERS } from "@/lib/site";

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
  const rotating = FEATURED_SERVICES.map((id) => dict.services.featured[id].title);

  return (
    <>
      <Hero locale={loc} dict={dict} rotating={rotating} />

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

      {/* Manifesto band — "Esto es intervø" */}
      <section className="mesh grain relative overflow-hidden text-white">
        <MarbleDuotone src="/images/textures/marble-1.jpg" className="absolute inset-0 opacity-25" />
        <BridgeMotif className="pointer-events-none absolute -left-16 bottom-[-20%] w-[42rem] text-white/[0.05]" />
        <div className="container-x section relative z-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} tone="light" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-white/75">
              {t.intro.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link href={localePath(loc, "firma")} className="btn btn-light mt-8 !px-6 !py-3">
              {t.intro.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
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
                className="group relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-2xl bg-navy p-7 text-white transition-transform duration-500 hover:-translate-y-1"
              >
                <BridgeMotif className="pointer-events-none absolute -right-6 -top-6 w-32 text-white/10" />
                <span className="relative font-serif text-xl font-medium">{t.services.cta}</span>
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
        <MarbleDuotone src="/images/textures/marble-2.jpg" className="absolute inset-0 opacity-20" />
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
                <div className="flex flex-col items-start">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-navy">
                    <ValueIcon id={v.key} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-serif text-xl font-medium">{v.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partners teaser */}
      <section className="section bg-mist">
        <div className="container-x">
          <div className="overflow-hidden rounded-3xl bg-navy-900 text-white shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[22rem]">
                <Image
                  src="/images/partners-group.jpg"
                  alt="Socios de intervø"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent lg:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-center p-9 md:p-12">
                <SectionHeading eyebrow={t.partners.eyebrow} title={t.partners.title} subtitle={t.partners.body} tone="light" />
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {PARTNERS.map((p) => (
                    <span key={p.id} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[0.82rem] text-white/80">
                      {p.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  ))}
                </div>
                <Link href={localePath(loc, "socios")} className="btn btn-light mt-8 w-fit !px-6 !py-3">
                  {t.partners.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
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
