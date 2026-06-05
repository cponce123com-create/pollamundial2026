import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, entries } from "../db/schema";
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

// ─── Entries (payment) admin routes ───

// GET /api/admin/entries — all entries with user info
router.get("/entries", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allEntries = await db
      .select({
        id: entries.id,
        userId: entries.user_id,
        ticketNumber: entries.ticket_number,
        paymentStatus: entries.payment_status,
        paymentProofUrl: entries.payment_proof_url,
        createdAt: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userEmojiId: users.emoji_id,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .orderBy(entries.created_at);

    res.json(allEntries);
  } catch (err) {
    console.error("Admin entries error:", err);
    res.status(500).json({ error: "Error al obtener entradas." });
  }
});

// GET /api/admin/entries/pending — pending entries
router.get("/entries/pending", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const pending = await db
      .select({
        id: entries.id,
        userId: entries.user_id,
        ticketNumber: entries.ticket_number,
        paymentProofUrl: entries.payment_proof_url,
        paymentStatus: entries.payment_status,
        createdAt: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userEmojiId: users.emoji_id,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .where(eq(entries.payment_status, "pending"))
      .orderBy(entries.created_at);

    res.json(pending);
  } catch (err) {
    console.error("Pending entries error:", err);
    res.status(500).json({ error: "Error al obtener entradas pendientes." });
  }
});

// GET /api/admin/entries/approved — approved entries
router.get("/entries/approved", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const approved = await db
      .select({
        id: entries.id,
        userId: entries.user_id,
        ticketNumber: entries.ticket_number,
        paymentStatus: entries.payment_status,
        paymentProofUrl: entries.payment_proof_url,
        createdAt: entries.created_at,
        userName: users.name,
        userPhone: users.phone,
        userEmojiId: users.emoji_id,
      })
      .from(entries)
      .innerJoin(users, eq(entries.user_id, users.id))
      .where(eq(entries.payment_status, "approved"))
      .orderBy(entries.created_at);

    res.json(approved);
  } catch (err) {
    console.error("Approved entries error:", err);
    res.status(500).json({ error: "Error al obtener entradas aprobadas." });
  }
});

// PATCH /api/admin/entries/:id/approve — approve entry
router.patch("/entries/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [existingEntry] = await db
      .select({ paymentProofUrl: entries.payment_proof_url })
      .from(entries)
      .where(eq(entries.id, req.params.id))
      .limit(1);

    if (!existingEntry || !existingEntry.paymentProofUrl) {
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

    res.json({ message: "Pago aprobado.", entry: updated });
  } catch (err) {
    console.error("Approve entry error:", err);
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

    res.json({ message: reason ? `Pago rechazado: ${reason}` : "Pago rechazado.", entry: updated });
  } catch (err) {
    console.error("Reject entry error:", err);
    res.status(500).json({ error: "Error al rechazar pago." });
  }
});

export default router;
