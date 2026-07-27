import Link from "next/link";
import { Globe, Linkedin, Lock } from "./icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteConfig } from "@/lib/cms/types";
import { resolveNavigationLink, resolvePrivacyLink, visibleSocialLinks } from "@/lib/cms/links";

export default function Footer({ locale, dict, siteConfig }: { locale: Locale; dict: Dictionary; siteConfig: SiteConfig }) {
  const t = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="container-x py-9 md:py-10">
        {/* Row 1 — primary links + social */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 font-display text-[0.98rem] font-semibold">
            {siteConfig.navigation.filter((item) => item.visible !== false).map(({ key, labelEs, labelEn }) => (
              <Link
                key={key}
                href={resolveNavigationLink(siteConfig, locale, key)}
                className="text-ink transition-colors hover:text-navy"
              >
                {(locale === "es" ? labelEs : labelEn) || dict.nav[key as keyof typeof dict.nav] || key}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            {visibleSocialLinks(siteConfig).map((social) => {
              const SocialIcon = social.id.toLowerCase() === "linkedin" ? Linkedin : Globe;
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white transition-colors hover:bg-azure"
                >
                  <SocialIcon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Row 2 — legal + copyright */}
        <div className="mt-7 flex flex-col gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-muted-2 md:flex-row md:flex-wrap md:items-center">
          <Link href={resolvePrivacyLink(siteConfig, locale)} className="link-underline transition-colors hover:text-navy">
            {t.privacy}
          </Link>
          <span className="hidden text-line md:inline">·</span>
          <span>© {year} {siteConfig.site.legalName} {t.rights}</span>
          <span className="hidden text-line md:inline">·</span>
          <span>{siteConfig.offices.map((office) => office.city).join(" · ")}</span>
          <Link
            href="/admin/login"
            prefetch={false}
            aria-label={t.adminAccess}
            title={t.adminAccess}
            className="mt-2 inline-flex h-7 w-7 items-center justify-center self-start rounded-full border border-line text-muted-2 transition-[border-color,color,background-color] hover:border-navy/30 hover:bg-mist hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:mt-0 md:ml-auto md:self-auto"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
