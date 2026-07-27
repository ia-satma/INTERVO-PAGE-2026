"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CloudArrowUp,
  DownloadSimple,
  FileImage,
  FilmStrip,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";

type Media = {
  id: string;
  name: string;
  kind: "image" | "video";
  mime: string;
  size: number | null;
  url: string;
  altEs?: string;
  altEn?: string;
  posterUrl?: string | null;
  virtual?: boolean;
  createdAt?: string | null;
};

export default function MediaManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Media[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Media | null>(null);
  const [savingMetadata, setSavingMetadata] = useState(false);

  async function load() {
    setState("loading");
    const response = await fetch("/api/admin/media");
    if (!response.ok) return setState("error");
    const payload = await response.json();
    setItems(payload.items);
    setState("ready");
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(
    () => items.filter((item) => (kind === "all" || item.kind === kind) && item.name.toLowerCase().includes(query.toLowerCase())),
    [items, kind, query],
  );

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(""); setNotice("");
    const data = new FormData();
    data.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", headers: csrfHeaders(), body: data });
    const payload = await response.json().catch(() => ({}));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (!response.ok) return setError(payload.error || "No se pudo subir el archivo.");
    setNotice("Archivo subido y disponible en la biblioteca.");
    await load();
  }

  async function remove(item: Media) {
    if (item.virtual || !window.confirm(`¿Archivar “${item.name}”?`)) return;
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ id: item.id }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setError(payload.error || "No se pudo eliminar.");
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  }

  async function saveMetadata(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || editing.id.startsWith("virtual:")) return;
    setSavingMetadata(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({
        id: editing.id,
        name: form.get("name"),
        altEs: form.get("altEs"),
        altEn: form.get("altEn"),
        posterUrl: editing.kind === "video" ? form.get("posterUrl") || null : null,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setSavingMetadata(false);
    if (!response.ok) return setError(payload.error || "No se pudieron guardar los metadatos.");
    setItems((current) => current.map((item) => item.id === editing.id ? { ...item, ...payload.item, virtual: item.virtual } : item));
    setEditing(null);
    setNotice("Nombre y textos alternativos actualizados.");
  }

  return (
    <>
      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="relative block">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar imágenes o videos…" className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-10 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
        </label>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(["all", "image", "video"] as const).map((value) => (
            <button key={value} onClick={() => setKind(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${kind === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {value === "all" ? "Todos" : value === "image" ? "Imágenes" : "Videos"}
            </button>
          ))}
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f4386] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0072ad] active:translate-y-px">
          <CloudArrowUp size={19} /> {uploading ? "Subiendo…" : "Subir archivo"}
          <input ref={inputRef} type="file" onChange={upload} disabled={uploading} accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" className="sr-only" />
        </label>
      </div>
      <p className="mb-5 text-xs text-slate-500">Imágenes hasta 20 MB. Videos MP4, WebM o MOV hasta 200 MB. Los recursos en uso no se pueden eliminar.</p>
      {notice && <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={17} weight="bold" /> {notice}</p>}
      {error && <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><WarningCircle size={17} /> {error}</p>}
      {state === "loading" && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />)}</div>}
      {state === "error" && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-800">No se pudo cargar la biblioteca.</div>}
      {state === "ready" && filtered.length === 0 && <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-center"><div><FileImage size={38} className="mx-auto text-slate-300" /><p className="mt-3 font-semibold text-slate-700">No hay medios para mostrar</p><p className="mt-1 text-sm text-slate-500">Sube un archivo o cambia los filtros.</p></div></div>}
      {state === "ready" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {item.kind === "image" ? <Image src={item.url} alt={item.altEs || item.name} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <video src={item.url} muted controls={false} className="h-full w-full object-cover" />}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-slate-950/75 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                  {item.kind === "image" ? <FileImage size={13} /> : <FilmStrip size={13} />} {item.kind}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-800">{item.name}</h3><p className="mt-1 text-xs text-slate-500">{item.virtual ? "Referencia histórica" : item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : "Subido al panel"}</p></div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={item.virtual ? item.url : `${item.url}${item.url.includes("?") ? "&" : "?"}download=1`}
                      download={item.name}
                      aria-label={`Descargar ${item.name}`}
                      title="Descargar archivo original"
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <DownloadSimple size={16} />
                    </a>
                    {!item.id.startsWith("virtual:") && <button onClick={() => setEditing(item)} aria-label="Editar metadatos" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700"><PencilSimple size={16} /></button>}
                    {!item.virtual && <button onClick={() => remove(item)} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700"><Trash size={16} /></button>}
                  </div>
                </div>
                {(item.altEs || item.altEn) && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.altEs || item.altEn}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <form onSubmit={saveMetadata} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_80px_-30px_rgba(7,29,54,0.7)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Metadatos del medio</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">Editar imagen o video</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100"><X size={19} /></button>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                {editing.kind === "image" ? <Image src={editing.url} alt="" fill unoptimized className="object-cover" /> : <video src={editing.url} muted controls className="h-full w-full object-cover" />}
              </div>
              <div className="space-y-4">
                <label className="block space-y-2 text-xs font-semibold text-slate-700">
                  Nombre interno
                  <input name="name" defaultValue={editing.name} required maxLength={180} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
                </label>
                <label className="block space-y-2 text-xs font-semibold text-slate-700">
                  Texto alternativo — Español
                  <textarea name="altEs" defaultValue={editing.altEs ?? ""} rows={3} maxLength={500} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
                </label>
                <label className="block space-y-2 text-xs font-semibold text-slate-700">
                  Alternative text — English
                  <textarea name="altEn" defaultValue={editing.altEn ?? ""} rows={3} maxLength={500} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
                </label>
                {editing.kind === "video" && (
                  <label className="block space-y-2 text-xs font-semibold text-slate-700">
                    Imagen de portada del video
                    <input name="posterUrl" defaultValue={editing.posterUrl ?? ""} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button disabled={savingMetadata} className="rounded-lg bg-[#0f4386] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0072ad] disabled:opacity-50">{savingMetadata ? "Guardando…" : "Guardar metadatos"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
