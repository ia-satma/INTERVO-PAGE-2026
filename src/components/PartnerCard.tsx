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
  specialties: string[];
  specialtiesLabel: string;
  managing?: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  viewProfileLabel: string;
};

export default function PartnerCard({
  href,
  name,
  role,
  photo,
  chambers,
  specialties,
  specialtiesLabel,
  managing,
  email,
  phoneDisplay,
  phoneHref,
  viewProfileLabel,
}: Props) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-mist">
        <Image
          src={asset(photo)}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/0 to-transparent" />
        {managing && (
          <span className="tag absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5">
            {role}
          </span>
        )}
        {chambers && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-navy-950/60 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            Chambers · {chambers}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link href={href} className="group/link">
          <h3 className="font-serif text-2xl leading-tight transition-colors group-hover/link:text-navy">
            {name}
          </h3>
        </Link>
        {!managing && <p className="mt-1 text-sm font-medium text-azure">{role}</p>}

        <div className="hairline mt-5" />

        <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {specialtiesLabel}
        </p>
        <ul className="mt-3 space-y-2">
          {specialties.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-[0.92rem] text-ink/80">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-azure" />
              {s}
            </li>
          ))}
        </ul>

        <div className="hairline mt-6" />

        <div className="mt-5 flex flex-col gap-2 text-[0.88rem]">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 text-ink/75 transition-colors hover:text-navy"
          >
            <Mail className="h-4 w-4 shrink-0 text-azure" />
            <span className="truncate">{email}</span>
          </a>
          <a href={phoneHref} className="flex items-center gap-2.5 text-ink/75 transition-colors hover:text-navy">
            <Phone className="h-4 w-4 shrink-0 text-azure" />
            {phoneDisplay}
          </a>
        </div>

        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-sm font-semibold text-navy"
        >
          {viewProfileLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
