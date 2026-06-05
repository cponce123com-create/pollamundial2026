import { Router, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { requireAdmin } from "../middleware/admin";
import { eq } from "drizzle-orm";

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

export default router;
