import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/site";
import type { SiteConfig } from "./types";

const absoluteWebPattern = /^https?:\/\//i;

export function isSafeNavigableHref(href: string) {
  const value = href.trim();
  return (value.startsWith("/") && !value.startsWith("//")) || absoluteWebPattern.test(value);
}

export function isSafeExternalHref(href: string) {
  return absoluteWebPattern.test(href.trim());
}

function withSuffix(base: string, suffix?: string) {
  if (!suffix) return base;
  return `${base.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;
}

export function resolveHomeLink(siteConfig: SiteConfig, locale: Locale) {
  const configured = locale === "es"
    ? siteConfig.utilityLinks.homeEs
    : siteConfig.utilityLinks.homeEn;
  return configured && isSafeNavigableHref(configured) ? configured : localePath(locale);
}

export function resolvePrivacyLink(siteConfig: SiteConfig, locale: Locale) {
  const configured = locale === "es"
    ? siteConfig.utilityLinks.privacyEs
    : siteConfig.utilityLinks.privacyEn;
  return configured && isSafeNavigableHref(configured)
    ? configured
    : localePath(locale, "aviso-de-privacidad");
}

export function resolveNavigationLink(
  siteConfig: SiteConfig,
  locale: Locale,
  key: string,
  suffix?: string,
) {
  const item = siteConfig.navigation.find((navigationItem) => navigationItem.key === key);
  const configured = locale === "es" ? item?.hrefEs : item?.hrefEn;
  const fallback = localePath(locale, item?.slug || key);
  return withSuffix(configured && isSafeNavigableHref(configured) ? configured : fallback, suffix);
}

export function visibleSocialLinks(siteConfig: SiteConfig) {
  return siteConfig.socialLinks.filter((link) => link.visible && isSafeExternalHref(link.href));
}

export function absoluteSiteLink(siteConfig: SiteConfig, href: string) {
  try {
    return new URL(href, siteConfig.site.url).toString();
  } catch {
    return href;
  }
}

export function validateSiteConfigLinks(data: Record<string, unknown>) {
  const errors: string[] = [];
  const config = data as Partial<SiteConfig>;
  const checkNavigation = (value: unknown, label: string) => {
    if (typeof value === "string" && value.trim() && !isSafeNavigableHref(value)) {
      errors.push(`${label} debe ser una ruta interna o una URL HTTP/HTTPS.`);
    }
  };
  const checkExternal = (value: unknown, label: string) => {
    if (typeof value === "string" && value.trim() && !isSafeExternalHref(value)) {
      errors.push(`${label} debe ser una URL HTTP/HTTPS.`);
    }
  };

  config.navigation?.forEach((item, index) => {
    checkNavigation(item.hrefEs, `Navegación ${index + 1} ES`);
    checkNavigation(item.hrefEn, `Navegación ${index + 1} EN`);
  });
  if (config.utilityLinks) {
    checkNavigation(config.utilityLinks.homeEs, "Inicio ES");
    checkNavigation(config.utilityLinks.homeEn, "Inicio EN");
    checkNavigation(config.utilityLinks.privacyEs, "Privacidad ES");
    checkNavigation(config.utilityLinks.privacyEn, "Privacidad EN");
  }
  config.socialLinks?.forEach((item, index) => checkExternal(item.href, `Red social ${index + 1}`));
  if (config.offices) {
    config.offices.forEach((office, index) => checkExternal(office.mapsHref, `Mapa ${index + 1}`));
  }
  if (config.site?.url) checkExternal(config.site.url, "URL pública canónica");
  if (config.contact) {
    if (config.contact.phoneHref && !config.contact.phoneHref.trim().toLowerCase().startsWith("tel:")) {
      errors.push("El enlace telefónico debe comenzar con tel:.");
    }
    if (config.contact.emailHref && !config.contact.emailHref.trim().toLowerCase().startsWith("mailto:")) {
      errors.push("El enlace de correo debe comenzar con mailto:.");
    }
    checkExternal(config.contact.whatsappHref, "WhatsApp");
  }
  return errors;
}
