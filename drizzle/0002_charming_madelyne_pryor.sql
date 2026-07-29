DELETE FROM "admin_sessions";--> statement-breakpoint
ALTER TABLE "admin_sessions" DROP COLUMN "mfa_verified";--> statement-breakpoint
ALTER TABLE "admin_users" DROP COLUMN "mfa_secret";--> statement-breakpoint
ALTER TABLE "admin_users" DROP COLUMN "mfa_enabled";
