import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import type { SiteConfig } from "@/lib/cms/types";
import { absoluteSiteLink, visibleSocialLinks } from "@/lib/cms/links";

type PageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  siteConfig: SiteConfig;
  canonical: string;
  es: string;
  en: string;
  image?: string;
};

export function buildPageMetadata({
  locale,
  title,
  description,
  siteConfig,
  canonical,
  es,
  en,
  image = siteConfig.media.firmImage,
}: PageMetadataInput): Metadata {
  const imageUrl = absoluteSiteLink(siteConfig, image);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { es, en, "x-default": es },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.site.name,
      locale: locale === "es" ? "es_MX" : "en_US",
      title,
      description,
      url: canonical,
      images: [{ url: imageUrl, alt: siteConfig.site.legalName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildOrganizationSchema({
  locale,
  description,
  siteConfig,
  serviceNames,
}: {
  locale: Locale;
  description: string;
  siteConfig: SiteConfig;
  serviceNames: string[];
}) {
  const siteUrl = siteConfig.site.url.replace(/\/+$/, "");
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const sameAs = visibleSocialLinks(siteConfig).map((link) => link.href);
  const visiblePartners = siteConfig.partners.filter((partner) => partner.visible !== false);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LegalService", "Organization"],
        "@id": organizationId,
        name: siteConfig.site.name,
        legalName: siteConfig.site.legalName,
        description,
        url: siteUrl,
        logo: absoluteSiteLink(siteConfig, siteConfig.media.logoColor),
        image: absoluteSiteLink(siteConfig, siteConfig.media.firmImage),
        foundingDate: String(siteConfig.site.founded),
        telephone: siteConfig.contact.phoneDisplay,
        email: siteConfig.contact.email,
        areaServed: [
          { "@type": "Country", name: locale === "es" ? "México" : "Mexico" },
          { "@type": "AdministrativeArea", name: "Nuevo León" },
          { "@type": "City", name: "Monterrey" },
          { "@type": "City", name: "Ciudad Juárez" },
        ],
        address: siteConfig.offices.map((office) => ({
          "@type": "PostalAddress",
          streetAddress: office.lines.join(", "),
          addressLocality: office.city,
          addressCountry: "MX",
        })),
        sameAs,
        knowsAbout: serviceNames,
        employee: visiblePartners.map((partner) => ({
          "@type": "Person",
          "@id": `${siteUrl}/${locale}/socios/${partner.id}#person`,
          name: partner.name,
          image: absoluteSiteLink(siteConfig, partner.photo),
          email: partner.email,
          telephone: partner.phoneDisplay,
          worksFor: { "@id": organizationId },
          ...(partner.linkedin ? { sameAs: [partner.linkedin] } : {}),
        })),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: siteConfig.site.name,
        description,
        inLanguage: ["es-MX", "en-US"],
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function buildPersonSchema({
  locale,
  siteConfig,
  id,
  name,
  role,
  bio,
  specialties,
  photo,
  email,
  phone,
  linkedin,
  recognition,
  url,
}: {
  locale: Locale;
  siteConfig: SiteConfig;
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  photo: string;
  email: string;
  phone: string;
  linkedin?: string;
  recognition?: string | null;
  url: string;
}) {
  const siteUrl = siteConfig.site.url.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteSiteLink(siteConfig, url)}#person`,
    name,
    jobTitle: role,
    description: bio,
    url: absoluteSiteLink(siteConfig, url),
    image: absoluteSiteLink(siteConfig, photo),
    email,
    telephone: phone,
    knowsAbout: specialties,
    worksFor: { "@id": `${siteUrl}/#organization` },
    ...(linkedin ? { sameAs: [linkedin] } : {}),
    ...(recognition ? { award: `Chambers & Partners — ${recognition}` } : {}),
    inLanguage: locale === "es" ? "es-MX" : "en-US",
    identifier: id,
  };
}
