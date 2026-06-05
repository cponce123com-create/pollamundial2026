import { Router, Request, Response } from "express";
import { db } from "../db";
import { matches } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, asc, lte, gte, desc, and } from "drizzle-orm";

const router = Router();

// GET /api/matches — listar todos los partidos (público)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));
    res.json(allMatches);
  } catch (err) {
    console.error("Get matches error:", err);
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
          gte(matches.home_score_real, 0)
        )
      )
      .orderBy(desc(matches.match_date))
      .limit(20);

    res.json({ live: liveMatches, recent: recentMatches });
  } catch (err) {
    console.error("Live matches error:", err);
    res.status(500).json({ error: "Error al obtener partidos en vivo." });
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
    console.error("Get match error:", err);
    res.status(500).json({ error: "Error al obtener partido." });
  }
});

// POST /api/matches — crear partido (admin)
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [newMatch] = await db.insert(matches).values(req.body).returning();
    res.status(201).json(newMatch);
  } catch (err) {
    console.error("Create match error:", err);
    res.status(500).json({ error: "Error al crear partido." });
  }
});

// PUT /api/matches/:id — actualizar partido (admin)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(matches)
      .set(req.body)
      .where(eq(matches.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Update match error:", err);
    res.status(500).json({ error: "Error al actualizar partido." });
  }
});

export default router;
