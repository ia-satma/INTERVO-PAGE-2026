CREATE TYPE "public"."admin_role" AS ENUM('owner', 'admin', 'editor');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'in_progress', 'closed');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"csrf_hash" text NOT NULL,
	"mfa_verified" boolean DEFAULT false NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"mfa_secret" text,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"group" text NOT NULL,
	"description" text,
	"draft" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" uuid,
	"published_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"locale" text DEFAULT 'es' NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"name" text NOT NULL,
	"kind" "media_kind" NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"alt_es" text DEFAULT '' NOT NULL,
	"alt_en" text DEFAULT '' NOT NULL,
	"poster_url" text,
	"width" integer,
	"height" integer,
	"duration" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_documents" ADD CONSTRAINT "cms_documents_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_documents" ADD CONSTRAINT "cms_documents_published_by_admin_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_versions" ADD CONSTRAINT "cms_versions_document_id_cms_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."cms_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_versions" ADD CONSTRAINT "cms_versions_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_idx" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_sessions_expiry_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_documents_key_idx" ON "cms_documents" USING btree ("key");--> statement-breakpoint
CREATE INDEX "cms_documents_group_idx" ON "cms_documents" USING btree ("group");--> statement-breakpoint
CREATE INDEX "cms_versions_document_idx" ON "cms_versions" USING btree ("document_id","version");--> statement-breakpoint
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_items_storage_idx" ON "media_items" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "media_items_kind_idx" ON "media_items" USING btree ("kind");