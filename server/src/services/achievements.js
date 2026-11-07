// Achievement list. `value(stats)` = the player's progress, `target` = what unlocks it.
// Everything is calculated from VERIFIED server data (never from the browser).
export const ACHIEVEMENTS = [
  { id: "first_pop", name: "First Pop", icon: "🫧", description: "Pop your first bubble", target: 1, value: (s) => s.bubblesPopped },
  { id: "bubble_beginner", name: "Bubble Beginner", icon: "🌱", description: "Complete 5 levels", target: 5, value: (s) => s.levelsCompleted },
  { id: "halfway_there", name: "Halfway There", icon: "🚀", description: "Complete 20 levels", target: 20, value: (s) => s.levelsCompleted },
  { id: "level_master", name: "Level Master", icon: "👑", description: "Complete 40 levels", target: 40, value: (s) => s.levelsCompleted },
  { id: "star_collector", name: "Star Collector", icon: "⭐", description: "Earn 50 stars", target: 50, value: (s) => s.totalStars },
  { id: "three_star_hero", name: "Three Star Hero", icon: "🌟", description: "Get 3 stars on a level", target: 1, value: (s) => s.threeStarLevels },
  { id: "combo_starter", name: "Combo Starter", icon: "🔥", description: "Reach a x3 combo", target: 3, value: (s) => s.bestCombo },
  { id: "combo_master", name: "Combo Master", icon: "💥", description: "Reach a x10 combo", target: 10, value: (s) => s.bestCombo },
  { id: "bubble_hunter", name: "Bubble Hunter", icon: "🎯", description: "Pop 1,000 bubbles", target: 1000, value: (s) => s.bubblesPopped },
  { id: "booster_expert", name: "Booster Expert", icon: "🧨", description: "Use 25 boosters", target: 25, value: (s) => s.boostersUsedTotal },
  { id: "perfect_aim", name: "Perfect Aim", icon: "🏹", description: "Clear a level using 60% of its shots or fewer", target: 1, value: (s) => s.perfectAim },
  { id: "bubble_legend", name: "Bubble Legend", icon: "🏆", description: "Earn 100,000 points", target: 100000, value: (s) => s.totalScore },
  { id: "rescue_hero", name: "Rescue Hero", icon: "🐣", description: "Rescue 25 baby chicks", target: 25, value: (s) => s.rescuedObjects },
];

// `extra.perfectAim` is true only for the game that was just verified
function statsFor(user, extra = {}) {
  return {
    levelsCompleted: user.completedLevels.length,
    totalStars: user.totalStars,
    totalScore: user.totalScore,
    bubblesPopped: user.bubblesPopped,
    bestCombo: user.bestCombo,
    boostersUsedTotal: user.boostersUsedTotal || 0,
    rescuedObjects: user.rescuedObjects || 0,
    threeStarLevels: user.completedLevels.filter((l) => l.stars === 3).length,
    perfectAim: extra.perfectAim ? 1 : 0,
  };
}

// Unlocks every achievement the player has now earned (does not save the user).
// Returns only the NEW ones, so the game can celebrate them.
export function checkNewAchievements(user, extra = {}) {
  const have = new Set(user.achievements.map((a) => a.achievementId));
  const stats = statsFor(user, extra);

  const unlocked = ACHIEVEMENTS.filter(
    (a) => !have.has(a.id) && a.value(stats) >= a.target
  );
  for (const a of unlocked) {
    user.achievements.push({ achievementId: a.id, unlockedAt: new Date() });
  }
  return unlocked.map(({ id, name, icon, description }) => ({ id, name, icon, description }));
}

// Everything the achievements page needs: progress bars + unlocked state
export function listForUser(user) {
  const stats = statsFor(user);
  return ACHIEVEMENTS.map((a) => {
    const entry = user.achievements.find((u) => u.achievementId === a.id);
    return {
      id: a.id,
      name: a.name,
      icon: a.icon,
      description: a.description,
      target: a.target,
      progress: entry ? a.target : Math.min(a.value(stats), a.target),
      unlocked: Boolean(entry),
      unlockedAt: entry ? entry.unlockedAt : null,
    };
  });
}