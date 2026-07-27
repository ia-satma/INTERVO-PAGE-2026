"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Key, LockKey, WarningCircle } from "@phosphor-icons/react";

export default function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        code: requiresMfa ? form.get("code") : undefined,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 428) {
      setRequiresMfa(true);
      setPending(false);
      return;
    }
    if (!response.ok) {
      setError(payload.error || "No fue posible iniciar sesión.");
      setPending(false);
      return;
    }
    router.replace(payload.requiresEnrollment ? "/admin/mfa" : "/admin");
    router.refresh();
  }

  const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[0.95rem] outline-none transition-[border-color,box-shadow] focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15";

  return (
    <form method="post" action="/api/auth/login" onSubmit={submit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-800">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={field} placeholder="nombre@intervo.legal" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-800">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      </div>
      {requiresMfa && (
        <div className="space-y-2">
          <label htmlFor="code" className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Key size={17} /> Código de seis dígitos</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required className={`${field} font-mono tracking-[0.35em]`} autoFocus />
        </div>
      )}
      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <WarningCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={pending || !ready} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f4386] px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-[#0072ad] active:translate-y-px disabled:cursor-wait disabled:opacity-60">
        {pending ? "Verificando…" : "Entrar al panel"} {!pending && <ArrowRight size={18} weight="bold" />}
      </button>
      <p className="flex items-center justify-center gap-2 text-xs text-slate-500"><LockKey size={15} /> Sesión cifrada y protegida</p>
    </form>
  );
}
