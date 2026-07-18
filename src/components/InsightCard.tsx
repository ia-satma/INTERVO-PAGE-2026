import Image from "next/image";
import { ArrowRight } from "./icons";
import { asset } from "@/lib/asset";
import type { Dictionary } from "@/i18n/dictionaries";

type Insight = Dictionary["insights"]["items"][number];

export default function InsightCard({ item, readMore }: { item: Insight; readMore: string }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card">
      <div className="mesh grain relative h-36 overflow-hidden">
        <Image
          src={asset("/images/textures/brand-shapes-navy-2.webp")}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-navy-950/30" />
        <span className="tag absolute left-5 top-5 text-accent-soft">{item.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-muted-2">
          <span>{item.area}</span>
          <span className="text-line">·</span>
          <span>{item.date}</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-snug">{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-[1rem] leading-relaxed text-muted">{item.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-sm font-semibold text-navy">
          {readMore}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
