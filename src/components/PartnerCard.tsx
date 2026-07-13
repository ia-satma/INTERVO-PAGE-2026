import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Mail, Phone, ArrowUpRight } from "./icons";

type Props = {
  href: string;
  index: number;
  name: string;
  role: string;
  photo: string;
  chambers?: string | null;
  specialties: string[];
  specialtiesLabel: string;
  activeSpecialty?: string | null;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  viewProfileLabel: string;
};

/** A single entry in the partner roster — a full-width alternating row (photo
 * left/right by position) rather than a uniform card grid, closer to an
 * editorial directory than a team-page grid. */
export default function PartnerCard({
  href,
  index,
  name,
  role,
  photo,
  chambers,
  specialties,
  specialtiesLabel,
  activeSpecialty,
  email,
  phoneDisplay,
  phoneHref,
  viewProfileLabel,
}: Props) {
  const reversed = index % 2 === 0;

  return (
    <article className="group border-b border-line py-12 transition-transform duration-500 first:pt-0 last:border-b-0 hover:-translate-y-1 md:py-14">
      <div className={`flex flex-col gap-8 md:gap-12 lg:items-center ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        <Link
          href={href}
          className="relative block aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl bg-mist shadow-card lg:w-[34%]"
        >
          <Image
            src={asset(photo)}
            alt={name}
            fill
            className="object-cover grayscale transition-[filter,scale] duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
            sizes="(max-width: 1024px) 100vw, 34vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-navy-950/0 to-transparent" />
          {chambers && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-navy-950/60 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Chambers · {chambers}
            </span>
          )}
        </Link>

        <div className="relative min-w-0 lg:flex-1">
          <span
            aria-hidden
            className={`pointer-events-none absolute -top-8 hidden font-serif text-[7rem] leading-none text-navy/[0.05] md:block lg:-top-10 lg:text-[8.5rem] ${
              reversed ? "right-0" : "left-0"
            }`}
          >
            {String(index).padStart(2, "0")}
          </span>

          <div className="relative">
            <p className="font-display text-sm font-medium text-azure">{role}</p>
            <Link href={href} className="group/link mt-2 block w-fit">
              <h3 className="display-3 leading-[1.05] transition-colors group-hover/link:text-navy">{name}</h3>
            </Link>

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {specialtiesLabel}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specialties.map((s) => {
                const active = s === activeSpecialty;
                return (
                  <span
                    key={s}
                    className={`rounded-full border px-3 py-1 text-[0.82rem] leading-none transition-colors ${
                      active ? "border-navy bg-navy text-white" : "border-line bg-white text-ink/70"
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.92rem]">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 text-ink/75 transition-colors hover:text-navy"
              >
                <Mail className="h-4 w-4 shrink-0 text-azure" />
                {email}
              </a>
              <a href={phoneHref} className="flex items-center gap-2.5 text-ink/75 transition-colors hover:text-navy">
                <Phone className="h-4 w-4 shrink-0 text-azure" />
                {phoneDisplay}
              </a>
            </div>

            <Link
              href={href}
              className="mt-7 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-navy"
            >
              {viewProfileLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
