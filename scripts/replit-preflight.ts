import { Client } from "@replit/object-storage";
import postgres from "postgres";

const REQUIRED_NODE = [22, 12, 0] as const;

function versionAtLeast(current: string, required: readonly number[]) {
  const actual = current.split(".").map((part) => Number.parseInt(part, 10));
  for (let index = 0; index < required.length; index += 1) {
    const currentPart = actual[index] ?? 0;
    const requiredPart = required[index] ?? 0;
    if (currentPart > requiredPart) return true;
    if (currentPart < requiredPart) return false;
  }
  return true;
}

function storageClient() {
  const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID?.trim();
  return new Client(bucketId ? { bucketId } : undefined);
}

async function main() {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!versionAtLeast(process.versions.node, REQUIRED_NODE)) {
    failures.push(`Node ${REQUIRED_NODE.join(".")} o superior es obligatorio; versión actual: ${process.versions.node}.`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) failures.push("DATABASE_URL no existe. Activa Replit Database para este entorno.");

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    failures.push("SESSION_SECRET debe existir y contener al menos 32 caracteres.");
  }

  let ownerExists = false;
  if (databaseUrl) {
    const sql = postgres(databaseUrl, { max: 1, prepare: false });
    try {
      await sql`select 1`;
      const [table] = await sql<{ exists: boolean }[]>`
        select to_regclass('public.admin_users') is not null as exists
      `;
      if (table?.exists) {
        const [owners] = await sql<{ count: string }[]>`
          select count(*)::text as count
          from admin_users
          where role = 'owner' and is_active = true
        `;
        ownerExists = Number(owners?.count ?? 0) > 0;
      }
    } catch {
      failures.push("DATABASE_URL existe, pero PostgreSQL no respondió correctamente.");
    } finally {
      await sql.end();
    }
  }

  if (!ownerExists) {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!email || !email.includes("@")) failures.push("Falta ADMIN_BOOTSTRAP_EMAIL para crear el primer owner.");
    if (!password || password.length < 16) failures.push("ADMIN_BOOTSTRAP_PASSWORD debe contener al menos 16 caracteres.");
  }

  if (!process.env.REPL_ID && !process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID) {
    failures.push("App Storage no está disponible. Crea o asocia un bucket a este Replit App.");
  } else {
    try {
      const result = await storageClient().list({ maxResults: 1 });
      if (!result.ok) failures.push(`App Storage rechazó el acceso: ${result.error.message}`);
    } catch {
      failures.push("No fue posible autenticar el SDK con App Storage.");
    }
  }

  if (!process.env.CONTACT_NOTIFICATION_EMAIL) warnings.push("CONTACT_NOTIFICATION_EMAIL no está configurado.");
  if (!process.env.NEXT_PUBLIC_SITE_URL) warnings.push("NEXT_PUBLIC_SITE_URL se detectará automáticamente; fíjalo antes del corte final.");

  warnings.forEach((warning) => console.warn(`AVISO: ${warning}`));
  if (failures.length) {
    failures.forEach((failure) => console.error(`ERROR: ${failure}`));
    throw new Error(`Preflight incompleto: ${failures.length} requisito(s) pendiente(s).`);
  }

  console.log(`Preflight correcto: Node ${process.versions.node}, Database conectada, App Storage accesible y owner ${ownerExists ? "existente" : "listo para bootstrap"}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
