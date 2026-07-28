import { createHash } from "node:crypto";
import { Resend } from "resend";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, PayloadTooLargeError, readLimitedJson } from "@/lib/auth/request";
import { hasSecureSessionSecret } from "@/lib/auth/crypto";
import { getDb } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(180).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["es", "en"]).default("es"),
  website: z.string().max(0).optional().default(""),
});

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !hasSecureSessionSecret()) {
    return NextResponse.json({ error: "El formulario no está configurado todavía." }, { status: 503 });
  }
  const ip = getClientIp(request);
  const limit = await rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiados envíos. Intenta más tarde." }, { status: 429 });
  let body: unknown;
  try {
    body = await readLimitedJson(request, 16 * 1024);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    throw error;
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success || parsed.data.website) return NextResponse.json({ error: "Revisa los campos del formulario." }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "El formulario todavía no está conectado en producción." }, { status: 503 });
  const data = {
    name: parsed.data.name,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    locale: parsed.data.locale,
  };
  const [submission] = await db
    .insert(contactSubmissions)
    .values({
      ...data,
      ipHash: createHash("sha256").update(`${process.env.SESSION_SECRET ?? "intervo-development"}:${ip}`).digest("hex"),
    })
    .returning();

  if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Intervo Web <notificaciones@intervo.legal>",
      to: process.env.CONTACT_NOTIFICATION_EMAIL,
      replyTo: data.email,
      subject: `Nuevo contacto web — ${(data.subject || data.name).replace(/[\r\n]+/g, " ")}`,
      text: [`Nombre: ${data.name}`, `Empresa: ${data.company}`, `Correo: ${data.email}`, `Teléfono: ${data.phone}`, "", data.message].join("\n"),
    }).catch((error) => console.error("No se pudo enviar la notificación", error));
  }
  return NextResponse.json({ ok: true, id: submission.id }, { status: 201 });
}
