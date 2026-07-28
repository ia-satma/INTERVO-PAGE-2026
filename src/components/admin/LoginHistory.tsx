"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Desktop,
  Funnel,
  MagnifyingGlass,
  Prohibit,
  SignIn,
  SignOut,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";

type LoginEvent = {
  id: string;
  action: "auth.login" | "auth.login_failed" | "auth.login_blocked" | "auth.mfa_challenge" | "auth.logout";
  metadata: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
};

type Filter = "all" | "success" | "failed" | "logout";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "success", label: "Exitosos" },
  { key: "failed", label: "Rechazados" },
  { key: "logout", label: "Cierres" },
];

function eventEmail(event: LoginEvent) {
  return event.userEmail || (typeof event.metadata.email === "string" ? event.metadata.email : "") || "Correo no disponible";
}

function deviceLabel(userAgent?: string | null) {
  if (!userAgent) return "Dispositivo no identificado";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Chrome\//.test(userAgent) ? "Chrome" : /Firefox\//.test(userAgent) ? "Firefox" : /Safari\//.test(userAgent) ? "Safari" : "Navegador";
  const device = /iPhone|iPad/.test(userAgent) ? "iOS" : /Android/.test(userAgent) ? "Android" : /Macintosh|Mac OS/.test(userAgent) ? "macOS" : /Windows/.test(userAgent) ? "Windows" : /Linux/.test(userAgent) ? "Linux" : "Equipo";
  return `${browser} · ${device}`;
}

function reasonLabel(event: LoginEvent) {
  const reason = event.metadata.reason;
  if (reason === "invalid_credentials") return "Credenciales incorrectas";
  if (reason === "invalid_mfa") return "Código MFA incorrecto";
  if (reason === "rate_limit") return "Demasiados intentos";
  if (event.action === "auth.mfa_challenge") return "Verificación MFA solicitada";
  return "";
}

function statusFor(event: LoginEvent) {
  if (event.action === "auth.login") return { label: "Acceso exitoso", Icon: CheckCircle, className: "bg-emerald-50 text-emerald-700" };
  if (event.action === "auth.logout") return { label: "Sesión cerrada", Icon: SignOut, className: "bg-slate-100 text-slate-600" };
  if (event.action === "auth.mfa_challenge") return { label: "MFA solicitado", Icon: SignIn, className: "bg-sky-50 text-sky-700" };
  return { label: "Acceso rechazado", Icon: Prohibit, className: "bg-rose-50 text-rose-700" };
}

export default function LoginHistory() {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/login-history?limit=250", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "No se pudo cargar el historial.");
        setEvents(payload.events);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesFilter = filter === "all"
        || (filter === "success" && event.action === "auth.login")
        || (filter === "failed" && ["auth.login_failed", "auth.login_blocked"].includes(event.action))
        || (filter === "logout" && event.action === "auth.logout");
      const matchesSearch = !term || [event.userName, eventEmail(event), event.ip, deviceLabel(event.userAgent)]
        .some((value) => value?.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, search]);

  const metrics = useMemo(() => ({
    successful: events.filter((event) => event.action === "auth.login").length,
    failed: events.filter((event) => ["auth.login_failed", "auth.login_blocked"].includes(event.action)).length,
    users: new Set(events.filter((event) => event.action === "auth.login").map(eventEmail)).size,
  }), [events]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}</div>;
  if (error) return <p className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><WarningCircle size={18} /> {error}</p>;

  return (
    <>
      <div className="mb-6 grid divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4"><p className="text-xs font-semibold text-slate-500">Accesos exitosos</p><p className="mt-1 text-3xl font-semibold tracking-tight text-emerald-700">{metrics.successful}</p></div>
        <div className="px-5 py-4"><p className="text-xs font-semibold text-slate-500">Intentos rechazados</p><p className="mt-1 text-3xl font-semibold tracking-tight text-rose-700">{metrics.failed}</p></div>
        <div className="px-5 py-4"><p className="text-xs font-semibold text-slate-500">Usuarios identificados</p><p className="mt-1 text-3xl font-semibold tracking-tight text-sky-800">{metrics.users}</p></div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          <Funnel size={17} className="ml-2 mt-2 text-slate-400" />
          {filters.map((item) => (
            <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`min-h-9 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${filter === item.key ? "bg-[#0f4386] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-sm">
          <MagnifyingGlass size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Buscar en accesos</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuario, correo, IP…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {visible.length === 0 && <div className="grid min-h-56 place-items-center text-center"><div><UserCircle size={36} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No hay accesos que coincidan</p><p className="mt-1 text-xs text-slate-500">Ajusta el filtro o la búsqueda.</p></div></div>}
        {visible.map((event) => {
          const status = statusFor(event);
          const reason = reasonLabel(event);
          return (
            <article key={event.id} className="grid gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 md:grid-cols-[190px_minmax(0,1fr)_220px] md:items-center">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${status.className}`}><status.Icon size={14} weight="bold" /> {status.label}</span>
                <time className="mt-2 block font-mono text-[0.68rem] text-slate-500">{new Date(event.createdAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "medium" })}</time>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{event.userName || "Usuario no autenticado"}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{eventEmail(event)}</p>
                {reason && <p className="mt-1 text-xs font-medium text-rose-700">{reason}</p>}
              </div>
              <div className="text-xs text-slate-500">
                <p className="flex items-center gap-2 font-semibold text-slate-700"><Desktop size={15} /> {deviceLabel(event.userAgent)}</p>
                <p className="mt-1.5 font-mono">{event.ip || "IP no disponible"}</p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-right text-xs text-slate-400">Se muestran hasta 250 eventos recientes.</p>
    </>
  );
}
