import { Router, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/admin/users — listar todos los usuarios
router.get("/users", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users).orderBy(users.created_at);
    res.json(allUsers);
  } catch (err) {
    console.error("Admin users error:", err);
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
    console.error("Admin update user error:", err);
    res.status(500).json({ error: "Error al actualizar usuario." });
  }
});

// ─── Payment admin routes (moved from payments.ts for correct URL) ───

// GET /api/admin/payments/pending — usuarios pendientes con comprobante
router.get("/payments/pending", requireAdmin, async (_req: Request, res: Response) => {
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

// GET /api/admin/payments/approved — usuarios aprobados
router.get("/payments/approved", requireAdmin, async (_req: Request, res: Response) => {
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
router.patch("/payments/:userId/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [existingUser] = await db
      .select({ payment_proof_url: users.payment_proof_url })
      .from(users)
      .where(eq(users.id, req.params.userId))
      .limit(1);

    if (!existingUser || !existingUser.payment_proof_url) {
      res.status(400).json({ error: "No hay comprobante de pago para este usuario." });
      return;
    }

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
router.patch("/payments/:userId/reject", requireAdmin, async (req: Request, res: Response) => {
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
