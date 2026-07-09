import Image from "next/image";
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
        src="/brand/isotype-color.png"
        alt=""
        width={520}
        height={520}
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 hidden w-[26rem] opacity-[0.05] md:block"
      />
      <div className="container-x relative">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display-1 mt-5 max-w-4xl">{title}</h1>
          {subtitle && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
