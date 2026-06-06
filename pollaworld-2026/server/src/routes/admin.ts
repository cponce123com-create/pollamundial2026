import { Router, Request, Response } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { db } from "../db";
import { users, entries, matches, predictions, poolConfig } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, and, asc, inArray } from "drizzle-orm";
import { calculatePoints } from "../lib/scoring";
import logger from "../lib/logger";
import { broadcastEvent } from "../lib/sse";

const router = Router();

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Demasiadas solicitudes." },
});

router.use(adminLimiter);

// GET /api/admin/users — listar todos los usuarios
router.get("/users", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        player_slug: users.player_slug,
        role: users.role,
        avatar_url: users.avatar_url,
        created_at: users.created_at,
      })
      .from(users)
      .orderBy(users.created_at);
    res.json(result);
  } catch (err) {
    logger.error(err, "Admin users error:");
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

// PUT /api/admin/users/:id — actualizar rol de usuario
router.put("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== "participant" && role !== "admin") {
      res.status(400).json({ error: "Rol inválido." });
      return;
    }

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, req.params.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json(updated);
  } catch (err) {
    logger.error(err, "Admin update user error:");
    res.status(500).json({ error: "Error al actualizar usuario." });
  }
});

// ─── Entries (payment) admin routes ───

// GET /api/admin/entries — all entries with user info
router.get("/entries", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allEntries = await db
      .select({
        id: entries.id,
        user_id: entries.user_id,
        ticket_number: entries.ticket_number,
        payment_status: entries.payment_status,
        payment_proof_url: entries.payment_proof_url,
        created_at: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userPlayerSlug: users.player_slug,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .orderBy(entries.created_at);

    res.json(allEntries);
  } catch (err) {
    logger.error(err, "Admin entries error:");
    res.status(500).json({ error: "Error al obtener entradas." });
  }
});

// GET /api/admin/entries/pending — pending entries
router.get("/entries/pending", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const pending = await db
      .select({
        id: entries.id,
        user_id: entries.user_id,
        ticket_number: entries.ticket_number,
        payment_proof_url: entries.payment_proof_url,
        payment_status: entries.payment_status,
        created_at: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userPlayerSlug: users.player_slug,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .where(eq(entries.payment_status, "pending"))
      .orderBy(entries.created_at);

    res.json(pending);
  } catch (err) {
    logger.error(err, "Pending entries error:");
    res.status(500).json({ error: "Error al obtener entradas pendientes." });
  }
});

// GET /api/admin/entries/approved — approved entries
router.get("/entries/approved", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const approved = await db
      .select({
        id: entries.id,
        user_id: entries.user_id,
        ticket_number: entries.ticket_number,
        payment_status: entries.payment_status,
        payment_proof_url: entries.payment_proof_url,
        created_at: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userPlayerSlug: users.player_slug,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .where(eq(entries.payment_status, "approved"))
      .orderBy(entries.created_at);

    res.json(approved);
  } catch (err) {
    logger.error(err, "Approved entries error:");
    res.status(500).json({ error: "Error al obtener entradas aprobadas." });
  }
});

// PATCH /api/admin/entries/:id/approve — approve entry
router.patch("/entries/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [existingEntry] = await db
      .select({ payment_proof_url: entries.payment_proof_url })
      .from(entries)
      .where(eq(entries.id, req.params.id))
      .limit(1);

    if (!existingEntry || !existingEntry.payment_proof_url) {
      res.status(400).json({ error: "No hay comprobante de pago para esta entrada." });
      return;
    }

    const [updated] = await db
      .update(entries)
      .set({ payment_status: "approved" })
      .where(eq(entries.id, req.params.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Entrada no encontrada." });
      return;
    }

    // Notify client
    broadcastEvent("payment_approved", { entryId: updated.id, ticketNumber: updated.ticket_number, userId: updated.user_id });

    res.json({ message: "Pago aprobado.", entry: updated });
  } catch (err) {
    logger.error(err, "Approve entry error:");
    res.status(500).json({ error: "Error al aprobar pago." });
  }
});

// PATCH /api/admin/entries/:id/reject — reject entry
router.patch("/entries/:id/reject", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const [updated] = await db
      .update(entries)
      .set({ payment_status: "rejected" })
      .where(eq(entries.id, req.params.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Entrada no encontrada." });
      return;
    }

    // Notify client
    broadcastEvent("payment_rejected", { entryId: updated.id, ticketNumber: updated.ticket_number, userId: updated.user_id, reason });

    res.json({ message: reason ? `Pago rechazado: ${reason}` : "Pago rechazado.", entry: updated });
  } catch (err) {
    logger.error(err, "Reject entry error:");
    res.status(500).json({ error: "Error al rechazar pago." });
  }
});

// GET /api/admin/predictions/export — export JSON de predicciones de entradas aprobadas
router.get("/predictions/export", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const approvedEntries = await db
      .select()
      .from(entries)
      .where(eq(entries.payment_status, "approved"));

    const allMatches = await db.select().from(matches).orderBy(asc(matches.match_order));

    // Pre-load all users and predictions
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    const approvedEntryIds = approvedEntries.map(e => e.id);
    const allPreds = await db.select().from(predictions).where(inArray(predictions.entry_id, approvedEntryIds));
    // Group preds by entry_id
    const predsByEntry = new Map<string, typeof allPreds>();
    for (const pred of allPreds) {
      const arr = predsByEntry.get(pred.entry_id) || [];
      arr.push(pred);
      predsByEntry.set(pred.entry_id, arr);
    }

    const result = [];
    for (const entry of approvedEntries) {
      const user = userMap.get(entry.user_id);
      const entryPreds = (predsByEntry.get(entry.id) || []).map(p => ({
        prediction: p,
        match: allMatches.find(m => m.id === p.match_id),
      })).filter(p => p.match);

      if (user) {
        result.push({
          user: { id: user.id, name: user.name, phone: user.phone, player_slug: user.player_slug },
          entry: { id: entry.id, ticketNumber: entry.ticket_number },
          predictions: entryPreds,
        });
      }
    }

    res.json({ exported_at: new Date().toISOString(), users: result, matches: allMatches });
  } catch (err) {
    logger.error(err, "Export error:");
    res.status(500).json({ error: "Error al exportar predicciones." });
  }
});

// GET /api/admin/players — list all players with custom names
router.get("/players", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [config] = await db.select({ names: poolConfig.player_custom_names }).from(poolConfig).limit(1);
    const customNames: Record<string, string> = (config?.names as Record<string, string>) || {};
    res.json({ customNames });
  } catch (err) {
    logger.error(err, "Admin players error:");
    res.status(500).json({ error: "Error al obtener jugadores." });
  }
});

// PUT /api/admin/players — save custom player names
router.put("/players", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { customNames } = req.body;
    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      await db.insert(poolConfig).values({ player_custom_names: customNames || {} });
    } else {
      await db.update(poolConfig).set({ player_custom_names: customNames || {} }).where(eq(poolConfig.id, configs[0].id));
    }
    res.json({ message: "Nombres actualizados.", customNames });
  } catch (err) {
    logger.error(err, "Admin save players error:");
    res.status(500).json({ error: "Error al guardar nombres." });
  }
});

// DELETE /api/admin/entries/:id — eliminar entrada y sus predicciones
router.delete("/entries/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [deleted] = await db
      .delete(entries)
      .where(eq(entries.id, req.params.id))
      .returning({ id: entries.id, ticket_number: entries.ticket_number });

    if (!deleted) {
      res.status(404).json({ error: "Entrada no encontrada." });
      return;
    }

    res.json({ message: `Ticket #${deleted.ticket_number} eliminado.` });
  } catch (err) {
    logger.error(err, "Delete entry error:");
    res.status(500).json({ error: "Error al eliminar entrada." });
  }
});

// POST /api/admin/matches/:id/result — admin ingresa resultado y dispara cálculo
const resultSchema = z.object({
  home_score_real: z.number().int().min(0, "El marcador local debe ser 0 o más"),
  away_score_real: z.number().int().min(0, "El marcador visitante debe ser 0 o más"),
});

router.post("/matches/:id/result", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { home_score_real, away_score_real } = resultSchema.parse(req.body);
    const homeScore = home_score_real;
    const awayScore = away_score_real;

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, req.params.id))
      .limit(1);

    if (!match) {
      res.status(404).json({ error: "Partido no encontrado." });
      return;
    }

    await db
      .update(matches)
      .set({ home_score_real: homeScore, away_score_real: awayScore, is_locked: true })
      .where(eq(matches.id, match.id));

    const allPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.match_id, match.id));

    for (const pred of allPredictions) {
      const points = calculatePoints(pred.home_score_pred, pred.away_score_pred, homeScore, awayScore);
      await db.update(predictions).set({ points_earned: points }).where(eq(predictions.id, pred.id));
    }

    // Notify clients
    broadcastEvent("match_result", {
      matchId: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      homeScore,
      awayScore,
      predictionsCalculated: allPredictions.length,
    });

    res.json({ message: `Resultado guardado. ${allPredictions.length} predicciones calculadas.` });
  } catch (err) {
    logger.error(err, "Save result error:");
    res.status(500).json({ error: "Error al guardar resultado." });
  }
});

// PATCH /api/admin/matches/:id/lock — toggle lock (admin)
router.patch("/matches/:id/lock", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { locked } = req.body;
    if (locked === undefined) {
      res.status(400).json({ error: "Se requiere el campo locked." });
      return;
    }

    if (locked) {
      const [match] = await db
        .update(matches)
        .set({ is_locked: true })
        .where(eq(matches.id, req.params.id))
        .returning();
      if (!match) {
        res.status(404).json({ error: "Partido no encontrado." });
        return;
      }
      res.json({ message: "Partido bloqueado.", match });
    } else {
      const [match] = await db
        .update(matches)
        .set({ is_locked: false, home_score_real: null, away_score_real: null })
        .where(eq(matches.id, req.params.id))
        .returning();
      if (!match) {
        res.status(404).json({ error: "Partido no encontrado." });
        return;
      }
      await db
        .update(predictions)
        .set({ points_earned: 0 })
        .where(eq(predictions.match_id, req.params.id));

      res.json({ message: "Partido desbloqueado. Resultado y puntos eliminados.", match });
    }
  } catch (err) {
    logger.error(err, "Lock match error:");
    res.status(500).json({ error: "Error al bloquear partido." });
  }
});

export default router;
