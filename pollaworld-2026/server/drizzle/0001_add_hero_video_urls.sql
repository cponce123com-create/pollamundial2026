--> statement-breakpoint
ALTER TABLE "pool_config" ADD COLUMN "hero_video_urls" jsonb DEFAULT '[]'::jsonb NOT NULL;
