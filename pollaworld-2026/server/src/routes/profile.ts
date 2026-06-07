import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq } from "drizzle-orm";
import { imageUpload, uploadToCloudinary, cloudinaryErrorResponse } from "../lib/upload";
import logger from "../lib/logger";

const router = Router();

// Zod schema for name update
const nameSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío").max(100, "Máximo 100 caracteres"),
});

// PATCH /api/profile/player — update player slug (character)
const playerSchema = z.object({
  player_slug: z.string().min(1, "Debes seleccionar un personaje"),
});

router.patch("/player", requireAuth, async (req: Request, res: Response) => {
  try {
    const { player_slug } = playerSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({ player_slug })
      .where(eq(users.id, req.user!.userId))
      .returning({ id: users.id, name: users.name, phone: users.phone, player_slug: users.player_slug, role: users.role, avatar_url: users.avatar_url });
    res.json({ user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    logger.error(err, "Profile player error:");
    res.status(500).json({ error: "Error al actualizar personaje." });
  }
});

// PATCH /api/profile/name — update display name
router.patch("/name", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name } = nameSchema.parse(req.body);
    const [updated] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, req.user!.userId))
      .returning({ id: users.id, name: users.name, phone: users.phone, player_slug: users.player_slug, role: users.role, avatar_url: users.avatar_url });
    res.json({ user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors[0].message }); return; }
    logger.error(err, "Profile name error:");
    res.status(500).json({ error: "Error al actualizar nombre." });
  }
});

// POST /api/profile/avatar — upload avatar
router.post("/avatar", requireAuth, (req: Request, res: Response, next) => {
  imageUpload.single("avatar")(req, res, (err) => {
    if (err) {
      const handled = cloudinaryErrorResponse(err, "Upload avatar");
      return res.status(handled.status).json({ error: handled.error });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes seleccionar una imagen." });
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `pollaworld/avatars/${req.user!.userId}`,
      allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    await db
      .update(users)
      .set({ avatar_url: result.secure_url })
      .where(eq(users.id, req.user!.userId));

    res.json({ avatar_url: result.secure_url, message: "Foto de perfil actualizada." });
  } catch (err: unknown) {
    const errResp = cloudinaryErrorResponse(err, "Upload avatar");
    res.status(errResp.status).json({ error: errResp.error });
  }
});

export default router;
