import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// only logged-in players can look at the leaderboard
router.use(requireAuth);

// ranking order: higher score first, then more stars, then who joined first
const SORT = { totalScore: -1, totalStars: -1, _id: 1 };

// 1 + number of players who are ahead of this player
async function rankOf(user) {
  if (user.totalScore <= 0) return null; // no score yet = not ranked
  const ahead = await User.countDocuments({
    $or: [
      { totalScore: { $gt: user.totalScore } },
      { totalScore: user.totalScore, totalStars: { $gt: user.totalStars } },
      {
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        _id: { $lt: user._id },
      },
    ],
  });
  return ahead + 1;
}

async function yourStats(user) {
  return {
    rank: await rankOf(user),
    name: user.name,
    score: user.totalScore,
    stars: user.totalStars,
    levelsCompleted: user.completedLevels.length,
    bestCombo: user.bestCombo,
  };
}

// GET /api/leaderboard - top 50 players + your own rank
router.get("/", async (req, res, next) => {
  try {
    const rows = await User.find({ totalScore: { $gt: 0 } })
      .sort(SORT)
      .limit(50)
      .select("name totalScore totalStars bestCombo completedLevels");

    // never send emails or ids, only what the board needs
    const leaderboard = rows.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      score: u.totalScore,
      stars: u.totalStars,
      levelsCompleted: u.completedLevels.length,
      bestCombo: u.bestCombo,
      isYou: u.id === req.user.id,
    }));

    res.json({ leaderboard, you: await yourStats(req.user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard/me - just your own rank
router.get("/me", async (req, res, next) => {
  try {
    res.json({ you: await yourStats(req.user) });
  } catch (err) {
    next(err);
  }
});

export default router;