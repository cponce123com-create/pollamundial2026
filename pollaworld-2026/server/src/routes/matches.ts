import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { matches } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, asc, lte, gte, desc, and, isNotNull } from "drizzle-orm";
import logger from "../lib/logger";

const matchCreateSchema = z.object({
  phase: z.enum(["groups", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "final_3rd", "final"]),
  group_name: z.string().nullable().optional(),
  home_team: z.string().min(1),
  away_team: z.string().min(1),
  home_flag: z.string().min(1),
  away_flag: z.string().min(1),
  match_date: z.string().min(1),
  match_order: z.number().int(),
});
const matchUpdateSchema = matchCreateSchema.partial();

const router = Router();

// GET /api/matches — listar todos los partidos (público)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));
    res.json(allMatches);
  } catch (err) {
    logger.error(err, "Get matches error:");
    res.status(500).json({ error: "Error al obtener partidos." });
  }
});

// GET /api/matches/live — información de partidos en vivo (debe ir ANTES de /:id)
router.get("/live", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    // Partidos que están ocurriendo ahora (fecha pasada, no bloqueados, sin resultado)
    const liveMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          lte(matches.match_date, now),
          eq(matches.is_locked, false)
        )
      )
      .orderBy(asc(matches.match_date));

    // Partidos que terminaron recientemente (últimas 24h)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          gte(matches.match_date, yesterday),
          eq(matches.is_locked, true),
          and(isNotNull(matches.home_score_real), gte(matches.home_score_real, 0))
        )
      )
      .orderBy(desc(matches.match_date))
      .limit(20);

    res.json({ live: liveMatches, recent: recentMatches });
  } catch (err) {
    logger.error(err, "Live matches error:");
    res.status(500).json({ error: "Error al obtener partidos en vivo." });
  }
});

// GET /api/matches/:id/incidents — obtener incidents de un partido
router.get("/:id/incidents", async (req: Request, res: Response) => {
  try {
    const [match] = await db
      .select({ id: matches.id, incidents: matches.incidents })
      .from(matches)
      .where(eq(matches.id, req.params.id))
      .limit(1);
    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    res.json(match.incidents || []);
  } catch (err) {
    logger.error(err, "Get match incidents error:");
    res.status(500).json({ error: "Error al obtener incidents del partido." });
  }
});

// GET /api/matches/:id — obtener un partido específico
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [match] = await db.select().from(matches).where(eq(matches.id, req.params.id)).limit(1);
    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    res.json(match);
  } catch (err) {
    logger.error(err, "Get match error:");
    res.status(500).json({ error: "Error al obtener partido." });
  }
});

// POST /api/matches — crear partido (admin)
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = matchCreateSchema.parse(req.body);
    const values = { ...data, match_date: new Date(data.match_date) };
    const [newMatch] = await db.insert(matches).values(values).returning();
    res.status(201).json(newMatch);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    logger.error(err, "Create match error:");
    res.status(500).json({ error: "Error al crear partido." });
  }
});

// PUT /api/matches/:id — actualizar partido (admin)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = matchUpdateSchema.parse(req.body);
    const values: any = { ...data };
    if (data.match_date) values.match_date = new Date(data.match_date);
    const [updated] = await db
      .update(matches)
      .set(values)
      .where(eq(matches.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    logger.error(err, "Update match error:");
    res.status(500).json({ error: "Error al actualizar partido." });
  }
});

export default router;
