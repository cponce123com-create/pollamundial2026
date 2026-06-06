/**
 * Script: generate-knockout.ts
 *
 * Genera automáticamente los equipos clasificados a la fase eliminatoria
 * basado en los resultados reales de la fase de grupos.
 *
 * Uso: npx tsx src/scripts/generate-knockout.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { db } from "../db";
import { matches } from "../db/schema";
import { eq, and, asc, sql, inArray } from "drizzle-orm";

interface GroupStanding {
  team: string;
  iso2: string;
  flag: string;
  pts: number;
  gd: number;
  gf: number;
}

const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const KNOCKOUT_BRACKET: { matchOrder: number; home: { group: string; pos: number }; away: { group: string; pos: number } }[] = [
  { matchOrder: 73, home: { group: "A", pos: 1 }, away: { group: "C", pos: 3 } },
  { matchOrder: 74, home: { group: "B", pos: 1 }, away: { group: "D", pos: 3 } },
  { matchOrder: 75, home: { group: "C", pos: 1 }, away: { group: "A", pos: 3 } },
  { matchOrder: 76, home: { group: "D", pos: 1 }, away: { group: "B", pos: 3 } },
  { matchOrder: 77, home: { group: "E", pos: 1 }, away: { group: "G", pos: 3 } },
  { matchOrder: 78, home: { group: "F", pos: 1 }, away: { group: "H", pos: 3 } },
  { matchOrder: 79, home: { group: "G", pos: 1 }, away: { group: "E", pos: 3 } },
  { matchOrder: 80, home: { group: "H", pos: 1 }, away: { group: "F", pos: 3 } },
  { matchOrder: 81, home: { group: "I", pos: 1 }, away: { group: "K", pos: 3 } },
  { matchOrder: 82, home: { group: "J", pos: 1 }, away: { group: "L", pos: 3 } },
  { matchOrder: 83, home: { group: "K", pos: 1 }, away: { group: "I", pos: 3 } },
  { matchOrder: 84, home: { group: "L", pos: 1 }, away: { group: "J", pos: 3 } },
  { matchOrder: 85, home: { group: "A", pos: 2 }, away: { group: "B", pos: 2 } },
  { matchOrder: 86, home: { group: "C", pos: 2 }, away: { group: "D", pos: 2 } },
  { matchOrder: 87, home: { group: "E", pos: 2 }, away: { group: "F", pos: 2 } },
  { matchOrder: 88, home: { group: "G", pos: 2 }, away: { group: "H", pos: 2 } },
];

async function getGroupStandings(groupName: string): Promise<GroupStanding[]> {
  const teamSet = new Set<string>();
  const uniqueTeams = await db
    .select({ team: matches.home_team })
    .from(matches)
    .where(and(eq(matches.group_name, groupName), eq(matches.phase, "groups")));
  for (const t of uniqueTeams) teamSet.add(t.team);

  const teams = Array.from(teamSet);
  const standings: GroupStanding[] = [];

  for (const team of teams) {
    const teamMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.phase, "groups"),
          eq(matches.group_name, groupName),
          sql`(${matches.home_team} = ${team} OR ${matches.away_team} = ${team})`
        )
      );

    let pts = 0, gf = 0, ga = 0;
    for (const m of teamMatches) {
      if (m.home_score_real === null || m.away_score_real === null) continue;
      if (m.home_team === team) {
        gf += m.home_score_real; ga += m.away_score_real;
        if (m.home_score_real > m.away_score_real) pts += 3;
        else if (m.home_score_real === m.away_score_real) pts += 1;
      } else {
        gf += m.away_score_real; ga += m.home_score_real;
        if (m.away_score_real > m.home_score_real) pts += 3;
        else if (m.away_score_real === m.home_score_real) pts += 1;
      }
    }
    standings.push({ team, iso2: "", flag: "", pts, gd: gf - ga, gf });
  }

  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
  return standings;
}

async function getTeamFlag(teamName: string): Promise<string> {
  const [match] = await db
    .select({ home_flag: matches.home_flag })
    .from(matches)
    .where(eq(matches.home_team, teamName))
    .limit(1);
  return match?.home_flag || "\uD83C\uDFF3\uFE0F";
}

async function generateKnockout(): Promise<void> {
  console.log("Generating knockout stage brackets...\n");

  const allStandings: Record<string, GroupStanding[]> = {};
  for (const group of GROUP_NAMES) {
    allStandings[group] = await getGroupStandings(group);
    console.log(`Group ${group}:`);
    allStandings[group].forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.team} - ${s.pts} pts (GD: ${s.gd > 0 ? "+" : ""}${s.gd}, GF: ${s.gf})`);
    });
  }

  let updated = 0;
  for (const bracket of KNOCKOUT_BRACKET) {
    const homeStandings = allStandings[bracket.home.group];
    const awayStandings = allStandings[bracket.away.group];
    if (!homeStandings || !awayStandings) continue;

    const homeTeam = homeStandings[bracket.home.pos - 1]?.team;
    const awayTeam = awayStandings[bracket.away.pos - 1]?.team;
    if (!homeTeam || !awayTeam) continue;

    const homeFlag = await getTeamFlag(homeTeam);
    const awayFlag = await getTeamFlag(awayTeam);

    await db
      .update(matches)
      .set({ home_team: homeTeam, away_team: awayTeam, home_flag: homeFlag, away_flag: awayFlag })
      .where(and(eq(matches.match_order, bracket.matchOrder), eq(matches.phase, "round_of_32")));

    console.log(`  Match ${bracket.matchOrder}: ${homeTeam} vs ${awayTeam}`);
    updated++;
  }

  console.log(`\nUpdated ${updated} knockout matches.`);
  console.log("\nRemaining rounds (round_of_16+) need manual filling after round_of_32 completes.");
}

generateKnockout()
  .then(() => { console.log("Done!"); process.exit(0); })
  .catch((err) => { console.error("Failed:", err); process.exit(1); });
