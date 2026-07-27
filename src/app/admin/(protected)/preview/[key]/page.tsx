import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "@phosphor-icons/react/dist/ssr";
import { getCmsDocument } from "@/lib/cms/repository";

type UnknownRecord = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sectionBlocks(value: UnknownRecord) {
  return Object.entries(value).filter(([, item]) => item && typeof item === "object");
}

export default async function AdminPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const { key } = await params;
  const { locale: localeParam } = await searchParams;
  const locale = localeParam === "en" ? "en" : "es";
  const document = await getCmsDocument(decodeURIComponent(key), "draft");
  if (!document) notFound();
  const localized = document.data?.[locale];
  const value = (localized && typeof localized === "object" ? localized : document.data) as UnknownRecord;
  const hero = (value.hero && typeof value.hero === "object" ? value.hero : value) as UnknownRecord;
  const title = text(hero.title) || text(value.title) || document.label;
  const subtitle = text(hero.subtitle) || text(value.subtitle) || text(hero.body);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-sky-900"><Eye size={18} /> Vista protegida del borrador · {locale.toUpperCase()}</div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/preview/${encodeURIComponent(document.key)}?locale=${locale === "es" ? "en" : "es"}`} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-800">Ver {locale === "es" ? "EN" : "ES"}</Link>
          <Link href={`/admin/content/${encodeURIComponent(document.key)}`} className="inline-flex items-center gap-2 rounded-lg bg-[#0f4386] px-3 py-2 text-xs font-semibold text-white"><ArrowLeft size={15} /> Volver al editor</Link>
        </div>
      </div>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_70px_-55px_rgba(15,23,42,0.8)]">
        <header className="bg-[#071d36] px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{text(hero.eyebrow) || document.label}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{subtitle}</p>}
        </header>
        <div className="divide-y divide-slate-200">
          {sectionBlocks(value).map(([name, item]) => {
            const block = item as UnknownRecord;
            const blockTitle = text(block.title) || text(block.heading);
            const blockBody = text(block.body) || text(block.description) || text(block.subtitle);
            if (!blockTitle && !blockBody && name === "hero") return null;
            return (
              <section key={name} className="px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-sky-700">{name.replace(/([A-Z])/g, " $1")}</p>
                {blockTitle && <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-slate-950">{blockTitle}</h2>}
                {blockBody && <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-slate-600">{blockBody}</p>}
                {Array.isArray(block.items) && <div className="mt-7 grid gap-3 md:grid-cols-2">{(block.items as UnknownRecord[]).slice(0, 8).map((itemValue, index) => <div key={index} className="border-t border-slate-300 pt-4"><p className="font-semibold text-slate-800">{text(itemValue.title) || text(itemValue.label) || `Elemento ${index + 1}`}</p><p className="mt-2 text-sm text-slate-500">{text(itemValue.body) || text(itemValue.desc)}</p></div>)}</div>}
              </section>
            );
          })}
        </div>
      </article>
    </>
  );
}
