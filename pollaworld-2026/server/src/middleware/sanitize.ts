import { Request, Response, NextFunction } from "express";

/**
 * Sanitiza recursivamente cualquier valor del body para prevenir XSS.
 * - Strings: elimina etiquetas HTML/XML (no escapa — elimina)
 * - Objetos/Arrays: recorre recursivamente
 * - password: se salta (no tocar contraseñas)
 */
function stripTags(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(stripTags);
  }
  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      if (key === "password" || key === "password_hash") {
        sanitized[key] = (value as Record<string, unknown>)[key];
      } else {
        sanitized[key] = stripTags((value as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return value;
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = stripTags(req.body);
  }
  next();
}
