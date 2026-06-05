import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { predictions, matches, users, entries, poolConfig } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";

const router = Router();

const predictionSchema = z.object({
  entry_id: z.string().uuid(),
  match_id: z.string().uuid(),
  home_score_pred: z.number().int().min(0).max(20),
  away_score_pred: z.number().int().min(0).max(20),
});

const bulkPredictionSchema = z.object({
  entry_id: z.string().uuid(),
  predictions: z.array(z.object({
    match_id: z.string().uuid(),
    home_score_pred: z.number().int().min(0).max(20),
    away_score_pred: z.number().int().min(0).max(20),
  })),
});

// POST /api/predictions — crear/actualizar UNA predicción (upsert)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = predictionSchema.parse(req.body);

    const [match] = await db.select().from(matches).where(eq(matches.id, data.match_id)).limit(1);
    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    if (match.is_locked) {
      res.status(400).json({ error: "Este partido ya está bloqueado." });
      return;
    }

    // Verify the entry belongs to the current user
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, data.entry_id), eq(entries.user_id, req.user!.userId)))
      .limit(1);
    if (!entry) {
      res.status(403).json({ error: "Esta entrada no te pertenece." });
      return;
    }

    // Verificar tournament_started
    const [config] = await db.select().from(poolConfig).limit(1);
    if (config?.tournament_started) {
      res.status(400).json({ error: "El torneo ya inició. No se aceptan más predicciones." });
      return;
    }

    const [existing] = await db
      .select()
      .from(predictions)
      .where(and(eq(predictions.entry_id, data.entry_id), eq(predictions.match_id, data.match_id)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(predictions)
        .set({ home_score_pred: data.home_score_pred, away_score_pred: data.away_score_pred, updated_at: new Date() })
        .where(eq(predictions.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(predictions)
        .values({
          user_id: req.user!.userId,
          entry_id: data.entry_id,
          match_id: data.match_id,
          home_score_pred: data.home_score_pred,
          away_score_pred: data.away_score_pred,
        })
        .returning();
      res.status(201).json(created);
    }
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Error al guardar predicción." });
  }
});

// POST /api/predictions/bulk — upsert masivo de predicciones
router.post("/bulk", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = bulkPredictionSchema.parse(req.body);

    // Verify the entry belongs to the current user
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, data.entry_id), eq(entries.user_id, req.user!.userId)))
      .limit(1);
    if (!entry) {
      res.status(403).json({ error: "Esta entrada no te pertenece." });
      return;
    }

    const [config] = await db.select().from(poolConfig).limit(1);
    if (config?.tournament_started) {
      res.status(400).json({ error: "El torneo ya inició." });
      return;
    }

    const results = [];
    // Get all match IDs
    const matchIds = data.predictions.map(p => p.match_id);
    // Single query for all unlockable matches
    const activeMatches = await db.select().from(matches).where(and(inArray(matches.id, matchIds), eq(matches.is_locked, false)));
    const validMatchIds = new Set(activeMatches.map(m => m.id));
    // Get existing predictions for this entry
    const existingPreds = await db.select().from(predictions).where(and(eq(predictions.entry_id, data.entry_id), inArray(predictions.match_id, matchIds)));
    const existingMap = new Map(existingPreds.map(p => [p.match_id, p]));
    // Batch upsert
    const batch = data.predictions.filter(p => validMatchIds.has(p.match_id)).map(p => ({
      user_id: req.user!.userId,
      entry_id: data.entry_id,
      match_id: p.match_id,
      home_score_pred: p.home_score_pred,
      away_score_pred: p.away_score_pred,
      points_earned: 0,
    }));
    if (batch.length > 0) {
      const inserted = await db.insert(predictions).values(batch).onConflictDoUpdate({
        target: [predictions.entry_id, predictions.match_id],
        set: { home_score_pred: sql`excluded.home_score_pred`, away_score_pred: sql`excluded.away_score_pred`, updated_at: sql`now()` },
      }).returning();
      results.push(...inserted);
    }

    res.json({ saved: results.length, predictions: results });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error("Bulk prediction error:", err);
    res.status(500).json({ error: "Error al guardar predicciones." });
  }
});

// GET /api/predictions/my/:entryId — predicciones para una entry específica
router.get("/my/:entryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;

    // Verify the entry belongs to the current user
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, entryId), eq(entries.user_id, req.user!.userId)))
      .limit(1);
    if (!entry) {
      res.status(403).json({ error: "Esta entrada no te pertenece." });
      return;
    }

    const data = await db
      .select({
        prediction: predictions,
        match: matches,
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.match_id, matches.id))
      .where(eq(predictions.entry_id, entryId))
      .orderBy(asc(matches.match_order));

    res.json(data);
  } catch (err) {
    console.error("My predictions by entry error:", err);
    res.status(500).json({ error: "Error al obtener predicciones." });
  }
});

// GET /api/predictions/matches/:entryId — todos los partidos con la predicción para una entry
router.get("/matches/:entryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;

    // Verify the entry belongs to the current user
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, entryId), eq(entries.user_id, req.user!.userId)))
      .limit(1);
    if (!entry) {
      res.status(403).json({ error: "Esta entrada no te pertenece." });
      return;
    }

    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));

    const entryPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.entry_id, entryId));

    const predMap = new Map(entryPredictions.map((p) => [p.match_id, p]));

    const result = allMatches.map((m) => ({
      ...m,
      prediction: predMap.get(m.id) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error("Matches with predictions by entry error:", err);
    res.status(500).json({ error: "Error al obtener partidos." });
  }
});

// GET /api/predictions/user/:userId — predicciones de un usuario (solo si torneo iniciado)
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    if (!config?.tournament_started) {
      res.status(403).json({ error: "Las predicciones solo son visibles cuando el torneo inicia." });
      return;
    }

    const data = await db
      .select({
        prediction: predictions,
        match: matches,
        entry: entries,
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.match_id, matches.id))
      .innerJoin(entries, eq(predictions.entry_id, entries.id))
      .where(eq(predictions.user_id, req.params.userId))
      .orderBy(asc(matches.match_order));

    res.json(data);
  } catch (err) {
    console.error("User predictions error:", err);
    res.status(500).json({ error: "Error al obtener predicciones." });
  }
});

// GET /api/predictions/popular — returns the most common prediction per match (público)
router.get("/popular", async (_req: Request, res: Response) => {
  try {
    const popular = await db
      .select({
        match_id: predictions.match_id,
        home_score_pred: predictions.home_score_pred,
        away_score_pred: predictions.away_score_pred,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(predictions)
      .groupBy(predictions.match_id, predictions.home_score_pred, predictions.away_score_pred)
      .orderBy(predictions.match_id, sql`COUNT(*) DESC`);

    // Take only the top result per match
    const topPerMatch = new Map<string, { home_score_pred: number; away_score_pred: number }>();
    for (const p of popular) {
      if (!topPerMatch.has(p.match_id)) {
        topPerMatch.set(p.match_id, { home_score_pred: p.home_score_pred, away_score_pred: p.away_score_pred });
      }
    }

    const result: Record<string, { home_score_pred: number; away_score_pred: number }> = {};
    topPerMatch.forEach((value, key) => {
      result[key] = value;
    });

    res.json(result);
  } catch (err) {
    console.error("Popular predictions error:", err);
    res.status(500).json({ error: "Error al obtener predicciones populares." });
  }
});

export default router;
