import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { predictions, matches, users, poolConfig } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";
import { calculatePoints } from "../lib/scoring";

const router = Router();

const predictionSchema = z.object({
  match_id: z.string().uuid(),
  home_score_pred: z.number().int().min(0).max(20),
  away_score_pred: z.number().int().min(0).max(20),
});

const bulkPredictionSchema = z.object({
  predictions: z.array(predictionSchema),
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

    // Verificar tournament_started
    const [config] = await db.select().from(poolConfig).limit(1);
    if (config?.tournament_started) {
      res.status(400).json({ error: "El torneo ya inició. No se aceptan más predicciones." });
      return;
    }

    const [existing] = await db
      .select()
      .from(predictions)
      .where(and(eq(predictions.user_id, req.user!.userId), eq(predictions.match_id, data.match_id)))
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
        .values({ user_id: req.user!.userId, match_id: data.match_id, home_score_pred: data.home_score_pred, away_score_pred: data.away_score_pred })
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

    const [config] = await db.select().from(poolConfig).limit(1);
    if (config?.tournament_started) {
      res.status(400).json({ error: "El torneo ya inició." });
      return;
    }

    const results = [];
    for (const pred of data.predictions) {
      const [match] = await db.select().from(matches).where(eq(matches.id, pred.match_id)).limit(1);
      if (!match || match.is_locked) continue;

      const [existing] = await db
        .select()
        .from(predictions)
        .where(and(eq(predictions.user_id, req.user!.userId), eq(predictions.match_id, pred.match_id)))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(predictions)
          .set({ home_score_pred: pred.home_score_pred, away_score_pred: pred.away_score_pred, updated_at: new Date() })
          .where(eq(predictions.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [created] = await db
          .insert(predictions)
          .values({ user_id: req.user!.userId, match_id: pred.match_id, home_score_pred: pred.home_score_pred, away_score_pred: pred.away_score_pred })
          .returning();
        results.push(created);
      }
    }

    res.json({ saved: results.length, predictions: results });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    console.error("Bulk prediction error:", err);
    res.status(500).json({ error: "Error al guardar predicciones." });
  }
});

// GET /api/predictions/my — predicciones del usuario con info del partido y puntos
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        prediction: predictions,
        match: matches,
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.match_id, matches.id))
      .where(eq(predictions.user_id, req.user!.userId))
      .orderBy(asc(matches.match_order));

    res.json(data);
  } catch (err) {
    console.error("My predictions error:", err);
    res.status(500).json({ error: "Error al obtener predicciones." });
  }
});

// GET /api/predictions/matches — todos los partidos con la predicción del usuario actual
router.get("/matches", requireAuth, async (req: Request, res: Response) => {
  try {
    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));

    const userPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.user_id, req.user!.userId));

    const predMap = new Map(userPredictions.map((p) => [p.match_id, p]));

    const result = allMatches.map((m) => ({
      ...m,
      prediction: predMap.get(m.id) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error("Matches with predictions error:", err);
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
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.match_id, matches.id))
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

// GET /api/predictions/ranking — tabla de posiciones (público)
router.get("/ranking", async (_req: Request, res: Response) => {
  try {
    const ranking = await db
      .select({
        user_id: users.id,
        name: users.name,
        emoji_id: users.emoji_id,
        total_points: sql<number>`COALESCE(SUM(${predictions.points_earned}), 0)`.mapWith(Number),
      })
      .from(users)
      .leftJoin(predictions, eq(users.id, predictions.user_id))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(${predictions.points_earned}), 0)`));

    res.json(ranking);
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: "Error al obtener ranking." });
  }
});

// POST /api/admin/matches/:id/result — admin ingresa resultado y dispara cálculo
router.post("/admin/matches/:id/result", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { home_score_real, away_score_real } = req.body;
    if (home_score_real == null || away_score_real == null) {
      res.status(400).json({ error: "Se requieren home_score_real y away_score_real." });
      return;
    }

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, req.params.id))
      .limit(1);

    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }

    // Actualizar resultado real
    await db
      .update(matches)
      .set({ home_score_real, away_score_real, is_locked: true })
      .where(eq(matches.id, match.id));

    // Calcular puntos para todas las predicciones de este partido
    const allPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.match_id, match.id));

    for (const pred of allPredictions) {
      const points = calculatePoints(pred.home_score_pred, pred.away_score_pred, home_score_real, away_score_real);
      await db.update(predictions).set({ points_earned: points }).where(eq(predictions.id, pred.id));
    }

    res.json({ message: `Resultado guardado. ${allPredictions.length} predicciones calculadas.` });
  } catch (err) {
    console.error("Save result error:", err);
    res.status(500).json({ error: "Error al guardar resultado." });
  }
});

// PATCH /api/admin/matches/:id/lock — toggle lock (admin)
router.patch("/admin/matches/:id/lock", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { locked } = req.body;
    if (locked === undefined) {
      res.status(400).json({ error: "Se requiere el campo locked." });
      return;
    }
    const [match] = await db
      .update(matches)
      .set({ is_locked: locked })
      .where(eq(matches.id, req.params.id))
      .returning();
    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }
    res.json({ message: `Partido ${locked ? "bloqueado" : "desbloqueado"}.`, match });
  } catch (err) {
    console.error("Lock match error:", err);
    res.status(500).json({ error: "Error al bloquear partido." });
  }
});

// GET /api/admin/predictions/export — export JSON de predicciones de usuarios aprobados
router.get("/admin/predictions/export", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const approvedUsers = await db
      .select()
      .from(users)
      .where(eq(users.payment_status, "approved"));

    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));

    const result = [];
    for (const user of approvedUsers) {
      const userPreds = await db
        .select({
          prediction: predictions,
          match: matches,
        })
        .from(predictions)
        .innerJoin(matches, eq(predictions.match_id, matches.id))
        .where(eq(predictions.user_id, user.id))
        .orderBy(asc(matches.match_order));

      result.push({
        user: { id: user.id, name: user.name, phone: user.phone, emoji_id: user.emoji_id },
        predictions: userPreds,
      });
    }

    res.json({ exported_at: new Date().toISOString(), users: result, matches: allMatches });
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Error al exportar predicciones." });
  }
});

export default router;
