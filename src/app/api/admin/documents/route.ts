import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { listCmsDocuments } from "@/lib/cms/repository";
import { getDb } from "@/lib/db";
import { cmsDocuments } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "content:read");
    return NextResponse.json({ documents: await listCmsDocuments() });
  } catch (error) {
    return apiError(error);
  }
}

const pageTemplate = (title: string) => ({
  es: {
    eyebrow: "Intervo",
    title,
    subtitle: "Agrega aquí una introducción breve.",
    seoTitle: `${title} · intervø`,
    seoDescription: "",
    sections: [
      { type: "rich_text", visible: true, eyebrow: "", title: "Título de sección", body: "Escribe aquí el contenido." },
      { type: "image_text", visible: false, title: "Imagen y contenido", body: "", image: "", imagePosition: "right" },
      { type: "video", visible: false, title: "Video", body: "", video: "", poster: "" },
      { type: "stats", visible: false, title: "Cifras", items: [{ value: "01", label: "Indicador" }] },
      { type: "cards", visible: false, title: "Puntos clave", items: [{ title: "Tarjeta", body: "" }] },
      { type: "cta", visible: true, title: "Hablemos de tu proyecto", body: "", label: "Contacto", href: "/es/contacto" },
    ],
  },
  en: {
    eyebrow: "Intervo",
    title,
    subtitle: "Add a short introduction here.",
    seoTitle: `${title} · intervø`,
    seoDescription: "",
    sections: [
      { type: "rich_text", visible: true, eyebrow: "", title: "Section title", body: "Write the content here." },
      { type: "image_text", visible: false, title: "Image and content", body: "", image: "", imagePosition: "right" },
      { type: "video", visible: false, title: "Video", body: "", video: "", poster: "" },
      { type: "stats", visible: false, title: "Figures", items: [{ value: "01", label: "Indicator" }] },
      { type: "cards", visible: false, title: "Key points", items: [{ title: "Card", body: "" }] },
      { type: "cta", visible: true, title: "Let’s discuss your project", body: "", label: "Contact", href: "/en/contacto" },
    ],
  },
});

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(request, "content:write", { csrf: true });
    const input = z
      .object({
        title: z.string().trim().min(2).max(120),
        slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      })
      .parse(await request.json());
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const key = `page:${input.slug}`;
    const data = pageTemplate(input.title);
    const [document] = await db
      .insert(cmsDocuments)
      .values({
        key,
        label: input.title,
        group: "Contenido",
        description: `Página modular /${input.slug}`,
        draft: data,
        published: data,
        status: "draft",
        updatedBy: context.user.id,
      })
      .returning();
    await writeAudit(request, { userId: context.user.id, action: "page.created", resource: "cms_document", resourceId: document.id, metadata: { slug: input.slug } });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
