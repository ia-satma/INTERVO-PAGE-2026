"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowClockwise,
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  Check,
  CloudArrowUp,
  FloppyDisk,
  Images,
  MagicWand,
  Plus,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";
import MediaPickerDialog from "./MediaPickerDialog";

type Json = null | string | number | boolean | Json[] | { [key: string]: Json };
type DocumentData = {
  key: string;
  label: string;
  description?: string | null;
  status: string;
  version: number;
  data: Record<string, Json>;
  published: Record<string, Json>;
};

const labels: Record<string, string> = {
  title: "Título",
  subtitle: "Subtítulo",
  eyebrow: "Etiqueta superior",
  body: "Contenido",
  desc: "Descripción",
  description: "Descripción",
  cta: "Llamado a la acción",
  label: "Etiqueta",
  href: "Enlace",
  image: "Imagen",
  photo: "Fotografía",
  video: "Video",
  poster: "Portada del video",
  name: "Nombre",
  role: "Puesto",
  email: "Correo",
  phoneDisplay: "Teléfono visible",
  city: "Ciudad",
  lines: "Líneas",
  published: "Publicado",
  visible: "Visible",
  es: "Español",
  en: "Inglés",
};

function humanize(key: string) {
  return labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (value) => value.toUpperCase());
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function blankLike(value: Json): Json {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blankLike(item)]));
  return "";
}

function isMediaKey(key: string) {
  return /(image|photo|video|poster|logo|media|src)$/i.test(key);
}

function isLongText(key: string, value: string) {
  return value.length > 90 || /(body|desc|content|bio|summary|paragraph|intro|message|privacy|copy|lead|text)/i.test(key);
}

function JsonField({
  fieldKey,
  value,
  onChange,
  depth = 0,
}: {
  fieldKey: string;
  value: Json;
  onChange: (value: Json) => void;
  depth?: number;
}) {
  const [picker, setPicker] = useState(false);
  const label = humanize(fieldKey);
  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition-[border-color,box-shadow] focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15";

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-0.5 block text-xs text-slate-500">Controla la visibilidad o el estado de este elemento.</span></span>
        <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative h-7 w-12 rounded-full transition-colors ${value ? "bg-sky-700" : "bg-slate-300"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </label>
    );
  }

  if (typeof value === "string" || typeof value === "number" || value === null) {
    const stringValue = value === null ? "" : String(value);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          {typeof value === "string" && isMediaKey(fieldKey) && (
            <button type="button" onClick={() => setPicker(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900">
              <Images size={15} /> Elegir de biblioteca
            </button>
          )}
        </div>
        {typeof value === "string" && isMediaKey(fieldKey) && stringValue && (
          <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {/video/i.test(fieldKey) ? (
              <video src={stringValue} muted controls className="h-full w-full object-cover" />
            ) : (
              <Image src={stringValue} alt="" fill unoptimized className="object-cover" />
            )}
          </div>
        )}
        {typeof value === "number" ? (
          <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className={inputClass} />
        ) : isLongText(fieldKey, stringValue) ? (
          <textarea rows={Math.min(8, Math.max(3, Math.ceil(stringValue.length / 90)))} value={stringValue} onChange={(event) => onChange(event.target.value)} className={inputClass} />
        ) : (
          <input value={stringValue} onChange={(event) => onChange(event.target.value)} className={inputClass} />
        )}
        {typeof value === "string" && isMediaKey(fieldKey) && <MediaPickerDialog open={picker} onClose={() => setPicker(false)} onSelect={(url) => onChange(url)} kind={/video/i.test(fieldKey) ? "video" : "image"} />}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{value.length} elemento{value.length === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={() => onChange([...value, blankLike(value[0] ?? "")])} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300">
            <Plus size={15} weight="bold" /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {value.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-4 py-7 text-center text-sm text-slate-500">No hay elementos. Usa “Agregar” para crear el primero.</p>}
          {value.map((item, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_25px_-24px_rgba(15,23,42,0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">Elemento {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }} aria-label="Subir" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"><ArrowUp size={15} /></button>
                  <button type="button" disabled={index === value.length - 1} onClick={() => { const next = [...value]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(next); }} aria-label="Bajar" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"><ArrowDown size={15} /></button>
                  <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"><Trash size={15} /></button>
                </div>
              </div>
              <JsonField fieldKey={`${fieldKey} ${index + 1}`} value={item} onChange={(nextItem) => onChange(value.map((current, itemIndex) => itemIndex === index ? nextItem : current))} depth={depth + 1} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <fieldset className={`${depth > 1 ? "rounded-xl border border-slate-200 bg-white p-4" : ""}`}>
      {depth > 1 && <legend className="px-1 text-xs font-semibold text-slate-500">{label}</legend>}
      {depth <= 1 && <h3 className="mb-4 border-b border-slate-200 pb-3 text-base font-semibold tracking-tight text-slate-900">{label}</h3>}
      <div className="space-y-4">
        {Object.entries(value).map(([key, item]) => (
          <JsonField key={key} fieldKey={key} value={item} depth={depth + 1} onChange={(nextItem) => onChange({ ...value, [key]: nextItem })} />
        ))}
      </div>
    </fieldset>
  );
}

function flattenStrings(value: Json, prefix = "", result: Record<string, string> = {}) {
  if (typeof value === "string" && value.trim() && !/^https?:|^mailto:|^tel:|^\//.test(value)) result[prefix] = value;
  else if (Array.isArray(value)) value.forEach((item, index) => flattenStrings(item, `${prefix}.${index}`, result));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => flattenStrings(item, prefix ? `${prefix}.${key}` : key, result));
  return result;
}

function setPath(root: Json, path: string, value: string): Json {
  const parts = path.split(".");
  const result = clone(root);
  let cursor = result as Record<string, Json> | Json[];
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      if (Array.isArray(cursor)) cursor[Number(part)] = value;
      else cursor[part] = value;
    } else {
      cursor = (Array.isArray(cursor) ? cursor[Number(part)] : cursor[part]) as Record<string, Json> | Json[];
    }
  });
  return result;
}

export default function ContentEditor({ document, canPublish }: { document: DocumentData; canPublish: boolean }) {
  const [data, setData] = useState<Record<string, Json>>(() => clone(document.data));
  const [saved, setSaved] = useState<Record<string, Json>>(() => clone(document.data));
  const [pending, setPending] = useState<"save" | "publish" | "translate" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"save" | "publish" | null>(null);
  const [versions, setVersions] = useState<{ id: string; version: number; createdAt: string }[] | null>(null);
  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved]);
  const localized = data.es && data.en && typeof data.es === "object" && typeof data.en === "object";
  async function save() {
    setPending("save"); setError(""); setMessage("");
    const response = await fetch(`/api/admin/documents/${document.key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ data }),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) {
      setError(payload.error || "No se pudo guardar.");
      return false;
    }
    setSaved(clone(data));
    setMessage("Borrador guardado. El sitio público todavía no cambió.");
    setConfirm(null);
    return true;
  }

  async function publish() {
    if (dirty && !(await save())) return;
    setPending("publish"); setError(""); setMessage("");
    const response = await fetch(`/api/admin/documents/${document.key}/publish`, { method: "POST", headers: csrfHeaders() });
    const payload = await response.json().catch(() => ({}));
    setPending(""); setConfirm(null);
    if (!response.ok) return setError(payload.error || "No se pudo publicar.");
    setMessage(`Versión ${payload.document.version} publicada correctamente.`);
  }

  async function translate() {
    if (!localized) return;
    setPending("translate"); setError(""); setMessage("");
    const fields = flattenStrings(data.es);
    const response = await fetch("/api/admin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ fields }),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) return setError(payload.error || "No se pudo traducir.");
    let english = clone(data.en) as Json;
    Object.entries(payload.fields as Record<string, string>).forEach(([path, value]) => { english = setPath(english, path, value); });
    setData({ ...data, en: english });
    setMessage("Traducción propuesta. Revísala antes de guardar.");
  }

  async function loadVersions() {
    const response = await fetch(`/api/admin/documents/${document.key}/versions`);
    const payload = await response.json();
    setVersions(payload.versions ?? []);
  }

  async function restore(versionId: string) {
    if (!window.confirm("¿Restaurar esta versión como nuevo borrador? La versión pública no cambiará hasta que publiques.")) return;
    const response = await fetch(`/api/admin/documents/${document.key}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ versionId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setError(payload.error || "No se pudo restaurar.");
    window.location.reload();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className="font-semibold text-slate-800">{dirty ? "Cambios sin guardar" : "Borrador sincronizado"}</span>
          <span className="text-slate-400">Versión pública {document.version}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {localized && <button onClick={translate} disabled={Boolean(pending)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 active:translate-y-px disabled:opacity-50"><MagicWand size={16} /> {pending === "translate" ? "Traduciendo…" : "Proponer inglés"}</button>}
          <button onClick={loadVersions} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 active:translate-y-px"><ArrowClockwise size={16} /> Versiones</button>
          <Link target="_blank" href={`/admin/preview/${encodeURIComponent(document.key)}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 active:translate-y-px">Vista previa <ArrowSquareOut size={15} /></Link>
          <button onClick={() => setConfirm("save")} disabled={!dirty || Boolean(pending)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-800 bg-white px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50 active:translate-y-px disabled:border-slate-200 disabled:text-slate-400"><FloppyDisk size={16} /> {pending === "save" ? "Guardando…" : "Guardar borrador"}</button>
          {canPublish && <button onClick={() => setConfirm("publish")} disabled={Boolean(pending)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0f4386] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0072ad] active:translate-y-px disabled:opacity-50"><CloudArrowUp size={16} /> Publicar</button>}
        </div>
      </div>

      {message && <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={18} weight="bold" /> {message}</p>}
      {error && <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><WarningCircle size={18} /> {error}</p>}

      {localized ? (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {(["es", "en"] as const).map((locale) => (
            <section key={locale} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-38px_rgba(15,23,42,0.5)] md:p-6">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-700">{locale === "es" ? "Contenido base" : "Traducción"}</p><h2 className="mt-1 text-xl font-semibold tracking-tight">{locale === "es" ? "Español" : "English"}</h2></div>
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[0.68rem] font-semibold text-slate-500">{locale.toUpperCase()}</span>
              </div>
              <JsonField fieldKey={locale} value={data[locale]} onChange={(value) => setData({ ...data, [locale]: value })} />
            </section>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-38px_rgba(15,23,42,0.5)] md:p-7">
          {Object.entries(data).map(([key, value]) => <JsonField key={key} fieldKey={key} value={value} onChange={(next) => setData({ ...data, [key]: next })} />)}
        </section>
      )}

      {versions && (
        <aside className="fixed inset-y-0 right-0 z-[90] w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-[-24px_0_70px_-45px_rgba(15,23,42,0.7)]">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Historial</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Versiones publicadas</h2></div><button onClick={() => setVersions(null)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100"><X size={19} /></button></div>
          <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
            {versions.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Todavía no hay versiones anteriores.</p>}
            {versions.map((version) => <div key={version.id} className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-semibold">Versión {version.version}</p><p className="mt-1 text-xs text-slate-500">{new Date(version.createdAt).toLocaleString("es-MX")}</p></div><button onClick={() => restore(version.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-sky-700 hover:text-sky-800">Restaurar</button></div>)}
          </div>
        </aside>
      )}

      {confirm && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(7,29,54,0.65)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Confirmar publicación</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{confirm === "publish" ? `¿Publicar los cambios de ${document.label}?` : `¿Guardar el borrador de ${document.label}?`}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{confirm === "publish" ? "El borrador reemplazará la versión visible en español e inglés. La versión anterior quedará disponible en el historial." : "Los cambios quedarán guardados para revisión y todavía no aparecerán en el sitio público."}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onClick={confirm === "publish" ? publish : save} disabled={Boolean(pending)} className="inline-flex items-center gap-2 rounded-lg bg-[#0f4386] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0072ad] disabled:opacity-50">{confirm === "publish" ? <CloudArrowUp size={17} /> : <FloppyDisk size={17} />} {pending ? "Procesando…" : confirm === "publish" ? "Publicar ahora" : "Guardar borrador"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
