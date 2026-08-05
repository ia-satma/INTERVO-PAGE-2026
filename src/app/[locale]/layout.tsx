import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { bricolage, inter } from "../fonts";
import Header, { type HeaderModel } from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { isLocale, locales } from "@/i18n/config";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { SITE_URL } from "@/lib/site";
import { buildOrganizationSchema, buildPageMetadata } from "@/lib/seo";
import {
  resolveHomeLink,
  resolveNavigationLink,
  resolvePrivacyLink,
  visibleSocialLinks,
} from "@/lib/cms/links";

// Replit can invalidate prerendered locale routes after a CMS publication.
// Keep on-demand regeneration enabled; invalid locales are still rejected by
// the isLocale guard below.
export const dynamicParams = true;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getPublishedDictionary(locale);
  const siteConfig = await getPublishedSiteConfig();
  const bp = process.env.EXPORT === "true" ? "/INTERVO-PAGE-2026" : "";
  return {
    ...buildPageMetadata({
      locale,
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      siteConfig,
      canonical: resolveHomeLink(siteConfig, locale),
      es: resolveHomeLink(siteConfig, "es"),
      en: resolveHomeLink(siteConfig, "en"),
    }),
    metadataBase: new URL(siteConfig.site.url || SITE_URL),
    title: {
      default: dict.meta.home.title,
      template: "%s",
    },
    applicationName: siteConfig.site.name,
    authors: [{ name: siteConfig.site.legalName }],
    icons: {
      icon: `${bp}${siteConfig.media.favicon}`,
      apple: `${bp}${siteConfig.media.favicon}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dict, siteConfig] = await Promise.all([
    getPublishedDictionary(locale),
    getPublishedSiteConfig(),
  ]);
  const languageRoutes = {
    home: {
      es: resolveHomeLink(siteConfig, "es"),
      en: resolveHomeLink(siteConfig, "en"),
    },
    privacy: {
      es: resolvePrivacyLink(siteConfig, "es"),
      en: resolvePrivacyLink(siteConfig, "en"),
    },
    navigation: siteConfig.navigation.map((item) => ({
      key: item.key,
      href: {
        es: resolveNavigationLink(siteConfig, "es", item.key),
        en: resolveNavigationLink(siteConfig, "en", item.key),
      },
    })),
  };
  const headerModel: HeaderModel = {
    home: languageRoutes.home[locale],
    homeLabel: dict.brand.homeLabel,
    descriptor: dict.brand.descriptor,
    tagline: dict.brand.tagline,
    legalName: siteConfig.site.legalName,
    menuLabel: dict.header.menu,
    closeLabel: dict.header.close,
    offices: siteConfig.offices.map((office) => office.city),
    contact: {
      phoneHref: siteConfig.contact.phoneHref,
      phoneDisplay: siteConfig.contact.phoneDisplay,
      emailHref: siteConfig.contact.emailHref,
      email: siteConfig.contact.email,
    },
    media: {
      logoColor: siteConfig.media.logoColor,
      logoWhite: siteConfig.media.logoWhite,
      menuBackground: siteConfig.media.menuBackground,
    },
    navigation: siteConfig.navigation
      .filter((item) => item.visible !== false)
      .map((item) => ({
        key: item.key,
        label:
          (locale === "es" ? item.labelEs : item.labelEn) ||
          dict.nav[item.key as keyof typeof dict.nav] ||
          item.key,
        href: resolveNavigationLink(siteConfig, locale, item.key),
      })),
    socialLinks: visibleSocialLinks(siteConfig).map(({ id, label, href }) => ({
      id,
      label,
      href,
    })),
    languageRoutes,
  };
  const organizationSchema = buildOrganizationSchema({
    locale,
    description: dict.meta.home.description,
    siteConfig,
    serviceNames: siteConfig.featuredServices.map((id) => dict.services.featured[id].title),
  });

  return (
    <html lang={dict.htmlLang} className={`${inter.variable} ${bricolage.variable}`}>
      <body>
        <StructuredData id="intervo-organization-schema" data={organizationSchema} />
        <Header locale={locale} model={headerModel} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} siteConfig={siteConfig} />
      </body>
    </html>
  );
}
