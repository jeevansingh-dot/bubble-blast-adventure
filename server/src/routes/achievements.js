import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { ACHIEVEMENTS, listForUser } from "../services/achievements.js";

const router = Router();
router.use(requireAuth);

// GET /api/achievements - all achievements of the game
router.get("/", (req, res) => {
  res.json({
    achievements: ACHIEVEMENTS.map(({ id, name, icon, description, target }) => ({
      id,
      name,
      icon,
      description,
      target,
    })),
  });
});

// GET /api/achievements/me - my progress and unlocked badges
router.get("/me", (req, res) => {
  const achievements = listForUser(req.user);
  res.json({
    achievements,
    unlocked: achievements.filter((a) => a.unlocked).length,
    total: achievements.length,
  });
});

export default router;