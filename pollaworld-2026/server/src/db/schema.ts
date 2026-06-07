import { pgTable, uuid, text, varchar, integer, boolean, timestamp, uniqueIndex, jsonb, index, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["participant", "admin"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);
export const phaseEnum = pgEnum("phase", ["groups", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "final_3rd", "final"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  password_hash: text("password_hash").notNull(),
  player_slug: text("player_slug"),
  avatar_url: text("avatar_url"),
  role: roleEnum("role").default("participant").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  phase: phaseEnum("phase").notNull(),
  group_name: text("group_name"),
  home_team: text("home_team").notNull(),
  away_team: text("away_team").notNull(),
  home_flag: text("home_flag").notNull(),
  away_flag: text("away_flag").notNull(),
  match_date: timestamp("match_date", { withTimezone: true }).notNull(),
  home_score_real: integer("home_score_real"),
  away_score_real: integer("away_score_real"),
  incidents: jsonb("incidents").default([]).notNull(),
  is_locked: boolean("is_locked").default(false).notNull(),
  match_order: integer("match_order").notNull(),
}, (table) => ({
  matchDateIdx: index("idx_matches_date").on(table.match_date),
}));

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ticket_number: integer("ticket_number").notNull(),
  payment_status: paymentStatusEnum("payment_status").default("pending").notNull(),
  payment_proof_url: text("payment_proof_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_entries_user").on(table.user_id),
}));

export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    entry_id: uuid("entry_id").references(() => entries.id, { onDelete: "cascade" }).notNull(),
    match_id: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
    home_score_pred: integer("home_score_pred").notNull(),
    away_score_pred: integer("away_score_pred").notNull(),
    points_earned: integer("points_earned").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueEntryMatch: uniqueIndex("unique_entry_match").on(table.entry_id, table.match_id),
    entryIdIdx: index("idx_predictions_entry").on(table.entry_id),
    matchIdIdx: index("idx_predictions_match").on(table.match_id),
  })
);

export const poolConfig = pgTable("pool_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  entry_fee: integer("entry_fee").default(20).notNull(),
  prize_1st_pct: integer("prize_1st_pct").default(70).notNull(),
  prize_2nd_pct: integer("prize_2nd_pct").default(20).notNull(),
  prize_3rd_pct: integer("prize_3rd_pct").default(10).notNull(),
  tournament_started: boolean("tournament_started").default(false).notNull(),
  yape_qr_url: text("yape_qr_url"),
  yape_phone: text("yape_phone"),
  whatsapp_group_link: text("whatsapp_group_link"),
  logo_url: text("logo_url"),
  favicon_url: text("favicon_url"),
  player_custom_names: jsonb("player_custom_names"),
});
