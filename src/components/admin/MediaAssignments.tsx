"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CloudArrowUp,
  FilmStrip,
  FloppyDisk,
  ImageSquare,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import type { SiteConfig } from "@/lib/cms/types";
import { csrfHeaders } from "@/lib/client/csrf";
import MediaPickerDialog from "./MediaPickerDialog";

type JsonRecord = Record<string, unknown>;

const imageSlots: Array<{ key: Exclude<keyof SiteConfig["media"], "homeHero" | "heroVideo">; label: string; description: string }> = [
  { key: "heroPoster", label: "Poster del video principal", description: "Imagen mostrada mientras carga el video de portada." },
  { key: "firmImage", label: "Imagen de La Firma", description: "Fotografía principal dentro de la página institucional." },
  { key: "logoColor", label: "Logotipo a color", description: "Encabezado sobre fondos claros." },
  { key: "logoWhite", label: "Logotipo blanco", description: "Encabezado sobre el hero y fondos oscuros." },
  { key: "isotypeColor", label: "Isotipo a color", description: "Símbolo de marca para fondos claros." },
  { key: "isotypeWhite", label: "Isotipo blanco", description: "Máscara visual utilizada en la portada." },
  { key: "isotypeMask", label: "Isotipo recortado", description: "Marca de agua en secciones oscuras." },
  { key: "favicon", label: "Favicon", description: "Ícono mostrado en la pestaña del navegador." },
  { key: "menuBackground", label: "Fondo del menú", description: "Panel atmosférico del menú principal." },
  { key: "pageHeaderBackground", label: "Fondo de encabezados", description: "Encabezado interior compartido por las páginas." },
  { key: "ctaBackground", label: "Fondo de llamados a la acción", description: "Sección final compartida de contacto." },
  { key: "insightCardBackground", label: "Fondo de publicaciones", description: "Imagen base de las tarjetas editoriales." },
  { key: "servicesBackground", label: "Fondo de Servicios", description: "Sección de áreas de práctica adicionales." },
  { key: "globalBackground", label: "Fondo de Alcance Global", description: "Banda oscura con cifras internacionales." },
  { key: "homeServicesBackground", label: "Fondo de servicios en Portada", description: "Bloque editorial de servicios y reconocimientos." },
  { key: "homeRecognitionBackground", label: "Fondo global en Portada", description: "Panel de alcance global de la página inicial." },
  { key: "firmRecognitionBackground", label: "Fondo de reconocimientos", description: "Panel de Chambers en La Firma." },
  { key: "teamBackground", label: "Fondo para personas sin foto", description: "Textura usada detrás de las iniciales del equipo." },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function AssignmentCard({
  label,
  description,
  value,
  kind = "image",
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  kind?: "image" | "video";
  onChange: (value: string) => void;
}) {
  const [picker, setPicker] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-[16/8] bg-slate-100">
        {value ? (
          kind === "image" ? (
            <Image src={value} alt="" fill unoptimized className="object-cover" />
          ) : (
            <video src={value} muted controls className="h-full w-full object-cover" />
          )
        ) : (
          <span className="grid h-full w-full place-items-center text-slate-300">
            {kind === "image" ? <ImageSquare size={34} /> : <FilmStrip size={34} />}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        <p className="mt-1 min-h-10 text-xs leading-relaxed text-slate-500">{description}</p>
        <p className="mt-2 truncate font-mono text-[0.67rem] text-slate-400">{value || "Sin archivo asignado"}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f4386] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0072ad]"
          >
            {kind === "image" ? <ImageSquare size={16} /> : <FilmStrip size={16} />} Subir o cambiar
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="grid h-10 w-10 place-items-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50" aria-label={`Quitar ${label}`}>
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      <MediaPickerDialog open={picker} kind={kind} onClose={() => setPicker(false)} onSelect={onChange} allowUpload />
    </article>
  );
}

export default function MediaAssignments({
  siteData,
  canPublish,
}: {
  siteData: JsonRecord;
  canPublish: boolean;
}) {
  const [data, setData] = useState<JsonRecord>(() => clone(siteData));
  const [savedData, setSavedData] = useState<JsonRecord>(() => clone(siteData));
  const [pending, setPending] = useState<"save" | "publish" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const media = data.media as SiteConfig["media"];
  const savedMedia = savedData.media as SiteConfig["media"];
  const dirty = JSON.stringify(media) !== JSON.stringify(savedMedia);

  function updateMedia(changes: Partial<SiteConfig["media"]>) {
    setData((current) => ({ ...current, media: { ...(current.media as SiteConfig["media"]), ...changes } }));
  }

  async function save() {
    setPending("save");
    setMessage("");
    setError("");
    const response = await fetch("/api/admin/documents/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ data }),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) {
      setError(payload.error || "No se pudieron guardar los medios.");
      return false;
    }
    setSavedData(clone(data));
    setMessage("Asignaciones guardadas como borrador.");
    return true;
  }

  async function publish() {
    if (!(await save())) return;
    if (!window.confirm("¿Publicar ahora todas las nuevas imágenes y videos del sitio?")) return;
    setPending("publish");
    const response = await fetch("/api/admin/documents/site-config/publish", {
      method: "POST",
      headers: csrfHeaders(),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) return setError(payload.error || "No se pudieron publicar los medios.");
    setMessage("Medios publicados correctamente en todo el sitio.");
  }

  function addHeroImage() {
    updateMedia({ homeHero: [...media.homeHero, ""] });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{dirty ? "Cambios sin guardar" : "Todas las asignaciones están cargadas"}</p>
            <p className="text-xs text-slate-500">{imageSlots.length + media.homeHero.length + 1} posiciones editables de imagen o video</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void save()} disabled={!dirty || Boolean(pending)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-800 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50 disabled:border-slate-200 disabled:text-slate-400">
            <FloppyDisk size={16} /> {pending === "save" ? "Guardando…" : "Guardar borrador"}
          </button>
          {canPublish && (
            <button type="button" onClick={() => void publish()} disabled={Boolean(pending)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0f4386] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0072ad] disabled:opacity-50">
              <CloudArrowUp size={16} /> {pending === "publish" ? "Publicando…" : "Publicar medios"}
            </button>
          )}
        </div>
      </div>

      {message && <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={18} weight="bold" /> {message}</p>}
      {error && <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><WarningCircle size={18} /> {error}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Portada</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Hero principal</h2>
            <p className="mt-1 text-sm text-slate-500">El video tiene prioridad; si está vacío se usa la secuencia de imágenes.</p>
          </div>
          <button type="button" onClick={addHeroImage} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-sky-600">
            <Plus size={15} weight="bold" /> Añadir imagen
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AssignmentCard label="Video del hero" description="MP4, WebM o MOV en reproducción automática, sin sonido." value={media.heroVideo} kind="video" onChange={(heroVideo) => updateMedia({ heroVideo })} />
          {media.homeHero.map((value, index) => (
            <div key={index} className="relative">
              <AssignmentCard label={`Imagen del hero ${index + 1}`} description="Secuencia visual utilizada cuando no hay video." value={value} onChange={(nextValue) => updateMedia({ homeHero: media.homeHero.map((item, itemIndex) => itemIndex === index ? nextValue : item) })} />
              <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur-sm">
                <button type="button" aria-label="Subir imagen" onClick={() => {
                  if (index === 0) return;
                  const next = [...media.homeHero];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  updateMedia({ homeHero: next });
                }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"><ArrowUp size={15} /></button>
                <button type="button" aria-label="Bajar imagen" onClick={() => {
                  if (index === media.homeHero.length - 1) return;
                  const next = [...media.homeHero];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  updateMedia({ homeHero: next });
                }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"><ArrowDown size={15} /></button>
                <button type="button" aria-label="Eliminar imagen" onClick={() => updateMedia({ homeHero: media.homeHero.filter((_, itemIndex) => itemIndex !== index) })} className="grid h-8 w-8 place-items-center rounded-md text-rose-700 hover:bg-rose-50"><Trash size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Todo el sitio</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Logos, fondos e imágenes compartidas</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {imageSlots.map((slot) => (
            <AssignmentCard
              key={slot.key}
              label={slot.label}
              description={slot.description}
              value={media[slot.key]}
              onChange={(value) => updateMedia({ [slot.key]: value })}
            />
          ))}
        </div>
      </section>
    </>
  );
}
