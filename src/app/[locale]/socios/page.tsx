import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import TeamWall from "@/components/TeamWall";
import SociosDirectory from "@/components/SociosDirectory";
import CTASection from "@/components/CTASection";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { PARTNERS, localePath } from "@/lib/site";

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

  const partners = PARTNERS.map((p) => {
    const info = dict.partners[p.id as keyof typeof dict.partners];
    return {
      id: p.id,
      href: localePath(loc, `socios/${p.id}`),
      name: p.name,
      role: info.role,
      photo: p.photo,
      chambers: p.chambers,
      specialties: info.specialties,
      managing: p.managing,
      email: p.email,
      phoneDisplay: p.phoneDisplay,
      phoneHref: p.phoneHref,
    };
  });

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <TeamWall partners={partners} eyebrow={t.teamWall.eyebrow} />

      <section className="section">
        <div className="container-x">
          <SociosDirectory
            partners={partners}
            specialtiesLabel={t.specialtiesLabel}
            chambersLabel={t.profile.chambersLabel}
            viewProfileLabel={t.viewProfile}
            filterLabel={t.filter.label}
            filterAllLabel={t.filter.all}
            filterEmptyLabel={t.filter.empty}
            contactHref={localePath(loc, "contacto")}
            contactLabel={dict.actions.contact}
            statsPartnersLabel={t.stats.partners}
            statsAreasLabel={t.stats.areas}
          />
          <p className="mt-10 text-sm text-muted-2">{t.note}</p>
        </div>
      </section>

      <CTASection locale={loc} title={t.cta.title} body={t.cta.body} ctaLabel={dict.actions.contact} />
    </>
  );
}
