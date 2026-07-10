import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className = "",
}: Props) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow && (
        <span className={`eyebrow ${center ? "eyebrow--center" : ""} ${tone === "light" ? "eyebrow--light" : ""}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`display-2 mt-5 ${tone === "light" ? "text-white" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`mt-5 text-lg leading-relaxed ${tone === "light" ? "text-white/70" : "text-muted"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
