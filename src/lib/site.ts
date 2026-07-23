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
 * Photos: cropped from the firm's own group portrait (pCloud, session "thisisraw"
 * 2022-10-17), whose left-to-right order is confirmed by the official brochure —
 * not sourced from the unlabeled studio session, to avoid misattributing a face.
 */
export type PartnerMeta = {
  id: string;
  name: string;
  chambers: string | null;
  managing?: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  photo: string;
  linkedin?: string;
};

export const PARTNERS: PartnerMeta[] = [
  {
    id: "jorge",
    name: "Jorge Andrés Garza Navarro",
    chambers: "Up and Coming",
    email: "jgarza@intervo.legal",
    phoneDisplay: "+52 811 405 5614",
    phoneHref: "tel:+528114055614",
    photo: "/images/team/jorge.webp",
  },
  {
    id: "carlos",
    name: "Carlos Marcos Iga",
    chambers: "Band 2",
    email: "cmarcos@intervo.legal",
    phoneDisplay: "+52 811 259 7313",
    phoneHref: "tel:+528112597313",
    photo: "/images/team/carlos.webp",
  },
  {
    id: "luis",
    name: "Luis Gustavo Romero Villarreal",
    chambers: null,
    email: "lromero@intervo.legal",
    phoneDisplay: "+52 811 531 5893",
    phoneHref: "tel:+528115315893",
    photo: "/images/team/luis.webp",
  },
  {
    id: "alfredo",
    name: "Alfredo García Villarreal",
    chambers: "Band 3",
    managing: true,
    email: "agarcia@intervo.legal",
    phoneDisplay: "+52 811 396 7180",
    phoneHref: "tel:+528113967180",
    photo: "/images/team/alfredo.webp",
    linkedin: "https://mx.linkedin.com/in/alfredogarciaintervolegal",
  },
  {
    id: "faustino",
    name: "Faustino Martínez Zulueta",
    chambers: null,
    email: "fmartinez@intervo.legal",
    phoneDisplay: "+52 811 599 9025",
    phoneHref: "tel:+528115999025",
    photo: "/images/team/faustino.webp",
  },
];

export function getPartner(id: string): PartnerMeta | undefined {
  return PARTNERS.find((p) => p.id === id);
}

export const ORGANIZATION = {
  partners: [
    "Carlos Marcos Iga",
    "Alfredo García Villarreal",
    "Faustino Martínez Zulueta",
    "Jorge Andrés Garza Navarro",
    "Luis Gustavo Romero Villarreal",
  ],
  lawyers: [
    "Roberto Carlos Marcos Romero",
    "Olivia Carolina Cisneros González",
    "Erick David Ceballos Peña",
    "Willy Andrés Morales Riosvelasco",
  ],
  interns: [
    "Ana Sofía de los Santos Apodaca",
    "Miguel Ángel Rosales Martínez",
    "Paloma Angélica Portillo Reyes",
  ],
  administration: ["Karla Edith Reyes González"],
} as const;

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
