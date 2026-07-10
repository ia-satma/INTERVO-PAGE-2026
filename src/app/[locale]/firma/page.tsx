import type { Metadata } from "next";
import Image from "next/image";
import { asset } from "@/lib/asset";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { ValueIcon } from "@/components/icons";
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
    title: dict.meta.firma.title,
    description: dict.meta.firma.description,
    alternates: { canonical: `/${locale}/firma`, languages: { es: "/es/firma", en: "/en/firma" } },
  };
}

export default async function FirmaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.firma;

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      {/* Story */}
      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t.story.eyebrow} title={t.story.title} />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
              {t.story.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal>
            <div className="overflow-hidden rounded-2xl shadow-card">
              <Image
                src={asset("/images/boardroom-wide.jpg")}
                alt="Equipo de intervø en su oficina de Monterrey"
                width={1100}
                height={760}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow={t.values.eyebrow} title={t.values.title} align="center" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.valuesData.map((v, i) => (
              <Reveal key={v.key} delay={i * 0.06}>
                <div className="flex h-full flex-col items-start rounded-2xl border border-line bg-white p-7">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-navy">
                    <ValueIcon id={v.key} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold">{v.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="section">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-14 text-white md:px-14 md:py-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <SectionHeading eyebrow={t.recognition.eyebrow} title={t.recognition.title} subtitle={t.recognition.body} tone="light" />
              <div className="grid gap-4">
                {t.recognition.badges.map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-4">
                    <span className="font-display font-medium text-white">{b.name}</span>
                    <span className="shrink-0 rounded-full bg-azure-bright/15 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-wide text-azure-bright">
                      {b.band}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
