import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("🗃️  Creating entries table...");
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ticket_number INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_proof_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log("✅ entries table created.");

  console.log("📦 Migrating existing users to entries...");
  // For every existing user, create an entry with ticket_number=1,
  // copying their payment_status and payment_proof_url
  await sql`
    INSERT INTO entries (user_id, ticket_number, payment_status, payment_proof_url)
    SELECT id, 1, payment_status, payment_proof_url
    FROM users
    ON CONFLICT DO NOTHING;
  `;
  console.log("✅ Existing users migrated to entries.");

  console.log("➕ Adding entry_id column to predictions...");
  // Add entry_id column if it doesn't exist
  await sql`
    ALTER TABLE predictions ADD COLUMN IF NOT EXISTS entry_id UUID REFERENCES entries(id) ON DELETE CASCADE;
  `;
  console.log("✅ entry_id column added.");

  console.log("🔗 Linking predictions to entries...");
  // For each prediction, set entry_id to the user's entry (ticket_number=1)
  await sql`
    UPDATE predictions p
    SET entry_id = e.id
    FROM entries e
    WHERE e.user_id = p.user_id AND e.ticket_number = 1;
  `;
  console.log("✅ Predictions linked to entries.");

  console.log("🗑️  Dropping old unique_user_match index...");
  await sql`
    DROP INDEX IF EXISTS unique_user_match;
  `;
  console.log("✅ Old index dropped.");

  console.log("🔐 Creating new unique_entry_match index...");
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS unique_entry_match ON predictions (entry_id, match_id);
  `;
  console.log("✅ New index created.");

  console.log("🎉 Migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
