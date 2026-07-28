import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "../globals.css";
import Header, { type HeaderModel } from "@/components/Header";
import Footer from "@/components/Footer";
import { isLocale, locales } from "@/i18n/config";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { SITE_URL } from "@/lib/site";
import {
  resolveHomeLink,
  resolveNavigationLink,
  resolvePrivacyLink,
  visibleSocialLinks,
} from "@/lib/cms/links";

export const dynamicParams = false;

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
    metadataBase: new URL(siteConfig.site.url || SITE_URL),
    title: {
      default: dict.meta.home.title,
      template: "%s",
    },
    description: dict.meta.home.description,
    applicationName: siteConfig.site.name,
    authors: [{ name: siteConfig.site.legalName }],
    alternates: {
      canonical: resolveHomeLink(siteConfig, locale),
      languages: {
        es: resolveHomeLink(siteConfig, "es"),
        en: resolveHomeLink(siteConfig, "en"),
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.site.name,
      locale: locale === "es" ? "es_MX" : "en_US",
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      url: resolveHomeLink(siteConfig, locale),
    },
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

  return (
    <html lang={dict.htmlLang}>
      <body>
        <Header locale={locale} model={headerModel} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} siteConfig={siteConfig} />
      </body>
    </html>
  );
}
