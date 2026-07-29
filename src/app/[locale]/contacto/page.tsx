import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { Phone, Mail, Whatsapp, Linkedin, Globe, MapPin, ArrowUpRight } from "@/components/icons";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { isLocale } from "@/i18n/config";
import { resolveNavigationLink, resolvePrivacyLink, visibleSocialLinks } from "@/lib/cms/links";
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
    title: dict.meta.contacto.title,
    description: dict.meta.contacto.description,
    siteConfig,
    canonical: resolveNavigationLink(siteConfig, loc, "contacto"),
    es: resolveNavigationLink(siteConfig, "es", "contacto"),
    en: resolveNavigationLink(siteConfig, "en", "contacto"),
  });
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "es";
  const [dict, siteConfig] = await Promise.all([getPublishedDictionary(loc), getPublishedSiteConfig()]);
  const t = dict.contacto;

  const subjects = [
    ...Object.values(dict.services.featured).map((s) => s.title),
    ...Object.values(dict.services.other),
  ];

  return (
    <>
      <PageHeader eyebrow={t.hero.eyebrow} title={t.hero.title} subtitle={t.hero.subtitle} />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm
              locale={loc}
              t={t.form}
              subjects={subjects}
              contactEmail={siteConfig.contact.email}
              contactEmailHref={siteConfig.contact.emailHref}
              privacyLabel={dict.privacy.title}
              privacyHref={resolvePrivacyLink(siteConfig, loc)}
            />
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3">
              <a href={siteConfig.contact.phoneHref} className="group flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-4 transition-colors hover:border-navy/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-navy"><Phone className="h-5 w-5" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted-2">{t.info.phoneLabel}</span>
                  <span className="font-display font-semibold text-ink">{siteConfig.contact.phoneDisplay}</span>
                </span>
              </a>
              <a href={siteConfig.contact.emailHref} className="group flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-4 transition-colors hover:border-navy/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-navy"><Mail className="h-5 w-5" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted-2">{t.info.emailLabel}</span>
                  <span className="font-display font-semibold text-ink">{siteConfig.contact.email}</span>
                </span>
              </a>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={siteConfig.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-white px-5 py-4 transition-colors hover:border-navy/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-navy"><Whatsapp className="h-5 w-5" /></span>
                  <span className="font-display font-semibold text-ink">{dict.actions.whatsapp}</span>
                </a>
                {visibleSocialLinks(siteConfig).map((social) => {
                  const SocialIcon = social.id.toLowerCase() === "linkedin" ? Linkedin : Globe;
                  return (
                    <a key={social.id} href={social.href} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-white px-5 py-4 transition-colors hover:border-navy/30">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-navy"><SocialIcon className="h-5 w-5" /></span>
                      <span className="font-display font-semibold text-ink">{social.label}</span>
                    </a>
                  );
                })}
              </div>
              <p className="mt-1 text-[0.8rem] text-muted-2">{t.info.emailNote}</p>
            </div>
          </div>
        </div>

        {/* Offices */}
        <div className="container-x mt-8">
          <h2 className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-muted-2">
            {t.info.officesLabel}
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {siteConfig.offices.map((o) => (
              <Reveal key={o.id}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white"><MapPin className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight">{o.city}</h3>
                      <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-azure">
                        {t.officeTags[o.tagKey]}
                      </span>
                    </div>
                  </div>
                  <address className="mt-4 not-italic text-[0.95rem] leading-relaxed text-muted">
                    {o.lines.map((l) => (
                      <span key={l} className="block">{l}</span>
                    ))}
                  </address>
                  <a
                    href={o.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-navy transition-colors hover:text-azure"
                  >
                    {t.mapsLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
