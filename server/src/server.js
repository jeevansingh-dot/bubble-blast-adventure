import "dotenv/config"; // must stay the FIRST import: it loads server/.env
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { GAME_NAME } from "./config/gameConfig.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import gamesRoutes from "./routes/games.js";
import playerRoutes from "./routes/player.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import achievementsRoutes from "./routes/achievements.js";
const app = express();
app.set("trust proxy", 1);
app.use(helmet()); // safer HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" })); // read JSON bodies, reject huge ones

// Quick check that the server (and database) are alive
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    game: GAME_NAME,
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/achievements", achievementsRoutes);
// Any other URL
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Central error handler: players never see stack traces or internal details
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request is too large" });
  }
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Something went wrong, please try again" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET is missing or too short in server/.env");
    }
    await connectDB();
    app.listen(PORT, () => {
      console.log(`${GAME_NAME} server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    // only the message, never the full error (it could contain connection details)
    console.error("Could not start server:", err.message);
    process.exit(1);
  }
}

start();