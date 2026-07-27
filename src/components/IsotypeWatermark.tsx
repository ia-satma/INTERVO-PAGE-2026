import { asset } from "@/lib/asset";

// Trimmed to its content bounding box (the source PNG has ~19% transparent
// padding on every side) so the shape actually fills the container instead
// of floating small and centered inside it.
/** Giant, near-transparent isotype watermark for dark panels — the bold
 * "logo as background" treatment, dialed back to intervø's editorial
 * register. Decorative only — never place over a photo of people. */
export function IsotypeWatermark({
  className = "",
  src = "/brand/isotype-white-trim.png",
}: {
  className?: string;
  src?: string;
}) {
  const mask = asset(src);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        WebkitMaskImage: `url(${mask})`,
        maskImage: `url(${mask})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        background: "currentColor",
      }}
    />
  );
}
