import type { MetadataRoute } from "next";
import { getPublishedSiteConfig, listCmsDocuments } from "@/lib/cms/repository";
import {
  absoluteSiteLink,
  resolveHomeLink,
  resolveNavigationLink,
  resolvePrivacyLink,
} from "@/lib/cms/links";

// The sitemap depends on published CMS state. Rendering it dynamically avoids
// freezing navigation visibility from the database at deployment build time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [documents, siteConfig] = await Promise.all([listCmsDocuments(), getPublishedSiteConfig()]);
  const customSlugs = documents
    .filter((document) => document.key.startsWith("page:") && document.status === "published")
    .map((document) => document.key.slice(5));
  const lastModified = documents.reduce<Date | undefined>((latest, document) => {
    const candidate = document.publishedAt ?? document.updatedAt;
    return candidate && (!latest || candidate > latest) ? candidate : latest;
  }, undefined);
  const entries: MetadataRoute.Sitemap = [];

  function add(esHref: string, enHref: string, priority = 0.7, changeFrequency: "weekly" | "monthly" = "monthly") {
    const esUrl = absoluteSiteLink(siteConfig, esHref);
    const enUrl = absoluteSiteLink(siteConfig, enHref);
    for (const url of [esUrl, enUrl]) {
      entries.push({
        url,
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages: { es: esUrl, en: enUrl, "x-default": esUrl } },
      });
    }
  }

  add(resolveHomeLink(siteConfig, "es"), resolveHomeLink(siteConfig, "en"), 1, "weekly");
  for (const item of siteConfig.navigation.filter((navigationItem) => navigationItem.visible !== false)) {
    add(
      resolveNavigationLink(siteConfig, "es", item.key),
      resolveNavigationLink(siteConfig, "en", item.key),
    );
  }
  add(resolvePrivacyLink(siteConfig, "es"), resolvePrivacyLink(siteConfig, "en"), 0.5);
  for (const partner of siteConfig.partners.filter((item) => item.visible !== false)) {
    add(
      resolveNavigationLink(siteConfig, "es", "socios", partner.id),
      resolveNavigationLink(siteConfig, "en", "socios", partner.id),
    );
  }
  for (const slug of customSlugs) {
    add(`/es/${slug}`, `/en/${slug}`);
  }

  return entries;
}
