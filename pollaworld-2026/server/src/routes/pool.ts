import { Router, Request, Response } from "express";
import multer from "multer";
import { db } from "../db";
import { poolConfig, users, predictions } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { eq, sql, count } from "drizzle-orm";
import cloudinary from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/pool/stats — estadísticas públicas del pozo
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.payment_status, "approved"));

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

// GET /api/participants — lista pública de aprobados
router.get("/participants", async (_req: Request, res: Response) => {
  try {
    const participants = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        emoji_id: users.emoji_id,
      })
      .from(users)
      .where(eq(users.payment_status, "approved"))
      .orderBy(users.name);

    // Mask phone numbers
    const masked = participants.map((p) => ({
      ...p,
      phone: p.phone ? `****${p.phone.slice(-4)}` : "****",
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

// POST /api/pool/upload-yape-qr — subir QR de Yape (admin)
router.post("/upload-yape-qr", requireAdmin, upload.single("qr"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes enviar una imagen del QR." });
      return;
    }
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "pollaworld/config" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      await db.insert(poolConfig).values({ yape_qr_url: result.secure_url });
    } else {
      await db.update(poolConfig).set({ yape_qr_url: result.secure_url }).where(eq(poolConfig.id, configs[0].id));
    }

    res.json({ url: result.secure_url, message: "QR subido correctamente." });
  } catch (err) {
    console.error("Upload QR error:", err);
    res.status(500).json({ error: "Error al subir QR." });
  }
});

// GET /api/ranking — ranking detallado público
router.get("/ranking", async (_req: Request, res: Response) => {
  try {
    const ranking = await db
      .select({
        userId: users.id,
        name: users.name,
        emoji_id: users.emoji_id,
        total_points: sql<number>`COALESCE(SUM(${predictions.points_earned}), 0)`.mapWith(Number),
        exact_scores: sql<number>`COALESCE(SUM(CASE WHEN ${predictions.points_earned} = 5 THEN 1 ELSE 0 END), 0)`.mapWith(Number),
        correct_results: sql<number>`COALESCE(SUM(CASE WHEN ${predictions.points_earned} = 3 THEN 1 ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(users)
      .leftJoin(predictions, eq(users.id, predictions.user_id))
      .where(eq(users.payment_status, "approved"))
      .groupBy(users.id)
      .orderBy(sql`COALESCE(SUM(${predictions.points_earned}), 0) DESC`);

    res.json(ranking);
  } catch (err) {
    console.error("Ranking error:", err);
    res.status(500).json({ error: "Error al obtener ranking." });
  }
});

export default router;
