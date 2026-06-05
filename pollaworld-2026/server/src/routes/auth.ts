import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
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
  emoji_id: z.string().min(1, "Debes seleccionar un emoji"),
});

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    if (existing.length > 0) {
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
        emoji_id: data.emoji_id,
      })
      .returning();

    const token = signToken({ userId: newUser.id, role: newUser.role });

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
        emoji_id: newUser.emoji_id,
        role: newUser.role,
        payment_status: newUser.payment_status,
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

    const [user] = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);

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
        emoji_id: user.emoji_id,
        role: user.role,
        payment_status: user.payment_status,
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
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        emoji_id: user.emoji_id,
        role: user.role,
        payment_status: user.payment_status,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
