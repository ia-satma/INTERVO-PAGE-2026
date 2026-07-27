import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cmsDocuments, cmsVersions } from "@/lib/db/schema";
import es from "@/i18n/dictionaries/es";
import en from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { CMS_DOCUMENTS, DEFAULT_SITE_CONFIG, getDocumentDefinition } from "./defaults";
import type { SiteConfig } from "./types";
import { deepMerge } from "./merge";

type RecordValue = Record<string, unknown>;

export async function ensureCmsDocuments() {
  const db = getDb();
  if (!db) return;
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
}

export async function getCmsDocument(key: string, mode: "draft" | "published" = "published") {
  const definition = getDocumentDefinition(key);
  const db = getDb();
  if (!db) {
    if (!definition) return null;
    return {
      id: `default:${key}`,
      key,
      label: definition.label,
      group: definition.group,
      description: definition.description,
      status: "published" as const,
      version: 1,
      draft: definition.defaults,
      published: definition.defaults,
      data: definition.defaults,
      updatedAt: null,
      publishedAt: null,
    };
  }

  const [row] = await db.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
  if (row) {
    return {
      ...row,
      data: definition ? deepMerge(definition.defaults, row[mode]) : row[mode],
    };
  }
  if (!definition) return null;
  if (!row) {
    await ensureCmsDocuments();
    return getCmsDocument(key, mode);
  }
  return null;
}

export async function listCmsDocuments() {
  const db = getDb();
  if (!db) {
    return CMS_DOCUMENTS.map((definition) => ({
      id: `default:${definition.key}`,
      key: definition.key,
      label: definition.label,
      group: definition.group,
      description: definition.description,
      status: "published" as const,
      version: 1,
      updatedAt: null,
      publishedAt: null,
    }));
  }
  await ensureCmsDocuments();
  return db
    .select({
      id: cmsDocuments.id,
      key: cmsDocuments.key,
      label: cmsDocuments.label,
      group: cmsDocuments.group,
      description: cmsDocuments.description,
      status: cmsDocuments.status,
      version: cmsDocuments.version,
      updatedAt: cmsDocuments.updatedAt,
      publishedAt: cmsDocuments.publishedAt,
    })
    .from(cmsDocuments)
    .orderBy(cmsDocuments.group, cmsDocuments.label);
}

export async function saveDocumentDraft(key: string, data: RecordValue, userId: string) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL no está configurada.");
  const definition = getDocumentDefinition(key);
  const [existing] = await db.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
  if (!definition && !existing) throw new Error("Documento desconocido.");

  const [row] = await db
    .insert(cmsDocuments)
    .values({
      key,
      label: definition?.label ?? existing!.label,
      group: definition?.group ?? existing!.group,
      description: definition?.description ?? existing!.description,
      draft: data,
      published: definition?.defaults ?? existing!.published,
      status: "draft",
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: cmsDocuments.key,
      set: { draft: data, status: "draft", updatedBy: userId, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function publishDocument(key: string, userId: string) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL no está configurada.");
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
    if (!current) throw new Error("Documento no encontrado.");
    const nextVersion = current.version + 1;
    await tx.insert(cmsVersions).values({
      documentId: current.id,
      version: current.version,
      snapshot: current.published,
      createdBy: userId,
    });
    const [updated] = await tx
      .update(cmsDocuments)
      .set({
        published: current.draft,
        status: "published",
        version: nextVersion,
        publishedBy: userId,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cmsDocuments.id, current.id))
      .returning();
    return updated;
  });
}

export async function listDocumentVersions(key: string) {
  const db = getDb();
  if (!db) return [];
  const [document] = await db.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
  if (!document) return [];
  return db
    .select()
    .from(cmsVersions)
    .where(eq(cmsVersions.documentId, document.id))
    .orderBy(desc(cmsVersions.version))
    .limit(30);
}

export async function restoreDocumentVersion(key: string, versionId: string, userId: string) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL no está configurada.");
  const [document] = await db.select().from(cmsDocuments).where(eq(cmsDocuments.key, key)).limit(1);
  if (!document) throw new Error("Documento no encontrado.");
  const [version] = await db
    .select()
    .from(cmsVersions)
    .where(and(eq(cmsVersions.id, versionId), eq(cmsVersions.documentId, document.id)))
    .limit(1);
  if (!version) throw new Error("Versión no encontrada.");
  return saveDocumentDraft(key, version.snapshot, userId);
}

export async function getPublishedDictionary(locale: Locale): Promise<Dictionary> {
  let dictionary = structuredClone(locale === "es" ? es : en) as Dictionary;
  const db = getDb();
  const publishedByKey = new Map<string, RecordValue>();

  if (db) {
    const rows = await db
      .select({
        key: cmsDocuments.key,
        published: cmsDocuments.published,
      })
      .from(cmsDocuments);

    for (const row of rows) {
      publishedByKey.set(row.key, row.published);
    }
  }

  for (const definition of CMS_DOCUMENTS) {
    if (definition.key === "site-config") continue;
    const published = publishedByKey.get(definition.key) ?? definition.defaults;
    const localized = published[locale] as RecordValue | undefined;
    if (!localized) continue;
    if (definition.dictionaryPath) {
      dictionary = {
        ...dictionary,
        [definition.dictionaryPath]: deepMerge(dictionary[definition.dictionaryPath], localized),
      };
    } else {
      dictionary = deepMerge(dictionary, localized);
    }
  }
  return dictionary;
}

export async function getPublishedSiteConfig(): Promise<SiteConfig> {
  const db = getDb();
  if (!db) return DEFAULT_SITE_CONFIG;
  const [document] = await db
    .select({ published: cmsDocuments.published })
    .from(cmsDocuments)
    .where(eq(cmsDocuments.key, "site-config"))
    .limit(1);
  return deepMerge(DEFAULT_SITE_CONFIG, document?.published ?? {});
}
