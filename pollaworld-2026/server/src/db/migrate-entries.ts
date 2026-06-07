import { neon } from "@neondatabase/serverless";
import logger from "../lib/logger";

/**
 * Run raw SQL migrations that drizzle-kit push might miss
 * (e.g., adding columns to existing tables where CREATE TABLE IF NOT EXISTS is a no-op)
 */
export async function runStartupMigrations() {
  const sql = neon(process.env.DATABASE_URL!);
  const migrations = [
    `ALTER TABLE pool_config ADD COLUMN IF NOT EXISTS whatsapp_group_link text;`,
    `ALTER TABLE pool_config ADD COLUMN IF NOT EXISTS logo_url text;`,
    `ALTER TABLE pool_config ADD COLUMN IF NOT EXISTS favicon_url text;`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS incidents jsonb DEFAULT '[]'::jsonb;`,
  ];

  for (const query of migrations) {
    try {
      await sql(query);
      logger.info(`[Migration] Ran: ${query.slice(0, 80)}...`);
    } catch (err) {
      logger.error(err, `[Migration] Failed: ${query.slice(0, 80)}...`);
    }
  }
}
