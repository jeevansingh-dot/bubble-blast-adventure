const STORAGE_KEY = "bubble_progress_v1";

// progress looks like: { stars: { 1: 3, 2: 1 } }  (levelId -> best stars)
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted or blocked storage: fall through to a fresh start
  }
  return { stars: {} };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or blocked: ignore, game still works
  }
}

// Save a finished level. Only keeps the BEST star count.
export function saveLevelResult(levelId, stars) {
  const progress = loadProgress();
  const best = progress.stars[levelId] || 0;
  if (stars > best) progress.stars[levelId] = stars;
  saveProgress(progress);
  return progress;
}

// Level 1 is always open. Level N opens once level N-1 is completed.
export function isUnlocked(levelId, progress) {
  return levelId === 1 || (progress.stars[levelId - 1] || 0) > 0;
}
// Progress now comes from the server (user.completedLevels), not from this browser
export function progressFromUser(user) {
  const stars = {};
  for (const level of user?.completedLevels || []) {
    stars[level.levelId] = level.stars;
  }
  return { stars };
}