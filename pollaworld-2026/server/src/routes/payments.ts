import { Router, Request, Response } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { db } from "../db";
import { entries } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq } from "drizzle-orm";
import cloudinary from "../lib/cloudinary";
import logger from "../lib/logger";

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Demasiadas solicitudes de pago. Espera un minuto." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes (JPG, PNG, GIF, WEBP)"));
  },
});

// POST /api/payments/upload — subir comprobante a Cloudinary para una entrada específica
router.post("/upload", requireAuth, (req: Request, res: Response, next) => {
  upload.single("proof")(req, res, (err) => {
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
      res.status(400).json({ error: "Debes enviar una imagen del comprobante." });
      return;
    }

    const { entry_id } = req.body;
    if (!entry_id) {
      res.status(400).json({ error: "Se requiere el entry_id." });
      return;
    }

    // Verify the entry belongs to the current user
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entry_id))
      .limit(1);

    if (!entry) {
      res.status(404).json({ error: "Entrada no encontrada." });
      return;
    }

    if (entry.user_id !== req.user!.userId) {
      res.status(403).json({ error: "Esta entrada no te pertenece." });
      return;
    }

    if (entry.payment_status === "approved") {
      res.status(400).json({ error: "Tu pago ya fue aprobado. No puedes subir otro comprobante." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `pollaworld/payments/${req.user!.userId}`,
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

    await db
      .update(entries)
      .set({ payment_proof_url: result.secure_url, payment_status: "pending" })
      .where(eq(entries.id, entry_id));

    res.json({ url: result.secure_url, message: "Comprobante subido. Pendiente de revisión." });
  } catch (err: unknown) {
    logger.error(err, "Upload proof error:");
    const errObj = err as Record<string, unknown>;
    if (errObj?.http_code === 401 || (typeof errObj?.message === "string" && (errObj.message as string).includes("Invalid"))) {
      return res.status(500).json({ error: "Error de configuración de Cloudinary. Contacta al administrador." });
    }
    res.status(500).json({ error: "Error al subir comprobante. Verifica que el archivo sea una imagen válida." });
  }
});

export default router;
