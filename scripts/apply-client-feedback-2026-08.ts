import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  applyClientFeedbackToDocument,
  CLIENT_FEEDBACK_DOCUMENT_KEYS,
  CLIENT_FEEDBACK_RESOURCE_ID,
} from "../src/lib/cms/client-feedback";
import * as schema from "../src/lib/db/schema";
import { auditLogs, cmsDocuments, cmsVersions } from "../src/lib/db/schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL es obligatoria para preparar los comentarios del cliente.");
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    const [alreadyApplied] = await db.select({ id: auditLogs.id }).from(auditLogs).where(eq(auditLogs.resourceId, CLIENT_FEEDBACK_RESOURCE_ID)).limit(1);
    if (alreadyApplied) {
      console.log("Los comentarios del cliente ya estaban preparados; no se duplicaron versiones ni auditoría.");
      return;
    }

    await db.transaction(async (tx) => {
      const updatedKeys: string[] = [];
      for (const key of CLIENT_FEEDBACK_DOCUMENT_KEYS) {
        const [document] = await tx.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
        if (!document) throw new Error(`Falta el documento CMS ${key}. Ejecuta npm run db:seed primero.`);
        const nextDraft = applyClientFeedbackToDocument(key, document.draft);
        if (JSON.stringify(nextDraft) === JSON.stringify(document.draft)) continue;

        await tx.insert(cmsVersions).values({
          documentId: document.id,
          version: document.version,
          snapshot: document.draft,
        });
        await tx.update(cmsDocuments).set({
          draft: nextDraft,
          status: "draft",
          updatedAt: new Date(),
        }).where(eq(cmsDocuments.id, document.id));
        updatedKeys.push(key);
      }

      await tx.insert(auditLogs).values({
        action: "content.client_feedback_applied",
        resource: "cms",
        resourceId: CLIENT_FEEDBACK_RESOURCE_ID,
        metadata: {
          documents: updatedKeys,
          published: false,
          source: "Comentarios Web Page.docx",
        },
      });
    });
    console.log("Comentarios preparados como borrador. Revisa el antes → después en /admin antes de publicar.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
