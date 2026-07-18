import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { SITE_URL, SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
  const dict = getDictionary(locale);
  const bp = process.env.EXPORT === "true" ? "/INTERVO-PAGE-2026" : "";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.home.title,
      template: "%s",
    },
    description: dict.meta.home.description,
    applicationName: SITE.name,
    authors: [{ name: SITE.legalName }],
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: locale === "es" ? "es_MX" : "en_US",
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      url: `/${locale}`,
    },
    icons: {
      icon: `${bp}/brand/favicon.png`,
      apple: `${bp}/brand/favicon.png`,
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
  const dict = getDictionary(locale);

  return (
    <html lang={dict.htmlLang} className={`${inter.variable} ${bricolage.variable}`}>
      <body>
        <Header locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
