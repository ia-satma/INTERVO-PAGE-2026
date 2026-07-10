import Link from "next/link";
import { Linkedin } from "./icons";
import { NAV, localePath, SITE } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="container-x py-9 md:py-10">
        {/* Row 1 — primary links + social */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 font-display text-[0.98rem] font-semibold">
            {NAV.map(({ key, slug }) => (
              <Link
                key={key}
                href={localePath(locale, slug)}
                className="text-ink transition-colors hover:text-navy"
              >
                {dict.nav[key]}
              </Link>
            ))}
          </nav>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white transition-colors hover:bg-azure"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>

        {/* Row 2 — legal + copyright */}
        <div className="mt-7 flex flex-col gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-muted-2 md:flex-row md:flex-wrap md:items-center">
          <Link href={localePath(locale, "aviso-de-privacidad")} className="transition-colors hover:text-navy">
            {t.privacy}
          </Link>
          <span className="hidden text-line md:inline">·</span>
          <span>© {year} {SITE.legalName} {t.rights}</span>
          <span className="hidden text-line md:inline">·</span>
          <span>Monterrey · Ciudad Juárez</span>
        </div>
      </div>
    </footer>
  );
}
