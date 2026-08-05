import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "@replit/object-storage";
import postgres from "postgres";
import { z } from "zod";

const timestamp = z.string().datetime();
const nullableTimestamp = timestamp.nullable();
const jsonRecord = z.record(z.string(), z.unknown());
const dataSchema = z.object({
  schemaVersion: z.literal(1),
  documents: z.array(z.object({
    key: z.string().min(1), label: z.string().min(1), group: z.string().min(1), description: z.string().nullable(),
    draft: jsonRecord, published: jsonRecord, status: z.enum(["draft", "published", "archived"]),
    version: z.number().int().positive(), createdAt: timestamp, updatedAt: timestamp, publishedAt: nullableTimestamp,
  })),
  versions: z.array(z.object({ documentKey: z.string().min(1), version: z.number().int().positive(), snapshot: jsonRecord, createdAt: timestamp })),
  media: z.array(z.object({
    storageKey: z.string().min(1), name: z.string().min(1), kind: z.enum(["image", "video"]), mime: z.string().min(1),
    size: z.number().int().nonnegative(), url: z.string().min(1), altEs: z.string(), altEn: z.string(), posterUrl: z.string().nullable(),
    width: z.number().int().nullable(), height: z.number().int().nullable(), duration: z.number().int().nullable(), createdAt: timestamp,
  })),
}).strict();
const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  createdAt: timestamp,
  privacy: z.object({
    included: z.array(z.string()),
    excluded: z.array(z.string()),
  }),
  data: z.object({ file: z.literal("data.json"), sha256: z.string().regex(/^[a-f0-9]{64}$/), size: z.number().int().nonnegative() }),
  objects: z.array(z.object({ storageKey: z.string().min(1), file: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/), size: z.number().int().nonnegative() })),
  counts: z.object({
    documents: z.number().int().nonnegative(),
    versions: z.number().int().nonnegative(),
    media: z.number().int().nonnegative(),
    objects: z.number().int().nonnegative(),
  }),
}).strict();

function parseArgs() {
  const args = process.argv.slice(2);
  let databaseEnv = "DATABASE_URL";
  let bundle = "";
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--database-env") databaseEnv = args[++index] ?? "";
    else if (arg.startsWith("--database-env=")) databaseEnv = arg.slice("--database-env=".length);
    else if (!arg.startsWith("-") && !bundle) bundle = arg;
    else throw new Error(`Argumento desconocido: ${arg}`);
  }
  if (!/^[A-Z][A-Z0-9_]*$/.test(databaseEnv)) throw new Error("--database-env debe ser el nombre de una variable de entorno.");
  if (!bundle) throw new Error("Uso: npm run handoff:import -- .handoff/<bundle> [--database-env HANDOFF_TARGET_DATABASE_URL]");
  return { databaseEnv, bundle: path.resolve(bundle) };
}

function sha256(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

function asJson(value: Record<string, unknown>): postgres.JSONValue {
  return value as postgres.JSONValue;
}

function safeBundleFile(root: string, relative: string) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes("..")) throw new Error(`Ruta insegura en bundle: ${relative}`);
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Ruta fuera del bundle: ${relative}`);
  return resolved;
}

function storageClient() {
  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID?.trim();
  return new Client(bucketId ? { bucketId } : undefined);
}

function isSafeUploadedStorageKey(value: string) {
  return /^media\/[A-Za-z0-9._/-]+$/.test(value) && !value.split("/").includes("..");
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`El bundle contiene ${label} duplicados.`);
}

async function main() {
  const options = parseArgs();
  const databaseUrl = process.env[options.databaseEnv];
  if (!databaseUrl) throw new Error(`Falta la variable ${options.databaseEnv}.`);

  const manifestText = await readFile(path.join(options.bundle, "manifest.json"), "utf8");
  const manifest = manifestSchema.parse(JSON.parse(manifestText));
  const dataPath = safeBundleFile(options.bundle, manifest.data.file);
  const dataText = await readFile(dataPath, "utf8");
  if (Buffer.byteLength(dataText) !== manifest.data.size || sha256(dataText) !== manifest.data.sha256) {
    throw new Error("data.json no coincide con el manifiesto; importación cancelada.");
  }
  const data = dataSchema.parse(JSON.parse(dataText));

  if (
    manifest.counts.documents !== data.documents.length
    || manifest.counts.versions !== data.versions.length
    || manifest.counts.media !== data.media.length
    || manifest.counts.objects !== manifest.objects.length
  ) {
    throw new Error("Los conteos del manifiesto no coinciden con el contenido del bundle.");
  }

  const requiredExclusions = ["admin_users", "admin_sessions", "audit_logs", "contact_submissions", "rate_limit_counters"];
  if (requiredExclusions.some((table) => !manifest.privacy.excluded.includes(table))) {
    throw new Error("El manifiesto no declara todas las exclusiones de privacidad obligatorias.");
  }

  assertUnique(data.documents.map((item) => item.key), "documentos");
  assertUnique(data.media.map((item) => item.storageKey), "medios");
  assertUnique(manifest.objects.map((item) => item.storageKey), "objetos");
  const documentKeys = new Set(data.documents.map((item) => item.key));
  for (const version of data.versions) {
    if (!documentKeys.has(version.documentKey)) {
      throw new Error(`La versión ${version.documentKey}@${version.version} no tiene documento asociado.`);
    }
  }

  const uploadedMediaKeys = new Set(
    data.media.filter((item) => item.storageKey.startsWith("media/")).map((item) => item.storageKey),
  );
  const objectKeys = new Set(manifest.objects.map((item) => item.storageKey));
  for (const media of data.media) {
    if (!media.storageKey.startsWith("media/") && !media.storageKey.startsWith("public:")) {
      throw new Error(`storageKey de medio inválido: ${media.storageKey}`);
    }
    if (media.storageKey.startsWith("media/") && !objectKeys.has(media.storageKey)) {
      throw new Error(`Falta el binario de ${media.storageKey}.`);
    }
    if (media.storageKey.startsWith("media/") && !isSafeUploadedStorageKey(media.storageKey)) {
      throw new Error(`storageKey de upload inseguro: ${media.storageKey}`);
    }
  }
  for (const object of manifest.objects) {
    if (!isSafeUploadedStorageKey(object.storageKey)) {
      throw new Error(`storageKey de objeto inseguro: ${object.storageKey}`);
    }
    if (!uploadedMediaKeys.has(object.storageKey)) {
      throw new Error(`El objeto ${object.storageKey} no tiene metadatos de medio asociados.`);
    }
  }

  const objectBytes = new Map<string, Buffer>();
  for (const object of manifest.objects) {
    const bytes = await readFile(safeBundleFile(options.bundle, object.file));
    if (bytes.length !== object.size || sha256(bytes) !== object.sha256) {
      throw new Error(`El objeto ${object.storageKey} no coincide con el manifiesto.`);
    }
    objectBytes.set(object.storageKey, bytes);
  }

  const client = storageClient();
  for (const object of manifest.objects) {
    const result = await client.uploadFromBytes(object.storageKey, objectBytes.get(object.storageKey)!, { compress: false });
    if (!result.ok) throw new Error(`App Storage rechazó ${object.storageKey}: ${result.error.message}`);
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    await sql.begin(async (tx) => {
      for (const document of data.documents) {
        const [target] = await tx<{ id: string }[]>`
          insert into cms_documents (
            key, label, "group", description, draft, published, status, version,
            created_at, updated_at, published_at, updated_by, published_by
          ) values (
            ${document.key}, ${document.label}, ${document.group}, ${document.description},
            ${tx.json(asJson(document.draft))}, ${tx.json(asJson(document.published))}, ${document.status}, ${document.version},
            ${new Date(document.createdAt)}, ${new Date(document.updatedAt)}, ${document.publishedAt ? new Date(document.publishedAt) : null}, null, null
          )
          on conflict (key) do update set
            label = excluded.label,
            "group" = excluded."group",
            description = excluded.description,
            draft = excluded.draft,
            published = excluded.published,
            status = excluded.status,
            version = excluded.version,
            updated_at = excluded.updated_at,
            published_at = excluded.published_at,
            updated_by = null,
            published_by = null
          returning id
        `;
        if (!target) throw new Error(`No se pudo importar el documento ${document.key}.`);
        await tx`delete from cms_versions where document_id = ${target.id}`;
        for (const version of data.versions.filter((item) => item.documentKey === document.key)) {
          await tx`
            insert into cms_versions (document_id, version, snapshot, created_by, created_at)
            values (${target.id}, ${version.version}, ${tx.json(asJson(version.snapshot))}, null, ${new Date(version.createdAt)})
          `;
        }
      }

      for (const media of data.media) {
        await tx`
          insert into media_items (
            storage_key, name, kind, mime, size, url, alt_es, alt_en, poster_url,
            width, height, duration, created_by, created_at, archived_at
          ) values (
            ${media.storageKey}, ${media.name}, ${media.kind}, ${media.mime}, ${media.size}, ${media.url},
            ${media.altEs}, ${media.altEn}, ${media.posterUrl}, ${media.width}, ${media.height}, ${media.duration},
            null, ${new Date(media.createdAt)}, null
          )
          on conflict (storage_key) do update set
            name = excluded.name,
            kind = excluded.kind,
            mime = excluded.mime,
            size = excluded.size,
            url = excluded.url,
            alt_es = excluded.alt_es,
            alt_en = excluded.alt_en,
            poster_url = excluded.poster_url,
            width = excluded.width,
            height = excluded.height,
            duration = excluded.duration,
            archived_at = null
        `;
      }
    });
  } finally {
    await sql.end();
  }

  console.log(`Importación idempotente completada: ${data.documents.length} documentos, ${data.versions.length} versiones, ${data.media.length} medios y ${manifest.objects.length} objetos.`);
  console.log("No se importaron usuarios, sesiones, auditoría, formularios ni rate limits.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
