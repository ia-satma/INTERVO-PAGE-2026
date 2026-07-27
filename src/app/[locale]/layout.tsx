import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isLocale, locales } from "@/i18n/config";
import { getPublishedDictionary, getPublishedSiteConfig } from "@/lib/cms/repository";
import { SITE_URL } from "@/lib/site";
import { resolveHomeLink } from "@/lib/cms/links";

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

  return (
    <html lang={dict.htmlLang}>
      <body>
        <Header locale={locale} dict={dict} siteConfig={siteConfig} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} siteConfig={siteConfig} />
      </body>
    </html>
  );
}
