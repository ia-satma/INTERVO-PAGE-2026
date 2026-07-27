"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Key, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { csrfHeaders } from "@/lib/client/csrf";

export default function MfaSetup() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/auth/mfa").then((response) => response.json()).then((payload) => {
      setSecret(payload.secret ?? "");
      setUri(payload.uri ?? "");
      if (payload.error) setError(payload.error);
    });
  }, []);

  async function verify(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    const response = await fetch("/api/auth/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ code }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setError(payload.error || "Código inválido."); setPending(false); return; }
    router.replace("/admin"); router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#0f4386] text-white"><ShieldCheck size={25} weight="duotone" /></span>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Seguridad obligatoria</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Activa la verificación de dos pasos</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">Añade esta cuenta a Google Authenticator, 1Password, Authy u otra aplicación TOTP. Después escribe el código actual.</p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <ol className="space-y-6">
          <li><p className="text-sm font-semibold text-slate-800">1. Copia la clave de configuración</p><div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-white"><code className="min-w-0 flex-1 break-all font-mono text-sm tracking-wider">{secret || "Generando…"}</code><button onClick={() => navigator.clipboard.writeText(secret)} aria-label="Copiar clave" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"><Copy size={17} /></button></div></li>
          <li><p className="text-sm font-semibold text-slate-800">2. También puedes copiar el enlace TOTP</p><button onClick={() => navigator.clipboard.writeText(uri)} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-900"><Key size={16} /> Copiar enlace para autenticador</button></li>
        </ol>
        <form onSubmit={verify} className="mt-7 border-t border-slate-200 pt-6">
          <label htmlFor="mfa-code" className="block text-sm font-semibold text-slate-800">3. Código de seis dígitos</label>
          <div className="mt-2 flex gap-2"><input id="mfa-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" required className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 font-mono tracking-[0.35em] outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15" /><button disabled={pending || code.length !== 6} className="inline-flex items-center gap-2 rounded-xl bg-[#0f4386] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0072ad] disabled:opacity-40"><CheckCircle size={18} /> Verificar</button></div>
          {error && <p className="mt-3 flex items-center gap-2 text-sm text-rose-700"><WarningCircle size={17} /> {error}</p>}
        </form>
      </div>
    </div>
  );
}
