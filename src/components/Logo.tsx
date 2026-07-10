import Image from "next/image";
import { asset } from "@/lib/asset";

type LogoProps = {
  variant?: "color" | "white";
  className?: string;
  priority?: boolean;
};

/** Full horizontal lockup (isotype + wordmark + descriptor). */
export default function Logo({ variant = "color", className = "h-9 w-auto", priority }: LogoProps) {
  const src = asset(variant === "white" ? "/brand/logo-white.png" : "/brand/logo-color.png");
  return (
    <Image
      src={src}
      alt="intervø — Legal and Business Consulting"
      width={360}
      height={180}
      className={className}
      priority={priority}
    />
  );
}

type MarkProps = {
  variant?: "color" | "white";
  className?: string;
};

/** Isotype only (the swirl mark). */
export function LogoMark({ variant = "color", className = "h-8 w-8" }: MarkProps) {
  const src = asset(variant === "white" ? "/brand/isotype-white.png" : "/brand/isotype-color.png");
  return <Image src={src} alt="intervø" width={96} height={96} className={className} />;
}
