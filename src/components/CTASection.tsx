import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRight, Phone } from "./icons";
import { localePath, CONTACT } from "@/lib/site";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  title: string;
  body: string;
  ctaLabel: string;
};

export default function CTASection({ locale, title, body, ctaLabel }: Props) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(10,134,207,0.35) 0%, transparent 70%)" }}
      />
      <div className="container-x section relative text-center">
        <Reveal>
          <h2 className="display-2 mx-auto max-w-3xl text-white">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">{body}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={localePath(locale, "contacto")} className="btn btn-light !px-7 !py-3.5">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a href={CONTACT.phoneHref} className="btn btn-outline-light !px-7 !py-3.5">
              <Phone className="h-4 w-4" />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
