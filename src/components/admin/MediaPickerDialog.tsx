"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, CloudArrowUp, Images, MagnifyingGlass, WarningCircle, X } from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";
import { buildChangeSet } from "@/lib/client/change-set";
import ChangeReviewDialog from "./ChangeReviewDialog";

type Item = {
  id: string;
  name: string;
  kind: "image" | "video";
  url: string;
  altEs?: string;
  virtual?: boolean;
  createdAt?: string | null;
  usageCount?: number;
  usages?: Array<{
    documentLabel: string;
    path: string;
  }>;
};

export default function MediaPickerDialog({
  open,
  kind,
  onClose,
  onSelect,
  allowUpload = true,
}: {
  open: boolean;
  kind?: "image" | "video";
  onClose: () => void;
  onSelect: (url: string) => void;
  allowUpload?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  function reviewUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null);
  }

  async function upload() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError("");
    const data = new FormData();
    data.set("file", uploadFile);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: csrfHeaders(),
      body: data,
    });
    const payload = await response.json().catch(() => ({}));
    setUploading(false);
    setUploadFile(null);
    if (inputRef.current) inputRef.current.value = "";
    if (!response.ok) {
      setUploadError(payload.error || "No se pudo subir el archivo.");
      return;
    }
    const item = { ...payload.item, virtual: false } as Item;
    setItems((current) => [item, ...current]);
    setSelected(item);
    setState("ready");
  }

  useEffect(() => {
    if (!open) return;
    setState("loading");
    fetch("/api/admin/media")
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((payload) => {
        setItems(payload.items);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [open]);

  const filtered = useMemo(
    () => items.filter((item) => {
      const term = query.toLowerCase();
      const searchable = [
        item.name,
        item.altEs,
        ...(item.usages ?? []).flatMap((usage) => [usage.documentLabel, usage.path]),
      ].filter(Boolean).join(" ").toLowerCase();
      return (!kind || item.kind === kind) && searchable.includes(term);
    }),
    [items, kind, query],
  );
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex max-h-[86dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_30px_80px_-30px_rgba(7,29,54,0.65)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Biblioteca</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Elegir del historial de medios</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"><X size={20} /></button>
        </div>
        <div className="border-b border-slate-200 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o apartado de uso…" className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-10 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
            </label>
            {allowUpload && (
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f4386] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0072ad]">
                <CloudArrowUp size={18} /> {uploading ? "Subiendo…" : "Subir nuevo"}
                <input
                  ref={inputRef}
                  type="file"
                  disabled={uploading}
                  accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/avif"}
                  onChange={reviewUpload}
                  className="sr-only"
                />
              </label>
            )}
          </div>
          {uploadError && <p className="mt-3 flex items-center gap-2 text-sm text-rose-700"><WarningCircle size={17} /> {uploadError}</p>}
        </div>
        <div className="min-h-64 flex-1 overflow-y-auto p-4">
          {state === "loading" && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          )}
          {state === "error" && <div className="grid min-h-64 place-items-center text-sm text-rose-700">No se pudo cargar la biblioteca.</div>}
          {state === "ready" && filtered.length === 0 && (
            <div className="grid min-h-64 place-items-center text-center">
              <div><Images size={34} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No hay resultados</p></div>
            </div>
          )}
          {state === "ready" && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`group overflow-hidden rounded-xl border text-left transition-[border-color,box-shadow,transform] active:translate-y-px ${selected?.id === item.id ? "border-sky-700 ring-2 ring-sky-700/15" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {item.kind === "image" ? <Image src={item.url} alt={item.altEs || item.name} fill unoptimized className="object-cover" /> : <video src={item.url} muted preload="none" className="h-full w-full object-cover" />}
                    {selected?.id === item.id && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-sky-700 text-white"><Check size={16} weight="bold" /></span>}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-[0.68rem] text-slate-500">
                      {item.usageCount
                        ? `Usado en ${item.usageCount} referencia${item.usageCount === 1 ? "" : "s"}`
                        : item.virtual
                          ? "Recurso original disponible"
                          : "Subido al panel · disponible"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button
            disabled={!selected}
            onClick={() => selected && (onSelect(selected.url), onClose())}
            className="rounded-lg bg-[#0f4386] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0072ad] disabled:opacity-40"
          >
            Usar seleccionado
          </button>
        </div>
      </div>
      <ChangeReviewDialog
        open={Boolean(uploadFile)}
        title="Subir un medio nuevo"
        description="Revisa el archivo antes de incorporarlo a la biblioteca."
        changes={buildChangeSet({}, uploadFile ? {
          name: uploadFile.name,
          type: uploadFile.type,
          size: `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`,
        } : {})}
        confirmLabel="Subir archivo"
        pending={uploading}
        tone="publish"
        onCancel={() => {
          setUploadFile(null);
          if (inputRef.current) inputRef.current.value = "";
        }}
        onConfirm={upload}
      />
    </div>
  );
}
