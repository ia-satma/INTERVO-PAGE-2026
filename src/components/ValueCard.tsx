import { ValueIcon } from "./icons";

type Props = {
  id: string;
  title: string;
  desc: string;
};

export default function ValueCard({ id, title, desc }: Props) {
  return (
    <div className="group flex h-full flex-col items-start rounded-2xl border border-line bg-white p-7 transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-card">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-white">
        <ValueIcon id={id} className="h-7 w-7" />
      </span>
      <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}
