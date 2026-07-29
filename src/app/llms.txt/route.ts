import {
  getPublishedDictionary,
  getPublishedSiteConfig,
} from "@/lib/cms/repository";
import {
  absoluteSiteLink,
  resolveHomeLink,
  resolveNavigationLink,
} from "@/lib/cms/links";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const [es, en, siteConfig] = await Promise.all([
    getPublishedDictionary("es"),
    getPublishedDictionary("en"),
    getPublishedSiteConfig(),
  ]);
  const visiblePartners = siteConfig.partners.filter((partner) => partner.visible !== false);
  const featuredServices = siteConfig.featuredServices.map((id) => ({
    es: es.services.featured[id].title,
    en: en.services.featured[id].title,
  }));
  const otherServices = siteConfig.otherServices.map((id) => ({
    es: es.services.other[id as keyof typeof es.services.other],
    en: en.services.other[id as keyof typeof en.services.other],
  }));

  const lines = [
    `# ${siteConfig.site.name}`,
    "",
    `> ${es.meta.home.description}`,
    `> ${en.meta.home.description}`,
    "",
    "## Entidad / Entity",
    `- Nombre legal / Legal name: ${siteConfig.site.legalName}`,
    `- Fundación / Founded: ${siteConfig.site.founded}`,
    `- Sitio oficial / Official site: ${siteConfig.site.url}`,
    `- Español: ${absoluteSiteLink(siteConfig, resolveHomeLink(siteConfig, "es"))}`,
    `- English: ${absoluteSiteLink(siteConfig, resolveHomeLink(siteConfig, "en"))}`,
    "",
    "## Servicios / Services",
    ...featuredServices.map((service) => `- ${service.es} / ${service.en}`),
    ...otherServices.map((service) => `- ${service.es} / ${service.en}`),
    "",
    "## Equipo directivo / Partners",
    ...visiblePartners.map((partner) => {
      const esProfile = (es.partners as Record<string, { role?: string }>)[partner.id];
      const enProfile = (en.partners as Record<string, { role?: string }>)[partner.id];
      const profileUrl = absoluteSiteLink(
        siteConfig,
        resolveNavigationLink(siteConfig, "es", "socios", partner.id),
      );
      return `- ${partner.name} — ${esProfile?.role ?? ""} / ${enProfile?.role ?? ""}: ${profileUrl}`;
    }),
    "",
    "## Oficinas / Offices",
    ...siteConfig.offices.map((office) => `- ${office.city}: ${office.lines.join(", ")}`),
    "",
    "## Contacto / Contact",
    `- Correo / Email: ${siteConfig.contact.email}`,
    `- Teléfono / Phone: ${siteConfig.contact.phoneDisplay}`,
    "",
    "## Páginas principales / Primary pages",
    ...siteConfig.navigation
      .filter((item) => item.visible !== false)
      .flatMap((item) => [
        `- ${item.labelEs || item.key}: ${absoluteSiteLink(siteConfig, resolveNavigationLink(siteConfig, "es", item.key))}`,
        `- ${item.labelEn || item.key}: ${absoluteSiteLink(siteConfig, resolveNavigationLink(siteConfig, "en", item.key))}`,
      ]),
    "",
    "## Uso de la información / Information use",
    "- El contenido publicado en las URLs anteriores es la fuente vigente y canónica.",
    "- Published content at the URLs above is the current canonical source.",
    "- La información es general y no constituye asesoría legal.",
    "- The information is general and does not constitute legal advice.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
