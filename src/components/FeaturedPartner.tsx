import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Mail, Phone, ArrowUpRight } from "./icons";

type Props = {
  href: string;
  name: string;
  role: string;
  photo: string;
  chambers?: string | null;
  chambersLabel: string;
  specialties: string[];
  specialtiesLabel: string;
  activeSpecialty?: string | null;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  viewProfileLabel: string;
};

/** Masthead-style treatment for the Managing Partner — sets them apart from
 * the rest of the directory grid rather than blending into a uniform row. */
export default function FeaturedPartner({
  href,
  name,
  role,
  photo,
  chambers,
  chambersLabel,
  specialties,
  specialtiesLabel,
  activeSpecialty,
  email,
  phoneDisplay,
  phoneHref,
  viewProfileLabel,
}: Props) {
  return (
    <div className="grain relative overflow-hidden rounded-2xl bg-navy-950">
      <div className="glow-radial pointer-events-none absolute inset-0" />
      <div className="relative grid gap-0 lg:grid-cols-12">
        <Link
          href={href}
          className="group relative block aspect-[4/5] overflow-hidden lg:col-span-5 lg:aspect-auto"
        >
          <Image
            src={asset(photo)}
            alt={name}
            fill
            className="object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/10 to-transparent lg:bg-gradient-to-r" />
        </Link>

        <div className="relative flex flex-col justify-center p-8 md:p-12 lg:col-span-7">
          <span className="eyebrow eyebrow--light">{role}</span>
          <Link href={href} className="group/link mt-5 w-fit">
            <h3 className="display-2 text-white transition-colors group-hover/link:text-accent-soft">{name}</h3>
          </Link>

          {chambers && (
            <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.1] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-soft">
              {chambersLabel} · Chambers · {chambers}
            </span>
          )}

          <p className="mt-7 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            {specialtiesLabel}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specialties.map((s) => {
              const active = s === activeSpecialty;
              return (
                <span
                  key={s}
                  className={`rounded-full border px-2.5 py-1 text-[0.78rem] leading-none transition-colors ${
                    active
                      ? "border-accent bg-accent text-navy-950"
                      : "border-white/15 bg-white/[0.04] text-white/75"
                  }`}
                >
                  {s}
                </span>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.9rem]">
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent-soft" />
              {email}
            </a>
            <a href={phoneHref} className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white">
              <Phone className="h-4 w-4 shrink-0 text-accent-soft" />
              {phoneDisplay}
            </a>
          </div>

          <Link
            href={href}
            className="group/cta mt-8 inline-flex w-fit items-center gap-1.5 font-display text-sm font-semibold text-white"
          >
            {viewProfileLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
