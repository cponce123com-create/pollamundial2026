import { Router, Request, Response } from "express";
import { db } from "../db";
import { matches } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { eq, asc } from "drizzle-orm";

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
