import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRight, Phone } from "./icons";
import { localePath, CONTACT } from "@/lib/site";
import { asset } from "@/lib/asset";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  title: string;
  body: string;
  ctaLabel: string;
};

export default function CTASection({ locale, title, body, ctaLabel }: Props) {
  return (
    <section className="mesh grain relative overflow-hidden text-white">
      <Image
        src={asset("/images/textures/brand-shapes-navy-3.webp")}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-navy-950/40" />
      <div className="container-x section relative z-10 text-center">
        <Reveal>
          <h2 className="display-2 mx-auto max-w-3xl text-white">{title}</h2>
          <p className="lead mx-auto mt-6 max-w-xl text-white/70">{body}</p>
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
