import type { Icon } from "@phosphor-icons/react";

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  icon: Icon;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0f4386] text-white shadow-[0_10px_24px_-16px_rgba(15,67,134,0.8)]">
          <Icon size={22} weight="duotone" />
        </span>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sky-700">{eyebrow}</p>
          <h1 className="mt-1 font-[Bricolage_Grotesque_Variable] text-3xl font-semibold tracking-[-0.035em] text-slate-950 md:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
