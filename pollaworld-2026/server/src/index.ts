import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import entryRoutes from "./routes/entries";
import matchRoutes from "./routes/matches";
import predictionRoutes from "./routes/predictions";
import paymentRoutes from "./routes/payments";
import standingsRoutes from "./routes/standings";
import adminRoutes from "./routes/admin";
import poolRoutes from "./routes/pool";
import teamRoutes from "./routes/teams";
import profileRoutes from "./routes/profile";
import { db } from "./db";
import { matches, poolConfig } from "./db/schema";
import { eq, lte, and, sql } from "drizzle-orm";
import logger from "./lib/logger";
import pinoHttp from "pino-http";
import { sanitizeBody } from "./middleware/sanitize";
import { csrfProtection } from "./middleware/csrf";
import { startLiveScoreSync, stopLiveScoreSync } from "./lib/livescore";
import { sseHandler, broadcastEvent } from "./lib/sse";
import { runStartupMigrations } from "./db/migrate-entries";

// Validar variables de entorno requeridas
const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  logger.error(`❌ Variables de entorno faltantes: ${missing.join(", ")}`);
  logger.error("Revisa tu archivo .env o las variables en Render.");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "res.cloudinary.com", "flagcdn.com", "cdn.jsdelivr.net", "data:", "blob:"],
      connectSrc: ["'self'", "res.cloudinary.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(express.json({ limit: "10mb" }));
app.use(sanitizeBody);
app.use(cookieParser());

// CSRF Protection — must be after cookieParser
app.use(csrfProtection);

// HTTP request logging
app.use(pinoHttp({ logger }));

// Global rate limiter (fallback for routes without specific limiter)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos." },
});
app.use("/api", globalLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pool", poolRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/standings", standingsRoutes);
app.use("/api/teams", teamRoutes);

// SSE endpoint for real-time notifications
app.get("/api/events", sseHandler);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuild));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

// ─── AUTO-CLOSE REGISTRATIONS JOB ────────────────────────────────
// Checks every 60s if the first match has started and auto-locks the tournament
async function checkTournamentStart() {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    if (!config) return;

    const now = new Date();

    // ── Verificar si ya hay partidos empezados ──
    if (!config.tournament_started) {
      const [startedMatch] = await db
        .select({ id: matches.id })
        .from(matches)
        .where(and(lte(matches.match_date, now), eq(matches.phase, "groups")))
        .limit(1);

      if (startedMatch) {
        // Atomic check-and-set: only one cron wins
        const [updated] = await db
          .update(poolConfig)
          .set({ tournament_started: true })
          .where(and(eq(poolConfig.tournament_started, false), eq(poolConfig.id, config.id)))
          .returning({ id: poolConfig.id });

        if (updated) {
          // Lock all group phase matches
          await db.update(matches).set({ is_locked: true }).where(eq(matches.phase, "groups"));
          // Notify clients
          broadcastEvent("tournament_started", { startedAt: now.toISOString() });
          logger.info(`[CRON] Tournament auto-started at ${now.toISOString()}`);
        }
      }
    }

    // ── Auto-lock elimination matches whose match_date has passed ──
    const [poolCfg] = await db.select({ started: poolConfig.tournament_started }).from(poolConfig).limit(1);
    if (poolCfg?.started) {
      const lockedElims = await db
        .update(matches)
        .set({ is_locked: true })
        .where(
          and(
            lte(matches.match_date, now),
            eq(matches.is_locked, false),
            sql`${matches.phase} != 'groups'`
          )
        )
        .returning({ id: matches.id, phase: matches.phase, home_team: matches.home_team, away_team: matches.away_team });

      if (lockedElims.length > 0) {
        logger.info(`[CRON] Auto-locked ${lockedElims.length} elimination match(es)`);
        for (const m of lockedElims) {
          broadcastEvent("match_locked", { matchId: m.id, phase: m.phase, homeTeam: m.home_team, awayTeam: m.away_team });
        }
      }
    }
  } catch (err) {
    logger.error(err, "[CRON] Error checking tournament start:");
  }
}

// Run check every 60 seconds
const tournamentCheckInterval = setInterval(checkTournamentStart, 60_000);
// Also run once on startup
checkTournamentStart();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("[SHUTDOWN] Received SIGTERM, cleaning up...");
  clearInterval(tournamentCheckInterval);
  stopLiveScoreSync();
  process.exit(0);
});
process.on("SIGINT", () => {
  logger.info("[SHUTDOWN] Received SIGINT, cleaning up...");
  clearInterval(tournamentCheckInterval);
  stopLiveScoreSync();
  process.exit(0);
});

// Global error handler (must be after all routes)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "[ERROR]");
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor."
      : err.message,
  });
});

app.listen(PORT, async () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  // Run startup migrations (ALTER TABLE ADD COLUMN IF NOT EXISTS, etc.)
  await runStartupMigrations();
});

// Iniciar sincronización de live scores
startLiveScoreSync();

export default app;
