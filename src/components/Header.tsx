"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import { Menu, Close, ArrowUpRight } from "./icons";
import { NAV, localePath } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { NavKey } from "@/lib/site";

type Props = {
  locale: Locale;
  nav: Record<NavKey, string>;
  cta: string;
};

export default function Header({ locale, nav, cta }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const home = localePath(locale);
  const isHome = pathname === home || pathname === `${home}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
        transparent
          ? "bg-transparent"
          : "border-b border-line/80 bg-white/85 shadow-[0_1px_20px_-12px_rgba(15,67,134,0.4)] backdrop-blur-md"
      }`}
    >
      <div className="container-x flex h-[4.75rem] items-center justify-between gap-6">
        <Link href={home} aria-label="intervø — inicio" className="relative z-10 shrink-0">
          <Logo variant={transparent ? "white" : "color"} className="h-8 w-auto md:h-9" priority />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map(({ key, slug }) => {
            const href = localePath(locale, slug);
            const activeLink = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={key}
                href={href}
                className={`link-underline font-display text-[0.9rem] font-medium transition-colors ${
                  transparent
                    ? "text-white/85 hover:text-white"
                    : activeLink
                      ? "text-navy"
                      : "text-ink/80 hover:text-navy"
                }`}
              >
                {nav[key]}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageToggle locale={locale} tone={transparent ? "light" : "dark"} />
          <span className={`h-4 w-px ${transparent ? "bg-white/25" : "bg-line"}`} />
          <Link
            href={localePath(locale, "contacto")}
            className={`btn ${transparent ? "btn-outline-light" : "btn-primary"} !px-5 !py-2.5 text-[0.85rem]`}
          >
            {cta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
            transparent ? "text-white" : "text-ink"
          }`}
        >
          {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={`fixed inset-0 top-0 z-0 origin-top bg-navy-900 transition-[opacity,transform] duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="bg-grid flex h-full flex-col px-6 pb-10 pt-28">
          <nav className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {NAV.map(({ key, slug }) => (
              <Link
                key={key}
                href={localePath(locale, slug)}
                className="flex items-center justify-between py-4 font-display text-2xl font-medium text-white/90 transition-colors hover:text-white"
              >
                {nav[key]}
                <ArrowUpRight className="h-5 w-5 text-azure-bright" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between pt-10">
            <LanguageToggle locale={locale} tone="light" />
            <Link
              href={localePath(locale, "contacto")}
              className="btn btn-light !px-6 !py-3"
            >
              {cta}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
