CREATE TABLE "rate_limit_counters" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_counters_reset_idx" ON "rate_limit_counters" USING btree ("reset_at");