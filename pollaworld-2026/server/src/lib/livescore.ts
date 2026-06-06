import { db } from "../db";
import { matches } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { calculatePoints } from "./scoring";
import { predictions } from "../db/schema";
import logger from "./logger";

const API_URL = "https://worldcup26.ir/get/games";
const SYNC_INTERVAL = 60_000; // 60 seconds
const MAX_BACKOFF_MS = 300_000; // 5 min max

// Map English team names from API → Spanish names used in our DB
const TEAM_NAME_MAP: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czech Republic": "República Checa",
  "Canada": "Canadá",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Qatar": "Catar",
  "Switzerland": "Suiza",
  "Brazil": "Brasil",
  "Morocco": "Marruecos",
  "Haiti": "Haití",
  "Scotland": "Escocia",
  "United States": "Estados Unidos",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Turkey": "Turquía",
  "Germany": "Alemania",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Ecuador": "Ecuador",
  "Netherlands": "Países Bajos",
  "Japan": "Japón",
  "Sweden": "Suecia",
  "Tunisia": "Túnez",
  "Belgium": "Bélgica",
  "Egypt": "Egipto",
  "Iran": "Irán",
  "New Zealand": "Nueva Zelanda",
  "Spain": "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  "Uruguay": "Uruguay",
  "France": "Francia",
  "Senegal": "Senegal",
  "Iraq": "Irak",
  "Norway": "Noruega",
  "Argentina": "Argentina",
  "Algeria": "Argelia",
  "Austria": "Austria",
  "Jordan": "Jordania",
  "Portugal": "Portugal",
  "Democratic Republic of the Congo": "RD Congo",
  "Uzbekistan": "Uzbekistán",
  "Colombia": "Colombia",
  "England": "Inglaterra",
  "Croatia": "Croacia",
  "Ghana": "Ghana",
  "Panama": "Panamá",
};

interface ApiGame {
  id: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  finished: string;
  time_elapsed: string;
  local_date: string;
}

interface ApiResponse {
  games: ApiGame[];
}

let fetchAttempts = 0;

async function fetchGames(): Promise<ApiGame[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data: ApiResponse = await res.json() as ApiResponse;
    fetchAttempts = 0; // Reset on success
    return data.games;
  } catch (err) {
    fetchAttempts++;
    const backoffMs = Math.min(1000 * Math.pow(2, fetchAttempts), MAX_BACKOFF_MS);
    logger.warn({ fetchAttempts, backoffMs }, "Live score API fetch failed, will retry with backoff");
    throw err;
  }
}

async function syncScores(): Promise<{ updated: number; live: number }> {
  try {
    const games = await fetchGames();
    let updated = 0;
    let live = 0;

    // Build a map of (home_team, away_team) -> game from API
    const gameMap = new Map<string, ApiGame>();
    for (const game of games) {
      const homeName = TEAM_NAME_MAP[game.home_team_name_en];
      const awayName = TEAM_NAME_MAP[game.away_team_name_en];
      if (!homeName || !awayName) continue;
      gameMap.set(`${homeName}||${awayName}`, game);
    }

    // Get ALL DB matches at once (one query instead of N)
    const allDbMatches = await db
      .select({
        id: matches.id,
        home_team: matches.home_team,
        away_team: matches.away_team,
        home_score_real: matches.home_score_real,
        away_score_real: matches.away_score_real,
        is_locked: matches.is_locked,
      })
      .from(matches);

    // Build lookup by (home_team, away_team)
    const matchLookup = new Map<string, typeof allDbMatches[0]>();
    for (const m of allDbMatches) {
      matchLookup.set(`${m.home_team}||${m.away_team}`, m);
    }

    // Collect finished match IDs for batch prediction update
    const finishedMatchIds: string[] = [];
    const matchesToUpdate: { id: string; homeScore: number; awayScore: number; isFinished: boolean }[] = [];

    for (const [key, game] of gameMap) {
      const dbMatch = matchLookup.get(key);
      if (!dbMatch) continue;

      const homeScore = parseInt(game.home_score, 10);
      const awayScore = parseInt(game.away_score, 10);
      const isFinished = game.finished === "TRUE";

      if (game.time_elapsed !== "notstarted" && !isFinished) live++;

      // Only update if scores changed or match just finished
      const scoresChanged =
        dbMatch.home_score_real !== homeScore ||
        dbMatch.away_score_real !== awayScore;

      // Solo procesar partidos que realmente han comenzado o terminado
      const hasStarted = game.time_elapsed !== "notstarted";
      if (!hasStarted) continue;

      if (scoresChanged || (isFinished && !dbMatch.is_locked)) {
        matchesToUpdate.push({ id: dbMatch.id, homeScore, awayScore, isFinished });
        if (isFinished) finishedMatchIds.push(dbMatch.id);
        updated++;
      }
    }

    // Batch update all matches
    for (const m of matchesToUpdate) {
      await db
        .update(matches)
        .set({
          home_score_real: m.homeScore,
          away_score_real: m.awayScore,
          is_locked: m.isFinished ? true : undefined,
        })
        .where(eq(matches.id, m.id));
    }

    // Batch process predictions for ALL finished matches (one query instead of N)
    if (finishedMatchIds.length > 0) {
      const allPreds = await db
        .select()
        .from(predictions)
        .where(inArray(predictions.match_id, finishedMatchIds));

      // Build result lookup
      const resultMap = new Map<string, { home: number; away: number }>();
      for (const m of matchesToUpdate) {
        if (m.isFinished) resultMap.set(m.id, { home: m.homeScore, away: m.awayScore });
      }

      // Batch update all predictions
      for (const pred of allPreds) {
        const result = resultMap.get(pred.match_id);
        if (!result) continue;

        const points = calculatePoints(pred.home_score_pred, pred.away_score_pred, result.home, result.away);
        await db.update(predictions).set({ points_earned: points }).where(eq(predictions.id, pred.id));
      }
    }

    if (updated > 0 || live > 0) {
      logger.info({ updated, live }, "Live score sync completed");
    }

    return { updated, live };
  } catch (err) {
    logger.error({ err }, "Live score sync failed");
    return { updated: 0, live: 0 };
  }
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startLiveScoreSync(): void {
  logger.info("Starting live score sync every 60s");
  syncScores();
  intervalHandle = setInterval(syncScores, SYNC_INTERVAL);
}

export function stopLiveScoreSync(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info("Live score sync stopped");
  }
}

export { syncScores };
