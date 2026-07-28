import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { CMS_DOCUMENTS } from "../src/lib/cms/defaults";
import * as schema from "../src/lib/db/schema";
import { adminUsers, cmsDocuments, mediaItems } from "../src/lib/db/schema";

async function walk(directory: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const relative = path.posix.join(prefix, entry.name);
        return entry.isDirectory() ? walk(path.join(directory, entry.name), relative) : [relative];
      }),
    )
  ).flat();
}

function mediaInfo(relativePath: string) {
  const extension = path.extname(relativePath).toLowerCase();
  const video = [".mp4", ".webm", ".mov"].includes(extension);
  const mime: Record<string, string> = {
    ".avif": "image/avif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return mime[extension] ? { kind: video ? ("video" as const) : ("image" as const), mime: mime[extension] } : null;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL es obligatoria para ejecutar el seed.");

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    for (const definition of CMS_DOCUMENTS) {
      await db
        .insert(cmsDocuments)
        .values({
          key: definition.key,
          label: definition.label,
          group: definition.group,
          description: definition.description,
          draft: definition.defaults,
          published: definition.defaults,
        })
        .onConflictDoNothing({ target: cmsDocuments.key });
    }

    const publicRoot = path.join(process.cwd(), "public");
    const historicalMedia = (await walk(publicRoot)).filter((file) => !path.basename(file).startsWith("._"));
    for (const relativePath of historicalMedia) {
      const info = mediaInfo(relativePath);
      if (!info) continue;
      const details = await stat(path.join(publicRoot, relativePath));
      await db
        .insert(mediaItems)
        .values({
          storageKey: `public:${relativePath}`,
          name: path.basename(relativePath),
          kind: info.kind,
          mime: info.mime,
          size: details.size,
          url: `/${relativePath}`,
        })
        .onConflictDoNothing({ target: mediaItems.storageKey });
    }

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Administrador Intervo";

    if (email && password) {
      if (password.length < 16) {
        throw new Error("ADMIN_BOOTSTRAP_PASSWORD debe tener al menos 16 caracteres.");
      }

      const [existing] = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

      if (!existing) {
        await db.insert(adminUsers).values({
          email,
          name,
          role: "owner",
          passwordHash: await bcrypt.hash(password, 12),
        });
        console.log(`Owner creado: ${email}`);
      } else {
        console.log(`Owner ya existe: ${email}`);
      }
    } else {
      console.log("Contenido inicial creado. No se creó owner porque faltan ADMIN_BOOTSTRAP_EMAIL/PASSWORD.");
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
