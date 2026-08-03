import en from "@/i18n/dictionaries/en";
import es from "@/i18n/dictionaries/es";
import {
  CONTACT,
  FEATURED_SERVICES,
  NAV,
  OFFICES,
  ORGANIZATION,
  OTHER_SERVICES,
  PARTNERS,
  SITE,
} from "@/lib/site";
import type { CmsDocumentDefinition, SiteConfig } from "./types";

const localized = (esValue: unknown, enValue: unknown) => ({
  es: esValue as Record<string, unknown>,
  en: enValue as Record<string, unknown>,
});

const sharedEs = {
  htmlLang: es.htmlLang,
  brand: es.brand,
  nav: es.nav,
  actions: es.actions,
  header: es.header,
  footer: es.footer,
  notFound: es.notFound,
  services: es.services,
  partners: es.partners,
  valuesData: es.valuesData,
  meta: es.meta,
};

const sharedEn = {
  htmlLang: en.htmlLang,
  brand: en.brand,
  nav: en.nav,
  actions: en.actions,
  header: en.header,
  footer: en.footer,
  notFound: en.notFound,
  services: en.services,
  partners: en.partners,
  valuesData: en.valuesData,
  meta: en.meta,
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  site: SITE,
  contact: CONTACT,
  navigation: NAV.map((item) => ({
    ...item,
    labelEs: es.nav[item.key],
    labelEn: en.nav[item.key],
    hrefEs: `/es/${item.slug}`,
    hrefEn: `/en/${item.slug}`,
    visible: item.key !== "publicaciones",
  })),
  utilityLinks: {
    homeEs: "/es",
    homeEn: "/en",
    privacyEs: "/es/aviso-de-privacidad",
    privacyEn: "/en/aviso-de-privacidad",
  },
  socialLinks: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: SITE.linkedin,
      visible: true,
    },
  ],
  offices: OFFICES,
  partners: PARTNERS,
  organization: ORGANIZATION,
  featuredServices: FEATURED_SERVICES,
  otherServices: OTHER_SERVICES,
  media: {
    homeHero: [
      "/images/textures/brand-shapes-navy-4.webp",
      "/images/textures/brand-shapes-azure.webp",
      "/images/textures/brand-shapes-navy-5.webp",
    ],
    firmImage: "/images/boardroom-wide.webp",
    heroVideo: "",
    heroPoster: "",
    logoColor: "/brand/logo-color-trim.png",
    logoWhite: "/brand/logo-white-trim.png",
    isotypeColor: "/brand/isotype-color.png",
    isotypeWhite: "/brand/isotype-white.png",
    isotypeMask: "/brand/isotype-white-trim.png",
    favicon: "/brand/favicon.png",
    menuBackground: "/images/textures/marble-1.webp",
    pageHeaderBackground: "/images/textures/brand-shapes-light.webp",
    ctaBackground: "/images/textures/brand-shapes-navy-3.webp",
    insightCardBackground: "/images/textures/brand-shapes-navy-2.webp",
    servicesBackground: "/images/textures/brand-shapes-light-2.webp",
    serviceImages: {
      ma: "/images/services/fusiones-adquisiciones-ma.webp",
      finance: "/images/services/finanzas-corporativas.webp",
      corporate: "/images/services/corporativo-transaccional.webp",
      trusts: "/images/services/fideicomisos-planeacion-patrimonial.webp",
      realestate: "/images/services/derecho-inmobiliario.webp",
    },
    globalBackground: "/images/textures/brand-shapes-navy-1.webp",
    homeServicesBackground: "/images/textures/brand-shapes-light-2.webp",
    homeRecognitionBackground: "/images/textures/brand-shapes-navy-1.webp",
    firmRecognitionBackground: "/images/textures/brand-shapes-navy-2.webp",
    teamBackground: "/images/textures/brand-shapes-navy-2.webp",
  },
};

export const CMS_DOCUMENTS: CmsDocumentDefinition[] = [
  {
    key: "home",
    label: "Portada",
    group: "Contenido",
    description: "Hero, mensajes principales, cifras, servicios, reconocimiento y llamados a la acción.",
    dictionaryPath: "home",
    defaults: localized(es.home, en.home),
    icon: "home",
  },
  {
    key: "firma",
    label: "La Firma",
    group: "Contenido",
    description: "Historia, valores, reconocimiento y contenido institucional.",
    dictionaryPath: "firma",
    defaults: localized(es.firma, en.firma),
    icon: "building",
  },
  {
    key: "servicios",
    label: "Servicios",
    group: "Contenido",
    description: "Encabezados, introducciones y llamados a la acción de áreas de práctica.",
    dictionaryPath: "servicios",
    defaults: localized(es.servicios, en.servicios),
    icon: "briefcase",
  },
  {
    key: "equipo",
    label: "Equipo",
    group: "Contenido",
    description: "Muro de abogados, organigrama, perfiles, biografías y datos de contacto.",
    dictionaryPath: "socios",
    defaults: localized(es.socios, en.socios),
    icon: "users",
  },
  {
    key: "alcance-global",
    label: "Alcance Global",
    group: "Contenido",
    description: "Alianza internacional, cifras, jurisdicciones y propuesta global.",
    dictionaryPath: "global",
    defaults: localized(es.global, en.global),
    icon: "globe",
  },
  {
    key: "publicaciones",
    label: "Publicaciones",
    group: "Contenido",
    description: "Artículos, categorías, imágenes, autores, fechas y visibilidad.",
    dictionaryPath: "insights",
    defaults: localized(es.insights, en.insights),
    icon: "article",
  },
  {
    key: "contacto",
    label: "Contacto",
    group: "Contenido",
    description: "Textos del formulario, datos de contacto y mensajes de confirmación.",
    dictionaryPath: "contacto",
    defaults: localized(es.contacto, en.contacto),
    icon: "phone",
  },
  {
    key: "privacidad",
    label: "Aviso de Privacidad",
    group: "Contenido",
    description: "Documento legal bilingüe y fecha de actualización.",
    dictionaryPath: "privacy",
    defaults: localized(es.privacy, en.privacy),
    icon: "shield",
  },
  {
    key: "navegacion-seo",
    label: "Navegación y SEO",
    group: "Configuración",
    description: "Menús, pie, etiquetas compartidas y metadata por página.",
    defaults: localized(sharedEs, sharedEn),
    icon: "navigation",
  },
  {
    key: "site-config",
    label: "Configuración del sitio",
    group: "Configuración",
    description: "Marca, contacto, oficinas, equipo, medios globales y enlaces.",
    defaults: DEFAULT_SITE_CONFIG as unknown as Record<string, unknown>,
    icon: "settings",
  },
];

export function getDocumentDefinition(key: string) {
  return CMS_DOCUMENTS.find((document) => document.key === key);
}
