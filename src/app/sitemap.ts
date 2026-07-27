import type { MetadataRoute } from "next";
import { getPublishedSiteConfig, listCmsDocuments } from "@/lib/cms/repository";
import {
  absoluteSiteLink,
  resolveHomeLink,
  resolveNavigationLink,
  resolvePrivacyLink,
} from "@/lib/cms/links";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [documents, siteConfig] = await Promise.all([listCmsDocuments(), getPublishedSiteConfig()]);
  const customSlugs = documents
    .filter((document) => document.key.startsWith("page:") && document.status === "published")
    .map((document) => document.key.slice(5));
  const entries: MetadataRoute.Sitemap = [];

  function add(esHref: string, enHref: string, priority = 0.7) {
    const esUrl = absoluteSiteLink(siteConfig, esHref);
    const enUrl = absoluteSiteLink(siteConfig, enHref);
    for (const url of [esUrl, enUrl]) {
      entries.push({
        url,
        changeFrequency: "monthly",
        priority,
        alternates: { languages: { es: esUrl, en: enUrl } },
      });
    }
  }

  add(resolveHomeLink(siteConfig, "es"), resolveHomeLink(siteConfig, "en"), 1);
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
