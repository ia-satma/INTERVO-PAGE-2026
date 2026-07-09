import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
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
    title: dict.meta.privacy.title,
    description: dict.meta.privacy.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/aviso-de-privacidad`,
      languages: { es: "/es/aviso-de-privacidad", en: "/en/aviso-de-privacidad" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const dict = getDictionary(loc);
  const t = dict.privacy;

  return (
    <>
      <PageHeader eyebrow={dict.footer.privacy} title={t.title} subtitle={t.updated} />

      <section className="section">
        <div className="container-x max-w-3xl">
          <p className="text-[1.02rem] leading-relaxed text-muted">{t.intro}</p>
          <div className="mt-10 space-y-8">
            {t.sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-xl font-semibold">{s.h}</h2>
                <p className="mt-3 text-[1rem] leading-relaxed text-muted">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 rounded-xl border border-line bg-mist px-5 py-4 text-sm text-muted-2">
            {t.note}
          </p>
        </div>
      </section>
    </>
  );
}
