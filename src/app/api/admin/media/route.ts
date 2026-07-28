import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/auth/audit";
import { apiError, requirePermission } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { cmsDocuments, mediaItems } from "@/lib/db/schema";
import {
  deleteMediaObject,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  detectMedia,
  listVirtualMedia,
  storeMediaBytes,
} from "@/lib/media/storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, "content:read");
    const db = getDb();
    const uploaded = db
      ? await db.select().from(mediaItems).where(isNull(mediaItems.archivedAt)).orderBy(desc(mediaItems.createdAt))
      : [];
    const stored = uploaded.map((item) => ({
      ...item,
      virtual: item.storageKey.startsWith("public:"),
    }));
    const byUrl = new Map<string, Record<string, unknown> & { url: string }>();
    for (const item of stored) byUrl.set(item.url, item);
    for (const item of await listVirtualMedia()) {
      if (!byUrl.has(item.url)) byUrl.set(item.url, item);
    }
    return NextResponse.json({ items: Array.from(byUrl.values()) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await requirePermission(request, "media:manage", { csrf: true });
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_VIDEO_BYTES + 1024 * 1024) {
      return NextResponse.json({ error: "La carga supera el límite permitido." }, { status: 413 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona un archivo." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectMedia(bytes);
    if (!detected) return NextResponse.json({ error: "Formato no permitido. SVG y archivos sin firma válida se rechazan." }, { status: 400 });
    const limit = detected.kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (bytes.length > limit) {
      return NextResponse.json({ error: `El archivo supera el límite de ${detected.kind === "image" ? "20 MB" : "200 MB"}.` }, { status: 413 });
    }
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const storageKey = `media/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${detected.ext}`;
    await storeMediaBytes(storageKey, bytes);
    const url = `/api/media/${storageKey}`;
    let item;
    try {
      [item] = await db
        .insert(mediaItems)
        .values({
          storageKey,
          name: file.name.slice(0, 180),
          kind: detected.kind,
          mime: detected.mime,
          size: bytes.length,
          url,
          altEs: String(form.get("altEs") ?? "").slice(0, 500),
          altEn: String(form.get("altEn") ?? "").slice(0, 500),
          createdBy: context.user.id,
        })
        .returning();
    } catch (error) {
      await deleteMediaObject(storageKey).catch(() => undefined);
      throw error;
    }
    await writeAudit(request, {
      userId: context.user.id,
      action: "media.uploaded",
      resource: "media",
      resourceId: item.id,
      metadata: { name: item.name, kind: item.kind, size: item.size },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await requirePermission(request, "media:manage", { csrf: true });
    const input = z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(180),
        altEs: z.string().max(500).default(""),
        altEn: z.string().max(500).default(""),
        posterUrl: z.string().max(1000).nullable().optional(),
      })
      .parse(await request.json());
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const [item] = await db
      .update(mediaItems)
      .set({
        name: input.name,
        altEs: input.altEs,
        altEn: input.altEn,
        posterUrl: input.posterUrl || null,
      })
      .where(and(eq(mediaItems.id, input.id), isNull(mediaItems.archivedAt)))
      .returning();
    if (!item) return NextResponse.json({ error: "Medio no encontrado." }, { status: 404 });
    await writeAudit(request, {
      userId: context.user.id,
      action: "media.updated",
      resource: "media",
      resourceId: item.id,
      metadata: { name: item.name },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await requirePermission(request, "media:manage", { csrf: true });
    const input = z.object({ id: z.string().uuid() }).parse(await request.json());
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL no está configurada.");
    const [item] = await db.select().from(mediaItems).where(and(eq(mediaItems.id, input.id), isNull(mediaItems.archivedAt))).limit(1);
    if (!item) return NextResponse.json({ error: "Medio no encontrado." }, { status: 404 });
    if (item.storageKey.startsWith("public:")) {
      return NextResponse.json({ error: "Los recursos originales del sitio no se pueden eliminar." }, { status: 409 });
    }
    const documents = await db.select({ draft: cmsDocuments.draft, published: cmsDocuments.published }).from(cmsDocuments);
    const used = documents.some((document) => JSON.stringify(document).includes(item.url) || JSON.stringify(document).includes(item.storageKey));
    if (used) return NextResponse.json({ error: "No se puede eliminar porque este archivo está en uso." }, { status: 409 });
    await deleteMediaObject(item.storageKey);
    await db.update(mediaItems).set({ archivedAt: new Date() }).where(eq(mediaItems.id, item.id));
    await writeAudit(request, { userId: context.user.id, action: "media.archived", resource: "media", resourceId: item.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
