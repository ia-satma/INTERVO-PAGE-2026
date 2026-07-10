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
          <span className="font-display text-sm font-semibold text-accent-deep">{index}</span>
        )}
      </div>
      <h3 className="mt-6 font-serif text-2xl leading-snug">{title}</h3>
      {desc && <p className="mt-3 text-[1rem] leading-relaxed text-muted">{desc}</p>}
      <span className="mt-5 block h-px w-10 bg-accent transition-all duration-500 group-hover:w-20" />
    </div>
  );
}
