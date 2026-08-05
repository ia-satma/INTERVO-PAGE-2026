import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "@replit/object-storage";
import postgres from "postgres";

type CliOptions = { databaseEnv: string; output: string };

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let databaseEnv = "DATABASE_URL";
  let output = path.join(".handoff", `intervo-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--database-env") databaseEnv = args[++index] ?? "";
    else if (arg.startsWith("--database-env=")) databaseEnv = arg.slice("--database-env=".length);
    else if (arg === "--output") output = args[++index] ?? "";
    else if (arg.startsWith("--output=")) output = arg.slice("--output=".length);
    else throw new Error(`Argumento desconocido: ${arg}`);
  }
  if (!/^[A-Z][A-Z0-9_]*$/.test(databaseEnv)) throw new Error("--database-env debe ser el nombre de una variable de entorno.");
  if (!output) throw new Error("--output requiere una ruta.");
  return { databaseEnv, output };
}

function storageClient() {
  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID?.trim();
  return new Client(bucketId ? { bucketId } : undefined);
}

function sha256(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

function iso(value: Date | string | null) {
  return value ? new Date(value).toISOString() : null;
}

function objectFile(storageKey: string) {
  if (!/^media\/[A-Za-z0-9._/-]+$/.test(storageKey) || storageKey.split("/").includes("..")) {
    throw new Error(`storageKey inseguro: ${storageKey}`);
  }
  return path.posix.join("objects", storageKey);
}

async function main() {
  const options = parseArgs();
  const databaseUrl = process.env[options.databaseEnv];
  if (!databaseUrl) throw new Error(`Falta la variable ${options.databaseEnv}.`);

  const handoffRoot = path.resolve(".handoff");
  const outputRoot = path.resolve(options.output);
  if (!outputRoot.startsWith(`${handoffRoot}${path.sep}`)) {
    throw new Error("El bundle debe guardarse dentro de .handoff/ para permanecer fuera de Git.");
  }
  await mkdir(outputRoot, { recursive: true });
  const sql = postgres(databaseUrl, { max: 1, prepare: false });

  try {
    const documents = await sql`
      select key, label, "group", description, draft, published, status, version,
             created_at, updated_at, published_at
      from cms_documents
      order by key
    `;
    const versions = await sql`
      select d.key as document_key, v.version, v.snapshot, v.created_at
      from cms_versions v
      join cms_documents d on d.id = v.document_id
      order by d.key, v.version, v.created_at
    `;
    const media = await sql`
      select storage_key, name, kind, mime, size, url, alt_es, alt_en, poster_url,
             width, height, duration, created_at
      from media_items
      where archived_at is null
      order by storage_key
    `;

    const objects: Array<{ storageKey: string; file: string; sha256: string; size: number }> = [];
    const client = storageClient();
    for (const item of media) {
      const storageKey = String(item.storage_key);
      if (!storageKey.startsWith("media/")) continue;
      const result = await client.downloadAsBytes(storageKey, { decompress: false });
      if (!result.ok) throw new Error(`No se pudo exportar ${storageKey}: ${result.error.message}`);
      const bytes = Buffer.from(result.value[0]);
      const file = objectFile(storageKey);
      const destination = path.join(outputRoot, ...file.split("/"));
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      item.size = bytes.length;
      objects.push({ storageKey, file, sha256: sha256(bytes), size: bytes.length });
    }

    const data = {
      schemaVersion: 1,
      documents: documents.map((row) => ({
        key: row.key,
        label: row.label,
        group: row.group,
        description: row.description,
        draft: row.draft,
        published: row.published,
        status: row.status,
        version: row.version,
        createdAt: iso(row.created_at),
        updatedAt: iso(row.updated_at),
      publishedAt: iso(row.published_at),
      })),
      versions: versions.map((row) => ({
        documentKey: row.document_key,
        version: row.version,
        snapshot: row.snapshot,
        createdAt: iso(row.created_at),
      })),
      media: media.map((row) => ({
        storageKey: row.storage_key,
        name: row.name,
        kind: row.kind,
        mime: row.mime,
        size: row.size,
        url: row.url,
        altEs: row.alt_es,
        altEn: row.alt_en,
        posterUrl: row.poster_url,
        width: row.width,
        height: row.height,
        duration: row.duration,
        createdAt: iso(row.created_at),
      })),
    };
    const dataText = `${JSON.stringify(data, null, 2)}\n`;
    await writeFile(path.join(outputRoot, "data.json"), dataText, "utf8");

    const manifest = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      privacy: {
        included: ["cms_documents", "cms_versions", "media_items", "media_objects"],
        excluded: ["admin_users", "admin_sessions", "audit_logs", "contact_submissions", "rate_limit_counters"],
      },
      data: { file: "data.json", sha256: sha256(dataText), size: Buffer.byteLength(dataText) },
      objects,
      counts: { documents: data.documents.length, versions: data.versions.length, media: data.media.length, objects: objects.length },
    };
    await writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Bundle privado creado en ${outputRoot}`);
    console.log(`Incluye ${manifest.counts.documents} documentos, ${manifest.counts.versions} versiones, ${manifest.counts.media} medios y ${manifest.counts.objects} objetos.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
