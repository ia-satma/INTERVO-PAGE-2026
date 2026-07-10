import type { Locale } from "@/i18n/config";

/** Canonical production URL (update when the domain/hosting is confirmed). */
export const SITE_URL = "https://www.intervo.legal";

export const SITE = {
  name: "intervø",
  legalName: "Intervo Legal, S.C.",
  descriptor: "Legal and Business Consulting",
  url: SITE_URL,
  founded: 2019,
  linkedin: "https://www.linkedin.com/company/intervolegal/",
} as const;

/** Contact & offices — from the official 2023 brochure. */
export const CONTACT = {
  phoneDisplay: "+52 811 405 5614",
  phoneHref: "tel:+528114055614",
  whatsappHref: "https://wa.me/528114055614",
  // NOTE: no public email was published on the site or brochure.
  // Placeholder below — confirm the real inbox with the client before launch.
  email: "contacto@intervo.legal",
  emailHref: "mailto:contacto@intervo.legal",
} as const;

export type Office = {
  id: string;
  city: string;
  tagKey: "hq" | "branch";
  lines: string[];
  mapsHref: string;
};

export const OFFICES: Office[] = [
  {
    id: "monterrey",
    city: "Monterrey",
    tagKey: "hq",
    lines: [
      "Torre Legacy, Valle Sol núm. 122, int. 302",
      "Fracc. La Diana, C.P. 66266",
      "San Pedro Garza García, Nuevo León",
    ],
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Torre+Legacy+Valle+Sol+122+San+Pedro+Garza+Garcia",
  },
  {
    id: "juarez",
    city: "Ciudad Juárez",
    tagKey: "branch",
    lines: [
      "Av. Paseo Triunfo de la República núm. 4020-1",
      "Plaza Renacimiento, Col. Monumental, C.P. 32310",
      "Ciudad Juárez, Chihuahua",
    ],
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Paseo+Triunfo+de+la+Republica+4020+Plaza+Renacimiento+Ciudad+Juarez",
  },
];

/** Primary navigation — slugs are shared across locales; labels are translated. */
export const NAV: { key: NavKey; slug: string }[] = [
  { key: "firma", slug: "firma" },
  { key: "servicios", slug: "servicios" },
  { key: "socios", slug: "socios" },
  { key: "global", slug: "global" },
  { key: "publicaciones", slug: "publicaciones" },
  { key: "contacto", slug: "contacto" },
];
export type NavKey = "firma" | "servicios" | "socios" | "global" | "publicaciones" | "contacto";

export function localePath(locale: Locale, slug = ""): string {
  return `/${locale}${slug ? `/${slug}` : ""}`;
}

/** Partners — left-to-right order per the official brochure "Nuestros Socios". */
export type PartnerMeta = {
  id: string;
  name: string;
  chambers: string | null;
  managing?: boolean;
};

export const PARTNERS: PartnerMeta[] = [
  { id: "jorge", name: "Jorge Andrés Garza Navarro", chambers: "Up and Coming" },
  { id: "carlos", name: "Carlos Marcos Iga", chambers: "Band 2" },
  { id: "luis", name: "Luis Romero", chambers: null },
  { id: "alfredo", name: "Alfredo García Villarreal", chambers: "Band 3", managing: true },
  { id: "faustino", name: "Faustino Martínez", chambers: null },
];

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Featured practice areas (with their own copy blocks). */
export const FEATURED_SERVICES = [
  "ma",
  "finance",
  "corporate",
  "trusts",
  "realestate",
] as const;

/** Additional services (label-only list). */
export const OTHER_SERVICES = [
  "competition",
  "tax",
  "fintech",
  "foreign",
  "immigration",
  "aml",
  "data",
  "regulatory",
  "labor",
  "litigation",
  "ip",
] as const;
