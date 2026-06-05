import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "../db";
import { users, entries } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Rate limiting: 5 intentos por minuto por IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." },
  headers: true,
  legacyHeaders: false,
  standardHeaders: true,
});

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  player_slug: z.string().min(1, "Debes seleccionar un jugador"),
});

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing using raw SQL for avatar_url resilience
    const dupCheck = await db.execute<{ id: string }>(
      sql`SELECT id FROM users WHERE phone = ${data.phone} LIMIT 1`
    );
    if (dupCheck.rows?.length > 0) {
      res.status(400).json({ error: "Este número de teléfono ya está registrado." });
      return;
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        phone: data.phone,
        password_hash,
        player_slug: data.player_slug,
      })
      .returning();

    const token = signToken({ userId: newUser.id, role: newUser.role });

    // Create first entry for the new user
    await db
      .insert(entries)
      .values({
        user_id: newUser.id,
        ticket_number: 1,
      })
      .returning();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        player_slug: newUser.player_slug,
        role: newUser.role,
        avatar_url: newUser.avatar_url,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    let user: { id: string; name: string; phone: string; player_slug: string | null; role: "participant" | "admin"; password_hash: string | null; avatar_url: string | null } | undefined;

    try {
      const result = await db.execute<{ id: string; name: string; phone: string; player_slug: string | null; role: "participant" | "admin"; password_hash: string | null; avatar_url: string | null }>(
        sql`SELECT id, name, phone, player_slug, role, password_hash, avatar_url FROM users WHERE phone = ${data.phone} LIMIT 1`
      );
      user = result.rows?.[0];
    } catch {
      // Fallback without avatar_url
      const result = await db.execute<{ id: string; name: string; phone: string; player_slug: string | null; role: "participant" | "admin"; password_hash: string | null }>(
        sql`SELECT id, name, phone, player_slug, role, password_hash FROM users WHERE phone = ${data.phone} LIMIT 1`
      );
      const found = result.rows?.[0];
      user = found ? { ...found, avatar_url: null } : undefined;
    }

    if (!user) {
      res.status(401).json({ error: "Teléfono o contraseña incorrectos." });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.password_hash || "");
    if (!valid) {
      res.status(401).json({ error: "Teléfono o contraseña incorrectos." });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        player_slug: user.player_slug || "",
        role: user.role,
        avatar_url: user.avatar_url || null,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada." });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    // Use raw SQL to select user fields, handling optional avatar_url column
    const result = await db.execute<{
      id: string; name: string; phone: string;
      player_slug: string | null; role: "participant" | "admin";
      created_at: string; avatar_url: string | null;
    }>(
      sql`SELECT id, name, phone, player_slug, role, created_at, avatar_url FROM users WHERE id = ${req.user!.userId} LIMIT 1`
    );
    const row = result.rows?.[0];

    if (!row) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json({
      user: {
        id: row.id,
        name: row.name,
        phone: row.phone,
        player_slug: row.player_slug || "",
        role: row.role,
        avatar_url: row.avatar_url || null,
      },
    });
  } catch (err: any) {
    // Fallback if avatar_url column doesn't exist yet
    if (err?.message?.includes("avatar_url") || err?.code === "42703") {
      try {
        const fallback = await db.execute<{
          id: string; name: string; phone: string;
          player_slug: string | null; role: "participant" | "admin";
        }>(
          sql`SELECT id, name, phone, player_slug, role FROM users WHERE id = ${req.user!.userId} LIMIT 1`
        );
        const user = fallback.rows?.[0];
        if (!user) { res.status(404).json({ error: "Usuario no encontrado." }); return; }
        res.json({
          user: { id: user.id, name: user.name, phone: user.phone, player_slug: user.player_slug || "", role: user.role, avatar_url: null },
        });
        return;
      } catch {}
    }
    console.error("Me error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
