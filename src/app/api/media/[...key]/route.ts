import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { loadMediaBytes } from "@/lib/media/storage";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

function contentDisposition(name: string) {
  const fallback = name
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\/]/g, "_")
    .trim() || "archivo";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const storageKey = key.join("/");
  if (!storageKey.startsWith("media/") || storageKey.includes("..")) {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 400 });
  }
  const buffer = await loadMediaBytes(storageKey);
  if (!buffer) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  const db = getDb();
  const [item] = db
    ? await db
        .select({ mime: mediaItems.mime, name: mediaItems.name })
        .from(mediaItems)
        .where(eq(mediaItems.storageKey, storageKey))
        .limit(1)
    : [];
  const range = request.headers.get("range");
  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers = new Headers({
    "Content-Type": item?.mime ?? "application/octet-stream",
    "Cache-Control": download ? "private, no-store" : "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  if (download) headers.set("Content-Disposition", contentDisposition(item?.name ?? storageKey.split("/").at(-1) ?? "archivo"));

  if (range && !download) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${buffer.length}` },
      });
    }
    const suffixLength = !match[1] && match[2] ? Number(match[2]) : null;
    const start = suffixLength === null
      ? Number(match[1] || 0)
      : Math.max(buffer.length - suffixLength, 0);
    const requestedEnd = suffixLength === null
      ? Number(match[2] || buffer.length - 1)
      : buffer.length - 1;
    const end = Math.min(requestedEnd, buffer.length - 1);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= buffer.length) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${buffer.length}` },
      });
    }
    const chunk = buffer.subarray(start, end + 1);
    headers.set("Content-Range", `bytes ${start}-${end}/${buffer.length}`);
    headers.set("Content-Length", String(chunk.length));
    return new NextResponse(new Uint8Array(chunk), { status: 206, headers });
  }

  headers.set("Content-Length", String(buffer.length));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      ...Object.fromEntries(headers),
    },
  });
}
