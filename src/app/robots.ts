import type { MetadataRoute } from "next";
import { getPublishedSiteConfig } from "@/lib/cms/repository";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteConfig = await getPublishedSiteConfig();
  const siteUrl = siteConfig.site.url.replace(/\/+$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/api/auth"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
