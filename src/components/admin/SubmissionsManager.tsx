"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowSquareOut, CheckCircle, Clock, EnvelopeOpen, WarningCircle } from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";
import { buildChangeSet } from "@/lib/client/change-set";
import ChangeReviewDialog from "./ChangeReviewDialog";

type Submission = {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  locale: string;
  status: "new" | "in_progress" | "closed";
  notes?: string | null;
  createdAt: string;
};

const statusLabel = { new: "Nueva", in_progress: "En seguimiento", closed: "Cerrada" };

export default function SubmissionsManager() {
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [proposal, setProposal] = useState<{ id: string; status: Submission["status"]; notes: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/contact-submissions").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setItems(payload.submissions);
    }).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => ({
    new: items.filter((item) => item.status === "new"),
    in_progress: items.filter((item) => item.status === "in_progress"),
    closed: items.filter((item) => item.status === "closed"),
  }), [items]);

  async function update() {
    if (!proposal) return;
    setPending(true);
    const response = await fetch(`/api/admin/contact-submissions/${proposal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ status: proposal.status, notes: proposal.notes }),
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) return setError(payload.error);
    setItems((current) => current.map((item) => item.id === proposal.id ? payload.submission : item));
    setSelected(payload.submission);
    setProposal(null);
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}</div>;
  if (error) return <p className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><WarningCircle size={18} /> {error}</p>;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-8">
        {(Object.keys(groups) as Submission["status"][]).map((status) => (
          <section key={status}>
            <div className="mb-3 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${status === "new" ? "bg-sky-600" : status === "in_progress" ? "bg-amber-500" : "bg-emerald-500"}`} /><h2 className="text-sm font-semibold text-slate-800">{statusLabel[status]}</h2><span className="font-mono text-xs text-slate-400">{groups[status].length}</span></div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {groups[status].length === 0 && <p className="py-6 text-sm text-slate-400">Sin solicitudes en esta etapa.</p>}
              {groups[status].map((item) => (
                <button key={item.id} onClick={() => setSelected(item)} className={`grid w-full gap-2 py-4 text-left transition-colors hover:bg-white sm:grid-cols-[minmax(150px,0.55fr)_1fr_120px] sm:items-center sm:px-3 ${selected?.id === item.id ? "bg-white" : ""}`}>
                  <div><p className="text-sm font-semibold text-slate-900">{item.name}</p><p className="mt-1 truncate text-xs text-slate-500">{item.email}</p></div>
                  <p className="truncate text-sm text-slate-600">{item.subject || item.message}</p>
                  <time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString("es-MX")}</time>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <aside className="xl:sticky xl:top-24 xl:self-start">
        {selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.7)]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">{statusLabel[selected.status]}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{selected.name}</h2></div><EnvelopeOpen size={23} className="text-slate-400" /></div>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="text-xs font-semibold text-slate-400">Correo</dt><dd className="mt-1"><a className="inline-flex items-center gap-1 text-sky-700" href={`mailto:${selected.email}`}>{selected.email}<ArrowSquareOut size={14} /></a></dd></div>
              {selected.phone && <div><dt className="text-xs font-semibold text-slate-400">Teléfono</dt><dd className="mt-1 text-slate-700">{selected.phone}</dd></div>}
              {selected.company && <div><dt className="text-xs font-semibold text-slate-400">Empresa</dt><dd className="mt-1 text-slate-700">{selected.company}</dd></div>}
              <div><dt className="text-xs font-semibold text-slate-400">Mensaje</dt><dd className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-700">{selected.message}</dd></div>
            </dl>
            <label className="mt-5 block text-xs font-semibold text-slate-700">Notas internas</label>
            <textarea id={`notes-${selected.id}`} defaultValue={selected.notes || ""} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setProposal({ id: selected.id, status: "in_progress", notes: (document.getElementById(`notes-${selected.id}`) as HTMLTextAreaElement)?.value ?? "" })} className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800"><Clock size={16} /> Seguimiento</button>
              <button onClick={() => setProposal({ id: selected.id, status: "closed", notes: (document.getElementById(`notes-${selected.id}`) as HTMLTextAreaElement)?.value ?? "" })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white"><CheckCircle size={16} /> Cerrar</button>
            </div>
          </div>
        ) : <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">Selecciona una solicitud para ver sus detalles.</div>}
      </aside>
      <ChangeReviewDialog
        open={Boolean(proposal)}
        title="Actualizar solicitud de contacto"
        description="Revisa el nuevo estado y las notas internas antes de guardar el seguimiento."
        changes={buildChangeSet(
          { status: selected?.status, notes: selected?.notes ?? "" },
          { status: proposal?.status, notes: proposal?.notes ?? "" },
        )}
        confirmLabel="Guardar seguimiento"
        pending={pending}
        onCancel={() => setProposal(null)}
        onConfirm={update}
      />
    </div>
  );
}
