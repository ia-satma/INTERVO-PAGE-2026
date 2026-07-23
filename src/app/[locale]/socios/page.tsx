import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TeamWall from "@/components/TeamWall";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { ORGANIZATION, PARTNERS, localePath } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "es");
  return {
    title: dict.meta.socios.title,
    description: dict.meta.socios.description,
    alternates: { canonical: `/${locale}/socios`, languages: { es: "/es/socios", en: "/en/socios" } },
  };
}

export default async function SociosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.socios;
  const org = t.organization;

  const partners = PARTNERS.map((p) => {
    const info = dict.partners[p.id as keyof typeof dict.partners];
    return {
      id: p.id,
      href: localePath(loc, `socios/${p.id}`),
      name: p.name,
      role: info.role,
      photo: p.photo,
      specialties: info.specialties,
      managing: p.managing,
    };
  });

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <TeamWall
        partners={partners}
        eyebrow={t.teamWall.eyebrow}
        specialtiesLabel={t.specialtiesLabel}
        managingLabel={t.managingLabel}
        viewProfileLabel={t.viewProfile}
        filterLabel={t.filter.label}
        filterAllLabel={t.filter.all}
        filterEmptyLabel={t.filter.empty}
        contactHref={localePath(loc, "contacto")}
        contactLabel={dict.actions.contact}
        statsPartnersLabel={t.stats.partners}
        statsAreasLabel={t.stats.areas}
      />

      <div className="container-x">
        <p className="mt-8 text-sm text-muted-2">{t.note}</p>
      </div>

      <section className="relative overflow-hidden bg-mist py-20 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={org.eyebrow} title={org.title} subtitle={org.subtitle} align="center" />

          <Reveal className="mt-12">
            <div className="mx-auto max-w-xs rounded-xl border border-line bg-white px-6 py-4 text-center shadow-card">
              <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-2">
                Intervo Legal SC
              </p>
              <p className="mt-1 font-serif text-2xl text-navy">{org.partners}</p>
            </div>

            <div className="mx-auto h-8 w-px bg-navy/25" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ORGANIZATION.partners.map((name) => (
                <div
                  key={name}
                  className="flex min-h-[7rem] items-center justify-center rounded-xl bg-navy px-4 py-5 text-center shadow-card"
                >
                  <p className="font-serif text-xl leading-tight text-white">{name}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto h-10 w-px bg-navy/25" />
            <div className="mx-auto mb-8 h-px w-full max-w-5xl bg-navy/25" />

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { label: org.lawyers, items: ORGANIZATION.lawyers },
                { label: org.interns, items: ORGANIZATION.interns },
                { label: org.administration, items: ORGANIZATION.administration },
              ].map((group) => (
                <div key={group.label}>
                  <div className="rounded-t-xl bg-navy-950 px-5 py-4">
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent-soft">
                      {group.label}
                    </p>
                  </div>
                  <div className="grid gap-2 rounded-b-xl border border-t-0 border-line bg-white p-3 shadow-card">
                    {group.items.map((name) => (
                      <div key={name} className="rounded-lg bg-mist px-4 py-3">
                        <p className="font-display text-[0.98rem] font-semibold leading-tight text-ink">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
