"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Article,
  Books,
  Buildings,
  CaretRight,
  ChartLineUp,
  FileText,
  GlobeHemisphereWest,
  House,
  ImageSquare,
  Images,
  List,
  LockKey,
  MagnifyingGlass,
  NavigationArrow,
  Phone,
  ShieldCheck,
  ShareNetwork,
  SignOut,
  SlidersHorizontal,
  Users,
} from "@phosphor-icons/react";
import type { AdminSessionUser } from "@/lib/cms/types";

const contentNav = [
  { href: "/admin/content/home", label: "Portada", icon: House },
  { href: "/admin/content/firma", label: "La Firma", icon: Buildings },
  { href: "/admin/content/servicios", label: "Servicios", icon: Books },
  { href: "/admin/team", label: "Equipo", icon: Users },
  { href: "/admin/content/alcance-global", label: "Alcance Global", icon: GlobeHemisphereWest },
  { href: "/admin/content/publicaciones", label: "Publicaciones", icon: Article },
  { href: "/admin/content/contacto", label: "Contacto", icon: Phone },
  { href: "/admin/content/privacidad", label: "Privacidad", icon: ShieldCheck },
];

const configNav = [
  { href: "/admin/content/navegacion-seo", label: "Navegación y SEO", icon: NavigationArrow },
  { href: "/admin/links", label: "Enlaces y redes", icon: ShareNetwork },
  { href: "/admin/content/site-config", label: "Configuración", icon: SlidersHorizontal },
  { href: "/admin/media/placements", label: "Medios del sitio", icon: ImageSquare },
  { href: "/admin/media", label: "Biblioteca de medios", icon: Images },
  { href: "/admin/submissions", label: "Formularios", icon: FileText },
];

export default function AdminShell({ user, children }: { user: AdminSessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mobileNav = [
    ...contentNav,
    ...configNav,
    ...(user.permissions.includes("users:manage") ? [{ href: "/admin/users", label: "Usuarios", icon: LockKey }] : []),
    ...(user.permissions.includes("audit:read") ? [{ href: "/admin/audit", label: "Auditoría", icon: MagnifyingGlass }] : []),
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navItem = (item: (typeof contentNav)[number]) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex min-h-10 items-center gap-3 border-l-2 px-4 py-2 text-[0.84rem] font-medium transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px ${
          active ? "border-azure bg-white/10 text-white" : "border-transparent text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} />
        <span className="flex-1">{item.label}</span>
        {active && <CaretRight size={13} weight="bold" />}
      </Link>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#f5f7fa] font-[Bricolage_Grotesque_Variable] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col bg-[#071d36] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-300">intervø</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">Centro editorial</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-5">
          <p className="px-6 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Contenido</p>
          {contentNav.map(navItem)}
          <p className="mt-7 px-6 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Operación</p>
          {configNav.map(navItem)}
          {user.permissions.includes("users:manage") && navItem({ href: "/admin/users", label: "Usuarios", icon: LockKey })}
          {user.permissions.includes("audit:read") && navItem({ href: "/admin/audit", label: "Auditoría", icon: MagnifyingGlass })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={logout} className="flex min-h-10 w-full items-center gap-3 px-2 text-sm text-slate-300 transition-colors hover:text-white active:translate-y-px">
            <SignOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-slate-700 lg:hidden">
              <List size={20} /> Intervo Admin
            </Link>
            <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
              <ChartLineUp size={17} />
              <span>Contenido conectado</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/es" target="_blank" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 active:translate-y-px">
                Ver sitio ES
              </Link>
              <Link href="/en" target="_blank" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 active:translate-y-px">
                EN
              </Link>
            </div>
          </div>
          <nav
            aria-label="Navegación del panel"
            className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 [scrollbar-width:none] sm:px-7 lg:hidden [&::-webkit-scrollbar]:hidden"
          >
            {mobileNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    active ? "bg-[#0f4386] text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-800"
                  }`}
                >
                  <Icon size={15} weight={active ? "fill" : "regular"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
