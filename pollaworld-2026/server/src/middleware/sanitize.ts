import { Request, Response, NextFunction } from "express";

/**
 * Sanitiza campos de texto en req.body para prevenir XSS.
 * Remueve etiquetas HTML/script de los valores string.
 * Crea un nuevo objeto inmutable en lugar de mutar req.body.
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(req.body)) {
      if (key === "password") {
        sanitized[key] = (req.body as Record<string, unknown>)[key];
        continue;
      }
      if (typeof (req.body as Record<string, unknown>)[key] === "string") {
        sanitized[key] = ((req.body as Record<string, unknown>)[key] as string)
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
      } else {
        sanitized[key] = (req.body as Record<string, unknown>)[key];
      }
    }
    req.body = sanitized;
  }
  next();
}
