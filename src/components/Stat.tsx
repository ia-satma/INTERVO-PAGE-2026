type StatProps = {
  value: string;
  label: string;
  tone?: "dark" | "light";
  size?: "md" | "lg";
};

export function Stat({ value, label, tone = "dark", size = "md" }: StatProps) {
  return (
    <div>
      <div
        className={`font-display font-bold tracking-tight ${
          size === "lg" ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"
        } ${tone === "light" ? "text-white" : "text-navy"}`}
      >
        {value}
      </div>
      <div
        className={`mt-2 text-sm leading-snug ${tone === "light" ? "text-white/60" : "text-muted"}`}
      >
        {label}
      </div>
    </div>
  );
}
