import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/player/progress - saved progress (works on any device after login)
router.get("/progress", requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    progress: {
      currentLevel: u.currentLevel,
      completedLevels: u.completedLevels,
      totalStars: u.totalStars,
      totalScore: u.totalScore,
      bubblesPopped: u.bubblesPopped,
      bestCombo: u.bestCombo,
      rescuedObjects: u.rescuedObjects,
      boosterInventory: u.boosterInventory,
    },
  });
});

export default router;