import { Router, Request, Response } from "express";
import { computeGroupStandings, getTeamRecentForm } from "../lib/standings";
import logger from "../lib/logger";

const router = Router();

// GET /api/standings — tabla de posiciones de todos los grupos
router.get("/", async (_req: Request, res: Response) => {
  try {
    const standings = await computeGroupStandings();
    res.json(standings);
  } catch (err) {
    logger.error(err, "Get standings error:");
    res.status(500).json({ error: "Error al obtener tabla de posiciones." });
  }
});

// GET /api/standings/form/:teamName — forma reciente de un equipo
router.get("/form/:teamName", async (req: Request, res: Response) => {
  try {
    const form = await getTeamRecentForm(req.params.teamName);
    res.json(form);
  } catch (err) {
    logger.error(err, "Get team form error:");
    res.status(500).json({ error: "Error al obtener forma del equipo." });
  }
});

export default router;
