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

/**
 * Contact & offices — verified against the firm's official business cards and
 * letterhead (pCloud "PAPELERIA" folder). No shared "info@"/"contacto@" inbox
 * was found; the firm uses one address per partner (initial+lastname@intervo.legal).
 * The Managing Partner's address is used as the general contact default.
 */
export const CONTACT = {
  phoneDisplay: "+52 811 405 5614",
  phoneHref: "tel:+528114055614",
  whatsappHref: "https://wa.me/528114055614",
  email: "agarcia@intervo.legal",
  emailHref: "mailto:agarcia@intervo.legal",
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
    // Address per the 2025 brochure (updated from the 2023 brochure's
    // Paseo Triunfo de la República location).
    lines: [
      "Blvd. Tomás Fernández núm. 7930, Of. 203",
      "Col. Campestre, C.P. 32470",
      "Ciudad Juárez, Chihuahua",
    ],
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Blvd+Tomas+Fernandez+7930+Col+Campestre+Ciudad+Juarez",
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

/**
 * Partners — left-to-right order per the official brochure "Nuestros Socios".
 * Email/phone verified against each partner's individual business card
 * (pCloud "PAPELERIA" folder); phones formatted from the card's 10-digit MX numbers.
 */
export type PartnerMeta = {
  id: string;
  name: string;
  chambers: string | null;
  managing?: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
};

export const PARTNERS: PartnerMeta[] = [
  {
    id: "jorge",
    name: "Jorge Andrés Garza Navarro",
    chambers: "Up and Coming",
    email: "jgarza@intervo.legal",
    phoneDisplay: "+52 811 405 5614",
    phoneHref: "tel:+528114055614",
  },
  {
    id: "carlos",
    name: "Carlos Marcos Iga",
    chambers: "Band 2",
    email: "cmarcos@intervo.legal",
    phoneDisplay: "+52 811 259 7313",
    phoneHref: "tel:+528112597313",
  },
  {
    id: "luis",
    name: "Luis Romero",
    chambers: null,
    email: "lromero@intervo.legal",
    phoneDisplay: "+52 811 531 5893",
    phoneHref: "tel:+528115315893",
  },
  {
    id: "alfredo",
    name: "Alfredo García Villarreal",
    chambers: "Band 3",
    managing: true,
    email: "agarcia@intervo.legal",
    phoneDisplay: "+52 811 396 7180",
    phoneHref: "tel:+528113967180",
  },
  {
    id: "faustino",
    name: "Faustino Martínez",
    chambers: null,
    email: "fmartinez@intervo.legal",
    phoneDisplay: "+52 811 599 9025",
    phoneHref: "tel:+528115999025",
  },
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
