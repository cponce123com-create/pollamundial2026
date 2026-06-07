/**
 * Tabla de posiciones por grupo y forma reciente de equipos.
 * Calcula PG/PE/PP/GF/GC/DG/Pts a partir de los resultados reales en DB.
 */

import { db } from "../db";
import { matches } from "../db/schema";
import { eq, and, or, asc, isNotNull, sql } from "drizzle-orm";

export interface GroupStandingTeam {
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStanding {
  groupName: string;
  teams: GroupStandingTeam[];
}

export interface RecentFormEntry {
  result: "W" | "D" | "L";
  opponent: string;
  score: string;
  matchDate: string;
}

export interface TeamRecentForm {
  teamName: string;
  form: RecentFormEntry[];
  formString: string;
}

/**
 * Compute standings for all groups based on finished matches.
 */
export async function computeGroupStandings(): Promise<GroupStanding[]> {
  // Get all group phase matches with scores
  const groupMatches = await db
    .select({
      group_name: matches.group_name,
      home_team: matches.home_team,
      away_team: matches.away_team,
      home_flag: matches.home_flag,
      away_flag: matches.away_flag,
      home_score: matches.home_score_real,
      away_score: matches.away_score_real,
    })
    .from(matches)
    .where(
      and(
        eq(matches.phase, "groups"),
        isNotNull(matches.home_score_real),
        isNotNull(matches.away_score_real)
      )
    )
    .orderBy(asc(matches.group_name));

  // Build a map of groupName -> Map<teamName, stats>
  const groupMap = new Map<string, Map<string, GroupStandingTeam>>();

  for (const m of groupMatches) {
    const gName = m.group_name || "?";
    if (!groupMap.has(gName)) groupMap.set(gName, new Map());

    const teams = groupMap.get(gName)!;
    const homeScore = m.home_score ?? 0;
    const awayScore = m.away_score ?? 0;

    // Initialize teams if not present
    if (!teams.has(m.home_team)) {
      teams.set(m.home_team, {
        name: m.home_team,
        flag: m.home_flag,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      });
    }
    if (!teams.has(m.away_team)) {
      teams.set(m.away_team, {
        name: m.away_team,
        flag: m.away_flag,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      });
    }

    const home = teams.get(m.home_team)!;
    const away = teams.get(m.away_team)!;

    home.played++;
    away.played++;
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won++; home.points += 3;
      away.lost++;
    } else if (homeScore < awayScore) {
      away.won++; away.points += 3;
      home.lost++;
    } else {
      home.drawn++; home.points += 1;
      away.drawn++; away.points += 1;
    }

    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  // Sort each group: points DESC, goalDiff DESC, goalsFor DESC
  for (const [, teams] of groupMap) {
    const sorted = Array.from(teams.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    teams.clear();
    sorted.forEach((t) => teams.set(t.name, t));
  }

  // Return as array
  const standings: GroupStanding[] = [];
  const groupNames = Array.from(groupMap.keys()).sort();
  for (const gName of groupNames) {
    const teams = groupMap.get(gName)!;
    standings.push({
      groupName: gName,
      teams: Array.from(teams.values()),
    });
  }

  return standings;
}

/**
 * Get recent form (last N matches) for a team.
 */
export async function getTeamRecentForm(teamName: string, limit = 5): Promise<TeamRecentForm> {
  const recentMatches = await db
    .select({
      home_team: matches.home_team,
      away_team: matches.away_team,
      home_score: matches.home_score_real,
      away_score: matches.away_score_real,
      match_date: matches.match_date,
    })
    .from(matches)
    .where(
      and(
        or(
          eq(matches.home_team, teamName),
          eq(matches.away_team, teamName)
        ),
        isNotNull(matches.home_score_real),
        isNotNull(matches.away_score_real)
      )
    )
    .orderBy(sql`${matches.match_date} DESC`)
    .limit(limit);

  const form: RecentFormEntry[] = [];
  for (const m of recentMatches) {
    const homeScore = m.home_score ?? 0;
    const awayScore = m.away_score ?? 0;
    const isHome = m.home_team === teamName;
    const opponent = isHome ? m.away_team : m.home_team;
    const score = isHome ? `${homeScore}-${awayScore}` : `${awayScore}-${homeScore}`;

    let result: "W" | "D" | "L";
    if (isHome) {
      result = homeScore > awayScore ? "W" : homeScore < awayScore ? "L" : "D";
    } else {
      result = awayScore > homeScore ? "W" : awayScore < homeScore ? "L" : "D";
    }

    form.push({ result, opponent, score, matchDate: m.match_date.toISOString() });
  }

  const formString = form.map((f) => f.result).join("-");

  return { teamName, form, formString };
}
