import { ServiceIcon } from "./icons";

type Props = {
  id: string;
  title: string;
  desc?: string;
  index?: string;
};

export default function ServiceCard({ id, title, desc, index }: Props) {
  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-card">
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist text-navy transition-colors duration-500 group-hover:bg-navy group-hover:text-white">
          <ServiceIcon id={id} className="h-6 w-6" />
        </span>
        {index && (
          <span className="font-display text-sm font-semibold text-muted-2">{index}</span>
        )}
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold leading-snug">{title}</h3>
      {desc && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{desc}</p>}
    </div>
  );
}
