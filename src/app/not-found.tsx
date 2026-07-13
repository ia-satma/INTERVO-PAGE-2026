"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";
import { ArrowRight } from "@/components/icons";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, defaultLocale } from "@/i18n/config";
import { localePath } from "@/lib/site";

/**
 * Root-level not-found — this is the one Next actually bakes into the static
 * export's top-level `out/404.html`, which GitHub Pages serves for ANY
 * unmatched path (locale-prefixed or not). The nested `[locale]/not-found.tsx`
 * only covers client-side "soft" 404s inside an already-hydrated session.
 * Same pattern: derive locale from the URL on the client (no `params` available here).
 */
export default function RootNotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);
  const t = dict.notFound;

  return (
    <html lang={dict.htmlLang}>
      <body>
        <section className="grid min-h-screen place-items-center px-6">
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
      </body>
    </html>
  );
}
