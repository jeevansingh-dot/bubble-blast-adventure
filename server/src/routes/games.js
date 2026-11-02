import { Router } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import GameSession from "../models/GameSession.js";
import { requireAuth } from "../middleware/auth.js";
import { getLevel } from "../engine/index.js";
import { replayGame, CheatError } from "../services/validateSession.js";
import { checkNewAchievements } from "../services/achievements.js";
const router = Router();

// every game route needs a logged-in player
router.use(requireAuth);

router.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please slow down" },
  })
);

const MIN_MS_PER_SHOT = 300; // a real shot takes longer than this to fly and resolve
const MAX_SESSION_MS = 6 * 60 * 60 * 1000; // a game must be finished within 6 hours

function toSummary(s) {
  return {
    id: s._id.toString(),
    levelId: s.levelId,
    status: s.status,
    completed: s.completed,
    score: s.score,
    stars: s.stars,
    shotsUsed: s.shotsUsed,
    bubblesPopped: s.bubblesPopped,
    bestCombo: s.bestCombo,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
  };
}

// POST /api/games/start  { levelId }
router.post("/start", async (req, res, next) => {
  try {
    const levelId = req.body?.levelId;
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > 1000) {
      return res.status(400).json({ message: "Invalid level" });
    }

    // a level is open only if the previous one was completed
    const user = req.user;
    const unlocked =
      levelId === 1 ||
      user.completedLevels.some((l) => l.levelId === levelId - 1 && l.stars > 0);
    if (!unlocked) {
      return res.status(403).json({ message: "This level is still locked" });
    }

    // only one running game per player: older unfinished ones are closed
    await GameSession.updateMany(
      { userId: user._id, status: "active" },
      { $set: { status: "abandoned" } }
    );

    const session = await GameSession.create({
      userId: user._id,
      levelId,
      sessionToken: crypto.randomBytes(24).toString("hex"),
      seed: crypto.randomInt(1, 2147483647),
      startedAt: new Date(),
    });

    res.status(201).json({
      sessionToken: session.sessionToken,
      seed: session.seed,
      levelId,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/games/complete  { sessionToken, shots: [{angle,color,r,c}], claimedScore? }
router.post("/complete", async (req, res, next) => {
  try {
    const { sessionToken, shots, claimedScore } = req.body || {};
    if (
      typeof sessionToken !== "string" ||
      sessionToken.length > 100 ||
      !Array.isArray(shots) ||
      shots.length > 500
    ) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Atomically take the session: only ONE request can ever win this,
    // so double clicks and replayed requests cannot be counted twice.
    // The query also checks the session belongs to this player.
    const session = await GameSession.findOneAndUpdate(
      { sessionToken, userId: req.user._id, status: "active" },
      { $set: { status: "processing" } },
      { new: true }
    );
    if (!session) {
      const existing = await GameSession.findOne({
        sessionToken,
        userId: req.user._id,
      }).select("status");
      if (existing) {
        return res.status(409).json({ message: "This game was already submitted" });
      }
      return res.status(404).json({ message: "Game session not found" });
    }

    const level = getLevel(session.levelId);
    const elapsed = Date.now() - session.startedAt.getTime();

    let result;
    try {
      if (elapsed > MAX_SESSION_MS) throw new CheatError("Session expired");
      if (elapsed < shots.length * MIN_MS_PER_SHOT) {
        throw new CheatError("Level finished too fast");
      }
      result = replayGame(level, session.seed, shots);
    } catch (err) {
      if (err instanceof CheatError) {
        session.status = "rejected";
        session.rejectReason = err.message;
        session.completedAt = new Date();
        await session.save();
        console.warn(`Rejected session ${session.id} (user ${req.user.id}): ${err.message}`);
        // the player gets a general message, the exact reason stays in the database
        return res
          .status(422)
          .json({ message: "This result could not be verified, so it was not saved" });
      }
      // a bug on our side: give the session back so the player can try again
      session.status = "active";
      await session.save();
      throw err;
    }

    session.set({
      status: result.completed ? "completed" : "failed",
      completed: result.completed,
      completedAt: new Date(),
      shotsUsed: result.shotsUsed,
      bubblesPopped: result.bubblesPopped,
      score: result.score,
      stars: result.stars,
      bestCombo: result.bestCombo,
      boostersUsed: result.boostersUsed,
      // the browser's own number is only used to spot tampering
      suspicious: typeof claimedScore === "number" && claimedScore !== result.score,
    });
    await session.save();

    // update the player's saved progress using the VERIFIED numbers
    const user = req.user;
    if (result.completed) {
      const entry = user.completedLevels.find((l) => l.levelId === level.id);
      if (entry) {
        entry.stars = Math.max(entry.stars, result.stars);
        entry.bestScore = Math.max(entry.bestScore, result.score);
      } else {
        user.completedLevels.push({
          levelId: level.id,
          stars: result.stars,
          bestScore: result.score,
        });
      }
      user.currentLevel = Math.max(user.currentLevel, level.id + 1);
    }
    // total score = sum of best scores per level, so replaying cannot inflate it
    user.totalStars = user.completedLevels.reduce((sum, l) => sum + l.stars, 0);
    user.totalScore = user.completedLevels.reduce((sum, l) => sum + l.bestScore, 0);
       user.bubblesPopped += result.bubblesPopped;
    user.bestCombo = Math.max(user.bestCombo, result.bestCombo);
    user.boostersUsedTotal += result.boostersUsed.bomb + result.boostersUsed.rainbow;

    // achievements are checked with the VERIFIED numbers only
    const perfectAim = result.completed && result.shotsUsed <= Math.floor(level.shots * 0.6);
    const newAchievements = checkNewAchievements(user, { perfectAim });
    await user.save();

    res.json({ session: toSummary(session), user: user.toPublic(), newAchievements });
  } catch (err) {
    next(err);
  }
});

// GET /api/games/history  - last 50 finished games of this player
router.get("/history", async (req, res, next) => {
  try {
    const sessions = await GameSession.find({
      userId: req.user._id,
      status: { $in: ["completed", "failed"] },
    })
      .sort({ startedAt: -1 })
      .limit(50)
      .lean();
    res.json({ history: sessions.map(toSummary) });
  } catch (err) {
    next(err);
  }
});

// GET /api/games/:id  - one game (only the owner can see it)
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Game not found" });
    }
    const session = await GameSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();
    if (!session) return res.status(404).json({ message: "Game not found" });
    res.json({ session: toSummary(session) });
  } catch (err) {
    next(err);
  }
});

export default router;