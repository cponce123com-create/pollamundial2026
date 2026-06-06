import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { db } from "../db";
import { matches } from "../db/schema";
import { eq, or, asc } from "drizzle-orm";
import logger from "../lib/logger";

const router = Router();

function getSquadsPath(): string {
  // Dev (tsx): __dirname = server/src/routes/ → ../db/squads.json
  const devPath = path.join(__dirname, "../db/squads.json");
  if (fs.existsSync(devPath)) return devPath;
  // Prod (dist/): __dirname = server/dist/routes/ → ../../src/db/squads.json
  return path.join(__dirname, "../../src/db/squads.json");
}

// GET /api/teams/squads — devuelve datos de los 48 equipos
router.get("/squads", (_req: Request, res: Response) => {
  try {
    const dataPath = getSquadsPath();
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    res.json(data);
  } catch (err) {
    logger.error(err, "Squads error:");
    res.status(500).json({ error: "Error al cargar datos de equipos." });
  }
});

// GET /api/teams/matches/:teamName — partidos de un equipo
router.get("/matches/:teamName", async (req: Request, res: Response) => {
  try {
    const teamName = req.params.teamName;
    const teamMatches = await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.home_team, teamName),
          eq(matches.away_team, teamName)
        )
      )
      .orderBy(asc(matches.match_date));

    res.json(teamMatches);
  } catch (err) {
    logger.error(err, "Team matches error:");
    res.status(500).json({ error: "Error al obtener partidos." });
  }
});

export default router;
