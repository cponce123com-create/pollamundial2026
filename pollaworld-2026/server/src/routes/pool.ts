import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import { db } from "../db";
import { poolConfig, users, entries, predictions } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, sql, count, desc } from "drizzle-orm";
import cloudinary from "../lib/cloudinary";
import logger from "../lib/logger";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes (JPG, PNG, GIF, WEBP)"));
  },
});

const poolConfigSchema = z.object({
  entry_fee: z.number().int().min(1).max(1000).optional(),
  prize_1st_pct: z.number().int().min(0).max(100).optional(),
  prize_2nd_pct: z.number().int().min(0).max(100).optional(),
  prize_3rd_pct: z.number().int().min(0).max(100).optional(),
  tournament_started: z.boolean().optional(),
  yape_qr_url: z.string().nullable().optional(),
  yape_phone: z.string().nullable().optional(),
  whatsapp_group_link: z.string().nullable().optional(),
  player_custom_names: z.record(z.string()).nullable().optional(),
});

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
    logger.error(err, "Pool stats error:");
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
    logger.error(err, "Participants error:");
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
    logger.error(err, "Get pool config error:");
    res.status(500).json({ error: "Error al obtener configuración." });
  }
});

// PUT /api/pool/config — actualizar (admin)
router.put("/config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const validated = poolConfigSchema.parse(req.body);
    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      const [newConfig] = await db.insert(poolConfig).values(validated).returning();
      res.json(newConfig);
    } else {
      const [updated] = await db
        .update(poolConfig)
        .set(validated)
        .where(eq(poolConfig.id, configs[0].id))
        .returning();
      res.json(updated);
    }
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    logger.error(err, "Update pool config error:");
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
      .orderBy(
        desc(sql`COALESCE(SUM(${predictions.points_earned}), 0)`),
        desc(sql`COALESCE(SUM(CASE WHEN ${predictions.points_earned} = 5 THEN 1 ELSE 0 END), 0)`),
        desc(sql`COALESCE(SUM(CASE WHEN ${predictions.points_earned} >= 2 THEN 1 ELSE 0 END), 0)`),
        desc(sql`COUNT(${predictions.id})`)
      );

    res.json(ranking);
  } catch (err) {
    logger.error(err, "Ranking error:");
    res.status(500).json({ error: "Error al obtener ranking." });
  }
});

// POST /api/pool/upload-yape-qr — subir QR de Yape (admin)
router.post("/upload-yape-qr", requireAdmin, (req: Request, res: Response, next) => {
  upload.single("qr")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "La imagen no debe superar los 5MB." });
      }
      return res.status(400).json({ error: `Error al subir: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes enviar una imagen del código QR." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pollaworld/yape-qr",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
          max_file_size: 5 * 1024 * 1024,
        },
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
      await db
        .update(poolConfig)
        .set({ yape_qr_url: result.secure_url })
        .where(eq(poolConfig.id, configs[0].id));
    }

    res.json({ url: result.secure_url, message: "Código QR de Yape actualizado." });
  } catch (err: unknown) {
    logger.error(err, "Upload yape QR error:");
    const errObj = err as Record<string, unknown>;
    if (errObj?.http_code === 401 || (typeof errObj?.message === "string" && (errObj.message as string).includes("Invalid"))) {
      return res.status(500).json({ error: "Error de configuración de Cloudinary. Contacta al administrador." });
    }
    res.status(500).json({ error: "Error al subir código QR." });
  }
});

// POST /api/pool/upload-logo — subir logo de la polla (admin)
router.post("/upload-logo", requireAdmin, (req: Request, res: Response, next) => {
  upload.single("logo")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "La imagen no debe superar los 5MB." });
      }
      return res.status(400).json({ error: `Error al subir: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes enviar una imagen del logo." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pollaworld/logo",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
          max_file_size: 5 * 1024 * 1024,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      await db.insert(poolConfig).values({ logo_url: result.secure_url });
    } else {
      await db
        .update(poolConfig)
        .set({ logo_url: result.secure_url })
        .where(eq(poolConfig.id, configs[0].id));
    }

    res.json({ url: result.secure_url, message: "Logo actualizado." });
  } catch (err: unknown) {
    logger.error(err, "Upload logo error:");
    const errObj = err as Record<string, unknown>;
    if (errObj?.http_code === 401 || (typeof errObj?.message === "string" && (errObj.message as string).includes("Invalid"))) {
      return res.status(500).json({ error: "Error de configuración de Cloudinary. Contacta al administrador." });
    }
    res.status(500).json({ error: "Error al subir logo." });
  }
});

// POST /api/pool/upload-favicon — subir favicon de la polla (admin)
router.post("/upload-favicon", requireAdmin, (req: Request, res: Response, next) => {
  upload.single("favicon")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "La imagen no debe superar los 5MB." });
      }
      return res.status(400).json({ error: `Error al subir: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes enviar una imagen del favicon." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pollaworld/favicon",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico"],
          max_file_size: 5 * 1024 * 1024,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    const configs = await db.select().from(poolConfig).limit(1);
    if (configs.length === 0) {
      await db.insert(poolConfig).values({ favicon_url: result.secure_url });
    } else {
      await db
        .update(poolConfig)
        .set({ favicon_url: result.secure_url })
        .where(eq(poolConfig.id, configs[0].id));
    }

    res.json({ url: result.secure_url, message: "Favicon actualizado." });
  } catch (err: unknown) {
    logger.error(err, "Upload favicon error:");
    const errObj = err as Record<string, unknown>;
    if (errObj?.http_code === 401 || (typeof errObj?.message === "string" && (errObj.message as string).includes("Invalid"))) {
      return res.status(500).json({ error: "Error de configuración de Cloudinary. Contacta al administrador." });
    }
    res.status(500).json({ error: "Error al subir favicon." });
  }
});

export default router;
