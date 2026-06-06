import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * CSRF Protection using Double Submit Cookie pattern.
 * - On GET requests: sends a CSRF token cookie (if not present).
 * - On state-changing requests (POST, PUT, PATCH, DELETE): validates
 *   the token from the `X-CSRF-Token` header against the cookie.
 */

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32;

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for non-mutating requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Ensure cookie exists for subsequent mutations
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(TOKEN_LENGTH).toString("hex");
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // Must be accessible by JS to send as header
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    next();
    return;
  }

  // Validate CSRF token for mutations
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({ error: "CSRF token missing. Recarga la página e inténtalo de nuevo." });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    res.status(403).json({ error: "CSRF token inválido." });
    return;
  }

  const valid = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  if (!valid) {
    res.status(403).json({ error: "CSRF token inválido." });
    return;
  }

  // Rotate token after each mutation to limit replay window
  const newToken = crypto.randomBytes(TOKEN_LENGTH).toString("hex");
  res.cookie(CSRF_COOKIE, newToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  next();
}
