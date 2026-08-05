"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CloudArrowUp,
  FloppyDisk,
  LinkSimple,
  Plus,
  ShareNetwork,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import type { SiteConfig } from "@/lib/cms/types";
import { csrfHeaders } from "@/lib/client/csrf";
import { buildChangeSet } from "@/lib/client/change-set";
import ChangeReviewDialog from "./ChangeReviewDialog";

type JsonRecord = Record<string, unknown>;
type NavigationItem = SiteConfig["navigation"][number];
type SocialLink = SiteConfig["socialLinks"][number];

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-100";
const labelClass = "space-y-2 text-xs font-semibold text-slate-700";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function normalized(data: JsonRecord): JsonRecord {
  const next = clone(data);
  const navigation = (next.navigation as NavigationItem[] | undefined) ?? [];
  const defaultLabels: Record<string, { es: string; en: string }> = {
    firma: { es: "La Firma", en: "The Firm" },
    servicios: { es: "Servicios", en: "Services" },
    socios: { es: "Nuestro Equipo", en: "Our Team" },
    global: { es: "Alcance Global", en: "Global Reach" },
    publicaciones: { es: "Publicaciones", en: "Insights" },
    contacto: { es: "Contacto", en: "Contact" },
  };
  next.navigation = navigation.map((item) => ({
    ...item,
    labelEs: item.labelEs ?? defaultLabels[item.key]?.es ?? item.key,
    labelEn: item.labelEn ?? defaultLabels[item.key]?.en ?? item.key,
    hrefEs: item.hrefEs ?? `/es/${item.slug}`,
    hrefEn: item.hrefEn ?? `/en/${item.slug}`,
    visible: item.visible !== false,
  }));
  next.utilityLinks = {
    homeEs: "/es",
    homeEn: "/en",
    privacyEs: "/es/aviso-de-privacidad",
    privacyEn: "/en/aviso-de-privacidad",
    ...((next.utilityLinks as JsonRecord | undefined) ?? {}),
  };
  next.socialLinks = ((next.socialLinks as SocialLink[] | undefined) ?? []).map((item) => ({
    ...item,
    visible: item.visible !== false,
  }));
  return next;
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-slate-200 pb-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-800">{icon}</span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function LinksManager({
  siteData,
  publishedData,
  canPublish,
}: {
  siteData: JsonRecord;
  publishedData: JsonRecord;
  canPublish: boolean;
}) {
  const initial = useMemo(() => normalized(siteData), [siteData]);
  const initialPublished = useMemo(() => normalized(publishedData), [publishedData]);
  const [data, setData] = useState<JsonRecord>(() => clone(initial));
  const [savedData, setSavedData] = useState<JsonRecord>(() => clone(initial));
  const [published, setPublished] = useState<JsonRecord>(() => clone(initialPublished));
  const [pending, setPending] = useState<"save" | "publish" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState<"save" | "publish" | null>(null);

  const navigation = data.navigation as NavigationItem[];
  const utility = data.utilityLinks as SiteConfig["utilityLinks"];
  const socials = data.socialLinks as SocialLink[];
  const contact = data.contact as SiteConfig["contact"];
  const offices = data.offices as SiteConfig["offices"];
  const site = data.site as SiteConfig["site"];
  const dirty = JSON.stringify(data) !== JSON.stringify(savedData);
  const reviewChanges = useMemo(
    () => review ? buildChangeSet(review === "publish" ? published : savedData, data) : [],
    [data, published, review, savedData],
  );

  function updateNavigation(index: number, changes: Partial<NavigationItem>) {
    setData((current) => ({
      ...current,
      navigation: (current.navigation as NavigationItem[]).map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }));
  }

  function updateUtility(changes: Partial<SiteConfig["utilityLinks"]>) {
    setData((current) => ({
      ...current,
      utilityLinks: { ...(current.utilityLinks as SiteConfig["utilityLinks"]), ...changes },
    }));
  }

  function updateContact(changes: Record<string, string>) {
    setData((current) => ({
      ...current,
      contact: { ...(current.contact as JsonRecord), ...changes },
    }));
  }

  function updateSocial(index: number, changes: Partial<SocialLink>) {
    setData((current) => ({
      ...current,
      socialLinks: (current.socialLinks as SocialLink[]).map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }));
  }

  function updateOffice(index: number, mapsHref: string) {
    setData((current) => ({
      ...current,
      offices: (current.offices as SiteConfig["offices"]).map((office, itemIndex) =>
        itemIndex === index ? { ...office, mapsHref } : office,
      ),
    }));
  }

  async function save(closeReview = true) {
    setPending("save");
    setMessage("");
    setError("");

    const linkedin = socials.find((item) => item.id.toLowerCase() === "linkedin");
    const payloadData = {
      ...data,
      site: {
        ...(data.site as JsonRecord),
        ...(linkedin?.href ? { linkedin: linkedin.href } : {}),
      },
    };

    const response = await fetch("/api/admin/documents/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ data: payloadData }),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) {
      setError(payload.error || "No se pudieron guardar los enlaces.");
      return false;
    }
    setData(clone(payloadData));
    setSavedData(clone(payloadData));
    setMessage("Cambios guardados. El sitio público todavía no se ha modificado.");
    if (closeReview) setReview(null);
    return true;
  }

  async function publish() {
    if (dirty && !(await save(false))) return;
    setPending("publish");
    const response = await fetch("/api/admin/documents/site-config/publish", {
      method: "POST",
      headers: csrfHeaders(),
    });
    const payload = await response.json().catch(() => ({}));
    setPending("");
    if (!response.ok) {
      setError(payload.error || "No se pudieron publicar los enlaces.");
      return;
    }
    setPublished(clone(data));
    setMessage("Cambios publicados correctamente.");
    setReview(null);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {dirty ? "Cambios sin guardar" : "Todos los enlaces están sincronizados"}
            </p>
            <p className="text-xs text-slate-500">
              {navigation.length} destinos de navegación · {socials.length} redes · {offices.length} mapas
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReview("save")}
              disabled={!dirty || Boolean(pending)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-800 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50 disabled:border-slate-200 disabled:text-slate-400"
            >
              <FloppyDisk size={16} /> {pending === "save" ? "Guardando…" : "Guardar cambios"}
            </button>
            {canPublish && (
              <button
                type="button"
                onClick={() => setReview("publish")}
                disabled={Boolean(pending)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0f4386] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0072ad] disabled:opacity-50"
              >
                <CloudArrowUp size={16} /> {pending === "publish" ? "Publicando…" : "Publicar cambios"}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">Guardar cambios no modifica el sitio público.</p>
        </div>
      </div>

      {message && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check size={18} weight="bold" /> {message}
        </p>
      )}
      <ChangeReviewDialog
        open={Boolean(review)}
        title={review === "publish" ? "Publicar enlaces, redes y contacto" : "Guardar cambios de enlaces"}
        description={review === "publish" ? "Revisa los destinos que quedarán visibles en todo el sitio antes de publicarlos." : "Revisa los campos modificados antes de guardarlos como borrador."}
        changes={reviewChanges}
        confirmLabel={review === "publish" ? "Publicar cambios" : "Guardar cambios"}
        pending={Boolean(pending)}
        tone={review === "publish" ? "publish" : "save"}
        onCancel={() => setReview(null)}
        onConfirm={review === "publish" ? publish : () => save()}
      />
      {error && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <WarningCircle size={18} /> {error}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <SectionTitle
          icon={<LinkSimple size={20} />}
          title="Navegación principal"
          description="Edita la etiqueta y el destino ES/EN. Estos enlaces alimentan el menú, el footer y los botones internos del sitio."
        />
        <div className="space-y-4">
          {navigation.map((item, index) => (
            <article key={`${item.key}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.key}</p>
                  <p className="text-xs text-slate-500">Identificador interno: {item.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setData((current) => ({ ...current, navigation: moveItem(current.navigation as NavigationItem[], index, -1) }))} disabled={index === 0} aria-label="Subir enlace" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => setData((current) => ({ ...current, navigation: moveItem(current.navigation as NavigationItem[], index, 1) }))} disabled={index === navigation.length - 1} aria-label="Bajar enlace" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"><ArrowDown size={15} /></button>
                  <label className="ml-2 inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={item.visible !== false} onChange={(event) => updateNavigation(index, { visible: event.target.checked })} />
                    Visible
                  </label>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>Etiqueta ES<input value={item.labelEs ?? ""} onChange={(event) => updateNavigation(index, { labelEs: event.target.value })} className={inputClass} /></label>
                <label className={labelClass}>Etiqueta EN<input value={item.labelEn ?? ""} onChange={(event) => updateNavigation(index, { labelEn: event.target.value })} className={inputClass} /></label>
                <label className={labelClass}>Destino ES<input value={item.hrefEs ?? ""} onChange={(event) => updateNavigation(index, { hrefEs: event.target.value })} className={inputClass} placeholder="/es/firma o https://…" /></label>
                <label className={labelClass}>Destino EN<input value={item.hrefEn ?? ""} onChange={(event) => updateNavigation(index, { hrefEn: event.target.value })} className={inputClass} placeholder="/en/firma o https://…" /></label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <SectionTitle
            icon={<LinkSimple size={20} />}
            title="Enlaces auxiliares"
            description="Inicio, privacidad y URL canónica utilizada por buscadores y metadatos."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Inicio ES<input value={utility.homeEs} onChange={(event) => updateUtility({ homeEs: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Inicio EN<input value={utility.homeEn} onChange={(event) => updateUtility({ homeEn: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Privacidad ES<input value={utility.privacyEs} onChange={(event) => updateUtility({ privacyEs: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Privacidad EN<input value={utility.privacyEn} onChange={(event) => updateUtility({ privacyEn: event.target.value })} className={inputClass} /></label>
            <label className={`${labelClass} md:col-span-2`}>URL pública canónica<input value={site.url} onChange={(event) => setData((current) => ({ ...current, site: { ...(current.site as JsonRecord), url: event.target.value } }))} className={inputClass} placeholder="https://intervo-page-2026.replit.app" /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
          <SectionTitle
            icon={<LinkSimple size={20} />}
            title="Contacto enlazable"
            description="Lo que se muestra y el enlace real pueden editarse por separado."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Teléfono visible<input value={contact.phoneDisplay} onChange={(event) => updateContact({ phoneDisplay: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Enlace telefónico<input value={contact.phoneHref} onChange={(event) => updateContact({ phoneHref: event.target.value })} className={inputClass} placeholder="tel:+52…" /></label>
            <label className={labelClass}>Correo visible<input value={contact.email} onChange={(event) => updateContact({ email: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Enlace de correo<input value={contact.emailHref} onChange={(event) => updateContact({ emailHref: event.target.value })} className={inputClass} placeholder="mailto:…" /></label>
            <label className={`${labelClass} md:col-span-2`}>WhatsApp<input value={contact.whatsappHref} onChange={(event) => updateContact({ whatsappHref: event.target.value })} className={inputClass} placeholder="Vacío = botón oculto · https://wa.me/…" /><span className="font-normal text-slate-500">Deja este campo vacío para ocultar WhatsApp en Contacto.</span></label>
          </div>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-800"><ShareNetwork size={20} /></span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Redes sociales</h2>
              <p className="mt-1 text-sm text-slate-500">Añade, oculta, reordena o modifica cualquier red que aparecerá en encabezado, footer y contacto.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setData((current) => ({
              ...current,
              socialLinks: [
                ...(current.socialLinks as SocialLink[]),
                { id: `red-${Date.now()}`, label: "Nueva red", href: "", visible: true },
              ],
            }))}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-800 px-3.5 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-50"
          >
            <Plus size={15} weight="bold" /> Añadir red
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {socials.map((item, index) => (
            <article key={`${item.id}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-[0.8fr_1fr_2fr_auto] md:items-end">
              <label className={labelClass}>Identificador<input value={item.id} onChange={(event) => updateSocial(index, { id: event.target.value })} className={inputClass} placeholder="linkedin" /></label>
              <label className={labelClass}>Nombre visible<input value={item.label} onChange={(event) => updateSocial(index, { label: event.target.value })} className={inputClass} /></label>
              <label className={labelClass}>URL<input value={item.href} onChange={(event) => updateSocial(index, { href: event.target.value })} className={inputClass} placeholder="https://…" /></label>
              <div className="flex items-center gap-1">
                <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={item.visible !== false} onChange={(event) => updateSocial(index, { visible: event.target.checked })} />
                  Visible
                </label>
                <button type="button" onClick={() => setData((current) => ({ ...current, socialLinks: moveItem(current.socialLinks as SocialLink[], index, -1) }))} disabled={index === 0} aria-label="Subir red" className="grid h-11 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => setData((current) => ({ ...current, socialLinks: moveItem(current.socialLinks as SocialLink[], index, 1) }))} disabled={index === socials.length - 1} aria-label="Bajar red" className="grid h-11 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => setData((current) => ({ ...current, socialLinks: (current.socialLinks as SocialLink[]).filter((_, itemIndex) => itemIndex !== index) }))} aria-label="Eliminar red" className="grid h-11 w-9 place-items-center rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"><Trash size={15} /></button>
              </div>
            </article>
          ))}
          {!socials.length && <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No hay redes visibles. Usa “Añadir red” para crear una.</p>}
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
        <SectionTitle
          icon={<LinkSimple size={20} />}
          title="Enlaces de mapas"
          description="Cada oficina conserva su contenido y utiliza aquí el destino de “Ver en mapa”."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {offices.map((office, index) => (
            <label key={office.id} className={labelClass}>
              {office.city}
              <input value={office.mapsHref} onChange={(event) => updateOffice(index, event.target.value)} className={inputClass} placeholder="https://maps.google.com/…" />
            </label>
          ))}
        </div>
      </section>
    </>
  );
}
