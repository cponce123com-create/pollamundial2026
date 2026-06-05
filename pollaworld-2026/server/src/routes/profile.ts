import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq } from "drizzle-orm";
import cloudinary from "../lib/cloudinary";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

// Zod schema for name update
const nameSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío").max(100, "Máximo 100 caracteres"),
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
    console.error("Profile name error:", err);
    res.status(500).json({ error: "Error al actualizar nombre." });
  }
});

// POST /api/profile/avatar — upload avatar
router.post("/avatar", requireAuth, (req: Request, res: Response, next) => {
  upload.single("avatar")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "La imagen no debe superar los 5MB." });
      return res.status(400).json({ error: `Error: ${err.message}` });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Debes seleccionar una imagen." });
      return;
    }

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `pollaworld/avatars/${req.user!.userId}`,
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
          transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    await db
      .update(users)
      .set({ avatar_url: result.secure_url })
      .where(eq(users.id, req.user!.userId));

    res.json({ avatar_url: result.secure_url, message: "Foto de perfil actualizada." });
  } catch (err: any) {
    console.error("Upload avatar error:", err);
    if (err?.http_code === 401 || err?.message?.includes("Invalid")) {
      return res.status(500).json({ error: "Error de configuración de Cloudinary." });
    }
    res.status(500).json({ error: "Error al subir foto." });
  }
});

export default router;
