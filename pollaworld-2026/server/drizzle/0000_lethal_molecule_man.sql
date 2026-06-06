DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."phase" AS ENUM('groups', 'round_of_32', 'round_of_16', 'quarterfinals', 'semifinals', 'final_3rd', 'final');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('participant', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticket_number" integer NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_proof_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase" "phase" NOT NULL,
	"group_name" text,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"home_flag" text NOT NULL,
	"away_flag" text NOT NULL,
	"match_date" timestamp with time zone NOT NULL,
	"home_score_real" integer,
	"away_score_real" integer,
	"is_locked" boolean DEFAULT false NOT NULL,
	"match_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pool_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_fee" integer DEFAULT 20 NOT NULL,
	"prize_1st_pct" integer DEFAULT 70 NOT NULL,
	"prize_2nd_pct" integer DEFAULT 20 NOT NULL,
	"prize_3rd_pct" integer DEFAULT 10 NOT NULL,
	"tournament_started" boolean DEFAULT false NOT NULL,
	"yape_qr_url" text,
	"yape_phone" text,
	"whatsapp_group_link" text,
	"player_custom_names" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"home_score_pred" integer NOT NULL,
	"away_score_pred" integer NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password_hash" text NOT NULL,
	"player_slug" text,
	"avatar_url" text,
	"role" "role" DEFAULT 'participant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predictions" ADD CONSTRAINT "predictions_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predictions" ADD CONSTRAINT "predictions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entries_user" ON "entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_matches_date" ON "matches" USING btree ("match_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_entry_match" ON "predictions" USING btree ("entry_id","match_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_predictions_entry" ON "predictions" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_predictions_match" ON "predictions" USING btree ("match_id");