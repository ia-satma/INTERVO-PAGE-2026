"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import type { SiteConfig } from "@/lib/cms/types";
import { resolveHomeLink, resolveNavigationLink, resolvePrivacyLink } from "@/lib/cms/links";

type Props = {
  locale: Locale;
  tone?: "light" | "dark";
  className?: string;
  siteConfig?: SiteConfig;
};

export default function LanguageToggle({ locale, tone = "dark", className = "", siteConfig }: Props) {
  const pathname = usePathname();

  function pathFor(target: Locale) {
    if (siteConfig) {
      const currentHome = resolveHomeLink(siteConfig, locale);
      if (pathname === currentHome || pathname === `${currentHome}/`) {
        return resolveHomeLink(siteConfig, target);
      }

      const currentPrivacy = resolvePrivacyLink(siteConfig, locale);
      if (pathname === currentPrivacy || pathname === `${currentPrivacy}/`) {
        return resolvePrivacyLink(siteConfig, target);
      }

      for (const item of siteConfig.navigation) {
        const currentBase = resolveNavigationLink(siteConfig, locale, item.key);
        if (pathname === currentBase || pathname.startsWith(`${currentBase.replace(/\/+$/, "")}/`)) {
          const suffix = pathname.slice(currentBase.replace(/\/+$/, "").length).replace(/^\/+/, "");
          return resolveNavigationLink(siteConfig, target, item.key, suffix);
        }
      }
    }

    const segments = pathname.split("/");
    if (segments.length > 1) segments[1] = target;
    const next = segments.join("/");
    return next || `/${target}`;
  }

  const base = tone === "light" ? "text-white/70" : "text-muted";
  const active = tone === "light" ? "text-white" : "text-navy";

  return (
    <div className={`flex items-center gap-1.5 text-[0.82rem] font-display font-semibold ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className={tone === "light" ? "text-white/30" : "text-line"}>/</span>}
          <Link
            href={pathFor(l)}
            aria-current={l === locale ? "true" : undefined}
            className={`-m-2 inline-block p-2 tracking-wide transition-colors ${l === locale ? active : `${base} hover:${active}`}`}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
