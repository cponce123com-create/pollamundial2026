import { Request, Response, NextFunction } from "express";
import { requireAuth } from "./auth";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
      return;
    }
    next();
  });
}
