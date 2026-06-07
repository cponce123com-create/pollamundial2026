import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { db } from "../db";
import { entries } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq } from "drizzle-orm";
import { imageUpload, uploadToCloudinary, cloudinaryErrorResponse } from "../lib/upload";
import logger from "../lib/logger";

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Demasiadas solicitudes de pago. Espera un minuto." },
});

// POST /api/payments/upload — subir comprobante a Cloudinary para una entrada específica
router.post("/upload", requireAuth, paymentLimiter, (req: Request, res: Response, next) => {
  imageUpload.single("proof")(req, res, (err) => {
    if (err) {
      const handled = cloudinaryErrorResponse(err, "Upload proof");
      return res.status(handled.status).json({ error: handled.error });
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

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `pollaworld/payments/${req.user!.userId}`,
      allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
    });

    await db
      .update(entries)
      .set({ payment_proof_url: result.secure_url, payment_status: "pending" })
      .where(eq(entries.id, entry_id));

    res.json({ url: result.secure_url, message: "Comprobante subido. Pendiente de revisión." });
  } catch (err: unknown) {
    const errResp = cloudinaryErrorResponse(err, "Upload proof");
    res.status(errResp.status).json({ error: errResp.error });
  }
});

export default router;
