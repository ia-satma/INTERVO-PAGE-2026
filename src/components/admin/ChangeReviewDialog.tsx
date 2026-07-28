"use client";

import { useEffect, useId } from "react";
import { ArrowsLeftRight, CheckCircle, Info, Warning, X } from "@phosphor-icons/react";
import { formatChangeValue, type ChangeItem } from "@/lib/client/change-set";

type Props = {
  open: boolean;
  eyebrow?: string;
  title: string;
  description: string;
  changes: ChangeItem[];
  confirmLabel: string;
  pending?: boolean;
  tone?: "save" | "publish" | "danger";
  emptyMessage?: string;
  onCancel: () => void;
  onConfirm: () => unknown | Promise<unknown>;
};

const kindLabel = {
  added: "Nuevo",
  removed: "Eliminado",
  changed: "Modificado",
};

export default function ChangeReviewDialog({
  open,
  eyebrow = "Revisión antes de guardar",
  title,
  description,
  changes,
  confirmLabel,
  pending = false,
  tone = "save",
  emptyMessage = "Esta acción no modifica campos, pero cambiará el estado del contenido.",
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  const confirmClass = tone === "danger"
    ? "bg-rose-700 hover:bg-rose-800"
    : tone === "publish"
      ? "bg-[#0f4386] hover:bg-[#0072ad]"
      : "bg-slate-900 hover:bg-slate-800";

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-slate-950/70 p-3 sm:p-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) onCancel();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[min(88dvh,860px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_32px_90px_-28px_rgba(2,12,27,0.75)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
            <h2 id={titleId} className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
            <p id={descriptionId} className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
          <button type="button" aria-label="Cerrar revisión" disabled={pending} onClick={onCancel} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40">
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:grid-cols-[minmax(190px,.65fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="hidden px-5 py-3 sm:block">Campo</div>
            <div className="border-r border-slate-200 px-4 py-3 sm:border-x">Antes</div>
            <div className="px-4 py-3">Después</div>
          </div>
          {changes.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-12 text-center">
              <div>
                <Info size={30} className="mx-auto text-sky-700" />
                <p className="mt-3 text-sm font-semibold text-slate-800">Acción sin cambios de campo</p>
                <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-slate-500">{emptyMessage}</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {changes.map((change, index) => (
                <div key={`${change.path}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[minmax(190px,.65fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="col-span-2 flex items-start justify-between gap-3 bg-slate-50/70 px-4 py-3 sm:col-span-1 sm:bg-white sm:px-5">
                    <div className="min-w-0">
                      <p className="break-words text-xs font-semibold text-slate-800">{change.label}</p>
                      <p className="mt-1 break-all font-mono text-[0.62rem] text-slate-400">{change.path || "contenido"}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${
                      change.kind === "added" ? "bg-emerald-50 text-emerald-700" : change.kind === "removed" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}>{kindLabel[change.kind]}</span>
                  </div>
                  <pre className="min-h-20 overflow-x-auto whitespace-pre-wrap break-words border-r border-slate-200 bg-rose-50/35 px-4 py-3 font-sans text-xs leading-relaxed text-slate-600 sm:border-l">{formatChangeValue(change.before, change.path)}</pre>
                  <pre className="min-h-20 overflow-x-auto whitespace-pre-wrap break-words bg-emerald-50/35 px-4 py-3 font-sans text-xs leading-relaxed text-slate-800">{formatChangeValue(change.after, change.path)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            {tone === "danger" ? <Warning size={16} className="text-rose-600" /> : <ArrowsLeftRight size={16} className="text-sky-700" />}
            {changes.length} cambio{changes.length === 1 ? "" : "s"} detectado{changes.length === 1 ? "" : "s"}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={pending} onClick={onCancel} className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40">
              Volver a editar
            </button>
            <button type="button" disabled={pending} onClick={onConfirm} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white active:translate-y-px disabled:opacity-50 ${confirmClass}`}>
              <CheckCircle size={18} weight="bold" />
              {pending ? "Procesando…" : confirmLabel}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
