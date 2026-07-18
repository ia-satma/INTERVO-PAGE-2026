import Image from "next/image";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-mist pb-16 pt-36 md:pb-20 md:pt-44">
      <Image
        src={asset("/images/textures/brand-shapes-light.webp")}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-mist/40" />
      <div className="fade-accent-top pointer-events-none absolute inset-x-0 bottom-0 h-24" />
      <div className="container-x relative">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display-1 mt-5 max-w-4xl">{title}</h1>
          {subtitle && <p className="lead mt-6 max-w-2xl text-muted">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
