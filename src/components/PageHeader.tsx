import Reveal from "./Reveal";
import { BridgeMotif } from "./abstract";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-mist pb-16 pt-36 md:pb-20 md:pt-44">
      <BridgeMotif className="pointer-events-none absolute -right-16 -top-6 hidden w-[34rem] text-navy/[0.06] md:block" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: "linear-gradient(to top, rgba(198,161,91,0.06), transparent)" }}
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
