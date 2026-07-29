import Image from "next/image";
import { ServiceIcon } from "./icons";
import { asset } from "@/lib/asset";

type Props = {
  id: string;
  title: string;
  desc?: string;
  index?: string;
  image?: string;
};

const SERVICE_IMAGES: Record<string, string> = {
  ma: "/images/services/fusiones-adquisiciones-ma.webp",
  finance: "/images/services/finanzas-corporativas.webp",
  corporate: "/images/services/corporativo-transaccional.webp",
  trusts: "/images/services/fideicomisos-planeacion-patrimonial.webp",
  realestate: "/images/services/derecho-inmobiliario.webp",
};

export default function ServiceCard({ id, title, desc, index, image: configuredImage }: Props) {
  const image = configuredImage || SERVICE_IMAGES[id];

  return (
    <article className="group relative flex h-full min-h-[21rem] overflow-hidden rounded-2xl bg-navy-950 shadow-card transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-soft">
      {image && (
        <Image
          src={asset(image)}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/92 via-navy/74 to-azure/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/32 to-white/8" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/12 transition-colors duration-500 group-hover:ring-accent-soft/45" />

      <div className="relative z-10 flex h-full w-full flex-col p-7">
        <div className="flex items-center justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/70 bg-white text-navy shadow-soft transition-colors duration-500 group-hover:bg-accent-soft group-hover:text-navy-950">
            <ServiceIcon id={id} className="h-6 w-6" />
          </span>
          {index && (
            <span className="font-display text-sm font-semibold text-white/70">{index}</span>
          )}
        </div>
        <div className="mt-auto pt-12">
          <h3 className="font-serif text-2xl leading-snug text-white">{title}</h3>
          {desc && <p className="mt-3 text-[1rem] leading-relaxed text-white/80">{desc}</p>}
          <span className="mt-5 block h-px w-10 bg-accent-soft transition-all duration-500 group-hover:w-20" />
        </div>
      </div>
    </article>
  );
}
