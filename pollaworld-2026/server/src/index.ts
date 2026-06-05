import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import entryRoutes from "./routes/entries";
import matchRoutes from "./routes/matches";
import predictionRoutes from "./routes/predictions";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import poolRoutes from "./routes/pool";
import teamRoutes from "./routes/teams";
import { db } from "./db";
import { matches, poolConfig } from "./db/schema";
import { eq, lte, and } from "drizzle-orm";
import logger from "./lib/logger";
import pinoHttp from "pino-http";
import { sanitizeBody } from "./middleware/sanitize";
import { startLiveScoreSync } from "./lib/livescore";

// Validar variables de entorno requeridas
const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  logger.error(`❌ Variables de entorno faltantes: ${missing.join(", ")}`);
  logger.error("Revisa tu archivo .env o las variables en Render.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(sanitizeBody);
app.use(cookieParser());

// HTTP request logging
app.use(pinoHttp({ logger }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pool", poolRoutes);

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
    if (!config || config.tournament_started) return;

    const now = new Date();
    const [startedMatch] = await db
      .select()
      .from(matches)
      .where(and(lte(matches.match_date, now), eq(matches.phase, "groups")))
      .limit(1);

    if (startedMatch) {
      // Mark tournament as started
      await db.update(poolConfig).set({ tournament_started: true }).where(eq(poolConfig.id, config.id));

      // Lock all group phase matches
      await db.update(matches).set({ is_locked: true }).where(eq(matches.phase, "groups"));

      logger.info(`[CRON] Tournament auto-started at ${now.toISOString()}`);
    }
  } catch (err) {
    logger.error(err, "[CRON] Error checking tournament start:");
  }
}

// Run check every 60 seconds
setInterval(checkTournamentStart, 60_000);
// Also run once on startup
checkTournamentStart();

// Global error handler (must be after all routes)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, "[ERROR]");
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor."
      : err.message,
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Iniciar sincronización de live scores
startLiveScoreSync();

export default app;
