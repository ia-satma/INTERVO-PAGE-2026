"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LanguageToggle, { type LanguageRoutes } from "./LanguageToggle";
import { MarbleDuotone } from "./abstract";
import { Menu, Close, ArrowUpRight, Phone, Mail, Linkedin, Globe } from "./icons";
import type { Locale } from "@/i18n/config";

export type HeaderModel = {
  home: string;
  homeLabel: string;
  descriptor: string;
  tagline: string;
  legalName: string;
  menuLabel: string;
  closeLabel: string;
  offices: string[];
  contact: {
    phoneHref: string;
    phoneDisplay: string;
    emailHref: string;
    email: string;
  };
  media: {
    logoColor: string;
    logoWhite: string;
    menuBackground: string;
  };
  navigation: Array<{
    key: string;
    label: string;
    href: string;
  }>;
  socialLinks: Array<{
    id: string;
    label: string;
    href: string;
  }>;
  languageRoutes: LanguageRoutes;
};

export default function Header({ locale, model }: { locale: Locale; model: HeaderModel }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const scrolledRef = useRef(false);
  const scrollFrame = useRef(0);

  const home = model.home;
  const isHome = pathname === home || pathname === `${home}/`;

  useEffect(() => {
    const update = () => {
      scrollFrame.current = 0;
      const next = window.scrollY > 24;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!scrollFrame.current) scrollFrame.current = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame.current);
    };
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
  const openMenu = () => {
    setMenuMounted(true);
    setOpen(true);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          transparent
            ? "bg-transparent"
            : "border-b border-line/80 bg-white/95 shadow-[0_1px_20px_-12px_rgba(15,67,134,0.4)]"
        } ${open ? "!bg-transparent !border-transparent !shadow-none" : ""}`}
      >
        <div className="container-x flex h-[4.75rem] items-center justify-between gap-6">
          <Link href={home} aria-label={model.homeLabel} className={`relative z-10 shrink-0 ${open ? "opacity-0" : ""}`}>
            <Logo
              variant={transparent ? "white" : "color"}
              colorSrc={model.media.logoColor}
              whiteSrc={model.media.logoWhite}
              alt={model.descriptor}
              className="h-8 w-auto md:h-9"
              priority
            />
          </Link>

          <div className="flex items-center gap-5">
            <LanguageToggle locale={locale} tone={transparent ? "light" : "dark"} className={open ? "opacity-0" : ""} routes={model.languageRoutes} />
            <span className={`h-4 w-px ${transparent ? "bg-white/25" : "bg-line"} ${open ? "opacity-0" : ""}`} />
            <button
              type="button"
              onClick={openMenu}
              aria-label={model.menuLabel}
              aria-expanded={open}
              className={`flex items-center gap-2.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] transition-colors ${
                open ? "opacity-0" : transparent ? "text-white" : "text-ink"
              }`}
            >
              <span className="hidden sm:inline">{model.menuLabel}</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen drop-down menu */}
      {menuMounted && <div
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
          <MarbleDuotone src={model.media.menuBackground} className="absolute inset-0 opacity-[0.14]" />
          <div className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative flex h-full flex-col items-start justify-between p-12">
            <Logo variant="white" colorSrc={model.media.logoColor} whiteSrc={model.media.logoWhite} alt={model.descriptor} className="h-9 w-auto" />
            <div>
              <p className="font-serif text-3xl leading-tight text-white/90">{model.tagline}</p>
              <p className="mt-4 text-sm text-white/50">
                {model.legalName} · {model.offices.join(" · ")}
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
            <Logo variant="color" colorSrc={model.media.logoColor} whiteSrc={model.media.logoWhite} alt={model.descriptor} className="h-8 w-auto lg:hidden" />
            <span className="hidden lg:block" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
            >
              {model.closeLabel}
              <Close className="h-6 w-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col justify-center gap-1 px-8 md:px-14">
            {model.navigation.map(({ key, label, href }, idx) => (
              <Link
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${0.15 + idx * 0.06}s` : "0s" }}
                className={`group flex items-center gap-4 font-serif text-4xl leading-[1.15] text-ink transition-[color,transform,opacity] duration-500 hover:translate-x-2 hover:text-navy md:text-5xl ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {label}
                <ArrowUpRight className="h-6 w-6 -translate-x-2 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          {/* Footer utilities */}
          <div className="flex flex-col gap-5 border-t border-line px-8 py-7 text-ink sm:flex-row sm:items-center sm:justify-between md:px-14">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
              <a href={model.contact.phoneHref} className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
                <Phone className="h-4 w-4" /> {model.contact.phoneDisplay}
              </a>
              <a href={model.contact.emailHref} className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
                <Mail className="h-4 w-4" /> {model.contact.email}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {model.socialLinks.map((social) => {
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
      </div>}
    </>
  );
}
