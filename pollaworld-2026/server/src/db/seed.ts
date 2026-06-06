import dotenv from "dotenv";
dotenv.config();

import { db } from "./index";
import { users, matches, poolConfig } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import logger from "../lib/logger";

// ─── Helper: ISO2 country code → flag emoji ──────────────────────
function isoToEmoji(code: string): string {
  const base = 0x1f1e6;
  const a = code.charCodeAt(0) - 97;
  const b = code.charCodeAt(1) - 97;
  return String.fromCodePoint(base + a, base + b);
}

const SPECIAL_EMOJIS: Record<string, string> = {
  "gb-eng": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "gb-sct": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  eng: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  sco: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

function getFlagEmoji(iso2: string): string {
  return SPECIAL_EMOJIS[iso2] || isoToEmoji(iso2);
}

// ─── 48 TEAMS — Mundial 2026 ─────────────────────────────────────
interface TeamSeed {
  name: string;
  iso2: string;
  fifa_code: string;
  group: string;
}

const TEAMS: TeamSeed[] = [
  // Group A
  { name: "México", iso2: "mx", fifa_code: "MEX", group: "A" },
  { name: "Sudáfrica", iso2: "za", fifa_code: "RSA", group: "A" },
  { name: "Corea del Sur", iso2: "kr", fifa_code: "KOR", group: "A" },
  { name: "República Checa", iso2: "cz", fifa_code: "CZE", group: "A" },
  // Group B
  { name: "Canadá", iso2: "ca", fifa_code: "CAN", group: "B" },
  { name: "Bosnia y Herzegovina", iso2: "ba", fifa_code: "BIH", group: "B" },
  { name: "Catar", iso2: "qa", fifa_code: "QAT", group: "B" },
  { name: "Suiza", iso2: "ch", fifa_code: "SUI", group: "B" },
  // Group C
  { name: "Brasil", iso2: "br", fifa_code: "BRA", group: "C" },
  { name: "Marruecos", iso2: "ma", fifa_code: "MAR", group: "C" },
  { name: "Haití", iso2: "ht", fifa_code: "HAI", group: "C" },
  { name: "Escocia", iso2: "gb-sct", fifa_code: "SCO", group: "C" },
  // Group D
  { name: "Estados Unidos", iso2: "us", fifa_code: "USA", group: "D" },
  { name: "Paraguay", iso2: "py", fifa_code: "PAR", group: "D" },
  { name: "Australia", iso2: "au", fifa_code: "AUS", group: "D" },
  { name: "Turquía", iso2: "tr", fifa_code: "TUR", group: "D" },
  // Group E
  { name: "Alemania", iso2: "de", fifa_code: "GER", group: "E" },
  { name: "Curazao", iso2: "cw", fifa_code: "CUW", group: "E" },
  { name: "Costa de Marfil", iso2: "ci", fifa_code: "CIV", group: "E" },
  { name: "Ecuador", iso2: "ec", fifa_code: "ECU", group: "E" },
  // Group F
  { name: "Países Bajos", iso2: "nl", fifa_code: "NED", group: "F" },
  { name: "Japón", iso2: "jp", fifa_code: "JPN", group: "F" },
  { name: "Suecia", iso2: "se", fifa_code: "SWE", group: "F" },
  { name: "Túnez", iso2: "tn", fifa_code: "TUN", group: "F" },
  // Group G
  { name: "Bélgica", iso2: "be", fifa_code: "BEL", group: "G" },
  { name: "Egipto", iso2: "eg", fifa_code: "EGY", group: "G" },
  { name: "Irán", iso2: "ir", fifa_code: "IRN", group: "G" },
  { name: "Nueva Zelanda", iso2: "nz", fifa_code: "NZL", group: "G" },
  // Group H
  { name: "España", iso2: "es", fifa_code: "ESP", group: "H" },
  { name: "Cabo Verde", iso2: "cv", fifa_code: "CPV", group: "H" },
  { name: "Arabia Saudita", iso2: "sa", fifa_code: "KSA", group: "H" },
  { name: "Uruguay", iso2: "uy", fifa_code: "URU", group: "H" },
  // Group I
  { name: "Francia", iso2: "fr", fifa_code: "FRA", group: "I" },
  { name: "Senegal", iso2: "sn", fifa_code: "SEN", group: "I" },
  { name: "Irak", iso2: "iq", fifa_code: "IRQ", group: "I" },
  { name: "Noruega", iso2: "no", fifa_code: "NOR", group: "I" },
  // Group J
  { name: "Argentina", iso2: "ar", fifa_code: "ARG", group: "J" },
  { name: "Argelia", iso2: "dz", fifa_code: "ALG", group: "J" },
  { name: "Austria", iso2: "at", fifa_code: "AUT", group: "J" },
  { name: "Jordania", iso2: "jo", fifa_code: "JOR", group: "J" },
  // Group K
  { name: "Portugal", iso2: "pt", fifa_code: "POR", group: "K" },
  { name: "RD Congo", iso2: "cd", fifa_code: "COD", group: "K" },
  { name: "Uzbekistán", iso2: "uz", fifa_code: "UZB", group: "K" },
  { name: "Colombia", iso2: "co", fifa_code: "COL", group: "K" },
  // Group L
  { name: "Inglaterra", iso2: "gb-eng", fifa_code: "ENG", group: "L" },
  { name: "Croacia", iso2: "hr", fifa_code: "CRO", group: "L" },
  { name: "Ghana", iso2: "gh", fifa_code: "GHA", group: "L" },
  { name: "Panamá", iso2: "pa", fifa_code: "PAN", group: "L" },
];

// ─── Types ────────────────────────────────────────────────────────
interface GroupTeam {
  index: number;
  name: string;
  iso2: string;
  flag_url: string;
}

interface MatchSeed {
  phase: "groups" | "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "final_3rd" | "final";
  group_name: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  match_date: Date;
  match_order: number;
}

// ─── Build group data from TEAMS ─────────────────────────────────
const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function getGroupTeams(groupName: string): GroupTeam[] {
  return TEAMS.filter((t) => t.group === groupName).map((t, i) => ({
    index: i,
    name: t.name,
    iso2: t.iso2,
    flag_url: `https://flagcdn.com/w80/${t.iso2.replace("gb-", "")}.png`,
  }));
}

// ─── Generate 72 group stage fixtures ────────────────────────────
function generateGroupFixtures(): MatchSeed[] {
  const fixtures: MatchSeed[] = [];
  let order = 1;

  // Round-robin: each group plays 6 matches (indices into group teams)
  const matchPatterns: [number, number][] = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ];

  // 6 matchdays, distributed June 11–18 with rest days
  const matchdayDates = [
    "2026-06-11", "2026-06-12",
    "2026-06-14", "2026-06-15",
    "2026-06-17", "2026-06-18",
  ];

  // 3 time slots, 4 groups each
  const timeSlots = [
    { groups: ["A", "B", "C", "D"], hour: 12 },
    { groups: ["E", "F", "G", "H"], hour: 15 },
    { groups: ["I", "J", "K", "L"], hour: 18 },
  ];

  for (let p = 0; p < matchPatterns.length; p++) {
    const [hIdx, aIdx] = matchPatterns[p];
    const dateStr = matchdayDates[p];

    for (const slot of timeSlots) {
      for (const groupName of slot.groups) {
        const teams = getGroupTeams(groupName);
        const home = teams[hIdx];
        const away = teams[aIdx];

        fixtures.push({
          phase: "groups",
          group_name: groupName,
          home_team: home.name,
          away_team: away.name,
          home_flag: getFlagEmoji(home.iso2),
          away_flag: getFlagEmoji(away.iso2),
          match_date: new Date(`${dateStr}T${String(slot.hour).padStart(2, "0")}:00:00-05:00`),
          match_order: order++,
        });
      }
    }
  }

  return fixtures;
}

// ─── Generate 32 knockout fixtures (TBD teams = "0") ─────────────
function generateKnockoutFixtures(): MatchSeed[] {
  const fixtures: MatchSeed[] = [];
  let order = 73;

  interface PhaseDef {
    phase: "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "final_3rd" | "final";
    dates: string[];
    count: number;
  }

  const phases: PhaseDef[] = [
    { phase: "round_of_32", dates: ["2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02"], count: 16 },
    { phase: "round_of_16", dates: ["2026-07-05", "2026-07-06", "2026-07-07"], count: 8 },
    { phase: "quarterfinals", dates: ["2026-07-10", "2026-07-11"], count: 4 },
    { phase: "semifinals", dates: ["2026-07-14"], count: 2 },
    { phase: "final_3rd", dates: ["2026-07-17"], count: 1 },
    { phase: "final", dates: ["2026-07-19"], count: 1 },
  ];

  for (const phase of phases) {
    const matchesPerDay = Math.ceil(phase.count / phase.dates.length);
    let matchIdx = 0;

    for (const dateStr of phase.dates) {
      const dayMatches = Math.min(matchesPerDay, phase.count - matchIdx);
      for (let m = 0; m < dayMatches; m++) {
        const hour = 13 + (m % 3) * 3; // 13:00, 16:00, 19:00
        fixtures.push({
          phase: phase.phase,
          group_name: "",
          home_team: "0",
          away_team: "0",
          home_flag: "🏳️",
          away_flag: "🏳️",
          match_date: new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00-05:00`),
          match_order: order++,
        });
        matchIdx++;
      }
    }
  }

  return fixtures;
}

// ─── Seed function ────────────────────────────────────────────────
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
      player_slug: "pele",
      role: "admin",
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
    const groupFixtures = generateGroupFixtures();
    const knockoutFixtures = generateKnockoutFixtures();
    const allFixtures = [...groupFixtures, ...knockoutFixtures];
    await db.insert(matches).values(allFixtures);
    console.log(`✓ ${allFixtures.length} matches created (${groupFixtures.length} groups + ${knockoutFixtures.length} knockout)`);
  } else {
    console.log(`→ ${existingMatches.length} matches already exist`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  logger.error(err, "Seed failed:");
  process.exit(1);
});
