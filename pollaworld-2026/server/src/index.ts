import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import matchRoutes from "./routes/matches";
import predictionRoutes from "./routes/predictions";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import poolRoutes from "./routes/pool";
import { db } from "./db";
import { matches, poolConfig } from "./db/schema";
import { eq, lte, and, sql } from "drizzle-orm";

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
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

      console.log(`[CRON] Tournament auto-started at ${now.toISOString()}`);
    }
  } catch (err) {
    console.error("[CRON] Error checking tournament start:", err);
  }
}

// Run check every 60 seconds
setInterval(checkTournamentStart, 60_000);
// Also run once on startup
checkTournamentStart();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
