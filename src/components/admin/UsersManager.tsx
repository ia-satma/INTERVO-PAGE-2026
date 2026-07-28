"use client";

import { useEffect, useState } from "react";
import { Check, Plus, ShieldCheck, UserCircle, WarningCircle } from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";
import { buildChangeSet } from "@/lib/client/change-set";
import ChangeReviewDialog from "./ChangeReviewDialog";

type User = { id: string; name: string; email: string; role: "owner" | "admin" | "editor"; isActive: boolean; mfaEnabled: boolean; createdAt: string };

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [proposal, setProposal] = useState<Record<string, string> | null>(null);

  async function load() {
    const response = await fetch("/api/admin/users");
    const payload = await response.json();
    if (!response.ok) setError(payload.error);
    else setUsers(payload.users);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function reviewCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProposal(Object.fromEntries(form) as Record<string, string>);
  }

  async function create() {
    if (!proposal) return;
    setPending(true); setError(""); setNotice("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify(proposal),
    });
    const payload = await response.json();
    setPending(false);
    if (!response.ok) return setError(payload.error);
    setNotice("Usuario creado. La contraseña ya puede utilizarse.");
    setProposal(null);
    setOpen(false);
    await load();
  }

  const input = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15";
  return (
    <>
      <div className="mb-5 flex justify-end"><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#0f4386] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0072ad]"><Plus size={18} weight="bold" /> Nuevo usuario</button></div>
      {notice && <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={17} /> {notice}</p>}
      {error && <p className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><WarningCircle size={17} /> {error}</p>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? <div className="h-64 animate-pulse bg-slate-100" /> : users.map((user) => (
          <div key={user.id} className="grid gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_150px_130px] sm:items-center">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><UserCircle size={21} /></span><div><p className="text-sm font-semibold text-slate-900">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">{user.email}</p></div></div>
            <span className="w-fit rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold capitalize text-sky-800">{user.role}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs ${user.mfaEnabled ? "text-emerald-700" : "text-slate-400"}`}><ShieldCheck size={15} /> {user.mfaEnabled ? "MFA activo" : "Sin MFA"}</span>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form onSubmit={reviewCreate} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Acceso</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Crear usuario</h2>
            <div className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm font-semibold">Nombre<input name="name" required className={input} /></label>
              <label className="block space-y-2 text-sm font-semibold">Correo<input name="email" type="email" required className={input} /></label>
              <label className="block space-y-2 text-sm font-semibold">Contraseña temporal<input name="password" type="password" minLength={16} maxLength={256} autoComplete="new-password" required className={input} /><span className="block text-xs font-normal text-slate-500">Mínimo 16 caracteres; usa una frase única.</span></label>
              <label className="block space-y-2 text-sm font-semibold">Rol<select name="role" defaultValue="editor" className={input}><option value="editor">Editor</option><option value="admin">Administrador</option><option value="owner">Dueño</option></select></label>
            </div>
            <div className="mt-7 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button><button className="rounded-lg bg-[#0f4386] px-5 py-2.5 text-sm font-semibold text-white">Crear usuario</button></div>
          </form>
        </div>
      )}
      <ChangeReviewDialog
        open={Boolean(proposal)}
        title="Crear acceso para un usuario"
        description="Confirma el nombre, correo y nivel de permisos. La contraseña se mantiene oculta durante la revisión."
        changes={buildChangeSet({}, proposal ?? {})}
        confirmLabel="Crear usuario"
        pending={pending}
        tone="publish"
        onCancel={() => setProposal(null)}
        onConfirm={create}
      />
    </>
  );
}
