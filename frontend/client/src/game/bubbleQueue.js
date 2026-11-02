import { COLORS } from "./constants.js";
import { forEachBubble } from "./hexGrid.js";

// Picks the next bubble colour, only from colours still on the board.
// `rng` is a seeded random function (see rng.js), so the queue can be replayed.
export function pickColor(board, rng) {
  const present = new Set();
  forEachBubble(board, (b) => present.add(b.color));
  const list = present.size ? [...present] : COLORS;
  return list[Math.floor(rng() * list.length)];
}