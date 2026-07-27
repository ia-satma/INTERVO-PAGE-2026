"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowUpRight } from "./icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  t: Dictionary["contacto"]["form"];
  subjects: string[];
  contactEmail: string;
  contactEmailHref: string;
  privacyLabel: string;
  privacyHref: string;
};

export default function ContactForm({ locale, t, subjects, contactEmail, contactEmailHref, privacyLabel, privacyHref }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setError("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        company: data.get("company"),
        email: data.get("email"),
        phone: data.get("phone"),
        subject: data.get("subject"),
        message: data.get("message"),
        website: data.get("website"),
        locale,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || t.error);
      setStatus("error");
      return;
    }
    setStatus("success");
    form.reset();
  }

  const field =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-muted-2 focus:border-navy focus:ring-2 focus:ring-navy/10";
  const label = "mb-1.5 block font-display text-[0.82rem] font-semibold text-ink/80";

  if (status === "success") {
    return (
      <div className="flex h-full flex-col items-start justify-center rounded-2xl border border-line bg-mist p-10">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-navy text-white">
          <Check className="h-7 w-7" />
        </span>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink">{t.success}</p>
        <a href={contactEmailHref} className="mt-6 inline-flex items-center gap-1.5 font-display font-semibold text-navy">
          {contactEmail} <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>{t.name}</label>
          <input id="name" name="name" required autoComplete="name" placeholder={t.namePlaceholder} className={field} />
        </div>
        <div>
          <label htmlFor="company" className={label}>{t.company}</label>
          <input id="company" name="company" autoComplete="organization" placeholder={t.companyPlaceholder} className={field} />
        </div>
        <div>
          <label htmlFor="email" className={label}>{t.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder={t.emailPlaceholder} className={field} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>{t.phone}</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={t.phonePlaceholder} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="subject" className={label}>{t.subject}</label>
          <select id="subject" name="subject" defaultValue="" className={field}>
            <option value="" disabled>{t.subjectPlaceholder}</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>{t.message}</label>
          <textarea id="message" name="message" required rows={4} placeholder={t.messagePlaceholder} className={`${field} resize-none`} />
        </div>
      </div>

      {status === "error" && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <button type="submit" disabled={status === "submitting"} className="btn btn-primary mt-6 w-full sm:w-auto !px-8 !py-3.5 disabled:cursor-wait disabled:opacity-60">
        {status === "submitting" ? t.sending : t.submit}
        <ArrowUpRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-[0.8rem] text-muted-2">
        {(() => {
          const linkText = privacyLabel;
          const [before, after = ""] = t.privacy.split(linkText);
          return (
            <>
              {before}
              <Link href={privacyHref} className="underline hover:text-navy">
                {linkText}
              </Link>
              {after}
            </>
          );
        })()}
      </p>
    </form>
  );
}
