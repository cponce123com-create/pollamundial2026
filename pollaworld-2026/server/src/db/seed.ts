import dotenv from "dotenv";
dotenv.config();

import { db } from "./index";
import { users, matches, poolConfig } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

// ─── 48 FIXTURES — Mundial 2026 Fase de Grupos ──────────────────
// 12 grupos de 4 equipos. Cada grupo: 6 partidos. Total: 72 partidos reales.
// Pero usamos 8 grupos de 4 = 48 partidos (formato clásico expandido).
// Grupos A-H, fechas junio 2026.

interface MatchSeed {
  phase: "groups";
  group_name: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  match_date: Date;
  match_order: number;
  }

  const GROUPS: { name: string; teams: { name: string; flag: string }[] }[] = [
  { name: "A", teams: [{ name: "Canadá", flag: "🇨🇦" }, { name: "México", flag: "🇲🇽" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Croacia", flag: "🇭🇷" }] },
  { name: "B", teams: [{ name: "EEUU", flag: "🇺🇸" }, { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { name: "Senegal", flag: "🇸🇳" }, { name: "Japón", flag: "🇯🇵" }] },
  { name: "C", teams: [{ name: "Brasil", flag: "🇧🇷" }, { name: "Alemania", flag: "🇩🇪" }, { name: "Marruecos", flag: "🇲🇦" }, { name: "Corea Sur", flag: "🇰🇷" }] },
  { name: "D", teams: [{ name: "Francia", flag: "🇫🇷" }, { name: "España", flag: "🇪🇸" }, { name: "Ecuador", flag: "🇪🇨" }, { name: "Arabia S.", flag: "🇸🇦" }] },
  { name: "E", teams: [{ name: "Portugal", flag: "🇵🇹" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Nigeria", flag: "🇳🇬" }, { name: "Australia", flag: "🇦🇺" }] },
  { name: "F", teams: [{ name: "Países Bajos", flag: "🇳🇱" }, { name: "Italia", flag: "🇮🇹" }, { name: "Colombia", flag: "🇨🇴" }, { name: "Egipto", flag: "🇪🇬" }] },
  { name: "G", teams: [{ name: "Bélgica", flag: "🇧🇪" }, { name: "Dinamarca", flag: "🇩🇰" }, { name: "Chile", flag: "🇨🇱" }, { name: "Catar", flag: "🇶🇦" }] },
  { name: "H", teams: [{ name: "Suiza", flag: "🇨🇭" }, { name: "Serbia", flag: "🇷🇸" }, { name: "Perú", flag: "🇵🇪" }, { name: "Irán", flag: "🇮🇷" }] },
];

function generateFixtures(): MatchSeed[] {
  const fixtures: MatchSeed[] = [];
  let order = 1;

  // Each group: 6 matches (round-robin: 1v2, 3v4, 1v3, 2v4, 1v4, 2v3)
  const matchPatterns = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ];

  // Start dates per match day (June 11-26, 2026)
  const matchDays = [
    "2026-06-11", "2026-06-12", "2026-06-13",
    "2026-06-16", "2026-06-17", "2026-06-18",
    "2026-06-22", "2026-06-23", "2026-06-24",
    "2026-06-26",
  ];

  let matchDayIdx = 0;

  for (const group of GROUPS) {
    for (let m = 0; m < matchPatterns.length; m++) {
      const [h, a] = matchPatterns[m];
      const day = matchDays[matchDayIdx % matchDays.length];
      const hour = 13 + (m % 3) * 3; // 13:00, 16:00, 19:00

      fixtures.push({
        phase: "groups",
        group_name: group.name,
        home_team: group.teams[h].name,
        away_team: group.teams[a].name,
        home_flag: group.teams[h].flag,
        away_flag: group.teams[a].flag,
        match_date: new Date(`${day}T${String(hour).padStart(2, "0")}:00:00.000Z`),
        match_order: order++,
      });
      matchDayIdx++;
    }
  }

  return fixtures;
}

async function seed() {
  console.log("Seeding database...");

  // 1. Create admin user
  const existingAdmin = await db.select().from(users).where(eq(users.phone, "999000001")).limit(1);
  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash("admin2026", 10);
    await db.insert(users).values({
      name: "Admin",
      phone: "999000001",
      password_hash: hash,
      emoji_id: "pele",
      role: "admin",
      payment_status: "approved",
    });
    console.log("✓ Admin user created (999000001 / admin2026)");
  } else {
    console.log("→ Admin user already exists");
  }

  // 2. Create pool config
  const existingConfig = await db.select().from(poolConfig).limit(1);
  if (existingConfig.length === 0) {
    await db.insert(poolConfig).values({
      entry_fee: 20,
      prize_1st_pct: 70,
      prize_2nd_pct: 20,
      prize_3rd_pct: 10,
    });
    console.log("✓ Pool config created (S/.20, 70/20/10)");
  } else {
    console.log("→ Pool config already exists");
  }

  // 3. Create matches
  const existingMatches = await db.select().from(matches).limit(1);
  if (existingMatches.length === 0) {
    const fixtures = generateFixtures();
    await db.insert(matches).values(fixtures);
    console.log(`✓ ${fixtures.length} matches created (8 grupos, 48 partidos)`);
  } else {
    console.log(`→ ${existingMatches.length} matches already exist`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
