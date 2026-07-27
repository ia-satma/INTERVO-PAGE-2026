import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRight, Phone } from "./icons";
import { asset } from "@/lib/asset";
import type { Locale } from "@/i18n/config";
import { getPublishedSiteConfig } from "@/lib/cms/repository";
import { resolveNavigationLink } from "@/lib/cms/links";

type Props = {
  locale: Locale;
  title: string;
  body: string;
  ctaLabel: string;
};

export default async function CTASection({ locale, title, body, ctaLabel }: Props) {
  const siteConfig = await getPublishedSiteConfig();
  return (
    <section className="mesh grain relative overflow-hidden text-white">
      <Image
        src={asset(siteConfig.media.ctaBackground)}
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
            <Link href={resolveNavigationLink(siteConfig, locale, "contacto")} className="btn btn-light !px-7 !py-3.5">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a href={siteConfig.contact.phoneHref} className="btn btn-outline-light !px-7 !py-3.5">
              <Phone className="h-4 w-4" />
              {siteConfig.contact.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
