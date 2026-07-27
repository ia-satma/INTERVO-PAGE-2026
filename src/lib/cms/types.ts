import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type {
  CONTACT,
  OFFICES,
  OTHER_SERVICES,
  PartnerMeta,
  OrganizationMember,
  SITE,
} from "@/lib/site";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type LocalizedDocument = {
  es: Record<string, unknown>;
  en: Record<string, unknown>;
};

export type CmsDocumentDefinition = {
  key: string;
  label: string;
  group: "Contenido" | "Configuración";
  description: string;
  dictionaryPath?: keyof Dictionary;
  defaults: Record<string, unknown>;
  icon: "home" | "building" | "briefcase" | "users" | "globe" | "article" | "phone" | "shield" | "navigation" | "settings";
};

export type SiteConfig = {
  site: typeof SITE;
  contact: typeof CONTACT;
  navigation: Array<{
    key: string;
    slug: string;
    labelEs?: string;
    labelEn?: string;
    hrefEs?: string;
    hrefEn?: string;
    visible?: boolean;
  }>;
  utilityLinks: {
    homeEs: string;
    homeEn: string;
    privacyEs: string;
    privacyEn: string;
  };
  socialLinks: Array<{
    id: string;
    label: string;
    href: string;
    visible: boolean;
  }>;
  offices: typeof OFFICES;
  partners: Array<PartnerMeta & { visible?: boolean }>;
  organization: {
    partners: OrganizationMember[];
    lawyers: OrganizationMember[];
    interns: OrganizationMember[];
    administration: OrganizationMember[];
  };
  featuredServices: typeof import("@/lib/site").FEATURED_SERVICES;
  otherServices: typeof OTHER_SERVICES;
  media: {
    homeHero: string[];
    firmImage: string;
    heroVideo: string;
    heroPoster: string;
    logoColor: string;
    logoWhite: string;
    isotypeColor: string;
    isotypeWhite: string;
    isotypeMask: string;
    favicon: string;
    menuBackground: string;
    pageHeaderBackground: string;
    ctaBackground: string;
    insightCardBackground: string;
    servicesBackground: string;
    globalBackground: string;
    homeServicesBackground: string;
    homeRecognitionBackground: string;
    firmRecognitionBackground: string;
    teamBackground: string;
  };
};

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "editor";
  permissions: Permission[];
  mfaEnabled: boolean;
  mfaVerified: boolean;
};

export type Permission =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "media:manage"
  | "submissions:manage"
  | "users:manage"
  | "audit:read"
  | "settings:manage";

export type CmsDictionary = Record<Locale, Dictionary>;
