"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import { MarbleDuotone } from "./abstract";
import { Menu, Close, ArrowUpRight, Phone, Mail, Linkedin, Globe } from "./icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteConfig } from "@/lib/cms/types";
import { resolveHomeLink, resolveNavigationLink, visibleSocialLinks } from "@/lib/cms/links";

export default function Header({ locale, dict, siteConfig }: { locale: Locale; dict: Dictionary; siteConfig: SiteConfig }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const home = resolveHomeLink(siteConfig, locale);
  const isHome = pathname === home || pathname === `${home}/`;
  const menuLabel = dict.header.menu;
  const closeLabel = dict.header.close;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const transparent = isHome && !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          transparent
            ? "bg-transparent"
            : "border-b border-line/80 bg-white/85 shadow-[0_1px_20px_-12px_rgba(15,67,134,0.4)] backdrop-blur-md"
        } ${open ? "!bg-transparent !border-transparent !shadow-none" : ""}`}
      >
        <div className="container-x flex h-[4.75rem] items-center justify-between gap-6">
          <Link href={home} aria-label={dict.brand.homeLabel} className={`relative z-10 shrink-0 ${open ? "opacity-0" : ""}`}>
            <Logo
              variant={transparent ? "white" : "color"}
              colorSrc={siteConfig.media.logoColor}
              whiteSrc={siteConfig.media.logoWhite}
              alt={dict.brand.descriptor}
              className="h-8 w-auto md:h-9"
              priority
            />
          </Link>

          <div className="flex items-center gap-5">
            <LanguageToggle locale={locale} tone={transparent ? "light" : "dark"} className={open ? "opacity-0" : ""} siteConfig={siteConfig} />
            <span className={`h-4 w-px ${transparent ? "bg-white/25" : "bg-line"} ${open ? "opacity-0" : ""}`} />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={menuLabel}
              aria-expanded={open}
              className={`flex items-center gap-2.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
                open ? "opacity-0" : transparent ? "text-white" : "text-ink"
              }`}
            >
              <span className="hidden sm:inline">{menuLabel}</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen drop-down menu */}
      <div
        className={`fixed inset-0 z-[60] flex ${open ? "" : "pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        {/* Left atmospheric panel (desktop) */}
        <div
          className={`relative hidden overflow-hidden bg-navy-950 transition-opacity duration-700 lg:block lg:w-[42%] ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <MarbleDuotone src={siteConfig.media.menuBackground} className="absolute inset-0 opacity-[0.14]" />
          <div className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative flex h-full flex-col items-start justify-between p-12">
            <Logo variant="white" colorSrc={siteConfig.media.logoColor} whiteSrc={siteConfig.media.logoWhite} alt={dict.brand.descriptor} className="h-9 w-auto" />
            <div>
              <p className="font-serif text-3xl leading-tight text-white/90">{dict.brand.tagline}</p>
              <p className="mt-4 text-sm text-white/50">
                {siteConfig.site.legalName} · {siteConfig.offices.map((office) => office.city).join(" · ")}
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`relative ml-auto flex h-full w-full flex-col bg-white transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:w-[58%] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 pt-7 md:px-14">
            <Logo variant="color" colorSrc={siteConfig.media.logoColor} whiteSrc={siteConfig.media.logoWhite} alt={dict.brand.descriptor} className="h-8 w-auto lg:hidden" />
            <span className="hidden lg:block" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
            >
              {closeLabel}
              <Close className="h-6 w-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col justify-center gap-1 px-8 md:px-14">
            {siteConfig.navigation.filter((item) => item.visible !== false).map(({ key, labelEs, labelEn }, idx) => (
              <Link
                key={key}
                href={resolveNavigationLink(siteConfig, locale, key)}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${0.15 + idx * 0.06}s` : "0s" }}
                className={`group flex items-center gap-4 font-serif text-4xl leading-[1.15] text-ink transition-[color,transform,opacity] duration-500 hover:translate-x-2 hover:text-navy md:text-5xl ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {(locale === "es" ? labelEs : labelEn) || dict.nav[key as keyof typeof dict.nav] || key}
                <ArrowUpRight className="h-6 w-6 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          {/* Footer utilities */}
          <div className="flex flex-col gap-5 border-t border-line px-8 py-7 text-ink sm:flex-row sm:items-center sm:justify-between md:px-14">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
              <a href={siteConfig.contact.phoneHref} className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
                <Phone className="h-4 w-4" /> {siteConfig.contact.phoneDisplay}
              </a>
              <a href={siteConfig.contact.emailHref} className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
                <Mail className="h-4 w-4" /> {siteConfig.contact.email}
              </a>
            </div>
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 transition-colors hover:bg-navy hover:text-white"
                  >
                    <SocialIcon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
