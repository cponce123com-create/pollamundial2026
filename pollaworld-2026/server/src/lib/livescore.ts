import { db } from "../db";
import { matches } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { calculatePoints } from "./scoring";
import { predictions } from "../db/schema";
import logger from "./logger";

const API_URL = "https://worldcup26.ir/get/games";
const SYNC_INTERVAL = 60_000; // 60 seconds

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

async function fetchGames(): Promise<ApiGame[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const data: ApiResponse = await res.json() as ApiResponse;
  return data.games;
}

async function syncScores(): Promise<{ updated: number; live: number }> {
  try {
    const games = await fetchGames();
    let updated = 0;
    let live = 0;

    for (const game of games) {
      const homeName = TEAM_NAME_MAP[game.home_team_name_en];
      const awayName = TEAM_NAME_MAP[game.away_team_name_en];

      if (!homeName || !awayName) continue;

      const homeScore = parseInt(game.home_score, 10);
      const awayScore = parseInt(game.away_score, 10);
      const isFinished = game.finished === "TRUE";
      const isLive = game.time_elapsed !== "notstarted" && !isFinished;

      // Find matching match in DB
      const [dbMatch] = await db
        .select()
        .from(matches)
        .where(
          and(
            eq(matches.home_team, homeName),
            eq(matches.away_team, awayName)
          )
        )
        .limit(1);

      if (!dbMatch) continue;

      if (isLive) live++;

      // Only update if scores changed or match just finished
      const scoresChanged =
        dbMatch.home_score_real !== homeScore ||
        dbMatch.away_score_real !== awayScore;

      if (scoresChanged || (isFinished && !dbMatch.is_locked)) {
        await db
          .update(matches)
          .set({
            home_score_real: homeScore,
            away_score_real: awayScore,
            is_locked: isFinished ? true : dbMatch.is_locked,
          })
          .where(eq(matches.id, dbMatch.id));

        // If match finished, calculate points for all predictions
        if (isFinished) {
          const preds = await db
            .select()
            .from(predictions)
            .where(eq(predictions.match_id, dbMatch.id));

          for (const pred of preds) {
            const points = calculatePoints(
              pred.home_score_pred,
              pred.away_score_pred,
              homeScore,
              awayScore
            );
            await db
              .update(predictions)
              .set({ points_earned: points })
              .where(eq(predictions.id, pred.id));
          }
        }

        updated++;
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
  // Run immediately
  syncScores();
  // Then every 60s
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
