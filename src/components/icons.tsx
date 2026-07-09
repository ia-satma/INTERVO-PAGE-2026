import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- UI ---- */
export const ArrowRight = (p: IconProps) => (
  <Base {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Base>
);
export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}><path d="M7 17 17 7M8 7h9v9" /></Base>
);
export const Phone = (p: IconProps) => (
  <Base {...p}><path d="M4 5c0-.6.4-1 1-1h2.3c.5 0 .9.3 1 .8l.8 3c.1.4 0 .8-.3 1.1L7.3 10.6a12 12 0 0 0 6 6l1.7-1.5c.3-.3.7-.4 1.1-.3l3 .8c.5.1.8.5.8 1V19c0 .6-.4 1-1 1A15 15 0 0 1 4 5Z" /></Base>
);
export const Mail = (p: IconProps) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></Base>
);
export const MapPin = (p: IconProps) => (
  <Base {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Base>
);
export const Linkedin = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" /></Base>
);
export const Whatsapp = (p: IconProps) => (
  <Base {...p}><path d="M4 20l1.4-4A8 8 0 1 1 9 19.3L4 20Z" /><path d="M9 9c0 3 2.5 5.5 5.5 5.5.6 0 1-.6 1-1.2 0-.3-.2-.5-.5-.6l-1.3-.5c-.3-.1-.6 0-.7.2l-.3.4A4 4 0 0 1 10.2 10l.4-.3c.2-.2.3-.5.2-.8L10.3 7.6c-.1-.3-.4-.5-.7-.5-.6 0-1.2.4-1.2 1Z" /></Base>
);
export const Menu = (p: IconProps) => (
  <Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>
);
export const Close = (p: IconProps) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}><path d="M4 12.5 9 17.5 20 6.5" /></Base>
);
export const Globe = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" /></Base>
);
export const ChevronDown = (p: IconProps) => (
  <Base {...p}><path d="m6 9 6 6 6-6" /></Base>
);

/* ---- Service / value icons ---- */
const Handshake = (p: IconProps) => (
  <Base {...p}><path d="m3 12 3-3 4 3.5a1.4 1.4 0 0 0 2 0" /><path d="m21 12-3-3-4.5 3.5" /><path d="m8 12.5 2.5 2.5a1.5 1.5 0 0 0 2.2 0l.3-.3" /><path d="M13 15l1.7 1.7a1.4 1.4 0 0 0 2 0M6 9V7h3l3 2M18 9V7h-3l-2 1.4" /></Base>
);
const Chart = (p: IconProps) => (
  <Base {...p}><path d="M4 4v16h16" /><path d="M8 15l3-4 3 2 4-6" /></Base>
);
const Building = (p: IconProps) => (
  <Base {...p}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></Base>
);
const Shield = (p: IconProps) => (
  <Base {...p}><path d="M12 3 5 6v5c0 4.5 3 7.7 7 10 4-2.3 7-5.5 7-10V6l-7-3Z" /></Base>
);
const ShieldCheck = (p: IconProps) => (
  <Base {...p}><path d="M12 3 5 6v5c0 4.5 3 7.7 7 10 4-2.3 7-5.5 7-10V6l-7-3Z" /><path d="m9 11.5 2 2 4-4" /></Base>
);
const Home = (p: IconProps) => (
  <Base {...p}><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></Base>
);
const Scale = (p: IconProps) => (
  <Base {...p}><path d="M12 4v16M7 20h10M5 8h14M12 5l6 2-2.5 5a3 3 0 0 1-5 0L8 7M6 7l-2.5 5a3 3 0 0 0 5 0" /></Base>
);
const Receipt = (p: IconProps) => (
  <Base {...p}><path d="M6 3h12v18l-2-1.3L14 21l-2-1.3L10 21l-2-1.3L6 21V3Z" /><path d="M9 8h6M9 12h6" /></Base>
);
const Chip = (p: IconProps) => (
  <Base {...p}><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 10h4v4h-4zM9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" /></Base>
);
const Plane = (p: IconProps) => (
  <Base {...p}><path d="M10 3.5c.6-.6 1.6-.6 2 .3l1.6 6 4.6 2.7c1 .6 1 2 0 2.3l-4.8 1.3-2 4.3c-.4.8-1.6.6-1.7-.3l-.6-4-3.4-1.7c-.8-.4-.7-1.6.2-1.8l4-1L10 3.5Z" /></Base>
);
const Lock = (p: IconProps) => (
  <Base {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></Base>
);
const Gavel = (p: IconProps) => (
  <Base {...p}><path d="m14 6 4 4M8 12l4-4M11 9l4 4M6 20h8M13 13l-6 6-2-2 6-6" /></Base>
);
const Users = (p: IconProps) => (
  <Base {...p}><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0M16 5.5a3 3 0 0 1 0 5M15 20a5 5 0 0 0-.8-2.7" /></Base>
);
const Bulb = (p: IconProps) => (
  <Base {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.2 1 2.5h6c0-1.3.2-1.8 1-2.5A6 6 0 0 0 12 3Z" /></Base>
);
const Award = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="9" r="5" /><path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7" /></Base>
);
const Chat = (p: IconProps) => (
  <Base {...p}><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z" /><path d="M8 9h8M8 12h5" /></Base>
);
const Compass = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></Base>
);

const SERVICE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  ma: Handshake,
  finance: Chart,
  corporate: Building,
  trusts: Shield,
  realestate: Home,
  competition: Scale,
  tax: Receipt,
  fintech: Chip,
  foreign: Globe,
  immigration: Plane,
  aml: ShieldCheck,
  data: Lock,
  regulatory: Gavel,
  labor: Users,
  litigation: Gavel,
  ip: Bulb,
};

const VALUE_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  profesionalidad: Award,
  compromiso: Handshake,
  comunicacion: Chat,
  honestidad: ShieldCheck,
};

export function ServiceIcon({ id, ...props }: { id: string } & IconProps) {
  const Cmp = SERVICE_ICONS[id] ?? Compass;
  return <Cmp {...props} />;
}

export function ValueIcon({ id, ...props }: { id: string } & IconProps) {
  const Cmp = VALUE_ICONS[id] ?? Compass;
  return <Cmp {...props} />;
}
