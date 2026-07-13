import { initials } from "@/lib/site";
import { Mail, Phone } from "./icons";

type Props = {
  name: string;
  role: string;
  chambers?: string | null;
  specialties: string[];
  specialtiesLabel: string;
  managing?: boolean;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
};

export default function PartnerCard({
  name,
  role,
  chambers,
  specialties,
  specialtiesLabel,
  managing,
  email,
  phoneDisplay,
  phoneHref,
}: Props) {
  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card">
      {managing && (
        <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-azure-bright" aria-hidden />
      )}
      <div className="flex items-center gap-4">
        <span
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-white"
          style={{ background: "linear-gradient(140deg, var(--color-azure) 0%, var(--color-navy) 85%)" }}
        >
          {initials(name)}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-2xl leading-tight">{name}</h3>
          <p className="mt-1 text-sm font-medium text-azure">{role}</p>
        </div>
      </div>

      {chambers && (
        <span className="tag mt-5 w-fit rounded-full border border-accent/30 bg-accent/[0.06] px-3 py-1.5">
          Chambers · {chambers}
        </span>
      )}

      <div className="hairline mt-6" />

      <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
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
    </div>
  );
}
