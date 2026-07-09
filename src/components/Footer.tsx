import Link from "next/link";
import Logo from "./Logo";
import { Phone, Mail, Linkedin, MapPin } from "./icons";
import { NAV, localePath, CONTACT, OFFICES, SITE } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy-900 text-white/70">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-x relative">
        <div className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
          {/* Brand */}
          <div className="md:col-span-5">
            <Logo variant="white" className="h-10 w-auto" />
            <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-white/60">{t.blurb}</p>
            <p className="mt-6 font-display text-lg font-medium text-white">{t.tagline}</p>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          {/* Nav */}
          <div className="md:col-span-2">
            <h3 className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              {t.navLabel}
            </h3>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {NAV.map(({ key, slug }) => (
                <li key={key}>
                  <Link
                    href={localePath(locale, slug)}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              {t.contactLabel}
            </h3>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              <li>
                <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 text-azure-bright" /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref} className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                  <Mail className="h-4 w-4 text-azure-bright" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Offices */}
          <div className="md:col-span-3">
            <h3 className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              {t.officesLabel}
            </h3>
            <ul className="mt-5 space-y-5 text-[0.9rem] leading-relaxed">
              {OFFICES.map((o) => (
                <li key={o.id} className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-azure-bright" />
                  <span className="text-white/65">
                    <span className="block font-medium text-white/90">{o.city}</span>
                    {o.lines.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-7 text-[0.82rem] text-white/45 md:flex-row md:items-center">
          <p>
            © {year} {SITE.legalName}. {t.rights}
          </p>
          <div className="flex items-center gap-5">
            <Link href={localePath(locale, "aviso-de-privacidad")} className="transition-colors hover:text-white/80">
              {t.privacy}
            </Link>
            <span className="text-white/30">·</span>
            <span>{t.madeIn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
