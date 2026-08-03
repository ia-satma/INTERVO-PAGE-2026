export const CLIENT_FEEDBACK_RESOURCE_ID = "2026-08-client-feedback";
export const CLIENT_FEEDBACK_DOCUMENT_KEYS = ["site-config", "equipo", "contacto", "navegacion-seo"] as const;

export const CLIENT_CONTACT = {
  email: "info@intervo.legal",
  emailHref: "mailto:info@intervo.legal",
  whatsappHref: "",
} as const;

export const CLIENT_MAP_LINKS: Record<string, string> = {
  monterrey: "https://google.com/maps/place/Intervo+Legal/@25.6619843,-100.3481927,222m/data=!3m1!1e3!4m6!3m5!1s0x8662bfb2a3dca203:0x4707c3f4f9ff6ad8!8m2!3d25.6618876!4d-100.3484943!16s%2Fg%2F11lg27s7sx?entry=ttu&g_ep=EgoyMDI2MDcyNy4wIKXMDSoASAFQAw%3D%3D",
  juarez: "https://www.google.com/maps/place/Intervo+Legal,+S.+C.+(Jrz)/@31.7288311,-106.4102507,171m/data=!3m1!1e3!4m6!3m5!1s0x86e75d53005f2579:0x89ff97e3148c2a32!8m2!3d31.72906!4d-106.4097379!16s%2Fg%2F11xsw6bts7?entry=ttu&g_ep=EgoyMDI2MDcyNy4wIKXMDSoASAFQAw%3D%3D",
};

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function patchSiteConfig(input: JsonRecord) {
  const output = structuredClone(input);
  output.contact = { ...record(output.contact), ...CLIENT_CONTACT };
  output.media = {
    ...record(output.media),
    logoColor: "/brand/logo-color-trim.png",
    logoWhite: "/brand/logo-white-trim.png",
  };
  if (Array.isArray(output.navigation)) {
    output.navigation = output.navigation.map((item) => {
      const navigationItem = record(item);
      return navigationItem.key === "publicaciones" ? { ...navigationItem, visible: false } : navigationItem;
    });
  }
  if (Array.isArray(output.offices)) {
    output.offices = output.offices.map((item) => {
      const office = record(item);
      const id = typeof office.id === "string" ? office.id : "";
      return CLIENT_MAP_LINKS[id] ? { ...office, mapsHref: CLIENT_MAP_LINKS[id] } : office;
    });
  }
  if (Array.isArray(output.partners)) {
    output.partners = output.partners.map((item) => {
      const partner = record(item);
      if (partner.id !== "alfredo") return partner;
      const { managing: _managing, ...withoutManaging } = partner;
      void _managing;
      return { ...withoutManaging, cardPhoto: "/images/team/alfredo-card.webp" };
    });
  }
  const organization = record(output.organization);
  if (Array.isArray(organization.partners)) {
    organization.partners = organization.partners.map((item) => {
      const partner = record(item);
      return partner.id === "alfredo" ? { ...partner, photo: "/images/team/alfredo-card.webp", managing: false } : partner;
    });
    output.organization = organization;
  }
  return output;
}

function patchTeam(input: JsonRecord) {
  const output = structuredClone(input);
  for (const locale of ["es", "en"] as const) {
    const content = record(output[locale]);
    const organization = record(content.organization);
    content.note = "";
    organization.lawyers = locale === "es" ? "Asociados" : "Associates";
    organization.subtitle = locale === "es"
      ? "La organización actual de intervø integra socios, asociados, pasantes y administración para atender cada operación con una ruta clara de responsabilidad."
      : "intervø's current organization brings together partners, associates, interns and administration to serve each matter with clear responsibility.";
    content.organization = organization;
    output[locale] = content;
  }
  return output;
}

function patchContact(input: JsonRecord) {
  const output = structuredClone(input);
  for (const locale of ["es", "en"] as const) {
    const content = record(output[locale]);
    content.info = { ...record(content.info), emailNote: "" };
    output[locale] = content;
  }
  return output;
}

function patchSharedContent(input: JsonRecord) {
  const output = structuredClone(input);
  for (const locale of ["es", "en"] as const) {
    const content = record(output[locale]);
    const partners = record(content.partners);
    const alfredo = record(partners.alfredo);
    partners.alfredo = {
      ...alfredo,
      role: locale === "es" ? "Socio" : "Partner",
      bio: locale === "es"
        ? "Alfredo es socio de intervø. Cuenta con una Maestría en Derecho de la Empresa (LL.M.) por la Universitat Pompeu Fabra (2004–2005) y experiencia previa en White & Case LLP y Arizpe, Valdés & Marcos, S.C. Su práctica se enfoca en derecho corporativo, adquisiciones en México y el extranjero, derecho inmobiliario y financiamiento. Rankeado por Chambers & Partners — Latin America (Band 3), Corporate/Commercial: Monterrey."
        : "Alfredo is a partner at intervø. He holds an LL.M. in Business Law from Universitat Pompeu Fabra (2004–2005) and previously practiced at White & Case LLP and Arizpe, Valdés & Marcos, S.C. His practice focuses on corporate law, acquisitions in Mexico and abroad, real estate law and financing. Ranked by Chambers & Partners — Latin America (Band 3), Corporate/Commercial: Monterrey.",
    };
    content.partners = partners;
    output[locale] = content;
  }
  return output;
}

export function applyClientFeedbackToDocument(key: string, input: JsonRecord): JsonRecord {
  if (key === "site-config") return patchSiteConfig(input);
  if (key === "equipo") return patchTeam(input);
  if (key === "contacto") return patchContact(input);
  if (key === "navegacion-seo") return patchSharedContent(input);
  return structuredClone(input);
}
