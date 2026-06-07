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
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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

// Dynamic OG image — redirects to the custom logo or favicon from DB, or fallback
app.get("/api/og-image", async (_req, res) => {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    const imageUrl = config?.logo_url || config?.favicon_url || "/logo-og.png";
    // If it's an absolute URL (Cloudinary), redirect directly
    if (imageUrl.startsWith("http")) {
      return res.redirect(302, imageUrl);
    }
    // Relative URL — redirect to the same host
    res.redirect(302, imageUrl);
  } catch {
    res.redirect(302, "/logo-og.png");
  }
});

// Dynamic PWA manifest with custom logo
app.get("/manifest.json", async (_req, res) => {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    const logoUrl = config?.logo_url || "/logo-og.png";

    res.json({
      name: "La Polla del Ponce 2026",
      short_name: "La Polla 2026",
      description: "La quiniela del Mundial 2026 — Predice los resultados y compite con amigos",
      start_url: "/",
      display: "standalone",
      background_color: "#0d1117",
      theme_color: "#0d1117",
      orientation: "portrait",
      categories: ["sports", "games"],
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/logo.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
    });
  } catch {
    // Fallback if DB fails
    res.json({
      name: "La Polla del Ponce 2026",
      short_name: "La Polla 2026",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      ],
    });
  }
});

// ─── DYNAMIC OPEN GRAPH (scraper bots) ──────────────────────────
// Social scrapers (WhatsApp, FB, Twitter, Telegram, Discord, Slack, LinkedIn)
// don't execute JS, so we must serve static HTML with OG meta tags.
// If the request comes from a known scraper, handle it here before the SPA.
const SCRAPER_AGENTS = [
  "facebookexternalhit", "Twitterbot", "WhatsApp", "TelegramBot",
  "Slackbot", "LinkedInBot", "Discordbot", "Discord",
];

function isScraper(ua: string): boolean {
  return SCRAPER_AGENTS.some((agent) => ua.toLowerCase().includes(agent.toLowerCase()));
}

async function scraperMiddleware(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  if (!ua || !isScraper(ua)) return next();

  const entryMatch = req.path.match(/^\/entry\/([a-f0-9-]+)/i);
  // Dynamically determine base URL from the request
  const BASE_URL = `${req.protocol}://${req.get("host")}`;

  if (entryMatch) {
    const entryId = entryMatch[1];
    try {
      const result = await db.execute(
        sql`SELECT u.name, COALESCE(SUM(p.points_earned), 0) AS puntos
            FROM entries e
            JOIN users u ON u.id = e.user_id
            LEFT JOIN predictions p ON p.entry_id = e.id
            WHERE e.id = ${entryId}
            GROUP BY u.name`
      );

      const rows = (result as any).rows || [];
      const name = rows[0]?.name || "Participante";
      const puntos = rows[0]?.puntos ?? 0;

      const ogImage = await getOgImageUrl();

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta property="og:title" content="${escapeHtml(name)} — La Polla del Ponce 2026" />
  <meta property="og:description" content="Puntaje actual: ${puntos} pts. \u00bfPuedes superarlo?" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="La Polla del Ponce 2026 — Quiniela del Mundial" />
  <meta property="og:url" content="${BASE_URL}/entry/${entryId}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(name)} — La Polla del Ponce 2026" />
  <meta name="twitter:description" content="Puntaje actual: ${puntos} pts. \u00bfPuedes superarlo?" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta http-equiv="refresh" content="0;url=/entry/${entryId}" />
  <title>${escapeHtml(name)} — La Polla del Ponce 2026</title>
</head>
<body><a href="/entry/${entryId}">Ver quiniela</a></body>
</html>`;

      return res.status(200).send(html);
    } catch (err) {
      logger.warn(err, "[OG] Error fetching entry %s", entryId);
      // Fall through to SPA
      return next();
    }
  }

  // Root path for scrapers — serve dynamic HTML with OG metas using custom logo
  if (req.path === "/" || req.path === "") {
    try {
      const ogImage = await getOgImageUrl();
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${BASE_URL}/" />
  <meta property="og:title" content="La Polla del Ponce 2026" />
  <meta property="og:description" content="La quiniela del Mundial 2026 — Predice los resultados, compite con amigos y gana premios." />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="La Polla del Ponce 2026 — Quiniela del Mundial" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="La Polla del Ponce 2026" />
  <meta name="twitter:description" content="La quiniela del Mundial 2026 — Predice los resultados, compite con amigos y gana premios." />
  <meta name="twitter:image" content="${ogImage}" />
  <title>La Polla del Ponce 2026</title>
</head>
<body><a href="/">Ir al sitio</a></body>
</html>`;
      return res.status(200).send(html);
    } catch {
      // Fall through to SPA
      return next();
    }
  }

  // For other routes, just show the base SPA (which already has OG metas)
  return next();
}

/** Get the best OG image URL: custom logo > favicon > fallback */
async function getOgImageUrl(): Promise<string> {
  try {
    const [config] = await db.select().from(poolConfig).limit(1);
    return config?.logo_url || config?.favicon_url || "/logo-og.png";
  } catch {
    return "/logo-og.png";
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuild));

  // OG scraper middleware — intercept scrapers before SPA catch-all
  app.use(scraperMiddleware);

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
