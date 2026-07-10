import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

const slugs = ["", "firma", "servicios", "socios", "global", "publicaciones", "contacto", "aviso-de-privacidad"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const slug of slugs) {
      entries.push({
        url: `${SITE_URL}/${locale}${slug ? `/${slug}` : ""}`,
        changeFrequency: "monthly",
        priority: slug === "" ? 1 : 0.7,
        alternates: {
          languages: {
            es: `${SITE_URL}/es${slug ? `/${slug}` : ""}`,
            en: `${SITE_URL}/en${slug ? `/${slug}` : ""}`,
          },
        },
      });
    }
  }
  return entries;
}
