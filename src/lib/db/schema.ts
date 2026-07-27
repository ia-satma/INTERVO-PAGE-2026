import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", ["owner", "admin", "editor"]);
export const contentStatus = pgEnum("content_status", ["draft", "published", "archived"]);
export const mediaKind = pgEnum("media_kind", ["image", "video"]);
export const submissionStatus = pgEnum("submission_status", ["new", "in_progress", "closed"]);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: adminRole("role").notNull().default("editor"),
    isActive: boolean("is_active").notNull().default(true),
    mfaSecret: text("mfa_secret"),
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_idx").on(table.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    csrfHash: text("csrf_hash").notNull(),
    mfaVerified: boolean("mfa_verified").notNull().default(false),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_idx").on(table.tokenHash),
    index("admin_sessions_user_idx").on(table.userId),
    index("admin_sessions_expiry_idx").on(table.expiresAt),
  ],
);

export const cmsDocuments = pgTable(
  "cms_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    group: text("group").notNull(),
    description: text("description"),
    draft: jsonb("draft").$type<Record<string, unknown>>().notNull().default({}),
    published: jsonb("published").$type<Record<string, unknown>>().notNull().default({}),
    status: contentStatus("status").notNull().default("published"),
    version: integer("version").notNull().default(1),
    updatedBy: uuid("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
    publishedBy: uuid("published_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("cms_documents_key_idx").on(table.key), index("cms_documents_group_idx").on(table.group)],
);

export const cmsVersions = pgTable(
  "cms_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => cmsDocuments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("cms_versions_document_idx").on(table.documentId, table.version)],
);

export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageKey: text("storage_key").notNull(),
    name: text("name").notNull(),
    kind: mediaKind("kind").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    url: text("url").notNull(),
    altEs: text("alt_es").notNull().default(""),
    altEn: text("alt_en").notNull().default(""),
    posterUrl: text("poster_url"),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),
    createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("media_items_storage_idx").on(table.storageKey), index("media_items_kind_idx").on(table.kind)],
);

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    phone: text("phone"),
    subject: text("subject"),
    message: text("message").notNull(),
    locale: text("locale").notNull().default("es"),
    status: submissionStatus("status").notNull().default("new"),
    notes: text("notes"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contact_submissions_status_idx").on(table.status, table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt), index("audit_logs_user_idx").on(table.userId)],
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type CmsDocumentRow = typeof cmsDocuments.$inferSelect;
export type MediaItem = typeof mediaItems.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
