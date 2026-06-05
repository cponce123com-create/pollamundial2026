import { Request, Response, NextFunction } from "express";

/**
 * Sanitiza campos de texto en req.body para prevenir XSS.
 * Remueve etiquetas HTML/script de los valores string.
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (key === "password") continue;
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key]
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
      }
    }
  }
  next();
}
