import { randomBytes } from "node:crypto";
import { Client } from "@replit/object-storage";

function storageClient() {
  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID?.trim();
  return new Client(bucketId ? { bucketId } : undefined);
}

async function main() {
  if (!process.env.REPL_ID && !process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID) {
    throw new Error("Ejecuta esta prueba dentro de un Replit App con un bucket asociado.");
  }

  const client = storageClient();
  const key = `healthchecks/intervo-${Date.now()}-${randomBytes(5).toString("hex")}.txt`;
  const expected = Buffer.from(`intervo-storage-check:${randomBytes(16).toString("hex")}`);

  try {
    const upload = await client.uploadFromBytes(key, expected, { compress: false });
    if (!upload.ok) throw new Error(`Falló la subida: ${upload.error.message}`);

    const download = await client.downloadAsBytes(key, { decompress: false });
    if (!download.ok) throw new Error(`Falló la lectura: ${download.error.message}`);
    const actual = Buffer.from(download.value[0]);
    if (!actual.equals(expected)) throw new Error("El contenido leído no coincide con el archivo subido.");

    console.log("App Storage correcto: subir → leer → comparar.");
  } finally {
    const deletion = await client.delete(key, { ignoreNotFound: true });
    if (!deletion.ok) throw new Error(`La prueba terminó, pero no pudo eliminar el objeto temporal: ${deletion.error.message}`);
  }

  console.log("Objeto temporal eliminado correctamente.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
