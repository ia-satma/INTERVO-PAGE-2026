"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, WarningCircle } from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";

export default function CreatePageButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    const payload = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) return setError(payload.error || "No se pudo crear la página.");
    router.push(`/admin/content/${encodeURIComponent(payload.document.key)}`);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0f4386] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0072ad] active:translate-y-px">
        <Plus size={17} weight="bold" /> Nueva página
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form onSubmit={create} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Plantilla modular</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Crear página</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Se crearán los campos ES/EN y los bloques aprobados. Podrás ocultar, duplicar o reordenar su contenido.</p>
            <div className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm font-semibold">Título inicial<input name="title" required className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" /></label>
              <label className="block space-y-2 text-sm font-semibold">Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="ejemplo-de-pagina" className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" /><span className="block text-xs font-normal text-slate-500">Minúsculas, números y guiones. Será la URL pública.</span></label>
            </div>
            {error && <p className="mt-4 flex items-center gap-2 text-sm text-rose-700"><WarningCircle size={17} /> {error}</p>}
            <div className="mt-7 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button><button disabled={pending} className="rounded-lg bg-[#0f4386] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Creando…" : "Crear página"}</button></div>
          </form>
        </div>
      )}
    </>
  );
}
