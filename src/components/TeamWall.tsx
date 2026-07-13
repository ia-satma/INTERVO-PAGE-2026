import Link from "next/link";
import { MarbleDuotone } from "./abstract";
import Reveal from "./Reveal";
import type { DirectoryPartner } from "./SociosDirectory";

type Props = {
  partners: DirectoryPartner[];
  eyebrow: string;
};

/** Full-bleed "wall of faces" opener for the Abogados page — a gapless strip
 * of navy-duotone portraits, each linking straight to that partner's profile.
 * Sits above the functional directory (stats/filter/roster); doesn't replace it. */
export default function TeamWall({ partners, eyebrow }: Props) {
  return (
    <section className="border-b border-line bg-paper py-14 md:py-20">
      <div className="container-x">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-10 md:mt-12">
        <div className="grain relative flex h-[420px] snap-x snap-mandatory overflow-x-auto md:h-[60vh] md:max-h-[640px] md:snap-none md:overflow-visible">
          {partners.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="group relative block h-full w-[82vw] shrink-0 snap-center focus-visible:z-10 md:w-auto md:flex-1 md:shrink"
            >
              <MarbleDuotone
                src={p.photo}
                className="absolute inset-0"
                screen={false}
                intensity={0.8}
                sizes="(max-width: 767px) 82vw, 20vw"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy-950/80 to-transparent" />
              <span className="absolute bottom-5 left-5 translate-y-2 font-display text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
