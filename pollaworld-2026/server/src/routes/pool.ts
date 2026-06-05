import { Router, Request, Response } from "express";
import { db } from "../db";
import { poolConfig, users, entries, predictions } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, sql, count, desc } from "drizzle-orm";

const router = Router();

// GET /api/pool/stats — estadísticas públicas del pozo
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    const [result] = await db
      .select({ count: count() })
      .from(entries)
      .where(eq(entries.payment_status, "approved"));

    const approvedCount = result?.count ?? 0;
    const entryFee = config?.entry_fee ?? 20;
    const totalPool = approvedCount * entryFee;

    res.json({
      approvedCount,
      entryFee,
      totalPool,
      prizes: {
        first: Math.floor(totalPool * (config?.prize_1st_pct ?? 70) / 100),
        second: Math.floor(totalPool * (config?.prize_2nd_pct ?? 20) / 100),
        third: Math.floor(totalPool * (config?.prize_3rd_pct ?? 10) / 100),
      },
      tournamentStarted: config?.tournament_started ?? false,
    });
  } catch (err) {
    console.error("Pool stats error:", err);
    res.status(500).json({ error: "Error al obtener estadísticas." });
  }
});

// GET /api/participants — lista pública de entradas aprobadas
router.get("/participants", async (_req: Request, res: Response) => {
  try {
    const participants = await db
      .select({
        id: entries.id,
        userId: entries.user_id,
        userName: users.name,
        phone: users.phone,
        player_slug: users.player_slug,
        ticketNumber: entries.ticket_number,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .where(eq(entries.payment_status, "approved"))
      .orderBy(users.name, entries.ticket_number);

    // Mask phone numbers and format
    const masked = participants.map((p) => ({
      id: p.ticketNumber > 1 ? `${p.userId}-${p.ticketNumber}` : p.id,
      userId: p.userId,
      name: p.ticketNumber > 1 ? `${p.userName} (Ticket ${p.ticketNumber})` : p.userName,
      phone: p.phone ? `****${p.phone.slice(-4)}` : "****",
      player_slug: p.player_slug,
      ticketNumber: p.ticketNumber,
    }));

    res.json(masked);
  } catch (err) {
    console.error("Participants error:", err);
    res.status(500).json({ error: "Error al obtener participantes." });
  }
});

// GET /api/pool/config
router.get("/config", async (_req: Request, res: Response) => {
  try {
    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      const [newConfig] = await db.insert(poolConfig).values({}).returning();
      res.json(newConfig);
      return;
    }
    res.json(configs[0]);
  } catch (err) {
    console.error("Get pool config error:", err);
    res.status(500).json({ error: "Error al obtener configuración." });
  }
});

// PUT /api/pool/config — actualizar (admin)
router.put("/config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      const [newConfig] = await db.insert(poolConfig).values(req.body).returning();
      res.json(newConfig);
    } else {
      const [updated] = await db
        .update(poolConfig)
        .set(req.body)
        .where(eq(poolConfig.id, configs[0].id))
        .returning();
      res.json(updated);
    }
  } catch (err) {
    console.error("Update pool config error:", err);
    res.status(500).json({ error: "Error al actualizar configuración." });
  }
});

// GET /api/ranking — ranking detallado público, rankea por entry
router.get("/ranking", async (_req: Request, res: Response) => {
  try {
    const ranking = await db
      .select({
        entryId: entries.id,
        ticketNumber: entries.ticket_number,
        userId: users.id,
        name: users.name,
        playerSlug: users.player_slug,
        totalPoints: sql<number>`COALESCE(SUM(${predictions.points_earned}), 0)`.mapWith(Number),
        exactScores: sql<number>`COALESCE(SUM(CASE WHEN ${predictions.points_earned} = 5 THEN 1 ELSE 0 END), 0)`.mapWith(Number),
        correctResults: sql<number>`COALESCE(SUM(CASE WHEN ${predictions.points_earned} = 3 THEN 1 ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .leftJoin(predictions, eq(entries.id, predictions.entry_id))
      .where(eq(entries.payment_status, "approved"))
      .groupBy(entries.id, users.id)
      .orderBy(desc(sql`COALESCE(SUM(${predictions.points_earned}), 0)`));

    res.json(ranking);
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: "Error al obtener ranking." });
  }
});

export default router;
