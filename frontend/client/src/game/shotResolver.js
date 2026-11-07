import { findConnectedBubbles } from "./matchDetector.js";
import { findFloatingBubbles } from "./floatingDetector.js";
import { getNeighbors } from "./hexGrid.js";
import { COLORS } from "./constants.js";

// [[r,c], ...] -> [{ r, c, color }, ...]  (colour is needed for animations)
const toInfo = (board, cells) =>
  cells.map(([r, c]) => ({ r, c, color: board[r][c].color }));

// Removes every bubble that is no longer connected to the ceiling
function dropFloating(board) {
  const floating = findFloatingBubbles(board);
  const floatingBubbles = toInfo(board, floating);
  floating.forEach(([r, c]) => (board[r][c] = null));
  return { floating, floatingBubbles };
}

// Bomb: explodes where it lands and pops every neighbouring bubble
function resolveBomb(board, r, c) {
  const popped = getNeighbors(r, c, board.length).filter(
    ([nr, nc]) => board[nr][nc]
  );
  const poppedBubbles = [{ r, c, color: "bomb" }, ...toInfo(board, popped)];
  popped.forEach(([pr, pc]) => (board[pr][pc] = null));

  const { floating, floatingBubbles } = dropFloating(board);
  return {
    matched: true,
    special: "bomb",
    popped,
    floating,
    poppedBubbles,
    floatingBubbles,
  };
}

// Rainbow: becomes whichever neighbouring colour gives the biggest group
// (eggs are not a colour, so they are ignored)
function pickRainbowColor(board, r, c) {
  const options = new Set();
  for (const [nr, nc] of getNeighbors(r, c, board.length)) {
    const nb = board[nr][nc];
    if (nb && nb.type !== "creature") options.add(nb.color);
  }
  if (options.size === 0) return COLORS[0];

  let best = null;
  let bestSize = -1;
  for (const color of options) {
    board[r][c] = { color, type: "normal" };
    const size = findConnectedBubbles(board, r, c).length;
    if (size > bestSize) {
      best = color;
      bestSize = size;
    }
  }
  board[r][c] = null;
  return best;
}

// Places a bubble, pops matches, drops floating bubbles. Mutates `board`.
// `color` can be a normal colour, "bomb" or "rainbow".
export function resolveShot(board, r, c, color) {
  if (color === "bomb") return resolveBomb(board, r, c);

  let special = null;
  if (color === "rainbow") {
    color = pickRainbowColor(board, r, c);
    special = "rainbow";
  }

  board[r][c] = { color, type: "normal" };

  const group = findConnectedBubbles(board, r, c);
  let popped = [];
  let poppedBubbles = [];
  let floating = [];
  let floatingBubbles = [];

  if (group.length >= 3) {
    popped = group;
    poppedBubbles = toInfo(board, popped);
    popped.forEach(([pr, pc]) => (board[pr][pc] = null));
    ({ floating, floatingBubbles } = dropFloating(board));
  }

  return {
    matched: popped.length >= 3,
    special,
    popped,
    floating,
    poppedBubbles,
    floatingBubbles,
  };
}