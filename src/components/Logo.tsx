import Image from "next/image";
import { asset } from "@/lib/asset";

type LogoProps = {
  variant?: "color" | "white";
  className?: string;
  priority?: boolean;
  colorSrc?: string;
  whiteSrc?: string;
  alt?: string;
};

/** Full horizontal lockup (isotype + wordmark + descriptor). */
export default function Logo({
  variant = "color",
  className = "h-9 w-auto",
  priority,
  colorSrc = "/brand/logo-color-trim.png",
  whiteSrc = "/brand/logo-white-trim.png",
  alt = "intervø",
}: LogoProps) {
  const src = asset(variant === "white" ? whiteSrc : colorSrc);
  return (
    <Image
      src={src}
      alt={alt}
      width={736}
      height={164}
      className={className}
      priority={priority}
      sizes="(min-width: 768px) 180px, 144px"
      unoptimized
    />
  );
}

type MarkProps = {
  variant?: "color" | "white";
  className?: string;
  colorSrc?: string;
  whiteSrc?: string;
};

/** Isotype only (the swirl mark). */
export function LogoMark({
  variant = "color",
  className = "h-8 w-8",
  colorSrc = "/brand/isotype-color.png",
  whiteSrc = "/brand/isotype-white.png",
}: MarkProps) {
  const src = asset(variant === "white" ? whiteSrc : colorSrc);
  return <Image src={src} alt="intervø" width={96} height={96} sizes="96px" className={className} />;
}
