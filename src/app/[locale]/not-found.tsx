"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, defaultLocale } from "@/i18n/config";
import { localePath } from "@/lib/site";

/**
 * Next.js App Router does not pass `params` to not-found.tsx, so the locale
 * is derived from the URL on the client instead (same pattern as Header/LanguageToggle).
 */
export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);
  const t = dict.notFound;

  return (
    <section className="grid min-h-[70vh] place-items-center px-6 pt-24">
      <div className="text-center">
        <p className="font-display text-6xl font-bold text-navy">{t.code}</p>
        <p className="mt-4 text-lg text-muted">{t.message}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href={localePath(locale)} className="btn btn-primary !px-6 !py-3">
            {t.backHome}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
