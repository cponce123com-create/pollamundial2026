import { Router, Request, Response } from "express";
import multer from "multer";
import { db } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { eq, and } from "drizzle-orm";
import cloudinary from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/payments/upload — subir comprobante a Cloudinary (auth)
router.post("/upload", requireAuth, upload.single("proof"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes enviar una imagen del comprobante." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `pollaworld/payments/${req.user!.userId}` },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    await db
      .update(users)
      .set({ payment_proof_url: result.secure_url, payment_status: "pending" })
      .where(eq(users.id, req.user!.userId));

    res.json({ url: result.secure_url, message: "Comprobante subido. Pendiente de revisión." });
  } catch (err) {
    console.error("Upload proof error:", err);
    res.status(500).json({ error: "Error al subir comprobante." });
  }
});

// GET /api/admin/payments/pending — lista usuarios pendientes con comprobante
router.get("/admin/payments/pending", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const pending = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        emoji_id: users.emoji_id,
        payment_proof_url: users.payment_proof_url,
        payment_status: users.payment_status,
        created_at: users.created_at,
      })
      .from(users)
      .where(and(eq(users.payment_status, "pending")))
      .orderBy(users.created_at);

    res.json(pending);
  } catch (err) {
    console.error("Pending payments error:", err);
    res.status(500).json({ error: "Error al obtener pagos pendientes." });
  }
});

// GET /api/admin/payments/approved — lista usuarios aprobados
router.get("/admin/payments/approved", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const approved = await db
      .select()
      .from(users)
      .where(eq(users.payment_status, "approved"))
      .orderBy(users.created_at);

    res.json(approved);
  } catch (err) {
    console.error("Approved payments error:", err);
    res.status(500).json({ error: "Error al obtener pagos aprobados." });
  }
});

// PATCH /api/admin/payments/:userId/approve — aprobar pago
router.patch("/admin/payments/:userId/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(users)
      .set({ payment_status: "approved" })
      .where(eq(users.id, req.params.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json({ message: "Pago aprobado.", user: updated });
  } catch (err) {
    console.error("Approve payment error:", err);
    res.status(500).json({ error: "Error al aprobar pago." });
  }
});

// PATCH /api/admin/payments/:userId/reject — rechazar pago
router.patch("/admin/payments/:userId/reject", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    const [updated] = await db
      .update(users)
      .set({ payment_status: "rejected" })
      .where(eq(users.id, req.params.userId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json({ message: reason ? `Pago rechazado: ${reason}` : "Pago rechazado.", user: updated });
  } catch (err) {
    console.error("Reject payment error:", err);
    res.status(500).json({ error: "Error al rechazar pago." });
  }
});

export default router;
