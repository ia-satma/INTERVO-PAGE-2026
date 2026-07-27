"use client";

import { useEffect, useState } from "react";
import { ClockCounterClockwise, WarningCircle } from "@phosphor-icons/react";

type Event = { id: string; action: string; resource: string; resourceId?: string | null; metadata: Record<string, unknown>; createdAt: string; userName?: string | null; userEmail?: string | null };

export default function AuditLog() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/audit").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setEvents(payload.events);
    }).catch((reason) => setError(reason.message));
  }, []);
  if (error) return <p className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><WarningCircle size={17} /> {error}</p>;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {events.length === 0 && <div className="grid min-h-64 place-items-center text-center"><div><ClockCounterClockwise size={36} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">Aún no hay actividad registrada</p></div></div>}
      {events.map((event) => (
        <div key={event.id} className="grid gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0 md:grid-cols-[170px_1fr_220px] md:items-center">
          <time className="font-mono text-xs text-slate-500">{new Date(event.createdAt).toLocaleString("es-MX")}</time>
          <div><p className="text-sm font-semibold text-slate-900">{event.action}</p><p className="mt-1 text-xs text-slate-500">{event.resource}{event.resourceId ? ` · ${event.resourceId}` : ""}</p></div>
          <div className="text-xs text-slate-500"><p className="font-semibold text-slate-700">{event.userName || "Sistema"}</p><p className="mt-1 truncate">{event.userEmail || "Evento automático"}</p></div>
        </div>
      ))}
    </div>
  );
}
