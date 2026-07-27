import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "@replit/object-storage";

let client: Client | null;

export function getStorageClient() {
  if (client) return client;
  client = new Client(
    process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID
      ? { bucketId: process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID }
      : undefined,
  );
  return client;
}

const localStorageRoot = path.join(process.cwd(), ".local", "media");

export function usesReplitStorage() {
  return Boolean(process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID || process.env.REPL_ID);
}

function safeLocalPath(storageKey: string) {
  if (!storageKey.startsWith("media/") || storageKey.includes("..")) {
    throw new Error("Ruta de almacenamiento inválida.");
  }
  return path.join(localStorageRoot, ...storageKey.split("/"));
}

export async function storeMediaBytes(storageKey: string, bytes: Buffer) {
  if (usesReplitStorage()) {
    const result = await getStorageClient().uploadFromBytes(storageKey, bytes, { compress: false });
    if (!result.ok) throw new Error(`App Storage rechazó el archivo: ${result.error.message}`);
    return;
  }
  const filePath = safeLocalPath(storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
}

export async function loadMediaBytes(storageKey: string) {
  if (usesReplitStorage()) {
    const result = await getStorageClient().downloadAsBytes(storageKey);
    if (!result.ok) return null;
    return Buffer.from(result.value[0]);
  }
  return readFile(safeLocalPath(storageKey)).catch(() => null);
}

export async function deleteMediaObject(storageKey: string) {
  if (usesReplitStorage()) {
    const result = await getStorageClient().delete(storageKey, { ignoreNotFound: true });
    if (!result.ok) throw new Error(`No se pudo eliminar de App Storage: ${result.error.message}`);
    return;
  }
  await rm(safeLocalPath(storageKey), { force: true });
}

export const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export function detectMedia(buffer: Buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { kind: "image" as const, mime: "image/jpeg", ext: "jpg" };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { kind: "image" as const, mime: "image/png", ext: "png" };
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { kind: "image" as const, mime: "image/webp", ext: "webp" };
  }
  const box = buffer.subarray(4, 12).toString("ascii");
  if (box.startsWith("ftypavif") || box.startsWith("ftypavis")) return { kind: "image" as const, mime: "image/avif", ext: "avif" };
  if (box.startsWith("ftypqt")) return { kind: "video" as const, mime: "video/quicktime", ext: "mov" };
  if (box.startsWith("ftyp")) return { kind: "video" as const, mime: "video/mp4", ext: "mp4" };
  if (buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { kind: "video" as const, mime: "video/webm", ext: "webm" };
  }
  return null;
}

async function walk(directory: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const values = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.posix.join(prefix, entry.name);
      return entry.isDirectory() ? walk(path.join(directory, entry.name), relative) : [relative];
    }),
  );
  return values.flat();
}

export async function listVirtualMedia() {
  const root = path.join(process.cwd(), "public");
  const files = await walk(root);
  return files
    .filter((file) => !path.basename(file).startsWith("._") && /\.(avif|jpe?g|png|webp|mp4|webm|mov)$/i.test(file))
    .map((file) => {
      const kind = /\.(mp4|webm|mov)$/i.test(file) ? ("video" as const) : ("image" as const);
      return {
        id: `virtual:${createHash("sha1").update(file).digest("hex")}`,
        storageKey: null,
        name: path.basename(file),
        kind,
        mime: kind === "video" ? "video/mp4" : "image/webp",
        size: null,
        url: `/${file}`,
        altEs: "",
        altEn: "",
        posterUrl: null,
        createdAt: null,
        virtual: true,
      };
    });
}
