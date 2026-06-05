import { Router, Request, Response } from "express";
import { db } from "../db";
import { entries } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/entries — list current user's entries
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userEntries = await db
      .select()
      .from(entries)
      .where(eq(entries.user_id, req.user!.userId))
      .orderBy(entries.ticket_number);

    res.json(userEntries);
  } catch (err) {
    console.error("Get entries error:", err);
    res.status(500).json({ error: "Error al obtener tus entradas." });
  }
});

// POST /api/entries — create new entry (ticket_number = max + 1)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const [maxEntry] = await db
      .select({ maxTicket: sql<number>`COALESCE(MAX(${entries.ticket_number}), 0)`.mapWith(Number) })
      .from(entries)
      .where(eq(entries.user_id, req.user!.userId));

    const nextTicket = (maxEntry?.maxTicket ?? 0) + 1;

    const [entry] = await db
      .insert(entries)
      .values({
        user_id: req.user!.userId,
        ticket_number: nextTicket,
      })
      .returning();

    res.status(201).json(entry);
  } catch (err) {
    console.error("Create entry error:", err);
    res.status(500).json({ error: "Error al crear nueva entrada." });
  }
});

export default router;
