import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { Globe } from "@/components/icons";
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
    title: dict.meta.global.title,
    description: dict.meta.global.description,
    alternates: { canonical: `/${locale}/global`, languages: { es: "/es/global", en: "/en/global" } },
  };
}

export default async function GlobalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.global;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      {/* Alliance + figures */}
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow={t.alliance.eyebrow} title={t.alliance.title} subtitle={t.alliance.body} />
          </div>
          <div className="grid gap-4">
            {t.alliance.figures.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.06}>
                <div className="flex items-baseline gap-5 rounded-2xl border border-line bg-white p-6">
                  <span className="font-display text-4xl font-bold text-navy md:text-5xl">{f.value}</span>
                  <span className="text-[0.98rem] leading-snug text-muted">{f.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reach — dark band */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-25" />
        <div className="container-x section relative">
          <div className="max-w-2xl">
            <span className="eyebrow !text-azure-bright">
              <Globe className="h-4 w-4" /> {t.reach.title}
            </span>
            <p className="mt-5 text-lg leading-relaxed text-white/75">{t.reach.body}</p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-y border-white/10 py-10">
            {t.reach.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} tone="light" size="lg" />
            ))}
          </div>

          <div className="mt-10">
            <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/50">
              {t.reach.regionsLabel}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {t.reach.regions.map((r) => (
                <span key={r} className="rounded-full border border-white/15 px-4 py-1.5 text-[0.9rem] text-white/80">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Representative deals */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow={t.deals.eyebrow} title={t.deals.title} />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {t.deals.items.map((d, i) => (
              <Reveal key={i} delay={(i % 2) * 0.05}>
                <div className="flex h-full gap-5 rounded-2xl border border-line bg-white p-7">
                  <span className="font-display text-lg font-bold text-azure">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[1.05rem] leading-relaxed text-ink/85">{d}</p>
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
