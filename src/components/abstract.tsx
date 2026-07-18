import Image from "next/image";
import { asset } from "@/lib/asset";

/** Film-grain overlay for depth on dark panels. Parent must be positioned. */
export function Grain({ className = "" }: { className?: string }) {
  return <div className={`grain pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

/**
 * Duotone marble/architecture texture — the firm's own photography rendered in
 * brand blues (grayscale + multiply navy + screen azure).
 */
export function MarbleDuotone({
  src,
  className = "",
  priority,
  sizes = "100vw",
  intensity = 1,
}: {
  src: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  intensity?: number;
}) {
  return (
    // Caller supplies positioning (e.g. `absolute inset-0` or `relative h-full`)
    // — required because the inner <Image fill> needs a positioned ancestor.
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <Image
        src={asset(src)}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ filter: "grayscale(1) contrast(1.06) brightness(0.92)" }}
      />
      {/* shadows → navy */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ background: "var(--color-navy-900)", opacity: intensity }}
      />
      {/* highlights → azure */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{ background: "var(--color-azure)", opacity: 0.55 * intensity }}
      />
    </div>
  );
}
