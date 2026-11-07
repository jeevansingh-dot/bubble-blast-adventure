// Points table (same values as the PDF's example scoring)
export const SCORE = {
  POP: 10, // per bubble popped
  MATCH_3: 30, // bonus for popping exactly 3
  MATCH_4: 50, // bonus for popping exactly 4
  MATCH_5_PLUS: 80, // bonus for popping 5 or more
  FLOATING: 20, // per bubble that falls
  RESCUE: 100, // per baby chick freed
};

// combo 1 = x1, 2 = x1.5, 3 = x2, 4 = x2.5, 5 or more = x3 (max)
export function comboMultiplier(combo) {
  return Math.min(3, 1 + 0.5 * (Math.max(combo, 1) - 1));
}

export function calculateScore(poppedCount, floatingCount, combo = 1) {
  if (poppedCount < 3) return 0; // no match = no points

  let bonus = SCORE.MATCH_5_PLUS;
  if (poppedCount === 3) bonus = SCORE.MATCH_3;
  else if (poppedCount === 4) bonus = SCORE.MATCH_4;

  const base = poppedCount * SCORE.POP + bonus + floatingCount * SCORE.FLOATING;
  return Math.round(base * comboMultiplier(combo));
}

// starThresholds example: [200, 400, 600]
// score >= 200 -> 1 star, >= 400 -> 2 stars, >= 600 -> 3 stars
export function calculateStars(score, starThresholds) {
  let stars = 0;
  for (const needed of starThresholds) {
    if (score >= needed) stars++;
  }
  return stars;
}

// Bomb has no "3 match" bonus: just points per bubble destroyed
export function calculateBombScore(poppedCount, floatingCount, combo = 1) {
  const base = poppedCount * SCORE.POP + floatingCount * SCORE.FLOATING;
  return Math.round(base * comboMultiplier(combo));
}

// How many baby chicks (eggs) this shot freed (popped by a Bomb or dropped)
export function countRescued(result) {
  return [...result.poppedBubbles, ...result.floatingBubbles].filter(
    (b) => b.color === "egg"
  ).length;
}

// Points for one whole shot. The browser AND the server both use this function.
export function calculateShotScore(result, combo = 1) {
  const base =
    result.special === "bomb"
      ? calculateBombScore(result.popped.length, result.floating.length, combo)
      : calculateScore(result.popped.length, result.floating.length, combo);
  return base + countRescued(result) * SCORE.RESCUE;
}