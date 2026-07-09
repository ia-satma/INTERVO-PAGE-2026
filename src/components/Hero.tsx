import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowUpRight } from "./icons";
import { localePath } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.hero;
  return (
    <section className="relative flex min-h-[94svh] items-center overflow-hidden bg-navy-900">
      <Image
        src="/images/hero-partners.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/88 to-navy-900/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/40" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="container-x relative w-full pb-24 pt-32">
        <div className="max-w-2xl">
          <Reveal y={16}>
            <span className="eyebrow !text-azure-bright">{t.eyebrow}</span>
          </Reveal>
          <Reveal y={20} delay={0.08}>
            <h1 className="display-1 mt-6 text-white">{t.title}</h1>
          </Reveal>
          <Reveal y={20} delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{t.subtitle}</p>
          </Reveal>
          <Reveal y={20} delay={0.24}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={localePath(locale, "contacto")} className="btn btn-light !px-7 !py-3.5">
                {t.ctaPrimary}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={localePath(locale, "servicios")} className="btn btn-outline-light !px-7 !py-3.5">
                {t.ctaSecondary}
              </Link>
            </div>
          </Reveal>
          <Reveal y={16} delay={0.34}>
            <div className="mt-11 flex max-w-md items-center gap-3.5 border-l-2 border-azure-bright pl-4">
              <p className="text-[0.88rem] leading-snug text-white/70">{t.chambers}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
