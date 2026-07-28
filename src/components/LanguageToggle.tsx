"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export type LanguageRoutes = {
  home: Record<Locale, string>;
  privacy: Record<Locale, string>;
  navigation: Array<{
    key: string;
    href: Record<Locale, string>;
  }>;
};

type Props = {
  locale: Locale;
  tone?: "light" | "dark";
  className?: string;
  routes?: LanguageRoutes;
};

export default function LanguageToggle({ locale, tone = "dark", className = "", routes }: Props) {
  const pathname = usePathname();

  function pathFor(target: Locale) {
    if (routes) {
      const currentHome = routes.home[locale];
      if (pathname === currentHome || pathname === `${currentHome}/`) {
        return routes.home[target];
      }

      const currentPrivacy = routes.privacy[locale];
      if (pathname === currentPrivacy || pathname === `${currentPrivacy}/`) {
        return routes.privacy[target];
      }

      for (const item of routes.navigation) {
        const currentBase = item.href[locale];
        if (pathname === currentBase || pathname.startsWith(`${currentBase.replace(/\/+$/, "")}/`)) {
          const suffix = pathname.slice(currentBase.replace(/\/+$/, "").length).replace(/^\/+/, "");
          return suffix
            ? `${item.href[target].replace(/\/+$/, "")}/${suffix}`
            : item.href[target];
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
